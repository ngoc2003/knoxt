import { ArrowUpRight, Building2, CheckCircle2, FileText } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";

const statusStyles: Record<string, string> = {
  active: "bg-indigo-50 text-indigo-700",
  on_hold: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  archived: "bg-gray-100 text-gray-600",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  archived: "Archived",
};

export function ProjectCard({ project }: { project: any }) {
  const navigate = useNavigate();
  const columns = project.columns ?? [];
  const tasks = project.tasks ?? [];
  const doneKeys = new Set(
    columns
      .filter((column: any) => column.key === "done")
      .map((column: any) => column.key),
  );
  const doneCount = tasks.filter((task: any) => doneKeys.has(task.status)).length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <Card
      role="button"
      tabIndex={0}
      className="group relative cursor-pointer overflow-hidden border-gray-200 bg-white p-0 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
      onClick={() => navigate(`/projects/${project.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter") navigate(`/projects/${project.id}`);
      }}
    >
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-400" />
      <div className="p-5 pt-0">
        <div className="mb-5 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge className={statusStyles[project.status] ?? statusStyles.archived}>
                {statusLabels[project.status] ?? project.status}
              </Badge>
              <span className="text-xs text-gray-400">
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="truncate text-lg font-semibold text-gray-950">
              {project.name}
            </h2>
            <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
              {project.description || "No description added yet."}
            </p>
          </div>
          <div className="rounded-full bg-gray-50 p-2 text-gray-400 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
            <ArrowUpRight className="size-4" />
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
              <CheckCircle2 className="size-3.5" />
              Tasks
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {doneCount}
              <span className="text-sm font-normal text-gray-400">/{tasks.length}</span>
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
              <FileText className="size-3.5" />
              Documents
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {project.noteCount ?? 0}
            </p>
          </div>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-gray-600">Progress</span>
            <span className="font-semibold text-indigo-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-indigo-100" />
        </div>

        <div className="flex items-center gap-2 border-t pt-4 text-sm text-gray-500">
          <Building2 className="size-4 shrink-0 text-gray-400" />
          <span className="truncate">{project.customer?.name || "Internal project"}</span>
          <div className="ml-auto flex gap-1">
            {columns.slice(0, 3).map((column: any) => (
              <span
                key={column.id}
                title={`${column.name}: ${tasks.filter((task: any) => task.status === column.key).length}`}
                className="size-2 rounded-full bg-gray-300"
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
