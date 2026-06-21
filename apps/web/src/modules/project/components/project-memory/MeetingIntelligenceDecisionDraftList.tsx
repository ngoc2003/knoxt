import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type { MeetingIntelligenceDraft } from "./types";

export function MeetingIntelligenceDecisionDraftList({
  decisions,
  onChange,
}: {
  decisions: MeetingIntelligenceDraft["decisions"];
  onChange: (decisions: MeetingIntelligenceDraft["decisions"]) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Decisions</h3>
      {decisions.length === 0 && (
        <p className="rounded-md border border-dashed p-3 text-sm text-gray-500">
          No decisions detected.
        </p>
      )}
      {decisions.map((decision, index) => (
        <div key={index} className="space-y-2 rounded-md border p-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={decision.selected ?? true}
              onChange={(event) =>
                onChange(
                  decisions.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, selected: event.target.checked }
                      : item,
                  ),
                )
              }
            />
            Save decision
          </label>
          <Input
            value={decision.title}
            onChange={(event) =>
              onChange(
                decisions.map((item, itemIndex) =>
                  itemIndex === index
                    ? { ...item, title: event.target.value }
                    : item,
                ),
              )
            }
          />
          <Textarea
            value={decision.description}
            onChange={(event) =>
              onChange(
                decisions.map((item, itemIndex) =>
                  itemIndex === index
                    ? { ...item, description: event.target.value }
                    : item,
                ),
              )
            }
          />
        </div>
      ))}
    </div>
  );
}
