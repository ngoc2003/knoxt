import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { Notes } from "./pages/Notes";
import { Finance } from "./pages/Finance";
import { AIAssistant } from "./pages/AIAssistant";
import { Settings } from "./pages/Settings";
import { Landing } from "./pages/Landing";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Landing },
      { path: "dashboard", Component: Dashboard },
      { path: "projects", Component: Projects },
      { path: "notes", Component: Notes },
      { path: "finance", Component: Finance },
      { path: "ai-assistant", Component: AIAssistant },
      { path: "settings", Component: Settings },
    ],
  },
]);
