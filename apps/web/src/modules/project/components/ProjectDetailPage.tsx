import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  PROJECT_DETAIL_QUERY,
  DELETE_PROJECT_MUTATION,
  REORDER_PROJECT_COLUMNS_MUTATION,
  UPDATE_PROJECT_MUTATION,
} from "../graphql/project";

import { KanbanBoard } from "../../task/components/KanbanBoard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ArrowLeft,
  Columns3,
  FileText,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  BULK_MOVE_TASKS_MUTATION,
  MOVE_TASK_MUTATION,
  CREATE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
} from "@/modules/task/graphql/task";
import { ProjectModal } from "./ProjectModal";
import { Button } from "@/shared/ui/button";
import { TaskModal } from "@/modules/task/components/TaskModal";
import { useAuth } from "@/modules/auth/context/AuthContext";
import { ProjectMembersDialog } from "./ProjectMembersDialog";
import { ManageProjectColumnsDialog } from "./ManageProjectColumnsDialog";
import { DeleteConfirmDialog } from "@/shared/components/DeleteConfirmDialog";
import { ProjectNotesDialog } from "./ProjectNotesDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ProjectOverview } from "./ProjectOverview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: string;
  orderKey: string;
  dueDate?: string;
  projectId: string;
  assigneeId?: string | null;
  assignee?: { id: string; name: string; email: string } | null;
  tags?: { id: string; name: string; color?: string | null }[];
}

interface TaskFormData {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: string;
  dueDate?: string;
  projectId: string;
  assigneeId?: string | null;
  tags?: string[];
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
  startDate?: string;
  endDate?: string;
  customerId?: string;
  tasks: Task[];
  columns: ProjectColumn[];
  members: {
    id: string;
    userId: string;
    role: "viewer" | "editor" | "admin";
    user: { name: string; email: string; avatarUrl?: string | null };
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
  const [bulkMoveTasksMutation, { loading: bulkMoveLoading }] = useMutation(
    BULK_MOVE_TASKS_MUTATION,
  );
  const [updateProjectMutation] = useMutation(UPDATE_PROJECT_MUTATION);
  const [createTaskMutation] = useMutation(CREATE_TASK_MUTATION);
  const [updateTaskMutation] = useMutation(UPDATE_TASK_MUTATION);
  const [deleteProjectMutation] = useMutation(DELETE_PROJECT_MUTATION);
  const [reorderProjectColumnsMutation] = useMutation(
    REORDER_PROJECT_COLUMNS_MUTATION,
  );

  const project = (projectData as any)?.projectDetail;

  // State for ProjectModal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  // State for TaskModal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [isProjectNotesOpen, setIsProjectNotesOpen] = useState(false);
  const [focusedProjectNoteId, setFocusedProjectNoteId] = useState<string>();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [bulkStatus, setBulkStatus] = useState("");

  const [tasksState, setTasksState] = useState([] as Task[]);
  const [columnsState, setColumnsState] = useState([] as ProjectColumn[]);

  // Update tasks state when project data changes
  useEffect(() => {
    if (project?.tasks) {
      setTasksState(project.tasks);
    }
  }, [project]);

  useEffect(() => {
    if (
      columnsState[0] &&
      !columnsState.some((column) => column.key === bulkStatus)
    ) {
      setBulkStatus(columnsState[0].key);
    }
  }, [bulkStatus, columnsState]);

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
      const result = await moveTaskMutation({
        variables: {
          input: { id: taskId, status: newStatus, orderIndex: newOrderIndex },
        },
      });

      const updatedTask = (result.data as { moveTask?: Task } | undefined)
        ?.moveTask;

      if (!updatedTask) {
        throw new Error("The server did not return the moved task");
      }

      if (updatedTask.status !== newStatus) {
        alert(
          `Task status has been updated to '${updatedTask.status}' on the server. Please try again with the new status card.`,
        );
      } else {
        setTasksState((currentTasks) =>
          currentTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: updatedTask.status,
                  orderKey: updatedTask.orderKey,
                }
              : task,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to move task", error);
    }
  };

