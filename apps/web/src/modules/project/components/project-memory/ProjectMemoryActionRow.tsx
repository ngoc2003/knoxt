import { Check, Edit3, RotateCcw, Trash2, Wand2 } from "lucide-react";
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
  const deleted = Boolean(action.deletedAt);
  const completed = action.status === "completed";

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border p-3">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{action.title}</span>
          <Badge variant={completed ? "secondary" : "outline"}>
            {deleted ? "deleted" : action.status}
          </Badge>
          {action.promotedTaskId && <Badge variant="secondary">Task</Badge>}
        </div>
        {action.description && (
          <p className="text-sm text-gray-600">{action.description}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {action.externalAssigneeName && (
            <span>{action.externalAssigneeName}</span>
          )}
          {action.dueDate && <span>{new Date(action.dueDate).toLocaleDateString()}</span>}
          {action.promotedTask?.title && <span>{action.promotedTask.title}</span>}
        </div>
      </div>
      {canEdit && (
        <div className="flex flex-wrap gap-2">
          {deleted ? (
            <Button size="sm" variant="outline" onClick={() => onRestore(action.id)}>
              <RotateCcw />
              Restore
            </Button>
          ) : (
            <>
              {!completed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onComplete(action.id)}
                >
                  <Check />
                  Done
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => onEdit(action)}>
                <Edit3 />
                Edit
              </Button>
              {!action.promotedTaskId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCreateTask(action.id)}
                >
                  <Wand2 />
                  Create task
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(action.id)}
              >
                <Trash2 />
                Delete
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
