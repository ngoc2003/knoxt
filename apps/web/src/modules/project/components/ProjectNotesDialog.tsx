import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  LoaderCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  NOTE_DETAIL_QUERY,
  NOTE_TREE_QUERY,
} from "@/modules/notes/graphql/note";
import type { NoteDetail, NoteTreeItem } from "@/modules/notes/types/note";
import { NotePreview } from "@/modules/notes/components/NotePreview";

interface ProjectNoteNode extends NoteTreeItem {
  children: ProjectNoteNode[];
}

function buildTree(notes: NoteTreeItem[]) {
  const nodes = new Map<string, ProjectNoteNode>(
    notes.map((note) => [note.id, { ...note, children: [] }]),
  );
  const roots: ProjectNoteNode[] = [];

  nodes.forEach((node) => {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });

  const sort = (items: ProjectNoteNode[]) => {
    items.sort(
      (a, b) =>
        Number(b.isPinned) - Number(a.isPinned) || a.position - b.position,
    );
    items.forEach((item) => sort(item.children));
  };
  sort(roots);
  return roots;
}

function ProjectNoteTreeRow({
  note,
  depth,
  activeId,
  expanded,
  onToggle,
  onSelect,
}: {
  note: ProjectNoteNode;
  depth: number;
  activeId?: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const hasChildren = note.children.length > 0;

  return (
    <>
      <div
        className={`flex items-center rounded-md text-sm ${
          activeId === note.id
            ? "bg-white text-indigo-700 shadow-sm"
            : "text-gray-700 hover:bg-white"
        }`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          disabled={!hasChildren}
          aria-label={expanded.has(note.id) ? "Collapse note" : "Expand note"}
          onClick={() => onToggle(note.id)}
        >
          {hasChildren ? (
            expanded.has(note.id) ? (
              <ChevronDown />
            ) : (
              <ChevronRight />
            )
          ) : (
            <span className="size-4" />
          )}
        </Button>
        <button
          type="button"
          onClick={() => onSelect(note.id)}
          className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-3 text-left"
        >
          <FileText className="size-4 shrink-0" />
          <span className="truncate">{note.title}</span>
        </button>
      </div>
      {expanded.has(note.id) &&
        note.children.map((child) => (
          <ProjectNoteTreeRow
            key={child.id}
            note={child}
            depth={depth + 1}
            activeId={activeId}
            expanded={expanded}
            onToggle={onToggle}
            onSelect={onSelect}
          />
        ))}
    </>
  );
}

export function ProjectNotesDialog({
  projectId,
  projectName,
  focusedNoteId,
  open,
  onOpenChange,
}: {
  projectId: string;
  projectName: string;
  focusedNoteId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const treeQuery = useQuery(NOTE_TREE_QUERY, {
    variables: { projectId },
    skip: !open,
  });
  const notes = useMemo(
    () =>
      (treeQuery.data as { noteTree?: NoteTreeItem[] })?.noteTree ?? [],
    [treeQuery.data],
  );
  const tree = useMemo(() => buildTree(notes), [notes]);
  const activeId = selectedId ?? notes[0]?.id;
  const detailQuery = useQuery(NOTE_DETAIL_QUERY, {
    variables: { id: activeId ?? "" },
    skip: !open || !activeId,
  });
  const note = (detailQuery.data as { noteDetail?: NoteDetail })?.noteDetail;

  useEffect(() => {
    if (open && focusedNoteId) setSelectedId(focusedNoteId);
  }, [focusedNoteId, open]);

  useEffect(() => {
    if (!activeId) return;
    const byId = new Map(notes.map((item) => [item.id, item]));
    setExpanded((current) => {
      const next = new Set(current);
      let currentNote = byId.get(activeId);
      while (currentNote?.parentId) {
        next.add(currentNote.parentId);
        currentNote = byId.get(currentNote.parentId);
      }
      return next;
    });
  }, [activeId, notes]);

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
      <DialogContent className="flex h-[92vh] w-[80vw] max-w-[80vw] flex-col sm:max-w-[80vw]">
        <DialogHeader>
          <DialogTitle>{projectName} documents</DialogTitle>
          <DialogDescription>
            Preview related notes here, then open the Notes workspace to edit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-lg border md:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
          <div className="overflow-y-auto border-r bg-gray-50 p-2">
            {tree.map((item) => (
              <ProjectNoteTreeRow
                key={item.id}
                note={item}
                depth={0}
                activeId={activeId}
                expanded={expanded}
                onToggle={toggle}
                onSelect={setSelectedId}
              />
            ))}
            {!treeQuery.loading && notes.length === 0 && (
              <p className="p-6 text-center text-sm text-gray-500">
                No project notes yet.
              </p>
            )}
          </div>
          <div className="flex min-h-0 flex-col">
            {detailQuery.loading && (
              <div className="flex flex-1 items-center justify-center">
                <LoaderCircle className="size-5 animate-spin" />
              </div>
            )}
            {note && (
              <>
                <div className="flex items-center gap-3 border-b px-5 py-3">
                  <h3 className="min-w-0 flex-1 truncate font-semibold">
                    {note.title}
                  </h3>
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/notes/${note.id}?projectId=${projectId}`)
                    }
                  >
                    <ExternalLink />
                    Open in Notes
                  </Button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-6">
                  <NotePreview content={note.content} />
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
