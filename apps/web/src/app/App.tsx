import { ApolloProvider } from "@apollo/client/react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { client } from "@/shared/lib/apollo";
import { AuthProvider } from "@/modules/auth/context/AuthContext";

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ApolloProvider>
  );
}
