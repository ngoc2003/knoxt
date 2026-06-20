import { useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderInput,
  MoreHorizontal,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type { NoteTreeItem, NoteTreeNode } from "../types/note";

const NOTE_TREE_ITEM = "NOTE_TREE_ITEM";

interface NoteProject {
  id: string;
  name: string;
}

function buildTree(notes: NoteTreeItem[]) {
  const nodes = new Map<string, NoteTreeNode>(
    notes.map((note) => [note.id, { ...note, children: [] }]),
  );
  const roots: NoteTreeNode[] = [];

  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const sort = (items: NoteTreeNode[]) => {
    items.sort(
      (a, b) =>
        Number(b.isPinned) - Number(a.isPinned) || a.position - b.position,
    );
    items.forEach((item) => sort(item.children));
  };
  sort(roots);
  return roots;
}

function TreeRow({
  note,
  depth,
  selectedId,
  expanded,
  onToggle,
  onSelect,
  onCreateChild,
  onDelete,
  onSetPinned,
  onDropInto,
  onMoveUp,
  onMoveDown,
  canEdit,
  editableNoteId,
}: {
  note: NoteTreeNode;
  depth: number;
  selectedId?: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onCreateChild: (id: string) => void;
  onDelete: (note: NoteTreeItem) => void;
  onSetPinned: (note: NoteTreeItem, isPinned: boolean) => void;
  onDropInto: (noteId: string, parentId: string | null) => void;
  onMoveUp: (note: NoteTreeItem) => void;
  onMoveDown: (note: NoteTreeItem) => void;
  canEdit: boolean;
  editableNoteId?: string;
}) {
  const canManageNote = canEdit || editableNoteId === note.id;
  const rowRef = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: NOTE_TREE_ITEM,
    item: { id: note.id },
    canDrag: canEdit,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  const [{ isOver }, drop] = useDrop({
    accept: NOTE_TREE_ITEM,
    canDrop: (item: { id: string }) => canEdit && item.id !== note.id,
    drop: (item: { id: string }, monitor) => {
      if (monitor.didDrop()) return;
      onDropInto(item.id, note.id);
      return { parentId: note.id };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
    }),
  });
  drag(drop(rowRef));

  return (
    <>
      <div
        ref={rowRef}
        className={`group flex items-center gap-1 rounded-md py-1 pr-1 text-sm transition-colors ${
          selectedId === note.id
            ? "bg-indigo-50 text-indigo-700"
            : "hover:bg-gray-100"
        } ${isDragging ? "opacity-40" : ""} ${isOver ? "ring-2 ring-inset ring-indigo-300" : ""}`}
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label={expanded.has(note.id) ? "Collapse note" : "Expand note"}
          disabled={!note.hasChildren && note.children.length === 0}
          onClick={() => onToggle(note.id)}
        >
          {expanded.has(note.id) ? <ChevronDown /> : <ChevronRight />}
        </Button>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
          onClick={() => onSelect(note.id)}
        >
          <FileText className="size-4 shrink-0 text-gray-400" />
          <span className="truncate">{note.title}</span>
          {note.isPinned && (
            <Pin className="size-3.5 shrink-0 fill-indigo-100 text-indigo-500" />
          )}
        </button>
        {canManageNote && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                aria-label={`Actions for ${note.title}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => onSetPinned(note, !note.isPinned)}
              >
                {note.isPinned ? <PinOff /> : <Pin />}
                {note.isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onCreateChild(note.id)}>
                <Plus />
                New child
              </DropdownMenuItem>
              {canEdit && (
                <>
                  <DropdownMenuItem onSelect={() => onMoveUp(note)}>
                    <ArrowUp />
                    Move up
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onMoveDown(note)}>
                    <ArrowDown />
                    Move down
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onDelete(note)}
              >
                <Trash2 />
                Delete subtree
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {expanded.has(note.id) &&
        note.children.map((child) => (
          <TreeRow
            key={child.id}
            note={child}
            depth={depth + 1}
            selectedId={selectedId}
            expanded={expanded}
            onToggle={onToggle}
            onSelect={onSelect}
            onCreateChild={onCreateChild}
            onDelete={onDelete}
            onSetPinned={onSetPinned}
            onDropInto={onDropInto}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canEdit={canEdit}
            editableNoteId={editableNoteId}
          />
        ))}
    </>
  );
}

export function NoteTreeSidebar({
  notes,
  projects,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  onCreate,
  onDelete,
  onSetPinned,
  onMove,
  onOpenTrash,
  canEdit,
  canCreate,
  editableNoteId,
  scopeControl,
}: {
  notes: NoteTreeItem[];
  projects: NoteProject[];
  selectedId?: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onCreate: (parentId?: string) => void;
  onDelete: (note: NoteTreeItem) => void;
  onSetPinned: (note: NoteTreeItem, isPinned: boolean) => void;
  onMove: (
    noteId: string,
    parentId: string | null,
    orderedIds: string[],
  ) => void;
  onOpenTrash: () => void;
  canEdit: boolean;
  canCreate: boolean;
  editableNoteId?: string;
  scopeControl?: ReactNode;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const tree = useMemo(() => buildTree(notes), [notes]);
  const projectSections = useMemo(() => {
    const notesByProject = new Map<string, NoteTreeNode[]>();
    for (const note of tree) {
      if (!note.projectId) continue;
      const group = notesByProject.get(note.projectId) ?? [];
      group.push(note);
      notesByProject.set(note.projectId, group);
    }

    return projects
      .map((project) => ({
        ...project,
        notes: notesByProject.get(project.id) ?? [],
      }))
      .filter((project) => project.notes.length > 0);
  }, [projects, tree]);
  const standaloneTree = useMemo(
    () => tree.filter((note) => !note.projectId),
    [tree],
  );
  const hasSectionedNotes =
    projectSections.length > 0 || standaloneTree.length > 0;
  const [, rootDrop] = useDrop({
    accept: NOTE_TREE_ITEM,
    canDrop: () => canEdit,
    drop: (item: { id: string }, monitor) => {
      if (monitor.didDrop()) return;
      moveInto(item.id, null);
      return { parentId: null };
    },
  });

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createChild = (parentId: string) => {
    setExpanded((current) => new Set(current).add(parentId));
    onCreate(parentId);
  };

  const siblingsFor = (parentId: string | null) =>
    notes
      .filter((note) => (note.parentId ?? null) === parentId)
      .sort(
        (a, b) =>
          Number(b.isPinned) - Number(a.isPinned) || a.position - b.position,
      );

  const moveInto = (noteId: string, parentId: string | null) => {
    const orderedIds = siblingsFor(parentId)
      .filter((note) => note.id !== noteId)
      .map((note) => note.id);
    orderedIds.push(noteId);
    onMove(noteId, parentId, orderedIds);
    if (parentId) {
      setExpanded((current) => new Set(current).add(parentId));
    }
  };

  const reorder = (note: NoteTreeItem, direction: -1 | 1) => {
    const siblings = siblingsFor(note.parentId ?? null);
    const index = siblings.findIndex((sibling) => sibling.id === note.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= siblings.length) return;
    if (siblings[target].isPinned !== note.isPinned) return;
    const next = [...siblings];
    [next[index], next[target]] = [next[target], next[index]];
    onMove(
      note.id,
      note.parentId ?? null,
      next.map((item) => item.id),
    );
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Notes</h1>
            <p className="text-xs text-gray-500">
              Drag a note onto another to nest it.
            </p>
          </div>
          {canCreate && (
            <Button
              size="icon"
              onClick={() => onCreate()}
              aria-label="New root note"
            >
              <Plus />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9"
            />
          </div>
          {scopeControl}
        </div>
      </div>

      <div
        ref={(node) => {
          rootDrop(node);
        }}
        className="min-h-0 flex-1 overflow-y-auto p-2"
      >
        {projectSections.map((project) => (
          <NoteSection key={project.id} title={project.name}>
            {project.notes.map((note) => (
              <TreeRow
                key={note.id}
                note={note}
                depth={0}
                selectedId={selectedId}
                expanded={expanded}
                onToggle={toggle}
                onSelect={onSelect}
                onCreateChild={createChild}
                onDelete={onDelete}
                onSetPinned={onSetPinned}
                onDropInto={moveInto}
                onMoveUp={(item) => reorder(item, -1)}
                onMoveDown={(item) => reorder(item, 1)}
                canEdit={canEdit}
                editableNoteId={editableNoteId}
              />
            ))}
          </NoteSection>
        ))}

        {standaloneTree.length > 0 && (
          <NoteSection title="Other notes">
            {standaloneTree.map((note) => (
              <TreeRow
                key={note.id}
                note={note}
                depth={0}
                selectedId={selectedId}
                expanded={expanded}
                onToggle={toggle}
                onSelect={onSelect}
                onCreateChild={createChild}
                onDelete={onDelete}
                onSetPinned={onSetPinned}
                onDropInto={moveInto}
                onMoveUp={(item) => reorder(item, -1)}
                onMoveDown={(item) => reorder(item, 1)}
                canEdit={canEdit}
                editableNoteId={editableNoteId}
              />
            ))}
          </NoteSection>
        )}

        {!hasSectionedNotes && (
          <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
            <FolderInput className="mb-3 size-8 text-gray-300" />
            <p className="text-sm font-medium text-gray-700">
              {search ? "No matching notes" : "No notes yet"}
            </p>
            {!search && canCreate && (
              <Button className="mt-4" size="sm" onClick={() => onCreate()}>
                <Plus />
                Create first note
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-2">
        <button
          type="button"
          onClick={onOpenTrash}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <Trash2 className="size-4 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">Trash</span>
            <span className="block truncate text-xs text-gray-400">
              Restore deleted notes
            </span>
          </span>
          <RotateCcw className="size-3.5 shrink-0 text-gray-400" />
        </button>
      </div>
    </aside>
  );
}

function NoteSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-4 last:mb-0">
      <div className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}
