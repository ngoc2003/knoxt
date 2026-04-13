import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation } from "@apollo/client/react";
import { PROJECT_DETAIL_QUERY } from "../graphql/project";
import { TASKS_QUERY, MOVE_TASK_MUTATION } from "../graphql/task";
import { KanbanBoard } from "./KanbanBoard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { data: projectData, loading: projectLoading } = useQuery(
    PROJECT_DETAIL_QUERY,
    {
      variables: { id: projectId },
      skip: !projectId,
    },
  );
  const {
    data: tasksData,
    loading: tasksLoading,
    refetch,
  } = useQuery(TASKS_QUERY, {
    variables: { filter: { projectId }, pagination: { skip: 0, take: 100 } },
    skip: !projectId,
  });
  const [moveTaskMutation] = useMutation(MOVE_TASK_MUTATION);

  const tasks = (tasksData as any)?.tasks?.items || [];
  const project = (projectData as any)?.projectDetail;

  const handleMoveTask = async (
    taskId: string,
    newStatus: string,
    newOrderIndex = 0,
  ) => {
    await moveTaskMutation({
      variables: {
        input: { id: taskId, status: newStatus, orderIndex: newOrderIndex },
      },
    });
    refetch();
  };

  if (projectLoading || tasksLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found.</div>;

  return (
    <div className="p-6">
      <nav className="mb-4 text-sm">
        <button
          onClick={() => navigate("/projects")}
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          <span aria-hidden="true">←</span> Project List
        </button>
      </nav>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {project.name}
      </h1>
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard tasks={tasks} moveTask={handleMoveTask} />
      </DndProvider>
    </div>
  );
}
