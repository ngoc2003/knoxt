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
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { DeleteConfirmDialog } from "@/shared/components/DeleteConfirmDialog";
import {
  CREATE_NOTE_MUTATION,
  DELETE_NOTE_MUTATION,
  MOVE_NOTE_MUTATION,
  NOTE_ACCESS_QUERY,
  NOTE_DETAIL_QUERY,
  NOTE_TRASH_QUERY,
  NOTE_TREE_QUERY,
  NOTE_TAGS_QUERY,
  SET_NOTE_PINNED_MUTATION,
} from "../graphql/note";
import type { NoteDetail, NoteTag, NoteTreeItem } from "../types/note";
import { NoteBreadcrumb } from "./NoteBreadcrumb";
import { NoteEditor } from "./NoteEditor";
import { NoteTreeSidebar } from "./NoteTreeSidebar";
import { NoteDetailsDialog } from "./NoteDetailsDialog";
import { NoteTrashDialog } from "./NoteTrashDialog";
import { ShareNoteDialog } from "./ShareNoteDialog";
import { PROJECT_DETAIL_QUERY } from "@/modules/project/graphql/project";
import { PROJECTS_QUERY } from "@/modules/project/graphql/project";
import { useAuth } from "@/modules/auth/context/AuthContext";
import { NoteFiltersPopover } from "./NoteFiltersPopover";