  const handleTaskSelectionChange = (taskId: string, selected: boolean) => {
    setSelectedTaskIds((current) => {
      const next = new Set(current);
      if (selected) next.add(taskId);
      else next.delete(taskId);
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectedTaskIds(new Set());
    setSelectionMode(false);
  };

  const handleBulkMoveTasks = async () => {
    if (!projectId || !bulkStatus || selectedTaskIds.size === 0) return;

    const columnOrder = new Map(
      columnsState.map((column, index) => [column.key, index]),
    );
    const orderedTaskIds = tasksState
      .filter((task) => selectedTaskIds.has(task.id))
      .sort((a, b) => {
        const statusOrder =
          (columnOrder.get(a.status) ?? 0) - (columnOrder.get(b.status) ?? 0);
        if (statusOrder !== 0) return statusOrder;
        return a.orderKey.localeCompare(b.orderKey);
      })
      .map((task) => task.id);

    try {
      const { data } = await bulkMoveTasksMutation({
        variables: {
          input: { projectId, taskIds: orderedTaskIds, status: bulkStatus },
        },
      });
      const movedTasks = (
        data as { bulkMoveTasks?: Pick<Task, "id" | "status" | "orderKey">[] }
      )?.bulkMoveTasks;
      if (!movedTasks) {
        throw new Error("The server did not return the moved tasks");
      }

      const movedById = new Map(movedTasks.map((task) => [task.id, task]));
      setTasksState((currentTasks) =>
        currentTasks.map((task) => ({
          ...task,
          ...(movedById.get(task.id) ?? {}),
        })),
      );
      exitSelectionMode();
    } catch (error) {
      console.error("Failed to bulk move tasks", error);
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
          customerId: projectData.customerId || null,
          startDate: projectData.startDate || null,
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

  const handleCreateTask = async (taskData: Partial<TaskFormData>) => {
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

  const handleSaveTask = async (taskData: Partial<TaskFormData>) => {
    const input = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: taskData.status,
      dueDate: taskData.dueDate || undefined,
      assigneeId: taskData.assigneeId ?? null,
      tags: taskData.tags,
      ...(!selectedTask && { projectId }),
    };

    if (selectedTask) {
      await updateTaskMutation({
        variables: { id: selectedTask.id, data: input },
        refetchQueries: [
          { query: PROJECT_DETAIL_QUERY, variables: { id: projectId } },
        ],
        awaitRefetchQueries: true,
      });
      return;
    }

    await handleCreateTask(input);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    await deleteProjectMutation({ variables: { id: projectId } });
    navigate("/projects");
  };

  if (projectLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found.</div>;

  const membership = project.members.find(
    (member: Project["members"][number]) => member.userId === user?.id,
  );
  const isOwner = project.userId === user?.id;
  const canEdit =
    isOwner || membership?.role === "editor" || membership?.role === "admin";

  return (
    <div className="p-6">
      <nav className="sticky top-0 z-20 -mx-6 -mt-6 mb-4 flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 text-sm shadow-sm">
        <div>
          <Button variant="ghost" onClick={() => navigate("/projects")}>
            <ArrowLeft />
            Project List
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setFocusedProjectNoteId(undefined);
              setIsProjectNotesOpen(true);
            }}
          >
            <FileText />
            Documents
          </Button>
          {isOwner && (
            <ProjectMembersDialog
              projectId={project.id}
              members={project.members}
              invitations={project.invitations}
            />
          )}
          {canEdit && (
            <>
              <Button
                variant={selectionMode ? "secondary" : "outline"}
                onClick={() => {
                  if (selectionMode) exitSelectionMode();
                  else setSelectionMode(true);
                }}
              >
                <ListChecks />
                {selectionMode ? "Cancel selection" : "Select tasks"}
              </Button>
              <Button
                size="icon"
                className="min-w-36"
                variant="default"
                aria-label="Add new task"
                onClick={() => {
                  setSelectedTask(null);
                  setIsTaskModalOpen(true);
                }}
              >
                <Plus />
                Add new task
              </Button>
            </>
          )}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsProjectModalOpen(true)}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setIsManageColumnsOpen(true)}>
                  <Columns3 />
                  Manage columns
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setIsDeleteProjectOpen(true)}
                >
                  <Trash2 />
                  Delete project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {project.name}
      </h1>
      <ProjectOverview
        projectId={project.id}
        onOpenDocument={(noteId) => {
          setFocusedProjectNoteId(noteId);
          setIsProjectNotesOpen(true);
        }}
      />
      {selectionMode && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-indigo-100 bg-indigo-50 p-3">
          <span className="text-sm font-medium text-indigo-900">
            {selectedTaskIds.size} selected
          </span>
          <Select value={bulkStatus} onValueChange={setBulkStatus}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue placeholder="Move to status" />
            </SelectTrigger>
            <SelectContent>
              {columnsState.map((column) => (
                <SelectItem key={column.id} value={column.key}>
                  {column.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => void handleBulkMoveTasks()}
            disabled={
              selectedTaskIds.size === 0 || !bulkStatus || bulkMoveLoading
            }
          >
            {bulkMoveLoading ? "Applying..." : "Apply"}
          </Button>
          <Button variant="ghost" onClick={exitSelectionMode}>
            Cancel
          </Button>
        </div>
      )}
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard
          tasks={tasksState}
          columns={columnsState}
          moveTask={handleMoveTask}
          moveColumn={handleMoveColumn}
          canEdit={canEdit}
          canManageColumns={isOwner}
          selectionMode={selectionMode}
          selectedTaskIds={selectedTaskIds}
          onTaskSelectionChange={handleTaskSelectionChange}
          onTaskClick={(task) => {
            setSelectedTask(task as Task);
            setIsTaskModalOpen(true);
          }}
        />
      </DndProvider>
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        project={project}
      />
      <TaskModal
        task={
          selectedTask
            ? {
                ...selectedTask,
                tags: selectedTask.tags?.map((tag) => tag.name),
              }
            : { projectId: project.id }
        }
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        onSave={handleSaveTask}
        columns={columnsState}
        members={project.members}
        availableTags={[
          ...new Set(
            tasksState.flatMap(
              (task) => task.tags?.map((tag) => tag.name) ?? [],
            ),
          ),
        ]}
      />
      <ManageProjectColumnsDialog
        isOpen={isManageColumnsOpen}
        onClose={() => setIsManageColumnsOpen(false)}
        projectId={project.id}
        columns={columnsState}
        taskCounts={tasksState.reduce<Record<string, number>>(
          (counts, task) => ({
            ...counts,
            [task.status]: (counts[task.status] ?? 0) + 1,
          }),
          {},
        )}
      />
      <DeleteConfirmDialog
        isOpen={isDeleteProjectOpen}
        onClose={() => setIsDeleteProjectOpen(false)}
        onConfirm={() => void handleDeleteProject()}
        title="Delete project?"
        description={`This will delete "${project.name}" and remove it for every project member.`}
      />
      <ProjectNotesDialog
        projectId={project.id}
        projectName={project.name}
        focusedNoteId={focusedProjectNoteId}
        open={isProjectNotesOpen}
        onOpenChange={setIsProjectNotesOpen}
      />
    </div>
  );
}
