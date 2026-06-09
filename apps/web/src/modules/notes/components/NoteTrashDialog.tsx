import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { NOTE_TRASH_QUERY, RESTORE_NOTE_MUTATION } from "../graphql/note";
import type { NoteDetail } from "../types/note";
import { NotePreview } from "./NotePreview";
import { TaskioWatermark } from "./TaskioWatermark";

interface TrashNode extends NoteDetail {
  children: TrashNode[];
}

function buildTrashTree(notes: NoteDetail[]) {
  const nodes = new Map<string, TrashNode>(
    notes.map((note) => [note.id, { ...note, children: [] }]),
  );
  const roots: TrashNode[] = [];

  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent && parent.deletedAt === node.deletedAt) parent.children.push(node);
    else roots.push(node);
  }

  const sort = (items: TrashNode[]) => {
    items.sort((a, b) => a.position - b.position);
    items.forEach((item) => sort(item.children));
  };
  sort(roots);
  return roots;
}

function TrashTreeRow({
  note,
  depth,
  selectedId,
  expanded,
  onSelect,
  onToggle,
}: {
  note: TrashNode;
  depth: number;
  selectedId?: string;
  expanded: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const hasChildren = note.children.length > 0;
  return (
    <>
      <div
        className={`group mb-1 flex items-center rounded-md py-1 pr-2 transition-colors ${
          selectedId === note.id
            ? "bg-white text-indigo-700 shadow-sm ring-1 ring-gray-200"
            : "text-gray-700 hover:bg-white"
        }`}
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
      >
        <button
          type="button"
          disabled={!hasChildren}
          onClick={() => onToggle(note.id)}
          className="flex size-7 shrink-0 items-center justify-center text-gray-400 disabled:opacity-30"
          aria-label={expanded.has(note.id) ? "Collapse note" : "Expand note"}
        >
          {expanded.has(note.id) ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onSelect(note.id)}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left"
        >
          <FileText className="size-4 shrink-0 text-gray-400" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {note.title}
          </span>
          <Eye className="size-4 shrink-0 text-gray-400 opacity-0 group-hover:opacity-100" />
        </button>
      </div>
      {expanded.has(note.id) &&
        note.children.map((child) => (
          <TrashTreeRow
            key={child.id}
            note={child}
            depth={depth + 1}
            selectedId={selectedId}
            expanded={expanded}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        ))}
    </>
  );
}

export function NoteTrashDialog({
  open,
  onOpenChange,
  onRestored,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestored: (id: string) => void;
}) {
  const trashQuery = useQuery(NOTE_TRASH_QUERY, {
    skip: !open,
    fetchPolicy: "network-only",
  });
  const [restoreNote] = useMutation(RESTORE_NOTE_MUTATION);
  const [selectedId, setSelectedId] = useState<string>();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const notes =
    (trashQuery.data as { noteTrash?: NoteDetail[] })?.noteTrash ?? [];
  const tree = buildTrashTree(notes);
  const selectedNote = notes.find((note) => note.id === selectedId);

  useEffect(() => {
    if (!open) {
      setSelectedId(undefined);
      return;
    }
    if (notes.length > 0 && !notes.some((note) => note.id === selectedId)) {
      setSelectedId(notes[0].id);
    }
    setExpanded(
      new Set(
        notes
          .filter((note) =>
            notes.some(
              (child) =>
                child.parentId === note.id &&
                child.deletedAt === note.deletedAt,
            ),
          )
          .map((note) => note.id),
      ),
    );
  }, [notes, open, selectedId]);

  const handleRestore = async (note: NoteDetail) => {
    const result = await restoreNote({ variables: { id: note.id } });
    await trashQuery.refetch();
    const restored = (result.data as { restoreNote?: { id: string } })
      ?.restoreNote;
    if (restored) onRestored(restored.id);
  };

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] max-h-[1000px] flex-col sm:max-w-[calc(100vw-3rem)] xl:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Trash</DialogTitle>
          <DialogDescription>
            Preview deleted notes before restoring them. Restoring a note also
            restores its child notes.
          </DialogDescription>
        </DialogHeader>
        {!trashQuery.loading && notes.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed text-center text-gray-400">
            <FileText className="mb-3 size-8" />
            <p className="text-sm">Trash is empty.</p>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)] overflow-hidden rounded-lg border">
            <div className="min-h-0 overflow-y-auto border-r bg-gray-50 p-2">
              {tree.map((note) => (
                <TrashTreeRow
                  key={note.id}
                  note={note}
                  depth={0}
                  selectedId={selectedId}
                  expanded={expanded}
                  onSelect={setSelectedId}
                  onToggle={toggle}
                />
              ))}
            </div>

            <div className="flex min-h-0 min-w-0 flex-col bg-white">
              {selectedNote ? (
                <>
                  <div className="flex items-center gap-3 border-b px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">
                        {selectedNote.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Deleted note · Read-only preview
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleRestore(selectedNote)}
                    >
                      <RotateCcw />
                      Restore
                    </Button>
                  </div>
                  <NotePreview content={selectedNote.content} />
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-center text-gray-400">
                  <Eye className="mb-3 size-8" />
                  <p className="text-sm">
                    Select a deleted note to preview it.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
