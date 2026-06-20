import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => ({
      Component: (await import("@/modules/landing/Landing")).Landing,
    }),
  },
  {
    lazy: async () => ({
      Component: (await import("./shells/PublicAuthShell")).PublicAuthShell,
    }),
    children: [
      {
        path: "/login",
        lazy: async () => ({
          Component: (await import("@/modules/auth/components/Login")).Login,
        }),
      },
      {
        path: "/register",
        lazy: async () => ({
          Component: (await import("@/modules/auth/components/Register"))
            .Register,
        }),
      },
      {
        path: "/forgot-password",
        lazy: async () => ({
          Component: (await import("@/modules/auth/components/ForgotPassword"))
            .ForgotPassword,
        }),
      },
    ],
  },
  {
    lazy: async () => ({
      Component: (await import("./shells/GraphQLShell")).GraphQLShell,
    }),
    children: [
      {
        path: "/shared/notes/:token",
        lazy: async () => ({
          Component: (
            await import("@/modules/notes/components/PublicSharedNotePage")
          ).PublicSharedNotePage,
        }),
      },
    ],
  },
  {
    path: "/",
    lazy: async () => ({
      Component: (await import("./shells/ProtectedAppShell")).ProtectedAppShell,
    }),
    children: [
      {
        path: "dashboard",
        lazy: async () => ({
          Component: (await import("@/modules/dashboard/components/Dashboard"))
            .Dashboard,
        }),
      },
      {
        path: "projects",
        lazy: async () => ({
          Component: (
            await import("@/modules/project/components/ProjectListPage")
          ).ProjectListPage,
        }),
      },
      {
        path: "projects/:projectId/tasks/:taskId",
        lazy: async () => ({
          Component: (
            await import("@/modules/project/components/ProjectDetailPage")
          ).ProjectDetailPage,
        }),
      },
      {
        path: "projects/:projectId",
        lazy: async () => ({
          Component: (
            await import("@/modules/project/components/ProjectDetailPage")
          ).ProjectDetailPage,
        }),
      },
      {
        path: "customers",
        lazy: async () => ({
          Component: (await import("@/modules/customer/components/Customer"))
            .Customers,
        }),
      },
      {
        path: "customers/:id",
        lazy: async () => ({
          Component: (
            await import("@/modules/customer/components/CustomerDetail")
          ).CustomerDetail,
        }),
      },
      {
        path: "notes",
        lazy: async () => ({
          Component: (await import("@/modules/notes/components/Notes")).Notes,
        }),
      },
      {
        path: "notes/:noteId",
        lazy: async () => ({
          Component: (await import("@/modules/notes/components/Notes")).Notes,
        }),
      },
      {
        path: "ai-assistant",
        lazy: async () => ({
          Component: (
            await import("@/modules/ai-assistant/components/AIAssistant")
          ).AIAssistant,
        }),
      },
      {
        path: "settings",
        lazy: async () => ({
          Component: (await import("@/modules/settings/components/Settings"))
            .Settings,
        }),
      },
    ],
  },
]);
