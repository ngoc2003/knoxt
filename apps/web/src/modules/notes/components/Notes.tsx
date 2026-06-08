import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  FilePlus2,
  Info,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Pin,
  PinOff,
  Share2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { DeleteConfirmDialog } from "@/shared/components/DeleteConfirmDialog";
import {
  CREATE_NOTE_MUTATION,
  DELETE_NOTE_MUTATION,
  MOVE_NOTE_MUTATION,
  NOTE_DETAIL_QUERY,
  NOTE_TRASH_QUERY,
  NOTE_TREE_QUERY,
  SET_NOTE_PINNED_MUTATION,
} from "../graphql/note";
import type { NoteDetail, NoteTreeItem } from "../types/note";
import { NoteBreadcrumb } from "./NoteBreadcrumb";
import { NoteEditor } from "./NoteEditor";
import { NoteTreeSidebar } from "./NoteTreeSidebar";
import { NoteDetailsDialog } from "./NoteDetailsDialog";
import { NoteTrashDialog } from "./NoteTrashDialog";
import { ShareNoteDialog } from "./ShareNoteDialog";

export function Notes() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [noteToDelete, setNoteToDelete] = useState<NoteTreeItem | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!isFullScreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullScreen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  const treeQuery = useQuery(NOTE_TREE_QUERY, {
    variables: { search: debouncedSearch || undefined },
    fetchPolicy: "cache-and-network",
  });
  const detailQuery = useQuery(NOTE_DETAIL_QUERY, {
    variables: { id: noteId ?? "" },
    skip: !noteId,
  });
  const [createNote, { loading: creating }] = useMutation(CREATE_NOTE_MUTATION);
  const [moveNote, { loading: moving }] = useMutation(MOVE_NOTE_MUTATION);
  const [setNotePinned, { loading: pinning }] = useMutation(
    SET_NOTE_PINNED_MUTATION,
  );
  const [deleteNote, { loading: deleting }] = useMutation(
    DELETE_NOTE_MUTATION,
    {
      refetchQueries: [{ query: NOTE_TRASH_QUERY }],
      awaitRefetchQueries: true,
    },
  );

  const notes =
    (treeQuery.data as { noteTree?: NoteTreeItem[] })?.noteTree ?? [];
  const selectedNote = (detailQuery.data as { noteDetail?: NoteDetail })
    ?.noteDetail;

  useEffect(() => {
    if (!noteId && !search && notes.length > 0) {
      navigate(`/notes/${notes[0].id}`, { replace: true });
    }
  }, [navigate, noteId, notes, search]);

  const notesById = useMemo(
    () => new Map(notes.map((note) => [note.id, note])),
    [notes],
  );

  const handleCreate = async (parentId?: string) => {
    const result = await createNote({
      variables: {
        data: {
          title: "Untitled",
          content: "",
          parentId,
        },
      },
    });
    await treeQuery.refetch();
    const created = (result.data as { createNote?: NoteDetail })?.createNote;
    if (created) navigate(`/notes/${created.id}`);
  };

  const handleMove = async (
    id: string,
    parentId: string | null,
    orderedSiblingIds: string[],
  ) => {
    try {
      await moveNote({
        variables: { data: { id, parentId, orderedSiblingIds } },
      });
      await treeQuery.refetch();
    } catch {
      toast.error("Could not move that note.");
    }
  };

  const handleSetPinned = async (id: string, isPinned: boolean) => {
    try {
      await setNotePinned({ variables: { id, isPinned } });
      await treeQuery.refetch();
    } catch {
      toast.error(`Could not ${isPinned ? "pin" : "unpin"} that note.`);
    }
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;
    const fallbackId = noteToDelete.parentId;
    await deleteNote({
      variables: { id: noteToDelete.id },
    });
    await treeQuery.refetch();
    setNoteToDelete(null);
    if (noteId === noteToDelete.id || isDescendantOf(noteId, noteToDelete.id)) {
      navigate(fallbackId ? `/notes/${fallbackId}` : "/notes");
    }
  };

  const isDescendantOf = (
    candidateId: string | undefined,
    ancestorId: string,
  ) => {
    let current = candidateId ? notesById.get(candidateId) : undefined;
    while (current?.parentId) {
      if (current.parentId === ancestorId) return true;
      current = notesById.get(current.parentId);
    }
    return false;
  };

  const refetchTree = treeQuery.refetch;
  const handleSaved = useCallback(() => void refetchTree(), [refetchTree]);

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div className="flex h-full min-h-0 min-w-0 overflow-hidden bg-white">
          {!isFullScreen && (
            <NoteTreeSidebar
              notes={notes}
              selectedId={noteId}
              search={search}
              onSearchChange={setSearch}
              onSelect={(id) => navigate(`/notes/${id}`)}
              onCreate={(parentId) => void handleCreate(parentId)}
              onDelete={setNoteToDelete}
              onSetPinned={(note, isPinned) =>
                void handleSetPinned(note.id, isPinned)
              }
              onMove={(id, parentId, orderedIds) =>
                void handleMove(id, parentId, orderedIds)
              }
              onOpenTrash={() => setTrashOpen(true)}
            />
          )}

          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
            {noteId && (
              <div className="flex h-12 items-center border-b px-5">
                <NoteBreadcrumb noteId={noteId} notes={notes} />
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      void handleSetPinned(
                        noteId,
                        !notesById.get(noteId)?.isPinned,
                      )
                    }
                  >
                    {notesById.get(noteId)?.isPinned ? <PinOff /> : <Pin />}
                    {notesById.get(noteId)?.isPinned ? "Unpin" : "Pin"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDetailsOpen(true)}
                  >
                    <Info />
                    Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShareOpen(true)}
                  >
                    <Share2 />
                    Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullScreen((current) => !current)}
                    aria-label={
                      isFullScreen ? "Exit full screen" : "Open full screen"
                    }
                    aria-pressed={isFullScreen}
                  >
                    {isFullScreen ? <Minimize2 /> : <Maximize2 />}
                    {isFullScreen ? "Exit full screen" : "Full screen"}
                  </Button>
                </div>
                {(creating || moving || pinning || deleting) && (
                  <LoaderCircle className="size-4 animate-spin text-gray-400" />
                )}
              </div>
            )}

            {detailQuery.loading && noteId && (
              <div className="flex flex-1 items-center justify-center">
                <LoaderCircle className="size-6 animate-spin text-indigo-500" />
              </div>
            )}
            {detailQuery.error && noteId && (
              <div className="flex flex-1 items-center justify-center text-sm text-red-600">
                This note could not be loaded.
              </div>
            )}
            {selectedNote && (
              <NoteEditor
                key={selectedNote.id}
                note={selectedNote}
                onSaved={handleSaved}
              />
            )}
            {!noteId && !treeQuery.loading && (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <FilePlus2 className="mb-4 size-12 text-gray-300" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Create your first note
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Notes can contain both Markdown content and child notes.
                </p>
                <Button className="mt-5" onClick={() => void handleCreate()}>
                  Create note
                </Button>
              </div>
            )}
          </main>
        </div>
      </DndProvider>

      <DeleteConfirmDialog
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => void handleDelete()}
        title={`Delete "${noteToDelete?.title ?? "note"}"?`}
        description="This will delete the note and every child note below it."
      />
      {noteId && (
        <>
          <ShareNoteDialog
            noteId={noteId}
            open={shareOpen}
            onOpenChange={setShareOpen}
          />
          <NoteDetailsDialog
            noteId={noteId}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
          />
        </>
      )}
      <NoteTrashDialog
        open={trashOpen}
        onOpenChange={setTrashOpen}
        onRestored={(id) => {
          void treeQuery.refetch();
          navigate(`/notes/${id}`);
        }}
      />
    </>
  );
}
