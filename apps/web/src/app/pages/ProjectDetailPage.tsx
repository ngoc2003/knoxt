import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  PROJECT_DETAIL_QUERY,
  UPDATE_PROJECT_MUTATION,
} from "../graphql/project";
import { MOVE_TASK_MUTATION } from "../graphql/task";
import { KanbanBoard } from "./KanbanBoard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "../components/ui/button";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { ProjectModal } from "../components/modal";

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

  const [moveTaskMutation] = useMutation(MOVE_TASK_MUTATION);
  const [updateProjectMutation] = useMutation(UPDATE_PROJECT_MUTATION);

  const project = (projectData as any)?.projectDetail;
  const tasks = project?.tasks || [];

  // State for ProjectModal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

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
    // refetch();
  };

  const handleSaveProject = async (projectData: any) => {
    if (!projectId) return;

    await updateProjectMutation({
      variables: {
        id: projectId,
        data: {
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          startDate: projectData.startDate,
          endDate: projectData.endDate || null,
        },
      },
      refetchQueries: [
        {
          query: PROJECT_DETAIL_QUERY,
          variables: { id: projectId },
        },
      ],
      awaitRefetchQueries: true,
    });
  };

  if (projectLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found.</div>;

  return (
    <div className="p-6">
      <nav className="mb-4 text-sm flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate("/projects")}>
            <ArrowLeft />
            Project List
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="min-w-20"
            aria-label="Edit project"
            onClick={() => setIsProjectModalOpen(true)}
          >
            <Pencil />
            Edit
          </Button>
          <Button
            size="icon"
            className="min-w-36"
            variant="default"
            aria-label="Edit project"
            onClick={() => setIsProjectModalOpen(true)}
          >
            <Plus />
            Add new task
          </Button>
        </div>
      </nav>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {project.name}
      </h1>
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard tasks={tasks} moveTask={handleMoveTask} />
      </DndProvider>
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        project={project}
      />
    </div>
  );
}
