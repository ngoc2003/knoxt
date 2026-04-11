import { createBrowserRouter } from "react-router";
import { ProtectedRoute, PublicRoute } from "./components/RouteGuards";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { CustomerDetail } from "./pages/CustomerDetail";
import { Notes } from "./pages/Notes";
import { Finance } from "./pages/Finance";
import { AIAssistant } from "./pages/AIAssistant";
import { Settings } from "./pages/Settings";
import { Customers } from "./pages/Customer";
import { Layout } from "./layout/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", Component: Dashboard },
      { path: "projects", Component: Projects },
      { path: "customers", Component: Customers },
      { path: "customers/:id", Component: CustomerDetail },
      { path: "notes", Component: Notes },
      { path: "finance", Component: Finance },
      { path: "ai-assistant", Component: AIAssistant },
      { path: "settings", Component: Settings },
    ],
  },
]);
