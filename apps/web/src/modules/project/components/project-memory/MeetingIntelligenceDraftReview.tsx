import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { MeetingIntelligenceActionDraftList } from "./MeetingIntelligenceActionDraftList";
import { MeetingIntelligenceDecisionDraftList } from "./MeetingIntelligenceDecisionDraftList";
import type { MeetingIntelligenceDraft } from "./types";

export function MeetingIntelligenceDraftReview({
  draft,
  onChange,
}: {
  draft: MeetingIntelligenceDraft;
  onChange: (draft: MeetingIntelligenceDraft) => void;
}) {
  return (
    <div className="space-y-4">
      {draft.warnings.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {draft.warnings.join(" ")}
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input
          value={draft.title}
          onChange={(event) =>
            onChange({ ...draft, title: event.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Summary</label>
        <Textarea
          value={draft.summary}
          onChange={(event) =>
            onChange({ ...draft, summary: event.target.value })
          }
        />
      </div>
      <MeetingIntelligenceDecisionDraftList
        decisions={draft.decisions}
        onChange={(decisions) => onChange({ ...draft, decisions })}
      />
      <MeetingIntelligenceActionDraftList
        actionItems={draft.actionItems}
        onChange={(actionItems) => onChange({ ...draft, actionItems })}
      />
    </div>
  );
}
