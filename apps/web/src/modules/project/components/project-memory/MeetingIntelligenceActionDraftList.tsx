import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type { MeetingIntelligenceDraft } from "./types";

export function MeetingIntelligenceActionDraftList({
  actionItems,
  onChange,
}: {
  actionItems: MeetingIntelligenceDraft["actionItems"];
  onChange: (items: MeetingIntelligenceDraft["actionItems"]) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Action items</h3>
      {actionItems.length === 0 && (
        <p className="rounded-md border border-dashed p-3 text-sm text-gray-500">
          No action items detected.
        </p>
      )}
      {actionItems.map((action, index) => (
        <div key={index} className="space-y-2 rounded-md border p-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={action.selected ?? true}
              onChange={(event) =>
                onChange(
                  actionItems.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, selected: event.target.checked }
                      : item,
                  ),
                )
              }
            />
            Save action
          </label>
          <Input
            value={action.title}
            onChange={(event) =>
              onChange(
                actionItems.map((item, itemIndex) =>
                  itemIndex === index
                    ? { ...item, title: event.target.value }
                    : item,
                ),
              )
            }
          />
          <Textarea
            value={action.description ?? ""}
            onChange={(event) =>
              onChange(
                actionItems.map((item, itemIndex) =>
                  itemIndex === index
                    ? { ...item, description: event.target.value }
                    : item,
                ),
              )
            }
          />
          <Input
            placeholder="External assignee"
            value={action.externalAssigneeName ?? ""}
            onChange={(event) =>
              onChange(
                actionItems.map((item, itemIndex) =>
                  itemIndex === index
                    ? { ...item, externalAssigneeName: event.target.value }
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
