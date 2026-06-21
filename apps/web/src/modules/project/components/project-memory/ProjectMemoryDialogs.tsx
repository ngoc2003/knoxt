import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  MemoryForm,
  MemoryKind,
  MemoryEntity,
  ProjectAction,
} from "./types";
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
            {editor?.entity ? "Edit" : "Create"} {labelFor(editor?.kind)}
          </DialogTitle>
          <DialogDescription>
            Add the useful part now. Details can be filled in later.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Title"
          value={form.title ?? ""}
          onChange={(e) => onFormChange({ ...form, title: e.target.value })}
        />
        <Textarea
          placeholder={editor?.kind === "meeting" ? "Summary" : "Description"}
          value={form.description ?? ""}
          onChange={(e) =>
            onFormChange({ ...form, description: e.target.value })
          }
        />
        {(editor?.kind === "meeting" || editor?.kind === "decision") && (
          <Input
            type="datetime-local"
            value={form.date ?? ""}
            onChange={(e) => onFormChange({ ...form, date: e.target.value })}
          />
        )}
        <select
          className="h-9 rounded-md border px-3 text-sm"
          value={form.status}
          onChange={(e) => onFormChange({ ...form, status: e.target.value })}
        >
          {editor &&
            statusOptions[editor.kind].map((x) => <option key={x}>{x}</option>)}
        </select>
        {editor?.kind === "requirement" && (
          <select
            className="h-9 rounded-md border px-3 text-sm"
            value={form.priority}
            onChange={(e) =>
              onFormChange({ ...form, priority: e.target.value })
            }
          >
            {["low", "medium", "high", "critical"].map((x) => (
              <option key={x}>{x}</option>
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
          <DialogTitle>{editor?.item ? "Edit" : "Create"} action</DialogTitle>
          <DialogDescription>
            Only the title is required. Add due date or assignee when useful.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Title"
          value={form.title ?? ""}
          onChange={(e) => onFormChange({ ...form, title: e.target.value })}
        />
        <Textarea
          placeholder="Description"
          value={form.description ?? ""}
          onChange={(e) =>
            onFormChange({ ...form, description: e.target.value })
          }
        />
        <Input
          placeholder="External assignee"
          value={form.externalAssigneeName ?? ""}
          onChange={(e) =>
            onFormChange({ ...form, externalAssigneeName: e.target.value })
          }
        />
        <Input
          type="datetime-local"
          value={form.dueDate ?? ""}
          onChange={(e) => onFormChange({ ...form, dueDate: e.target.value })}
        />
        <select
          className="h-9 rounded-md border px-3 text-sm"
          value={form.status ?? "open"}
          onChange={(e) => onFormChange({ ...form, status: e.target.value })}
        >
          {["open", "completed", "cancelled"].map((x) => (
            <option key={x}>{x}</option>
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

function labelFor(kind?: MemoryKind) {
  if (kind === "meeting") return "recap";
  if (kind === "decision") return "decision";
  if (kind === "requirement") return "requirement";
  return "item";
}
