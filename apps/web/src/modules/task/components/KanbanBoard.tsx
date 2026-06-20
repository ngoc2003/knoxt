import { useDrop, useDrag } from "react-dnd";
import { useRef } from "react";
import { Badge } from "../../../shared/ui/badge";
import { Checkbox } from "../../../shared/ui/checkbox";
import { cn } from "../../../shared/ui/utils";
import {
  Calendar,
  ClipboardList,
  Flag,
  GripVertical,
  MessageSquare,
  Paperclip,
  UserRound,
} from "lucide-react";

type Priority = "low" | "medium" | "high";
type Status = string;

interface ProjectColumn {
  id: string;
  key: string;
  name: string;
  orderIndex: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  tags?: { id: string; name: string; color?: string | null }[];
  priority: Priority;
  status: Status;
  orderKey: string;
  dueDate?: string;
  assignee?: { id: string; name: string } | null;
}
export function KanbanBoard({
  tasks,
  columns,
  moveTask,
  moveColumn,
  canEdit,
  canManageColumns,
  selectionMode,
  selectedTaskIds,
  onTaskSelectionChange,
  onTaskClick,
}: {
  tasks: Task[];
  columns: ProjectColumn[];
  moveTask: (taskId: string, newStatus: string, newOrderIndex?: number) => void;
  moveColumn: (columnId: string, targetColumnId: string) => void;
  canEdit: boolean;
  canManageColumns: boolean;
  selectionMode: boolean;
  selectedTaskIds: Set<string>;
  onTaskSelectionChange: (taskId: string, selected: boolean) => void;
  onTaskClick: (task: Task) => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-17rem)] gap-4 overflow-x-auto pb-5">
      {columns.map((column, index) => {
        const columnTasks = tasks
          .filter((task) => task.status === column.key)
          .sort((a, b) =>
            a.orderKey === b.orderKey ? 0 : a.orderKey < b.orderKey ? -1 : 1,
          );
        return (
          <Column
            key={column.id}
            id={column.id}
            status={column.key}
            title={column.name}
            icon={null}
            tasks={columnTasks}
            count={columnTasks.length}
            moveTask={moveTask}
            moveColumn={moveColumn}
            canEdit={canEdit}
            canManageColumns={canManageColumns}
            selectionMode={selectionMode}
            selectedTaskIds={selectedTaskIds}
            onTaskSelectionChange={onTaskSelectionChange}
            onTaskClick={onTaskClick}
            palette={columnPalettes[index % columnPalettes.length]}
          />
        );
      })}
    </div>
  );
}

const columnPalettes = [
  {
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700 border-sky-100",
    shell: "border-sky-100 bg-sky-50/70",
    header: "from-sky-50 to-white",
    lane: "bg-sky-50/45",
    drop: "bg-sky-100/75 ring-sky-200",
    icon: "bg-sky-100 text-sky-700",
    indicator: "text-sky-700 bg-sky-500",
  },
  {
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700 border-violet-100",
    shell: "border-violet-100 bg-violet-50/70",
    header: "from-violet-50 to-white",
    lane: "bg-violet-50/45",
    drop: "bg-violet-100/75 ring-violet-200",
    icon: "bg-violet-100 text-violet-700",
    indicator: "text-violet-700 bg-violet-500",
  },
  {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    shell: "border-amber-100 bg-amber-50/70",
    header: "from-amber-50 to-white",
    lane: "bg-amber-50/45",
    drop: "bg-amber-100/75 ring-amber-200",
    icon: "bg-amber-100 text-amber-700",
    indicator: "text-amber-700 bg-amber-500",
  },
  {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    shell: "border-emerald-100 bg-emerald-50/70",
    header: "from-emerald-50 to-white",
    lane: "bg-emerald-50/45",
    drop: "bg-emerald-100/75 ring-emerald-200",
    icon: "bg-emerald-100 text-emerald-700",
    indicator: "text-emerald-700 bg-emerald-500",
  },
  {
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    shell: "border-rose-100 bg-rose-50/70",
    header: "from-rose-50 to-white",
    lane: "bg-rose-50/45",
    drop: "bg-rose-100/75 ring-rose-200",
    icon: "bg-rose-100 text-rose-700",
    indicator: "text-rose-700 bg-rose-500",
  },
];

interface ColumnProps {
  id: string;
  status: Status;
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  count: number;
  moveTask: (taskId: string, newStatus: Status, newOrderIndex?: number) => void;
  moveColumn: (columnId: string, targetColumnId: string) => void;
  canEdit: boolean;
  canManageColumns: boolean;
  selectionMode: boolean;
  selectedTaskIds: Set<string>;
  onTaskSelectionChange: (taskId: string, selected: boolean) => void;
  onTaskClick: (task: Task) => void;
  palette: (typeof columnPalettes)[number];
}

