import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ExternalLink,
  FolderKanban,
  Paperclip,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import {
  ADD_NOTE_ATTACHMENT_MUTATION,
  ASSIGN_NOTE_PROJECT_MUTATION,
  NOTE_WORKSPACE_META_QUERY,
  NOTE_TAGS_QUERY,
  REMOVE_NOTE_ATTACHMENT_MUTATION,
  SET_NOTE_TAGS_MUTATION,
} from "../graphql/note";
import type { NoteTag, NoteWorkspaceMeta } from "../types/note";
import { NoteTagSelector } from "./NoteTagSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export function NoteDetailsDialog({
  noteId,
  projectId,
  projects,
  open,
  onOpenChange,
  onProjectAssigned,
}: {
  noteId: string;
  projectId?: string | null;
  projects: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectAssigned: (projectId: string | null) => void;
}) {
  const [tags, setTagsState] = useState<string[]>([]);
  const [filename, setFilename] = useState("");
  const [url, setUrl] = useState("");
  const [targetProjectId, setTargetProjectId] = useState(
    projectId ?? "standalone",
  );
  const metaQuery = useQuery(NOTE_WORKSPACE_META_QUERY, {
    variables: { noteId },
    skip: !open,
  });
  const tagsQuery = useQuery(NOTE_TAGS_QUERY, { skip: !open });
  const [setTags] = useMutation(SET_NOTE_TAGS_MUTATION);
  const [addAttachment] = useMutation(ADD_NOTE_ATTACHMENT_MUTATION);
  const [removeAttachment] = useMutation(REMOVE_NOTE_ATTACHMENT_MUTATION);
  const [assignProject, { loading: assigning }] = useMutation(
    ASSIGN_NOTE_PROJECT_MUTATION,
  );
  const meta = (metaQuery.data as { noteWorkspaceMeta?: NoteWorkspaceMeta })
    ?.noteWorkspaceMeta;

  useEffect(() => {
    if (meta) setTagsState(meta.tags.map((tag) => tag.name));
  }, [meta]);

  useEffect(() => {
    if (open) setTargetProjectId(projectId ?? "standalone");
  }, [open, projectId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Note details</DialogTitle>
          <DialogDescription>
            Manage tags and attachment links.
          </DialogDescription>
        </DialogHeader>

        <section className="rounded-lg border p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium">
            <FolderKanban className="size-4" />
            Project
          </p>
          <div className="flex gap-2">
            <Select value={targetProjectId} onValueChange={setTargetProjectId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Assign to project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standalone">Standalone note</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={
                assigning ||
                targetProjectId === (projectId ?? "standalone")
              }
              onClick={async () => {
                const nextProjectId =
                  targetProjectId === "standalone" ? null : targetProjectId;
                try {
                  await assignProject({
                    variables: {
                      data: { noteId, projectId: nextProjectId },
                    },
                  });
                  toast.success(
                    nextProjectId
                      ? "Note subtree assigned to project."
                      : "Note subtree moved to standalone notes.",
                  );
                  onProjectAssigned(nextProjectId);
                  onOpenChange(false);
                } catch {
                  toast.error(
                    "Could not assign this note. Check your project edit permission.",
                  );
                }
              }}
            >
              Assign
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            This moves the note and all of its child notes.
          </p>
        </section>

        <section className="rounded-lg border p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Tag className="size-4" />
            Tags
          </p>
          <div className="space-y-3">
            <NoteTagSelector
              tags={tags}
              suggestions={
                (tagsQuery.data as { noteTags?: NoteTag[] })?.noteTags ?? []
              }
              onChange={setTagsState}
            />
            <Button
              onClick={async () => {
                await setTags({
                  variables: {
                    data: {
                      noteId,
                      tags,
                    },
                  },
                });
                await metaQuery.refetch();
              }}
            >
              Save
            </Button>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Paperclip className="size-4" />
            Attachment links
          </p>
          <div className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
            <Input
              value={filename}
              onChange={(event) => setFilename(event.target.value)}
              placeholder="Filename"
            />
            <Input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
            />
            <Button
              size="icon"
              disabled={!filename.trim() || !url.trim()}
              onClick={async () => {
                await addAttachment({
                  variables: {
                    data: {
                      noteId,
                      filename: filename.trim(),
                      url: url.trim(),
                    },
                  },
                });
                setFilename("");
                setUrl("");
                await metaQuery.refetch();
              }}
            >
              <Plus />
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {meta?.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 rounded-md bg-gray-50 p-2"
              >
                <a
                  className="flex min-w-0 flex-1 items-center gap-2 text-sm text-indigo-600 hover:underline"
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-4 shrink-0" />
                  <span className="truncate">{attachment.filename}</span>
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    await removeAttachment({
                      variables: { id: attachment.id },
                    });
                    await metaQuery.refetch();
                  }}
                >
                  <Trash2 className="text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
