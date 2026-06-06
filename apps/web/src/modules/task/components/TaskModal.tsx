import { useState, useEffect } from "react";

import { TagSelect } from "./TagSelect";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void | Promise<void>;
  task?: Partial<Task> | null;
  availableTags?: string[];
  columns?: { key: string; name: string }[];
  members?: ProjectMember[];
}

interface ProjectMember {
  userId: string;
  user: { name: string; email: string; avatarUrl?: string | null };
}

interface Task {
  id?: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: string;
  dueDate?: string;
  projectId: string;
  assigneeId?: string | null;
  tags?: string[];
}

const DEFAULT_COLUMNS = [
  { key: "todo", name: "To-do" },
  { key: "doing", name: "Doing" },
  { key: "done", name: "Done" },
];

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  task,
  columns = DEFAULT_COLUMNS,
  members = [],
}: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    status: columns[0]?.key || "todo",
    dueDate: "",
    projectId: "",
    assigneeId: null,
    tags: [],
  });

  const [errors, setErrors] = useState<{
    title?: string;
    projectId?: string;
    dueDate?: string;
  }>({});

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: columns[0]?.key || "todo",
        dueDate: "",
        projectId: "",
        assigneeId: null,
        tags: [],
      });
    }

    setErrors({});
  }, [task, isOpen, columns]);

  const validateForm = () => {
    const newErrors: {
      title?: string;
      projectId?: string;
      dueDate?: string;
    } = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Task title is required";
    }

    if (!formData.projectId?.trim()) {
      newErrors.projectId = "Project ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSave(formData);
    onClose();
  };

  const updateField = (field: keyof Task, value: string | string[] | null) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label className="text-gray-700 mb-2 block" htmlFor="title">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={`${
                errors.title
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300 focus-visible:ring-blue-500"
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block" htmlFor="description">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="min-h-[100px] border-gray-300 focus-visible:ring-blue-500"
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block" htmlFor="priority">
              Priority
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value: "low" | "medium" | "high") =>
                updateField("priority", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block" htmlFor="status">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => updateField("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column.key} value={column.key}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {members.length > 0 && (
            <div>
              <Label className="text-gray-700 mb-2 block" htmlFor="assignee">
                Assignee
              </Label>
              <Select
                value={formData.assigneeId || "unassigned"}
                onValueChange={(value) =>
                  updateField(
                    "assigneeId",
                    value === "unassigned" ? null : value,
                  )
                }
              >
                <SelectTrigger id="assignee">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      <span className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarImage
                            src={member.user.avatarUrl || undefined}
                            alt={member.user.name}
                          />
                          <AvatarFallback className="bg-indigo-100 text-[10px] font-medium text-indigo-700">
                            {getInitials(member.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {member.user.name} ({member.user.email})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-gray-700 mb-2 block" htmlFor="dueDate">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => updateField("dueDate", e.target.value)}
              className={`${
                errors.dueDate
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300 focus-visible:ring-blue-500"
              }`}
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block" htmlFor="tags">
              Tags
            </Label>
            <TagSelect
              data={["1"].map((tag) => ({ id: tag, name: tag }))}
              renderItem={(item, onSelect) => (
                <div onClick={onSelect} className="flex items-center gap-2">
                  {item.name}
                </div>
              )}
              value={formData.tags || []}
              onChange={(tags) => updateField("tags", tags)}
              onSubmit={async (input) => ({ id: input, name: input })} // Mock onSubmit for creating new tags
              placeholder="Add tags..."
              filterData={(data, input) =>
                data.filter((item) =>
                  item.name.toLowerCase().includes(input.toLowerCase()),
                )
              }
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
