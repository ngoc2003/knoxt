import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { UPDATE_NOTE_MUTATION } from "../graphql/note";
import type { NoteDetail } from "../types/note";

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "conflict";

export function useNoteAutosave(
  note: NoteDetail,
  onSaved?: (note: NoteDetail) => void,
  enabled = true,
) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const versionRef = useRef(note.version);
  const savedRef = useRef({ title: note.title, content: note.content });
  const draftRef = useRef({ title: note.title, content: note.content });
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [updateNote] = useMutation(UPDATE_NOTE_MUTATION);

  draftRef.current = { title, content };

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setStatus("idle");
    versionRef.current = note.version;
    savedRef.current = { title: note.title, content: note.content };
    draftRef.current = { title: note.title, content: note.content };
    saveQueueRef.current = Promise.resolve();
  }, [note.content, note.id, note.title, note.version]);

  useEffect(() => {
    if (!enabled) return;
    if (
      title === savedRef.current.title &&
      content === savedRef.current.content
    ) {
      return;
    }

    setStatus("saving");

    const timer = window.setTimeout(() => {
      saveQueueRef.current = saveQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          try {
            const result = await updateNote({
              variables: {
                id: note.id,
                data: {
                  title,
                  content,
                  expectedVersion: versionRef.current,
                },
              },
              context: { suppressGlobalError: true },
            });

            const savedNote = (result.data as { updateNote?: NoteDetail })
              ?.updateNote;
            if (!savedNote) throw new Error("Missing updated note");

            versionRef.current = savedNote.version;
            savedRef.current = { title, content };
            const currentDraft = draftRef.current;
            setStatus(
              currentDraft.title === title && currentDraft.content === content
                ? "saved"
                : "saving",
            );
            onSaved?.(savedNote);
          } catch (error) {
            const message = error instanceof Error ? error.message : "";
            setStatus(
              message.toLowerCase().includes("changed") ? "conflict" : "error",
            );
            throw error;
          }
        });
    }, 800);

    return () => window.clearTimeout(timer);
  }, [content, enabled, note.id, onSaved, title, updateNote]);

  return { title, setTitle, content, setContent, status };
}
