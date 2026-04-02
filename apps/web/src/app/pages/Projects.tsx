import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Circle,
  Clock,
  CheckCircle2,
  Plus,
  AlertCircle,
  Flag,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

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

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Design landing page mockup",
    tags: ["Design", "UI/UX"],
    priority: "high",
    time: "2h",
    status: "todo",
  },
  {
    id: "2",
    title: "Update client documentation",
    tags: ["Docs"],
    priority: "medium",
    time: "1h",
    status: "todo",
  },
  {
    id: "3",
    title: "Review design feedback",
    tags: ["Design"],
    priority: "low",
    time: "30m",
    status: "todo",
  },
  {
    id: "4",
    title: "Build API endpoints for dashboard",
    tags: ["Development", "Backend"],
    priority: "high",
    time: "4h",
    status: "doing",
  },
  {
    id: "5",
    title: "Prepare client presentation",
    tags: ["Meeting"],
    priority: "medium",
    time: "2h",
    status: "doing",
  },
  {
    id: "6",
    title: "Client kickoff meeting",
    tags: ["Meeting"],
    priority: "high",
    time: "1h",
    status: "done",
  },
  {
    id: "7",
    title: "Code review for payment module",
    tags: ["Development"],
    priority: "medium",
    time: "1.5h",
    status: "done",
  },
  {
    id: "8",
    title: "Weekly invoice sent",
    tags: ["Finance"],
    priority: "low",
    time: "30m",
    status: "done",
  },
];

const ITEM_TYPE = "TASK";

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
      ref={drag}
      className={`p-4 bg-white rounded-lg border border-gray-200 shadow-sm cursor-move hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-2 mb-3">
        <p className="text-sm font-medium text-gray-900 flex-1">{task.title}</p>
        {task.priority === "high" && (
          <Flag className="w-4 h-4 text-red-500 flex-shrink-0" />
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {task.tags.map((tag, idx) => (
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

interface ColumnProps {
  status: Status;
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  count: number;
  moveTask: (taskId: string, newStatus: Status) => void;
  badgeClass: string;
}

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
        ref={drop}
        className={`space-y-3 min-h-[600px] p-3 rounded-lg transition-colors ${
          isOver ? "bg-indigo-50/50" : "bg-gray-50/50"
        }`}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} moveTask={moveTask} />
        ))}
      </div>
    </div>
  );
}

function ProjectsContent() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const moveTask = (taskId: string, newStatus: Status) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );
  };

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doingTasks = tasks.filter((t) => t.status === "doing");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your tasks with drag & drop
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-4">
        <Column
          status="todo"
          title="To-do"
          icon={<Circle className="w-4 h-4 text-gray-400" />}
          tasks={todoTasks}
          count={todoTasks.length}
          moveTask={moveTask}
          badgeClass="bg-gray-100 text-gray-600"
        />
        <Column
          status="doing"
          title="Doing"
          icon={<Clock className="w-4 h-4 text-indigo-600" />}
          tasks={doingTasks}
          count={doingTasks.length}
          moveTask={moveTask}
          badgeClass="bg-indigo-50 text-indigo-600"
        />
        <Column
          status="done"
          title="Done"
          icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
          tasks={doneTasks}
          count={doneTasks.length}
          moveTask={moveTask}
          badgeClass="bg-green-50 text-green-600"
        />
      </div>
    </div>
  );
}

export function Projects() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ProjectsContent />
    </DndProvider>
  );
}