const ITEM_TYPE = "TASK";
const COLUMN_TYPE = "COLUMN";

function Column({
  id,
  status,
  title,
  icon,
  tasks,
  count,
  moveTask,
  moveColumn,
  canEdit,
  canManageColumns,
  selectionMode,
  selectedTaskIds,
  onTaskSelectionChange,
  onTaskClick,
  palette,
}: ColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    canDrop: () => canEdit && !selectionMode,
    drop: (item: { id: string }, monitor) => {
      if (!monitor.didDrop()) moveTask(item.id, status, tasks.length);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
    }),
  });
  const [{ isColumnOver }, columnDrop] = useDrop({
    accept: COLUMN_TYPE,
    canDrop: (item: { id: string }) =>
      canManageColumns && !selectionMode && item.id !== id,
    drop: (item: { id: string }) => moveColumn(item.id, id),
    collect: (monitor) => ({
      isColumnOver: monitor.isOver() && monitor.canDrop(),
    }),
  });
  const [{ isColumnDragging }, columnDrag] = useDrag({
    type: COLUMN_TYPE,
    item: { id },
    canDrag: canManageColumns && !selectionMode,
    collect: (monitor) => ({
      isColumnDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={(node) => {
        columnDrop(node as unknown as HTMLDivElement | null);
      }}
      className={cn(
        "w-[21rem] min-w-[21rem] rounded-lg border p-3 shadow-sm transition-all",
        palette.shell,
        isColumnDragging && "opacity-50",
        isColumnOver && "ring-2 ring-indigo-300",
      )}
    >
      <div
        ref={(node) => {
          columnDrag(node as unknown as HTMLDivElement | null);
        }}
        className={cn(
          "mb-3 rounded-md bg-gradient-to-r px-3 py-2.5",
          palette.header,
          canManageColumns && "cursor-grab active:cursor-grabbing",
        )}
      >
        <div
          role={canManageColumns ? "button" : undefined}
          tabIndex={canManageColumns ? 0 : undefined}
          aria-label={canManageColumns ? `Drag ${title} column` : undefined}
          className="flex min-w-0 items-center gap-2"
        >
          {canManageColumns && (
            <GripVertical className="h-4 w-4 text-gray-400" />
          )}
          <span className={cn("h-2.5 w-2.5 rounded-full", palette.dot)} />
          {icon}
          <span className="truncate text-sm font-semibold text-gray-800">
            {title}
          </span>
        </div>
        <Badge variant="outline" className={cn("ml-auto", palette.badge)}>
          {count}
        </Badge>
      </div>

      <div
        ref={(node) => {
          drop(node as unknown as HTMLDivElement | null);
        }}
        className={cn(
          "min-h-[500px] space-y-3 rounded-md p-2.5 transition-colors",
          isOver ? cn("ring-1 ring-inset", palette.drop) : palette.lane,
        )}
      >
        {tasks.map((task, orderIndex) => (
          <TaskCard
            key={task.id}
            task={task}
            status={status}
            orderIndex={orderIndex}
            moveTask={moveTask}
            canEdit={canEdit}
            selectionMode={selectionMode}
            selected={selectedTaskIds.has(task.id)}
            onSelectionChange={onTaskSelectionChange}
            onClick={onTaskClick}
            palette={palette}
          />
        ))}

        {tasks.length > 0 && isOver && <DropIndicator label="Move to end" />}

        {tasks.length === 0 && (
          <div
            className={`flex min-h-44 flex-col items-center justify-center rounded-sm border border-dashed px-6 text-center transition-colors ${
              isOver
                ? "border-indigo-300 bg-white"
                : "border-gray-200 bg-white/60"
            }`}
          >
            <div className="relative mb-4">
              <div
                className={cn("absolute inset-0 rotate-3 rounded-md", palette.icon)}
              />
              <div
                className={cn(
                  "relative rounded-md border border-white/80 p-3",
                  palette.icon,
                )}
              >
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">
              {isOver ? "Drop task here" : "No tasks yet"}
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-400">
              {canEdit
                ? "Drag a task here to get things moving."
                : "Tasks added to this stage will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  status: Status;
  orderIndex: number;
  moveTask: (taskId: string, newStatus: Status, newOrderIndex?: number) => void;
  canEdit: boolean;
  selectionMode: boolean;
  selected: boolean;
  onSelectionChange: (taskId: string, selected: boolean) => void;
  onClick: (task: Task) => void;
  palette: (typeof columnPalettes)[number];
}

function DropIndicator({
  label,
  palette = columnPalettes[0],
}: {
  label: string;
  palette?: (typeof columnPalettes)[number];
}) {
  return (
    <div
      className={cn(
        "flex h-5 items-center gap-2 text-[10px] font-semibold uppercase tracking-wide",
        palette.indicator.split(" ")[0],
      )}
    >
      <div className={cn("h-0.5 flex-1", palette.indicator.split(" ")[1])} />
      <span>{label}</span>
      <div className={cn("h-0.5 flex-1", palette.indicator.split(" ")[1])} />
    </div>
  );
}

function TaskCard({
  task,
  status,
  orderIndex,
  moveTask,
  canEdit,
  selectionMode,
  selected,
  onSelectionChange,
  onClick,
  palette,
}: TaskCardProps) {
  const suppressClick = useRef(false);
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    canDrop: (item: { id: string }) =>
      canEdit && !selectionMode && item.id !== task.id,
    drop: (item: { id: string }) => moveTask(item.id, status, orderIndex),
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
    }),
  });
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: task.id },
    canDrag: canEdit && !selectionMode,
    end: () => {
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const priorityColors = {
    low: "bg-slate-50 text-slate-600 border-slate-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const tagColors = [
    "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
    "bg-cyan-50 text-cyan-700 border-cyan-100",
    "bg-lime-50 text-lime-700 border-lime-100",
    "bg-orange-50 text-orange-700 border-orange-100",
  ];
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const initials =
    task.assignee?.name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "";

  return (
    <div
      ref={(node) => {
        drag(drop(node as unknown as HTMLDivElement | null));
      }}
      className="relative"
    >
      {isOver && (
        <div className="absolute inset-x-0 -top-3 z-10">
          <DropIndicator
            label={`Position ${orderIndex + 1}`}
            palette={palette}
          />
        </div>
      )}
      <div
        role={canEdit ? "button" : undefined}
        tabIndex={canEdit ? 0 : undefined}
        onClick={() => {
          if (!canEdit || suppressClick.current) return;
          if (selectionMode) {
            onSelectionChange(task.id, !selected);
          } else {
            onClick(task);
          }
        }}
        onKeyDown={(event) => {
          if (canEdit && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            if (selectionMode) {
              onSelectionChange(task.id, !selected);
            } else {
              onClick(task);
            }
          }
        }}
        className={cn(
          "group overflow-hidden rounded-md border bg-white shadow-sm transition-all",
          isOver
            ? "border-indigo-300 shadow-md -translate-y-0.5"
            : "border-gray-200 hover:-translate-y-0.5 hover:shadow-md",
          selected && "border-indigo-500 ring-2 ring-indigo-100",
          canEdit && "cursor-pointer",
          isDragging && "opacity-40",
        )}
      >
        <div className={cn("h-1 w-full", palette.dot)} />
        <div className="p-3.5">
          <div className="mb-3 flex items-start gap-2">
            {selectionMode && (
              <Checkbox
                checked={selected}
                aria-label={`Select ${task.title}`}
                onClick={(event) => event.stopPropagation()}
                onCheckedChange={(checked) =>
                  onSelectionChange(task.id, checked === true)
                }
              />
            )}
            <p className="min-w-0 flex-1 text-sm font-semibold leading-5 text-gray-900">
              {task.title}
            </p>
            {task.priority === "high" && (
              <Flag className="h-4 w-4 flex-shrink-0 text-rose-500" />
            )}
          </div>

          {task.description && (
            <p className="mb-3 line-clamp-2 text-xs leading-5 text-gray-500">
              {task.description}
            </p>
          )}

          {(task.tags?.length ?? 0) > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {task.tags?.slice(0, 3).map((tag, idx) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className={cn(
                    "max-w-28 truncate text-[11px]",
                    tagColors[idx % tagColors.length],
                  )}
                >
                  {tag.name}
                </Badge>
              ))}
              {(task.tags?.length ?? 0) > 3 && (
                <Badge
                  variant="outline"
                  className="bg-gray-50 text-[11px] text-gray-500"
                >
                  +{(task.tags?.length ?? 0) - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <Badge
              variant="outline"
              className={cn(
                "text-[11px] capitalize",
                priorityColors[task.priority],
              )}
            >
              {task.priority}
            </Badge>
            <div className="flex min-w-0 items-center justify-end gap-2 text-xs text-gray-500">
              {task.description && (
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              )}
              {(task.tags?.length ?? 0) > 0 && (
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              )}
              {dueDate && (
                <span className="flex shrink-0 items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {dueDate.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
              {task.assignee ? (
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                    palette.icon,
                  )}
                  title={task.assignee.name}
                >
                  {initials || <UserRound className="h-3.5 w-3.5" />}
                </span>
              ) : (
                <UserRound className="h-3.5 w-3.5 shrink-0 text-gray-300" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
