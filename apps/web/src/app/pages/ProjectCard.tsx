import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function ProjectCard({ project }: { project: any }) {
  const navigate = useNavigate();
  const clientName = project.customer?.name || "Unknown Client";
  const todoCount =
    project.tasks?.filter((t: any) => t.status === "todo").length || 0;
  const doingCount =
    project.tasks?.filter((t: any) => t.status === "doing").length || 0;
  const doneCount =
    project.tasks?.filter((t: any) => t.status === "done").length || 0;

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
        <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>

        <span className="text-sm font-medium text-green-600">
          ${totalIncomes.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      </div>
      <div className="text-sm text-gray-600 mb-2">{clientName}</div>
      <div className="flex gap-2 text-xs">
        <Badge variant="secondary">To-do: {todoCount}</Badge>
        <Badge variant="secondary">Doing: {doingCount}</Badge>
        <Badge variant="secondary">Done: {doneCount}</Badge>
      </div>
    </Card>
  );
}
