import { AIAssistant } from "@/modules/ai-assistant/components/AIAssistant";
import { ForgotPassword } from "@/modules/auth/components/ForgotPassword";
import { Login } from "@/modules/auth/components/Login";
import { Register } from "@/modules/auth/components/Register";
import { Customers } from "@/modules/customer/components/Customer";
import { CustomerDetail } from "@/modules/customer/components/CustomerDetail";
import { Dashboard } from "@/modules/dashboard/components/Dashboard";
import { Landing } from "@/modules/landing/Landing";
import { Notes } from "@/modules/notes/components/Notes";
import { PublicSharedNotePage } from "@/modules/notes/components/PublicSharedNotePage";
import { ProjectDetailPage } from "@/modules/project/components/ProjectDetailPage";
import { ProjectListPage } from "@/modules/project/components/ProjectListPage";
import { Settings } from "@/modules/settings/components/Settings";
import { ProtectedRoute, PublicRoute } from "@/shared/components/RouteGuards";
import { Layout } from "@/layout/Layout";
import { createBrowserRouter } from "react-router";

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
    path: "/shared/notes/:token",
    Component: PublicSharedNotePage,
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
      { path: "projects", Component: ProjectListPage },
      { path: "projects/:projectId", Component: ProjectDetailPage },
      { path: "customers", Component: Customers },
      { path: "customers/:id", Component: CustomerDetail },
      { path: "notes", Component: Notes },
      { path: "notes/:noteId", Component: Notes },
      { path: "ai-assistant", Component: AIAssistant },
      { path: "settings", Component: Settings },
    ],
  },
]);
