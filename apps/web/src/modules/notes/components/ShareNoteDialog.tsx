import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  RefreshCw,
  Trash2,
  UserPlus,
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
import { Switch } from "@/shared/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  CREATE_NOTE_PUBLIC_LINK_MUTATION,
  NOTE_WORKSPACE_META_QUERY,
  REMOVE_NOTE_SHARE_MUTATION,
  REVOKE_NOTE_PUBLIC_LINK_MUTATION,
  SHARE_NOTE_WITH_USER_MUTATION,
} from "../graphql/note";
import type { NoteWorkspaceMeta } from "../types/note";

export function ShareNoteDialog({
  noteId,
  open,
  onOpenChange,
}: {
  noteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [includeChildren, setIncludeChildren] = useState(false);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"viewer" | "editor">("viewer");
  const [userIncludeChildren, setUserIncludeChildren] = useState(true);
  const [latestUrl, setLatestUrl] = useState("");
  const metaQuery = useQuery(NOTE_WORKSPACE_META_QUERY, {
    variables: { noteId },
    skip: !open,
  });
  const [createLink] = useMutation(CREATE_NOTE_PUBLIC_LINK_MUTATION);
  const [revokeLink] = useMutation(REVOKE_NOTE_PUBLIC_LINK_MUTATION);
  const [shareNote] = useMutation(SHARE_NOTE_WITH_USER_MUTATION);
  const [removeShare] = useMutation(REMOVE_NOTE_SHARE_MUTATION);
  const meta = (metaQuery.data as { noteWorkspaceMeta?: NoteWorkspaceMeta })
    ?.noteWorkspaceMeta;
  const hasActivePublicLink = Boolean(
    meta?.publicLink && !meta.publicLink.revokedAt,
  );

  const handleCreateLink = async () => {
    const result = await createLink({
      variables: { data: { noteId, includeChildren } },
    });
    const token = (result.data as { createNotePublicLink?: { token: string } })
      ?.createNotePublicLink?.token;
    if (!token) return;
    const url = `${window.location.origin}/shared/notes/${token}`;
    setLatestUrl(url);
    await navigator.clipboard.writeText(url);
    await metaQuery.refetch();
    toast.success("Public link copied.");
  };

  const handleShare = async () => {
    if (!email.trim()) return;
    await shareNote({
      variables: {
        data: {
          noteId,
          email: email.trim(),
          permission,
          includeChildren: userIncludeChildren,
        },
      },
    });
    setEmail("");
    await metaQuery.refetch();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Share note</DialogTitle>
          <DialogDescription>
            Create a public read-only link or grant access to a registered user.
          </DialogDescription>
        </DialogHeader>

        <section className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Public link</p>
                {hasActivePublicLink && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <CheckCircle2 className="size-3.5" />
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {hasActivePublicLink
                  ? meta?.publicLink?.includeChildren
                    ? "Anyone with the link can read this note and its children."
                    : "Anyone with the link can read this note."
                  : "Anyone with the link can read it."}
              </p>
            </div>
            {hasActivePublicLink && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await revokeLink({ variables: { noteId } });
                  setLatestUrl("");
                  await metaQuery.refetch();
                }}
              >
                Revoke
              </Button>
            )}
          </div>
          <label className="mt-4 flex items-center justify-between text-sm">
            Include child notes
            <Switch
              checked={includeChildren}
              onCheckedChange={setIncludeChildren}
            />
          </label>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => void handleCreateLink()}>
              {hasActivePublicLink ? <RefreshCw /> : <Link2 />}
              {hasActivePublicLink
                ? "Refresh and copy link"
                : "Create and copy link"}
            </Button>
          </div>
          {hasActivePublicLink && !latestUrl && (
            <div className="mt-3 rounded-md border border-green-100 bg-green-50/70 p-3">
              <p className="text-sm font-medium text-green-800">
                This note already has an active public link.
              </p>
              <p className="mt-1 text-xs leading-5 text-green-700">
                For security, the existing URL cannot be displayed again.
                Refresh the link to generate and copy a new URL, or revoke it to
                stop sharing.
              </p>
            </div>
          )}
          {latestUrl && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-gray-600">
                Public link
              </p>
              <div className="flex gap-2">
                <Input
                  value={latestUrl}
                  readOnly
                  onFocus={(event) => event.currentTarget.select()}
                  aria-label="Public note link"
                />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Copy public link"
                  onClick={() => {
                    void navigator.clipboard.writeText(latestUrl);
                    toast.success("Public link copied.");
                  }}
                >
                  <Copy />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open public link"
                  onClick={() =>
                    window.open(latestUrl, "_blank", "noopener,noreferrer")
                  }
                >
                  <ExternalLink />
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                This URL is shown only after creating or refreshing the link.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-lg border p-4">
          <p className="mb-3 text-sm font-medium">People with access</p>
          <div className="flex gap-2">
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="person@example.com"
            />
            <Select
              value={permission}
              onValueChange={(value) =>
                setPermission(value as "viewer" | "editor")
              }
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button size="icon" onClick={() => void handleShare()}>
              <UserPlus />
            </Button>
          </div>
          <label className="mt-3 flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
            <span>
              <span className="block font-medium">Include child notes</span>
              <span className="block text-xs text-gray-500">
                Permission is inherited by the current subtree.
              </span>
            </span>
            <Switch
              checked={userIncludeChildren}
              onCheckedChange={setUserIncludeChildren}
            />
          </label>
          <div className="mt-3 space-y-2">
            {meta?.shares.map((share) => (
              <div
                key={share.userId}
                className="flex items-center gap-3 rounded-md bg-gray-50 p-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {share.user.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {share.user.email} · {share.permission}
                    {share.includeChildren ? " · includes children" : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    await removeShare({
                      variables: { noteId, userId: share.userId },
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
