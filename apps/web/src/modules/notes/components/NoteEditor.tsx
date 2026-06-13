import { lazy, Suspense, useState } from "react";
import { Braces, Columns2, Eye, Type } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { NotePreview } from "./NotePreview";
import { useNoteAutosave } from "../hooks/useNoteAutosave";
import type { EditorMode, NoteDetail } from "../types/note";

const RichTextEditor = lazy(() =>
  import("./RichTextEditor").then((module) => ({
    default: module.RichTextEditor,
  })),
);

export function NoteEditor({
  note,
  onSaved,
  canEdit = true,
}: {
  note: NoteDetail;
  onSaved: (note: NoteDetail) => void;
  canEdit?: boolean;
}) {
  const [mode, setMode] = useState<EditorMode>("rich");
  const { title, setTitle, content, setContent, status } = useNoteAutosave(
    note,
    onSaved,
    canEdit,
  );

  const statusText = {
    idle: "No changes",
    saving: "Saving...",
    saved: "Saved",
    error: "Save failed",
    conflict: "Conflict: refresh before editing",
  }[status];

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-auto border-none bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:ring-0"
            aria-label="Note title"
            disabled={!canEdit}
          />
          <span
            className={`ml-auto shrink-0 text-xs ${
              status === "error" || status === "conflict"
                ? "text-red-600"
                : "text-gray-400"
            }`}
          >
            {statusText}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1">
          <div className="ml-auto flex rounded-md border bg-gray-50 p-0.5">
            {(
              [
                ["rich", Type, "Rich text"],
                ["edit", Braces, "Markdown"],
                ["preview", Eye, "Preview"],
                ["split", Columns2, "Split"],
              ] as const
            ).map(([value, Icon, label]) => (
              <Button
                key={value}
                type="button"
                variant={mode === value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMode(value)}
              >
                <Icon />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`grid min-h-0 flex-1 ${
          mode === "split" ? "grid-cols-2 divide-x" : "grid-cols-1"
        }`}
      >
        {mode === "rich" && (
          <Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
                Loading rich text editor...
              </div>
            }
          >
            <RichTextEditor
              content={content}
              onChange={setContent}
              editable={canEdit}
            />
          </Suspense>
        )}
        {(mode === "edit" || mode === "split") && (
          <div className="min-h-0 overflow-auto p-6">
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="h-full min-h-0 field-sizing-fixed overflow-y-auto resize-none border-none bg-transparent font-mono text-sm leading-7 shadow-none focus-visible:ring-0"
              placeholder="Write Markdown..."
              aria-label="Note content"
              disabled={!canEdit}
            />
          </div>
        )}
        {(mode === "preview" || mode === "split") && (
          <div className="min-h-0 overflow-auto p-8">
            <NotePreview content={content} />
          </div>
        )}
      </div>
    </div>
  );
}
