import { useCallback, useRef, useState } from "react";
import { Bold, Columns2, Eye, Italic, Link2, List, Pencil } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { NotePreview } from "./NotePreview";
import { useNoteAutosave } from "../hooks/useNoteAutosave";
import type { EditorMode, NoteDetail } from "../types/note";

export function NoteEditor({
  note,
  onSaved,
}: {
  note: NoteDetail;
  onSaved: (note: NoteDetail) => void;
}) {
  const [mode, setMode] = useState<EditorMode>("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { title, setTitle, content, setContent, status } = useNoteAutosave(
    note,
    onSaved,
  );

  const insertMarkdown = useCallback(
    (before: string, after = "", fallback = "text") => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = content.slice(start, end) || fallback;
      const next =
        content.slice(0, start) +
        before +
        selected +
        after +
        content.slice(end);
      setContent(next);
      window.requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selected.length,
        );
      });
    },
    [content, setContent],
  );

  const statusText = {
    idle: "No changes",
    saving: "Saving...",
    saved: "Saved",
    error: "Save failed",
    conflict: "Conflict: refresh before editing",
  }[status];

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-auto border-none bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:ring-0"
            aria-label="Note title"
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
                ["edit", Pencil, "Edit"],
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
        {mode !== "preview" && (
          <div className="min-h-0 overflow-auto p-6">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-full resize-none border-none bg-transparent font-mono text-sm leading-7 shadow-none focus-visible:ring-0"
              placeholder="Write Markdown..."
              aria-label="Note content"
            />
          </div>
        )}
        {mode !== "edit" && (
          <div className="min-h-0 overflow-auto p-8">
            <NotePreview content={content} />
          </div>
        )}
      </div>
    </div>
  );
}
