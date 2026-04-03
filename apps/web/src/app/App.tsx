import { ApolloProvider } from "@apollo/client/react";
import { RouterProvider } from "react-router";
import { client } from "./lib/apollo";
import { AuthProvider } from "./contexts/AuthContext";
import { router } from "./routes";

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ApolloProvider>
  );
}
