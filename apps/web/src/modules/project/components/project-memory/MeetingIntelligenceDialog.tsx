import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { MeetingIntelligenceDraftReview } from "./MeetingIntelligenceDraftReview";
import { useMeetingIntelligenceController } from "./useMeetingIntelligenceController";

export function MeetingIntelligenceDialog({
  projectId,
  open,
  onOpenChange,
  onSaved,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [transcript, setTranscript] = useState("");
  const intelligence = useMeetingIntelligenceController({
    projectId,
    onSaved: async () => {
      await onSaved();
      onOpenChange(false);
      setTitle("");
      setScheduledAt("");
      setTranscript("");
    },
  });
  const selectedCount =
    (intelligence.draft?.summary.trim() ? 1 : 0) +
    (intelligence.draft?.decisions.filter((item) => item.selected).length ??
      0) +
    (intelligence.draft?.actionItems.filter((item) => item.selected).length ??
      0);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) intelligence.reset();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            AI recap
          </DialogTitle>
          <DialogDescription>
            Paste a transcript, review the draft, then save selected items to
            Project Memory.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Meeting title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
          />
          <Textarea
            className="min-h-40"
            placeholder="Paste transcript..."
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
          />
          {intelligence.error && (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {intelligence.error}
            </p>
          )}
          {intelligence.draft && (
            <MeetingIntelligenceDraftReview
              draft={intelligence.draft}
              onChange={intelligence.setDraft}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!intelligence.draft ? (
            <Button
              onClick={() =>
                void intelligence.analyze({ title, scheduledAt, transcript })
              }
              disabled={transcript.trim().length < 20 || intelligence.analyzing}
            >
              {intelligence.analyzing ? "Generating..." : "Generate draft"}
            </Button>
          ) : (
            <Button
              onClick={() => void intelligence.save(scheduledAt)}
              disabled={selectedCount === 0 || intelligence.saving}
            >
              {intelligence.saving ? "Saving..." : "Save to Project Memory"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
