import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  LoaderCircle,
} from "lucide-react";
import { useParams } from "react-router";
import { PUBLIC_NOTE_QUERY } from "../graphql/note";
import type { NoteDetail } from "../types/note";
import { NotePreview } from "./NotePreview";
import { KnoxtWatermark } from "./KnotWatermark";

interface SharedTreeNode extends NoteDetail {
  children: SharedTreeNode[];
}

function buildSharedTree(notes: NoteDetail[]) {
  const nodes = new Map<string, SharedTreeNode>(
    notes.map((note) => [note.id, { ...note, children: [] }]),
  );
  const roots: SharedTreeNode[] = [];

  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const sort = (items: SharedTreeNode[]) => {
    items.sort((a, b) => a.position - b.position);
    items.forEach((item) => sort(item.children));
  };
  sort(roots);
  return roots;
}

function SharedTreeRow({
  note,
  depth,
  selectedId,
  expanded,
  onSelect,
  onToggle,
}: {
  note: SharedTreeNode;
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
        className={`flex items-center gap-1 rounded-md py-1 pr-2 text-sm ${
          selectedId === note.id
            ? "bg-indigo-50 text-indigo-700"
            : "hover:bg-gray-50"
        }`}
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
      >
        <button
          type="button"
          disabled={!hasChildren}
          onClick={() => onToggle(note.id)}
          className="flex size-6 shrink-0 items-center justify-center rounded text-gray-400 disabled:opacity-0"
          aria-label={expanded.has(note.id) ? "Collapse note" : "Expand note"}
        >
          {expanded.has(note.id) ? <ChevronDown /> : <ChevronRight />}
        </button>
        <button
          type="button"
          onClick={() => onSelect(note.id)}
          className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
        >
          <FileText className="size-4 shrink-0 text-gray-400" />
          <span className="truncate">{note.title}</span>
        </button>
      </div>
      {expanded.has(note.id) &&
        note.children.map((child) => (
          <SharedTreeRow
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

export function PublicSharedNotePage() {
  const { token = "" } = useParams();
  const query = useQuery(PUBLIC_NOTE_QUERY, { variables: { token } });
  const result = (
    query.data as { publicNote?: { note: NoteDetail; children: NoteDetail[] } }
  )?.publicNote;
  const [selectedId, setSelectedId] = useState<string>();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const notes = result ? [result.note, ...result.children] : [];
  const selected = notes.find((note) => note.id === selectedId) ?? result?.note;
  const tree = buildSharedTree(notes);

  useEffect(() => {
    if (!result) return;
    setExpanded(
      new Set(
        notes
          .filter((note) =>
            notes.some((candidate) => candidate.parentId === note.id),
          )
          .map((note) => note.id),
      ),
    );
  }, [result?.note.id]);

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (query.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }
  if (!result || query.error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-red-600">
        This shared note is unavailable.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {notes.length > 1 && (
        <aside className="w-72 border-r bg-gray-50/40 p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold">Shared notes</p>
            <p className="text-xs text-gray-500">Read-only note tree</p>
          </div>
          {tree.map((note) => (
            <SharedTreeRow
              key={note.id}
              note={note}
              depth={0}
              selectedId={selected?.id}
              expanded={expanded}
              onSelect={setSelectedId}
              onToggle={toggle}
            />
          ))}
        </aside>
      )}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-5 border-b px-8 py-5">
          <div className="min-w-0 flex-1">
            <h1 className="mt-1 truncate text-2xl font-semibold">
              {selected?.title}
            </h1>
          </div>
          <div className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Shared via Knoxt.io
          </div>
        </header>
        <KnoxtWatermark label="SHARED NOTE" mode="fixed" contentClassName="p-8">
          <NotePreview content={selected?.content ?? ""} />
        </KnoxtWatermark>
      </main>
    </div>
  );
}
