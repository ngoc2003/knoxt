import { useNavigate } from "react-router";
import { Card } from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";

export function ProjectCard({ project }: { project: any }) {
  const navigate = useNavigate();
  const clientName = project.customer?.name || "Unknown Client";
  const columns = project.columns || [];

  const totalIncomes =
    project.incomes?.reduce(
      (sum: number, income: any) => sum + income.amount,
      0,
    ) || 0;

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {project.name}
          </h2>

          <Badge
            className={
              project.status === "active"
                ? "bg-blue-100 text-blue-700"
                : project.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
            }
          >
            {project.status}
          </Badge>
        </div>

        <span className="text-sm font-medium text-green-600">
          ${totalIncomes.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      </div>
      <div className="text-sm text-gray-600 mb-2">{clientName}</div>
      <div className="flex flex-wrap gap-2 text-xs">
        {columns.map((column: any) => (
          <Badge key={column.id} variant="secondary">
            {column.name}:{" "}
            {project.tasks?.filter((task: any) => task.status === column.key)
              .length || 0}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
