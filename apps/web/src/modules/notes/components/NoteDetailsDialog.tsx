import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { ExternalLink, Paperclip, Plus, Tag, Trash2 } from "lucide-react";
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
  NOTE_WORKSPACE_META_QUERY,
  REMOVE_NOTE_ATTACHMENT_MUTATION,
  SET_NOTE_TAGS_MUTATION,
} from "../graphql/note";
import type { NoteWorkspaceMeta } from "../types/note";

export function NoteDetailsDialog({
  noteId,
  open,
  onOpenChange,
}: {
  noteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tagText, setTagText] = useState("");
  const [filename, setFilename] = useState("");
  const [url, setUrl] = useState("");
  const metaQuery = useQuery(NOTE_WORKSPACE_META_QUERY, {
    variables: { noteId },
    skip: !open,
  });
  const [setTags] = useMutation(SET_NOTE_TAGS_MUTATION);
  const [addAttachment] = useMutation(ADD_NOTE_ATTACHMENT_MUTATION);
  const [removeAttachment] = useMutation(REMOVE_NOTE_ATTACHMENT_MUTATION);
  const meta = (metaQuery.data as { noteWorkspaceMeta?: NoteWorkspaceMeta })
    ?.noteWorkspaceMeta;

  useEffect(() => {
    if (meta) setTagText(meta.tags.map((tag) => tag.name).join(", "));
  }, [meta]);

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
            <Tag className="size-4" />
            Tags
          </p>
          <div className="flex gap-2">
            <Input
              value={tagText}
              onChange={(event) => setTagText(event.target.value)}
              placeholder="client, meeting, ideas"
            />
            <Button
              onClick={async () => {
                await setTags({
                  variables: {
                    data: {
                      noteId,
                      tags: tagText.split(",").map((tag) => tag.trim()),
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
