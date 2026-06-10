import { Layout } from "@/layout/Layout";
import { ProtectedRoute } from "@/shared/components/RouteGuards";
import { AuthenticatedProvider } from "./AppProviders";

export function ProtectedAppShell() {
  return (
    <AuthenticatedProvider>
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    </AuthenticatedProvider>
  );
}
