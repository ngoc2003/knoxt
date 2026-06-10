import { Link } from "react-router";
import { BookOpen, FolderKanban, Search, Users } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { usePageTransitionArrival } from "@/shared/components/PageTransitionProvider";

const highlights = [
  {
    title: "Projects",
    description: "Keep project context and documentation together.",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Notes",
    description: "Capture requirements, meeting notes, and decisions.",
    path: "/notes",
    icon: BookOpen,
  },
  {
    title: "Customers",
    description: "Keep contact context close to the projects it supports.",
    path: "/customers",
    icon: Users,
  },
];

export function Dashboard() {
  usePageTransitionArrival();

  return (
    <div className="p-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Knowledge Hub
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Preserve project context and make important information easy to
            find.
          </p>
        </div>
        <Button
          asChild
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Link to="/notes">
            <Search className="mr-2 size-4" />
            Browse notes
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {highlights.map(({ title, description, path, icon: Icon }) => (
          <Link key={path} to={path}>
            <Card className="h-full border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-indigo-50">
                <Icon className="size-5 text-indigo-600" />
              </div>
              <h2 className="font-semibold text-gray-900">{title}</h2>
              <p className="mt-2 text-sm text-gray-600">{description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
