import { Outlet } from "react-router";
import { GraphQLProvider } from "./AppProviders";

export function GraphQLShell() {
  return (
    <GraphQLProvider>
      <Outlet />
    </GraphQLProvider>
  );
}
