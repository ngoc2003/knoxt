import { Outlet } from "react-router";
import { PublicRoute } from "@/shared/components/RouteGuards";
import { AuthenticatedProvider } from "./AppProviders";

export function PublicAuthShell() {
  return (
    <AuthenticatedProvider>
      <PublicRoute>
        <Outlet />
      </PublicRoute>
    </AuthenticatedProvider>
  );
}