export function Notes() {
  const { noteId } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId") ?? undefined;
  const scope = projectId ?? searchParams.get("scope") ?? "all";
  const standaloneOnly = scope === "standalone";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [tagId, setTagId] = useState("all");
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
    variables: {
      projectId,
      standaloneOnly,
      search: debouncedSearch || undefined,
      tagIds: tagId === "all" ? undefined : [tagId],
    },
    fetchPolicy: "cache-and-network",
  });
  const tagsQuery = useQuery(NOTE_TAGS_QUERY);
  const projectsQuery = useQuery(PROJECTS_QUERY, {
    variables: { pagination: { skip: 0, take: 100 } },
  });
  const projectQuery = useQuery(PROJECT_DETAIL_QUERY, {
    variables: { id: projectId ?? "" },
    skip: !projectId,
  });
  const detailQuery = useQuery(NOTE_DETAIL_QUERY, {
    variables: { id: noteId ?? "" },
    skip: !noteId,
  });
  const accessQuery = useQuery(NOTE_ACCESS_QUERY, {
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
      refetchQueries: [
        {
          query: NOTE_TRASH_QUERY,
          variables: { projectId, standaloneOnly },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  const notes = useMemo(
    () => (treeQuery.data as { noteTree?: NoteTreeItem[] })?.noteTree ?? [],
    [treeQuery.data],
  );
  const selectedNote = (detailQuery.data as { noteDetail?: NoteDetail })
    ?.noteDetail;
  const selectedAccess = (
    accessQuery.data as {
      noteAccess?: { canEdit: boolean; canShare: boolean };
    }
  )?.noteAccess;
  const project = (
    projectQuery.data as {
      projectDetail?: {
        userId: string;
        members: { userId: string; role: "viewer" | "editor" | "admin" }[];
      };
    }
  )?.projectDetail;
  const projects =
    (
      projectsQuery.data as {
        projects?: { items: { id: string; name: string }[] };
      }
    )?.projects?.items ?? [];
  const tags = (tagsQuery.data as { noteTags?: NoteTag[] })?.noteTags ?? [];
  const membership = project?.members.find(
    (member) => member.userId === user?.id,
  );
  const isOwner = project?.userId === user?.id;
  const projectCanEdit =
    Boolean(isOwner) ||
    membership?.role === "editor" ||
    membership?.role === "admin";
  const canEditTree = standaloneOnly || (Boolean(projectId) && projectCanEdit);
  const canEditSelected = selectedAccess?.canEdit ?? false;
  const canCreate = !projectId || projectCanEdit;
  const canShare = selectedAccess?.canShare ?? false;
  const notesPath = useCallback(
    (id?: string) =>
      `/notes${id ? `/${id}` : ""}${
        projectId
          ? `?projectId=${encodeURIComponent(projectId)}`
          : standaloneOnly
            ? "?scope=standalone"
            : ""
      }`,
    [projectId, standaloneOnly],
  );

  useEffect(() => {
    if (!noteId && !search && notes.length > 0) {
      navigate(notesPath(notes[0].id), { replace: true });
    }
  }, [navigate, noteId, notes, notesPath, search]);

  const notesById = useMemo(
    () => new Map(notes.map((note) => [note.id, note])),
    [notes],
  );

  const handleCreate = async (parentId?: string) => {
    const parent = parentId ? notesById.get(parentId) : undefined;
    const canCreateChild =
      !parentId ||
      canEditTree ||
      (parentId === noteId && canEditSelected);
    if (!canCreate || !canCreateChild) return;
    const targetProjectId = parent?.projectId ?? projectId;
    try {
      const result = await createNote({
        variables: {
          data: {
            title: "Untitled",
            content: "",
            ...(targetProjectId ? { projectId: targetProjectId } : {}),
            parentId,
          },
        },
      });
      await treeQuery.refetch();
      const created = (result.data as { createNote?: NoteDetail })?.createNote;
      if (created) navigate(notesPath(created.id));
    } catch {
      toast.error("Could not create that note.");
    }
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
      navigate(notesPath(fallbackId ?? undefined));
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
              projects={projects}
              selectedId={noteId}
              search={search}
              onSearchChange={setSearch}
              onSelect={(id) => navigate(notesPath(id))}
              onCreate={(parentId) => void handleCreate(parentId)}
              onDelete={setNoteToDelete}
              onSetPinned={(note, isPinned) =>
                void handleSetPinned(note.id, isPinned)
              }
              onMove={(id, parentId, orderedIds) =>
                void handleMove(id, parentId, orderedIds)
              }
              onOpenTrash={() => setTrashOpen(true)}
              canEdit={canEditTree}
              canCreate={canCreate}
              editableNoteId={canEditSelected ? noteId : undefined}
              scopeControl={
                <NoteFiltersPopover
                  scope={scope}
                  tagId={tagId}
                  projects={projects}
                  tags={tags}
                  onScopeChange={(value) => {
                    navigate(
                      `/notes${
                        value === "all"
                          ? ""
                          : value === "standalone"
                            ? "?scope=standalone"
                            : `?projectId=${encodeURIComponent(value)}`
                      }`,
                    );
                  }}
                  onTagChange={setTagId}
                />
              }
            />
          )}

          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
            {noteId && (
              <div className="flex h-12 items-center border-b px-5">
                <NoteBreadcrumb noteId={noteId} notes={notes} />
                <div className="ml-auto flex items-center gap-1">
                  {canEditSelected && (
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
                  )}
                  {canEditSelected && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDetailsOpen(true)}
                    >
                      <Info />
                      Details
                    </Button>
                  )}
                  {canShare && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShareOpen(true)}
                    >
                      <Share2 />
                      Share
                    </Button>
                  )}
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
                canEdit={canEditSelected}
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
                {canCreate && (
                  <Button className="mt-5" onClick={() => void handleCreate()}>
                    Create note
                  </Button>
                )}
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
            projectId={selectedNote?.projectId}
            projects={projects}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            onProjectAssigned={(nextProjectId) => {
              void treeQuery.refetch();
              navigate(
                `/notes/${noteId}${
                  nextProjectId
                    ? `?projectId=${encodeURIComponent(nextProjectId)}`
                    : "?scope=standalone"
                }`,
              );
            }}
          />
        </>
      )}
      <NoteTrashDialog
        open={trashOpen}
        onOpenChange={setTrashOpen}
        onRestored={(id) => {
          void treeQuery.refetch();
          navigate(notesPath(id));
        }}
        projectId={projectId}
        standaloneOnly={standaloneOnly}
        canEdit={canEditTree}
      />
    </>
  );
}
