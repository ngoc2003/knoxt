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
import { Badge } from "@/shared/ui/badge";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Flag,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Share2,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { NotePreview } from "@/modules/notes/components/NotePreview";
import { RichTextEditor } from "@/modules/notes/components/RichTextEditor";
import { cn } from "@/shared/ui/utils";
import { toast } from "sonner";

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
  assignee?: { id: string; name: string; email?: string; avatarUrl?: string | null } | null;
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
  availableTags = [],
  columns = DEFAULT_COLUMNS,
  members = [],
}: TaskModalProps) {
  const isExistingTask = Boolean(task?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
      setIsEditing(!task.id);
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
      setIsEditing(true);
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
    if (isExistingTask) setIsEditing(false);
    else onClose();
  };

  const updateField = (field: keyof Task, value: string | string[] | null) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const statusLabel =
    columns.find((column) => column.key === formData.status)?.name ??
    formData.status ??
    "No status";
  const assignee =
    members.find((member) => member.userId === formData.assigneeId)?.user ??
    formData.assignee ??
    null;
  const shareUrl =
    isExistingTask && formData.projectId && formData.id
      ? `${window.location.origin}/projects/${formData.projectId}/tasks/${formData.id}`
      : undefined;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-h-[92vh] overflow-hidden p-0 sm:max-w-[760px]",
          isExistingTask && isExpanded && "sm:max-w-[calc(100vw-3rem)]",
          isEditing && isExistingTask && !isExpanded && "sm:max-w-[1120px]",
          !isExistingTask && "sm:max-w-[620px]",
        )}
      >
        {isExistingTask ? (
          <div
            className={cn(
              "grid min-h-[640px] grid-cols-1",
              isEditing && "lg:grid-cols-[minmax(0,1fr)_420px]",
            )}
          >
            <section className="min-w-0 overflow-y-auto">
              <TaskDetailView
                title={formData.title ?? "Untitled task"}
                description={formData.description ?? ""}
                priority={formData.priority ?? "medium"}
                statusLabel={statusLabel}
                dueDate={formData.dueDate}
                assignee={assignee}
                tags={formData.tags ?? []}
                onEdit={() => setIsEditing(true)}
                onClose={onClose}
                shareUrl={shareUrl}
                isExpanded={isExpanded}
                onToggleExpanded={() => setIsExpanded((current) => !current)}
              />
            </section>

            {isEditing && (
              <aside className="min-h-0 border-t bg-gray-50/70 lg:border-l lg:border-t-0">
                <form
                  onSubmit={handleSave}
                  className="flex h-full max-h-[92vh] flex-col"
                >
                  <div className="border-b bg-white px-5 py-4">
                    <h3 className="text-sm font-semibold text-gray-950">
                      Edit ticket
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Update fields without leaving the detail view.
                    </p>
                  </div>
                  <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                    <TaskEditFields
                      formData={formData}
                      errors={errors}
                      columns={columns}
                      members={members}
                      availableTags={availableTags}
                      updateField={updateField}
                      richDescription
                    />
                  </div>
                  <DialogFooter className="border-t bg-white p-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        if (task) {
                          setFormData({
                            ...task,
                            dueDate: task.dueDate
                              ? task.dueDate.slice(0, 10)
                              : "",
                          });
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </form>
              </aside>
            )}
          </div>
        ) : (
          <div className="max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Add new ticket</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <TaskEditFields
                formData={formData}
                errors={errors}
                columns={columns}
                members={members}
                availableTags={availableTags}
                updateField={updateField}
              />
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Create ticket</Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TaskDetailView({
  title,
  description,
  priority,
  statusLabel,
  dueDate,
  assignee,
  tags,
  onEdit,
  onClose,
  shareUrl,
  isExpanded,
  onToggleExpanded,
}: {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  statusLabel: string;
  dueDate?: string;
  assignee?: { name: string; email?: string; avatarUrl?: string | null } | null;
  tags: string[];
  onEdit: () => void;
  onClose: () => void;
  shareUrl?: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}) {
  const handleShare = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Ticket link copied.");
  };

  return (
    <div className="min-h-full bg-white">
      <div className="border-b bg-gradient-to-r from-indigo-50 via-white to-sky-50 px-6 py-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="border-indigo-100 bg-indigo-50 text-indigo-700">
                <CheckCircle2 className="size-3" />
                {statusLabel}
              </Badge>
              <PriorityBadge priority={priority} />
            </div>
            <DialogTitle className="text-2xl leading-8 text-gray-950">
              {title}
            </DialogTitle>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-10 bg-white text-gray-700"
              onClick={() => void handleShare()}
              aria-label="Share ticket"
              title="Share ticket"
            >
              <Share2 className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10 border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  aria-label="More ticket actions"
                  title="More"
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onEdit}>
                  <Edit3 />
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon"
              className="size-10 bg-white text-gray-700"
              onClick={onToggleExpanded}
              aria-label={isExpanded ? "Restore modal size" : "Expand modal"}
              title={isExpanded ? "Restore" : "Expand"}
            >
              {isExpanded ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-10 bg-white text-gray-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              onClick={onClose}
              aria-label="Close ticket"
              title="Close"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <InfoTile
            icon={<CalendarDays />}
            label="Due date"
            value={
              dueDate
                ? new Date(dueDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "No due date"
            }
            tone="bg-amber-50 text-amber-700"
          />
          <InfoTile
            icon={<UserRound />}
            label="Assignee"
            value={assignee?.name ?? "Unassigned"}
            tone="bg-emerald-50 text-emerald-700"
          />
          <InfoTile
            icon={<Clock3 />}
            label="Priority"
            value={priority}
            tone="bg-rose-50 text-rose-700"
          />
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-950">
            Description
          </h3>
          <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-4">
            {description.trim() ? (
              <NotePreview content={description} />
            ) : (
              <p className="text-sm text-gray-400">No description yet.</p>
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-950">Tags</h3>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn(
                    "gap-1.5",
                    [
                      "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700",
                      "border-cyan-100 bg-cyan-50 text-cyan-700",
                      "border-lime-100 bg-lime-50 text-lime-700",
                      "border-orange-100 bg-orange-50 text-orange-700",
                    ][index % 4],
                  )}
                >
                  <Tag className="size-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No tags.</p>
          )}
        </section>

        {assignee && (
          <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-950">Owner</h3>
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage
                  src={assignee.avatarUrl || undefined}
                  alt={assignee.name}
                />
                <AvatarFallback className="bg-indigo-100 text-xs font-semibold text-indigo-700">
                  {getInitials(assignee.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-950">
                  {assignee.name}
                </p>
                {assignee.email && (
                  <p className="truncate text-xs text-gray-500">
                    {assignee.email}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TaskEditFields({
  formData,
  errors,
  columns,
  members,
  availableTags,
  updateField,
  richDescription = false,
}: {
  formData: Partial<Task>;
  errors: { title?: string; projectId?: string; dueDate?: string };
  columns: { key: string; name: string }[];
  members: ProjectMember[];
  availableTags: string[];
  updateField: (field: keyof Task, value: string | string[] | null) => void;
  richDescription?: boolean;
}) {
  return (
    <>
      <div>
        <Label className="mb-2 block text-gray-700" htmlFor="title">
          Title
        </Label>
        <Input
          id="title"
          value={formData.title ?? ""}
          onChange={(e) => updateField("title", e.target.value)}
          className={
            errors.title
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-gray-300 focus-visible:ring-indigo-200"
          }
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div>
        <Label className="mb-2 block text-gray-700" htmlFor="description">
          Description
        </Label>
        {richDescription ? (
          <div className="flex h-72 overflow-hidden rounded-md border bg-white">
            <RichTextEditor
              content={formData.description ?? ""}
              onChange={(value) => updateField("description", value)}
            />
          </div>
        ) : (
          <div className="flex h-52 overflow-hidden rounded-md border bg-white">
            <RichTextEditor
              content={formData.description ?? ""}
              onChange={(value) => updateField("description", value)}
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-2 block text-gray-700" htmlFor="priority">
            Priority
          </Label>
          <Select
            value={formData.priority}
            onValueChange={(value: "low" | "medium" | "high") =>
              updateField("priority", value)
            }
          >
            <SelectTrigger id="priority">
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
          <Label className="mb-2 block text-gray-700" htmlFor="status">
            Status
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => updateField("status", value)}
          >
            <SelectTrigger id="status">
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
      </div>

      {members.length > 0 && (
        <div>
          <Label className="mb-2 block text-gray-700" htmlFor="assignee">
            Assignee
          </Label>
          <Select
            value={formData.assigneeId || "unassigned"}
            onValueChange={(value) =>
              updateField("assigneeId", value === "unassigned" ? null : value)
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
        <Label className="mb-2 block text-gray-700" htmlFor="dueDate">
          Due Date
        </Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate ?? ""}
          onChange={(e) => updateField("dueDate", e.target.value)}
          className={
            errors.dueDate
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-gray-300 focus-visible:ring-indigo-200"
          }
        />
      </div>

      <div>
        <Label className="mb-2 block text-gray-700" htmlFor="tags">
          Tags
        </Label>
        <TagSelect
          data={[...new Set([...(formData.tags || []), ...availableTags])].map(
            (tag) => ({ id: tag, name: tag }),
          )}
          renderItem={(item, onSelect) => (
            <div onClick={onSelect} className="flex items-center gap-2">
              {item.name}
            </div>
          )}
          value={formData.tags || []}
          onChange={(tags) => updateField("tags", tags)}
          onSubmit={async (input) => ({ id: input, name: input })}
          placeholder="Add tags..."
          filterData={(data, input) =>
            data.filter((item) =>
              item.name.toLowerCase().includes(input.toLowerCase()),
            )
          }
        />
      </div>
    </>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: "low" | "medium" | "high";
}) {
  const className = {
    low: "border-slate-200 bg-slate-50 text-slate-600",
    medium: "border-amber-200 bg-amber-50 text-amber-700",
    high: "border-rose-200 bg-rose-50 text-rose-700",
  }[priority];

  return (
    <Badge variant="outline" className={cn("capitalize", className)}>
      <Flag className="size-3" />
      {priority}
    </Badge>
  );
}

function InfoTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white/85 p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-md [&_svg]:size-3.5",
            tone,
          )}
        >
          {icon}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </span>
      </div>
      <p className="truncate text-sm font-semibold capitalize text-gray-900">
        {value}
      </p>
    </div>
  );
}
