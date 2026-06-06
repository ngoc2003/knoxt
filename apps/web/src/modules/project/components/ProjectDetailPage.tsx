import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  PROJECT_DETAIL_QUERY,
  CREATE_PROJECT_COLUMN_MUTATION,
  REORDER_PROJECT_COLUMNS_MUTATION,
  UPDATE_PROJECT_MUTATION,
} from "../graphql/project";

import { KanbanBoard } from "../../task/components/KanbanBoard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ArrowLeft, Columns3, Pencil, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import {
  MOVE_TASK_MUTATION,
  CREATE_TASK_MUTATION,
} from "@/modules/task/graphql/task";
import { ProjectModal } from "./ProjectModal";
import { Button } from "@/shared/ui/button";
import { TaskModal } from "@/modules/task/components/TaskModal";
import { Input } from "@/shared/ui/input";
import { useAuth } from "@/modules/auth/context/AuthContext";
import { ProjectMembersDialog } from "./ProjectMembersDialog";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: string;
  dueDate?: string;
  projectId: string;
}

interface ProjectColumn {
  id: string;
  key: string;
  name: string;
  orderIndex: number;
}

interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  customerId: string;
  tasks: Task[];
  columns: ProjectColumn[];
  members: {
    id: string;
    userId: string;
    role: "viewer" | "editor" | "admin";
    user: { name: string; email: string };
  }[];
  invitations: {
    id: string;
    email: string;
    role: "viewer" | "editor" | "admin";
  }[];
}

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: projectData, loading: projectLoading } = useQuery(
    PROJECT_DETAIL_QUERY,
    {
      variables: { id: projectId },
      skip: !projectId,
    },
  );

  const [moveTaskMutation] = useMutation(MOVE_TASK_MUTATION);
  const [updateProjectMutation] = useMutation(UPDATE_PROJECT_MUTATION);
  const [createTaskMutation] = useMutation(CREATE_TASK_MUTATION);
  const [createProjectColumnMutation] = useMutation(
    CREATE_PROJECT_COLUMN_MUTATION,
  );
  const [reorderProjectColumnsMutation] = useMutation(
    REORDER_PROJECT_COLUMNS_MUTATION,
  );

  const project = (projectData as any)?.projectDetail;

  // State for ProjectModal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  // State for TaskModal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const [tasksState, setTasksState] = useState([] as Task[]);
  const [columnsState, setColumnsState] = useState([] as ProjectColumn[]);

  // Update tasks state when project data changes
  useEffect(() => {
    if (project?.tasks) {
      setTasksState(project.tasks);
    }
  }, [project]);

  useEffect(() => {
    if (project?.columns) {
      setColumnsState(
        [...project.columns].sort(
          (a: ProjectColumn, b: ProjectColumn) => a.orderIndex - b.orderIndex,
        ),
      );
    }
  }, [project]);

  const handleMoveTask = async (
    taskId: string,
    newStatus: string,
    newOrderIndex = 0,
  ) => {
    try {
      const { data }: { data?: { moveTask: Task } } = await moveTaskMutation({
        variables: {
          input: { id: taskId, status: newStatus, orderIndex: newOrderIndex },
        },
      });

      const updatedTask = data?.moveTask;

      if (!updatedTask) {
        throw new Error("The server did not return the moved task");
      }

      if (updatedTask.status !== newStatus) {
        alert(
          `Task status has been updated to '${updatedTask.status}' on the server. Please try again with the new status card.`,
        );
      } else {
        // Update the task locally
        const updatedTasks = tasksState.map((task: Task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        );
        setTasksState(updatedTasks);
      }
    } catch (error) {
      console.error("Failed to move task", error);
    }
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

  const handleCreateColumn = async () => {
    const name = newColumnName.trim();
    if (!name || !projectId) return;

    await createProjectColumnMutation({
      variables: { data: { projectId, name } },
      refetchQueries: [
        { query: PROJECT_DETAIL_QUERY, variables: { id: projectId } },
      ],
      awaitRefetchQueries: true,
    });
    setNewColumnName("");
  };

  const handleMoveColumn = async (columnId: string, targetColumnId: string) => {
    const sourceIndex = columnsState.findIndex(
      (column) => column.id === columnId,
    );
    const targetIndex = columnsState.findIndex(
      (column) => column.id === targetColumnId,
    );
    if (
      sourceIndex === -1 ||
      targetIndex === -1 ||
      sourceIndex === targetIndex
    ) {
      return;
    }

    const previousColumns = columnsState;
    const reorderedColumns = [...columnsState];
    const [movedColumn] = reorderedColumns.splice(sourceIndex, 1);
    reorderedColumns.splice(targetIndex, 0, movedColumn);
    const optimisticColumns = reorderedColumns.map((column, orderIndex) => ({
      ...column,
      orderIndex,
    }));
    setColumnsState(optimisticColumns);

    try {
      const { data } = await reorderProjectColumnsMutation({
        variables: {
          data: {
            projectId,
            columnIds: optimisticColumns.map((column) => column.id),
          },
        },
      });
      const savedColumns = (data as any)?.reorderProjectColumns;
      if (savedColumns) setColumnsState(savedColumns);
    } catch (error) {
      setColumnsState(previousColumns);
      console.error("Failed to reorder project columns", error);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      await createTaskMutation({
        variables: { input: taskData },
        refetchQueries: [
          {
            query: PROJECT_DETAIL_QUERY,
            variables: { id: projectId },
          },
        ],
        awaitRefetchQueries: true,
      });
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  if (projectLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found.</div>;

  const membership = project.members.find(
    (member: Project["members"][number]) => member.userId === user?.id,
  );
  const isOwner = project.userId === user?.id;
  const canEdit =
    isOwner || membership?.role === "editor" || membership?.role === "admin";
  const canManageMembers = isOwner || membership?.role === "admin";

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
          {canManageMembers && (
            <ProjectMembersDialog
              projectId={project.id}
              members={project.members}
              invitations={project.invitations}
            />
          )}
          {canEdit && (
            <>
              <Input
                value={newColumnName}
                onChange={(event) => setNewColumnName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void handleCreateColumn();
                }}
                placeholder="New column name"
                className="w-44"
              />
              <Button
                variant="outline"
                disabled={!newColumnName.trim()}
                onClick={handleCreateColumn}
              >
                <Columns3 />
                Add column
              </Button>
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
                aria-label="Add new task"
                onClick={() => setIsTaskModalOpen(true)}
              >
                <Plus />
                Add new task
              </Button>
            </>
          )}
        </div>
      </nav>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {project.name}
      </h1>
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard
          tasks={tasksState}
          columns={columnsState}
          moveTask={handleMoveTask}
          moveColumn={handleMoveColumn}
          canEdit={canEdit}
        />
      </DndProvider>
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        project={project}
      />
      <TaskModal
        task={{ projectId: project.id }}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateTask}
        columns={columnsState}
        availableTags={[]}
      />
    </div>
  );
}
