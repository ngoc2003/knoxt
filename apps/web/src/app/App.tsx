import { ApolloProvider } from "@apollo/client/react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { client } from "@/shared/lib/apollo";
import { AuthProvider } from "@/modules/auth/context/AuthContext";
import { Toaster } from "@/shared/ui/sonner";

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ApolloProvider>
  );
}
