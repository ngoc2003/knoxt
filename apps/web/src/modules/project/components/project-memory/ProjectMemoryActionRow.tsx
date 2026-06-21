import { Check, Edit3, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { ProjectAction } from "./types";

export function ProjectMemoryActionRow({
  action,
  canEdit,
  onComplete,
  onCreateTask,
  onEdit,
  onDelete,
  onRestore,
}: {
  action: ProjectAction;
  canEdit: boolean;
  onComplete: (id: string) => void;
  onCreateTask: (id: string) => void;
  onEdit: (action: ProjectAction) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  const isDeleted = Boolean(action.deletedAt);
  const isDone = action.status === "completed";

  return (
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-sm">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          disabled={!canEdit || isDone || isDeleted}
          onClick={() => onComplete(action.id)}
          className={`flex size-5 shrink-0 items-center justify-center rounded border ${
            isDone
              ? "border-green-600 bg-green-600 text-white"
              : "border-gray-300 text-transparent"
          } disabled:cursor-default`}
          aria-label={isDone ? "Completed" : "Complete action"}
        >
          <Check className="size-3" />
        </button>
        <div className="min-w-0">
          <div
            className={`truncate font-medium ${
              isDeleted ? "text-gray-400" : "text-gray-900"
            }`}
          >
            {action.title}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span>{action.status}</span>
            {action.dueDate && (
              <span>due {new Date(action.dueDate).toLocaleDateString()}</span>
            )}
            {action.externalAssigneeName && (
              <span>{action.externalAssigneeName}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {isDeleted && <Badge variant="destructive">deleted</Badge>}
        {action.promotedTask ? (
          <Badge variant="outline">Task: {action.promotedTask.title}</Badge>
        ) : (
          canEdit &&
          !isDeleted && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCreateTask(action.id)}
            >
              Create task
            </Button>
          )
        )}
        {canEdit && isDeleted && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onRestore(action.id)}
          >
            <RotateCcw className="size-4" />
          </Button>
        )}
        {canEdit && !isDeleted && (
          <>
            <Button size="icon" variant="ghost" onClick={() => onEdit(action)}>
              <Edit3 className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(action.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
