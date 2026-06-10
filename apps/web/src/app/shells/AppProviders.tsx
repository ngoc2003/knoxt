import { ApolloProvider } from "@apollo/client/react";
import type { ReactNode } from "react";
import { AuthProvider } from "@/modules/auth/context/AuthContext";
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
      <AuthProvider>{children}</AuthProvider>
    </GraphQLProvider>
  );
}
