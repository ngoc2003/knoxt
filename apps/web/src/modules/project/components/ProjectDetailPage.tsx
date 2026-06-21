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
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Columns3,
  FileText,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Plus,
  Library,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useState, useEffect, useLayoutEffect } from "react";
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
import { StructuredKnowledge } from "./StructuredKnowledge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/ui/utils";

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
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: projectData,
    loading: projectLoading,
    error: projectError,
  } = useQuery(PROJECT_DETAIL_QUERY, {
    variables: { id: projectId },
    skip: !projectId,
  });

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
  const [documentsOverviewOpen, setDocumentsOverviewOpen] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [workspaceView, setWorkspaceView] = useState<"tasks" | "resources">(
    "tasks",
  );

  const [tasksState, setTasksState] = useState([] as Task[]);
  const [columnsState, setColumnsState] = useState([] as ProjectColumn[]);

  // Update tasks state when project data changes
  useLayoutEffect(() => {
    if (project?.tasks) {
      setTasksState(project.tasks);
    }
  }, [project]);

  useEffect(() => {
    if (!projectError || !projectId) return;
    navigate("/projects", {
      replace: true,
      state: {
        accessDeniedProjectId: projectId,
        accessDeniedTaskId: taskId,
      },
    });
  }, [navigate, projectError, projectId, taskId]);

  useEffect(() => {
    if (!taskId || tasksState.length === 0) return;
    const routedTask = tasksState.find((task) => task.id === taskId);
    if (!routedTask) return;
    setSelectedTask(routedTask);
    setIsTaskModalOpen(true);
    setWorkspaceView("tasks");
  }, [taskId, tasksState]);

  useEffect(() => {
    if (
      columnsState[0] &&
      !columnsState.some((column) => column.key === bulkStatus)
    ) {
      setBulkStatus(columnsState[0].key);
    }
  }, [bulkStatus, columnsState]);

  useLayoutEffect(() => {
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
    if (taskId && projectId) {
      navigate(`/projects/${projectId}`, { replace: true });
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    await deleteProjectMutation({ variables: { id: projectId } });
    navigate("/projects");
  };

  if (projectLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-8 w-72" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }
  if (!project) return <div>Project not found.</div>;

  const membership = project.members.find(
    (member: Project["members"][number]) => member.userId === user?.id,
  );
  const isOwner = project.userId === user?.id;
  const canEdit =
    isOwner || membership?.role === "editor" || membership?.role === "admin";
  const canViewActivity = isOwner || membership?.role === "admin";
  const completedTasks = tasksState.filter((task) => {
    const status = task.status.toLowerCase();
    return status.includes("done") || status.includes("complete");
  }).length;
  const overdueTasks = tasksState.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date(),
  ).length;
  const projectDateRange = [project.startDate, project.endDate]
    .filter(Boolean)
    .map((date) =>
      new Date(date as string).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    )
    .join(" - ");
  const statusToneByStatus: Record<string, string> = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    completed: "border-sky-200 bg-sky-50 text-sky-700",
    archived: "border-slate-200 bg-slate-50 text-slate-600",
    paused: "border-amber-200 bg-amber-50 text-amber-700",
  };
  const statusTone =
    statusToneByStatus[project.status?.toLowerCase?.() ?? ""] ??
    "border-indigo-200 bg-indigo-50 text-indigo-700";

  return (
    <div className="min-h-full bg-[#f6f8fb]">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-white/80 bg-white/90 px-6 py-3 text-sm shadow-sm backdrop-blur">
        <Button variant="ghost" onClick={() => navigate("/projects")}>
          <ArrowLeft />
          Projects
        </Button>
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
          {canEdit && workspaceView === "tasks" && (
            <>
              <Button
                variant={selectionMode ? "secondary" : "outline"}
                onClick={() => {
                  if (selectionMode) exitSelectionMode();
                  else setSelectionMode(true);
                }}
              >
                <ListChecks />
                {selectionMode ? "Cancel" : "Select"}
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                aria-label="Add new task"
                onClick={() => {
                  setSelectedTask(null);
                  setIsTaskModalOpen(true);
                }}
              >
                <Plus />
                Add task
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

      <div className="space-y-5 p-6">
        <section className="rounded-lg border border-white bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-semibold capitalize",
                    statusTone,
                  )}
                >
                  {project.status}
                </span>
                {projectDateRange && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                    <CalendarDays className="size-3.5" />
                    {projectDateRange}
                  </span>
                )}
              </div>
              <h1 className="truncate text-2xl font-semibold text-gray-950">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                  {project.description}
                </p>
              )}
            </div>
            <div className="grid min-w-full grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[33rem]">
              <ProjectMetric
                label="Tasks"
                value={tasksState.length}
                icon={<Columns3 className="size-4" />}
                className="bg-indigo-50 text-indigo-700"
              />
              <ProjectMetric
                label="Done"
                value={completedTasks}
                icon={<CheckCircle2 className="size-4" />}
                className="bg-emerald-50 text-emerald-700"
              />
              <ProjectMetric
                label="Due"
                value={overdueTasks}
                icon={<CalendarDays className="size-4" />}
                className="bg-rose-50 text-rose-700"
              />
              <ProjectMetric
                label="Members"
                value={project.members.length + 1}
                icon={<UsersRound className="size-4" />}
                className="bg-amber-50 text-amber-700"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-fit rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <Button
              size="sm"
              variant={workspaceView === "tasks" ? "default" : "ghost"}
              onClick={() => setWorkspaceView("tasks")}
            >
              <Columns3 />
              Board
            </Button>
            <Button
              size="sm"
              variant={workspaceView === "resources" ? "default" : "ghost"}
              onClick={() => setWorkspaceView("resources")}
            >
              <Library />
              Resources
            </Button>
          </div>
          {workspaceView === "tasks" && (
            <p className="text-sm text-gray-500">
              Drag cards to reorder work. Drag column headers to tune the flow.
            </p>
          )}
        </div>

        {workspaceView === "tasks" && selectionMode && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3 shadow-sm">
            <span className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-indigo-900">
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
              {bulkMoveLoading ? "Applying..." : "Apply move"}
            </Button>
            <Button variant="ghost" onClick={exitSelectionMode}>
              Cancel
            </Button>
          </div>
        )}

        {workspaceView === "tasks" && (
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
        )}
        {workspaceView === "resources" && (
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Project resources
              </h2>
              <p className="text-sm text-gray-500">
                Open supporting documents and structured knowledge only when you
                need them.
              </p>
            </div>
            <ResourcePanel
              icon={<BookOpen className="size-4" />}
              title="Document overview"
              description="Recent documents, pinned documents and attachments"
              open={documentsOverviewOpen}
              onOpenChange={setDocumentsOverviewOpen}
            >
              <ProjectOverview
                projectId={project.id}
                onOpenDocument={(noteId) => {
                  setFocusedProjectNoteId(noteId);
                  setIsProjectNotesOpen(true);
                }}
              />
            </ResourcePanel>
            <ResourcePanel
              icon={<Library className="size-4" />}
              title="Structured Knowledge"
              description="Decisions, meetings, requirements, search and activity"
              open={knowledgeOpen}
              onOpenChange={setKnowledgeOpen}
            >
              <StructuredKnowledge
                projectId={project.id}
                canEdit={canEdit}
                canViewActivity={canViewActivity}
                onTaskCreated={(task) => {
                  const promotedTask: Task = {
                    ...task,
                    description: task.description ?? undefined,
                    dueDate: task.dueDate ?? undefined,
                    tags: task.tags ?? [],
                  };
                  setTasksState((currentTasks) => {
                    if (
                      currentTasks.some((item) => item.id === promotedTask.id)
                    ) {
                      return currentTasks.map((item) =>
                        item.id === promotedTask.id
                          ? { ...item, ...promotedTask }
                          : item,
                      );
                    }
                    return [...currentTasks, promotedTask];
                  });
                }}
              />
            </ResourcePanel>
          </section>
        )}
      </div>
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

function ProjectMetric({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-md",
            className,
          )}
        >
          {icon}
        </span>
      </div>
      <p className="text-xl font-semibold text-gray-950">{value}</p>
    </div>
  );
}

function ResourcePanel({
  icon,
  title,
  description,
  open,
  onOpenChange,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="rounded-xl border bg-white">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-gray-50"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="rounded-md bg-gray-100 p-2 text-gray-600">
                {icon}
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-gray-900">{title}</span>
                <span className="block truncate text-sm text-gray-500">
                  {description}
                </span>
              </span>
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-gray-500 transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t p-4">{open ? children : null}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
