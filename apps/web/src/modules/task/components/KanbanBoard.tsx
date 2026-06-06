import { useDrop, useDrag } from "react-dnd";
import { useRef } from "react";
import { Badge } from "../../../shared/ui/badge";
import { Calendar, Flag, GripVertical, UserRound } from "lucide-react";

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
  tags: { id: string; name: string }[];
  priority: Priority;
  status: Status;
  dueDate?: string;
  assignee?: { id: string; name: string } | null;
}
export function KanbanBoard({
  tasks,
  columns,
  moveTask,
  moveColumn,
  canEdit,
  onTaskClick,
}: {
  tasks: any[];
  columns: ProjectColumn[];
  moveTask: (taskId: string, newStatus: string, newOrderIndex?: number) => void;
  moveColumn: (columnId: string, targetColumnId: string) => void;
  canEdit: boolean;
  onTaskClick: (task: Task) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.key);
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
            onTaskClick={onTaskClick}
            badgeClass="bg-indigo-50 text-indigo-600"
          />
        );
      })}
    </div>
  );
}

interface ColumnProps {
  id: string;
  status: Status;
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  count: number;
  moveTask: (taskId: string, newStatus: Status) => void;
  moveColumn: (columnId: string, targetColumnId: string) => void;
  canEdit: boolean;
  onTaskClick: (task: Task) => void;
  badgeClass: string;
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
  onTaskClick,
  badgeClass,
}: ColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    canDrop: () => canEdit,
    drop: (item: { id: string }) => moveTask(item.id, status),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  const [{ isColumnOver }, columnDrop] = useDrop({
    accept: COLUMN_TYPE,
    canDrop: (item: { id: string }) => canEdit && item.id !== id,
    drop: (item: { id: string }) => moveColumn(item.id, id),
    collect: (monitor) => ({
      isColumnOver: monitor.isOver() && monitor.canDrop(),
    }),
  });
  const [{ isColumnDragging }, columnDrag] = useDrag({
    type: COLUMN_TYPE,
    item: { id },
    canDrag: canEdit,
    collect: (monitor) => ({
      isColumnDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={(node) => {
        columnDrop(node as unknown as HTMLDivElement | null);
      }}
      className={`w-80 min-w-80 rounded-lg transition-opacity ${
        isColumnDragging ? "opacity-50" : ""
      } ${isColumnOver ? "ring-2 ring-indigo-300" : ""}`}
    >
      <div
        ref={(node) => {
          columnDrag(node as unknown as HTMLDivElement | null);
        }}
        className={`flex items-center gap-2 mb-4 ${canEdit ? "cursor-grab active:cursor-grabbing" : ""}`}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label={`Drag ${title} column`}
          className="flex items-center gap-2"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
          {icon}
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        <Badge variant="secondary" className={`ml-auto ${badgeClass}`}>
          {count}
        </Badge>
      </div>

      <div
        ref={(node) => {
          drop(node as unknown as HTMLDivElement | null);
        }}
        className={`space-y-3 min-h-[600px] p-3 rounded-lg transition-colors ${isOver ? "bg-indigo-50/50" : "bg-gray-50/50"}`}
      >
        {(tasks || []).map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            canEdit={canEdit}
            onClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  canEdit: boolean;
  onClick: (task: Task) => void;
}

function TaskCard({ task, canEdit, onClick }: TaskCardProps) {
  const suppressClick = useRef(false);
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: task.id },
    canDrag: canEdit,
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
    low: "bg-gray-100 text-gray-700",
    medium: "bg-yellow-50 text-yellow-700",
    high: "bg-red-50 text-red-700",
  };

  const tagColors = [
    "bg-purple-50 text-purple-700",
    "bg-blue-50 text-blue-700",
    "bg-green-50 text-green-700",
    "bg-orange-50 text-orange-700",
  ];

  return (
    <div
      ref={(node) => {
        drag(node as unknown as HTMLDivElement | null);
      }}
      role={canEdit ? "button" : undefined}
      tabIndex={canEdit ? 0 : undefined}
      onClick={() => {
        if (canEdit && !suppressClick.current) onClick(task);
      }}
      onKeyDown={(event) => {
        if (canEdit && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick(task);
        }
      }}
      className={`p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${canEdit ? "cursor-pointer" : ""} ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-2 mb-3">
        <p className="text-sm font-medium text-gray-900 flex-1">{task.title}</p>
        {task.priority === "high" && (
          <Flag className="w-4 h-4 text-red-500 flex-shrink-0" />
        )}
      </div>

      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {task.tags.map((tag, idx) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className={`text-xs ${tagColors[idx % tagColors.length]}`}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Badge
          variant="secondary"
          className={`text-xs ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </Badge>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {task.assignee && (
            <span className="flex items-center gap-1">
              <UserRound className="w-3 h-3" />
              {task.assignee.name}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
