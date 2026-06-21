import { ApolloProvider } from "@apollo/client/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";
import { AuthProvider } from "@/modules/auth/context/AuthContext";
import { GOOGLE_CLIENT_ID } from "@/configs/common";
import { client } from "@/shared/lib/apollo";
import { Toaster } from "@/shared/ui/sonner";

export function GraphQLProvider({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
      <Toaster position="top-right" richColors />
    </ApolloProvider>
  );
}

export function AuthenticatedProvider({ children }: { children: ReactNode }) {
  return (
    <GraphQLProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "missing-client-id"}>
        <AuthProvider>{children}</AuthProvider>
      </GoogleOAuthProvider>
    </GraphQLProvider>
  );
}
