import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type { MemoryEntity, MemoryForm, MemoryKind, ProjectAction } from "./types";
import { statusOptions } from "./types";

export function MemoryEntityDialog({
  editor,
  form,
  onFormChange,
  onClose,
  onSave,
}: {
  editor?: { kind: MemoryKind; entity?: MemoryEntity };
  form: MemoryForm;
  onFormChange: (form: MemoryForm) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={Boolean(editor)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editor?.entity ? "Edit" : "Create"} {label(editor?.kind)}
          </DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Title"
          value={form.title ?? ""}
          onChange={(event) =>
            onFormChange({ ...form, title: event.target.value })
          }
        />
        <Textarea
          placeholder={editor?.kind === "meeting" ? "Summary" : "Description"}
          value={form.description ?? ""}
          onChange={(event) =>
            onFormChange({ ...form, description: event.target.value })
          }
        />
        {(editor?.kind === "meeting" || editor?.kind === "decision") && (
          <Input
            type="datetime-local"
            value={form.date ?? ""}
            onChange={(event) =>
              onFormChange({ ...form, date: event.target.value })
            }
          />
        )}
        {editor && (
          <select
            className="h-9 rounded-md border px-3 text-sm"
            value={form.status}
            onChange={(event) =>
              onFormChange({ ...form, status: event.target.value })
            }
          >
            {statusOptions[editor.kind].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        )}
        {editor?.kind === "requirement" && (
          <select
            className="h-9 rounded-md border px-3 text-sm"
            value={form.priority}
            onChange={(event) =>
              onFormChange({ ...form, priority: event.target.value })
            }
          >
            {["low", "medium", "high", "critical"].map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ActionItemDialog({
  editor,
  form,
  onFormChange,
  onClose,
  onSave,
}: {
  editor?: { meetingId: string; item?: ProjectAction };
  form: MemoryForm;
  onFormChange: (form: MemoryForm) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={Boolean(editor)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editor?.item ? "Edit action" : "Add action"}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Action title"
          value={form.title ?? ""}
          onChange={(event) =>
            onFormChange({ ...form, title: event.target.value })
          }
        />
        <Textarea
          placeholder="Description"
          value={form.description ?? ""}
          onChange={(event) =>
            onFormChange({ ...form, description: event.target.value })
          }
        />
        <Input
          placeholder="Assignee"
          value={form.externalAssigneeName ?? ""}
          onChange={(event) =>
            onFormChange({
              ...form,
              externalAssigneeName: event.target.value,
            })
          }
        />
        <Input
          type="datetime-local"
          value={form.dueDate ?? ""}
          onChange={(event) =>
            onFormChange({ ...form, dueDate: event.target.value })
          }
        />
        <select
          className="h-9 rounded-md border px-3 text-sm"
          value={form.status ?? "open"}
          onChange={(event) =>
            onFormChange({ ...form, status: event.target.value })
          }
        >
          {["open", "completed", "cancelled"].map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function label(kind?: MemoryKind) {
  if (kind === "meeting") return "recap";
  return kind ?? "memory";
}
