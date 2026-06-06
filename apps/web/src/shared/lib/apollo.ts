import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { toast } from "sonner";

const httpLink = createHttpLink({
  uri: "http://localhost:3000/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("accessToken");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ error, operation }) => {
  const { suppressGlobalError } = operation.getContext();

  if (CombinedGraphQLErrors.is(error)) {
    for (const err of error.errors) {
      const isAuthMutation = ["Login", "Register"].includes(
        operation.operationName,
      );
      const hasAuthenticatedSession = Boolean(
        localStorage.getItem("accessToken"),
      );

      if (
        err.extensions?.code === "UNAUTHENTICATED" &&
        hasAuthenticatedSession &&
        !isAuthMutation
      ) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");
        window.location.href = "/login";
        return;
      }

      if (!suppressGlobalError) {
        const userMessage = err.extensions?.userMessage;
        toast.error(
          typeof userMessage === "string"
            ? userMessage
            : "Something went wrong. Please try again.",
        );
      }
    }
  } else if (error && !suppressGlobalError) {
    toast.error("Unable to connect to the server. Please try again.");
  }
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});
