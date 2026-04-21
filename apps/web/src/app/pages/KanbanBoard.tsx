import { useDrop, useDrag } from "react-dnd";
import { Badge } from "../components/ui/badge";
import { Clock, Flag } from "lucide-react";

type Priority = "low" | "medium" | "high";
type Status = "todo" | "doing" | "done";

interface Task {
  id: string;
  title: string;
  tags: string[];
  priority: Priority;
  time: string;
  status: Status;
}
export function KanbanBoard({
  tasks,
  moveTask,
}: {
  tasks: any[];
  moveTask: (taskId: string, newStatus: string, newOrderIndex?: number) => void;
}) {
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doingTasks = tasks.filter((t) => t.status === "doing");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="grid grid-cols-3 gap-4">
      <Column
        status="todo"
        title="To-do"
        icon={null}
        tasks={todoTasks}
        count={todoTasks.length}
        moveTask={moveTask}
        badgeClass="bg-gray-100 text-gray-600"
      />
      <Column
        status="doing"
        title="Doing"
        icon={null}
        tasks={doingTasks}
        count={doingTasks.length}
        moveTask={moveTask}
        badgeClass="bg-indigo-50 text-indigo-600"
      />
      <Column
        status="done"
        title="Done"
        icon={null}
        tasks={doneTasks}
        count={doneTasks.length}
        moveTask={moveTask}
        badgeClass="bg-green-50 text-green-600"
      />
    </div>
  );
}

interface ColumnProps {
  status: Status;
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  count: number;
  moveTask: (taskId: string, newStatus: Status) => void;
  badgeClass: string;
}

const ITEM_TYPE = "TASK";

function Column({
  status,
  title,
  icon,
  tasks,
  count,
  moveTask,
  badgeClass,
}: ColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: string }) => moveTask(item.id, status),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <span className="text-sm font-medium text-gray-700">{title}</span>
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
          <TaskCard key={task.id} task={task} moveTask={moveTask} />
        ))}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  moveTask: (taskId: string, newStatus: Status) => void;
}

function TaskCard({ task, moveTask }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: task.id },
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
      className={`p-4 bg-white rounded-lg border border-gray-200 shadow-sm cursor-move hover:shadow-md transition-shadow ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-2 mb-3">
        <p className="text-sm font-medium text-gray-900 flex-1">{task.title}</p>
        {task.priority === "high" && (
          <Flag className="w-4 h-4 text-red-500 flex-shrink-0" />
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {['1', '2', '3'].map((tag, idx) => (
          <Badge
            key={idx}
            variant="secondary"
            className={`text-xs ${tagColors[idx % tagColors.length]}`}
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Badge
          variant="secondary"
          className={`text-xs ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </Badge>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {task.time}
        </span>
      </div>
    </div>
  );
}
