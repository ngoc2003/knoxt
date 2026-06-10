import { RouterProvider } from "react-router";
import { router } from "./routes";
import { PageTransitionProvider } from "@/shared/components/PageTransitionProvider";

export default function App() {
  return (
    <PageTransitionProvider>
      <RouterProvider router={router} />
    </PageTransitionProvider>
  );
}
