import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  ANALYZE_MEETING_TRANSCRIPT,
  SAVE_MEETING_INTELLIGENCE_DRAFT,
} from "../../graphql/projectKnowledge";
import type { MeetingIntelligenceDraft } from "./types";

export function useMeetingIntelligenceController({
  projectId,
  onSaved,
}: {
  projectId: string;
  onSaved: () => void | Promise<void>;
}) {
  const [draft, setDraft] = useState<MeetingIntelligenceDraft>();
  const [error, setError] = useState<string>();
  const [analyzeMutation, analyzeState] = useMutation(
    ANALYZE_MEETING_TRANSCRIPT,
  );
  const [saveMutation, saveState] = useMutation(SAVE_MEETING_INTELLIGENCE_DRAFT);

  const analyze = async (input: {
    title?: string;
    scheduledAt?: string;
    transcript: string;
  }) => {
    setError(undefined);
    const result = await analyzeMutation({
      variables: {
        input: {
          projectId,
          title: input.title || undefined,
          scheduledAt: input.scheduledAt
            ? new Date(input.scheduledAt).toISOString()
            : undefined,
          transcript: input.transcript,
        },
      },
    });
    const nextDraft = (
      result.data as { analyzeMeetingTranscript?: MeetingIntelligenceDraft }
    ).analyzeMeetingTranscript;
    if (!nextDraft) {
      setError("No draft was generated. Please try again.");
      return;
    }
    setDraft({
      ...nextDraft,
      decisions: nextDraft.decisions.map((item) => ({
        ...item,
        selected: true,
      })),
      actionItems: nextDraft.actionItems.map((item) => ({
        ...item,
        selected: true,
      })),
    });
  };

  const save = async (scheduledAt?: string) => {
    if (!draft) return;
    await saveMutation({
      variables: {
        input: {
          projectId,
          title: draft.title,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          summary: draft.summary || null,
          decisions: draft.decisions
            .filter((item) => item.selected)
            .map((item) => ({
              title: item.title,
              description: item.description,
              reason: item.reason ?? null,
            })),
          actionItems: draft.actionItems
            .filter((item) => item.selected)
            .map((item) => ({
              title: item.title,
              description: item.description ?? null,
              externalAssigneeName: item.externalAssigneeName ?? null,
              dueDate: item.dueDate ?? null,
            })),
        },
      },
    });
    setDraft(undefined);
    await onSaved();
  };

  return {
    analyze,
    analyzing: analyzeState.loading,
    draft,
    error: error ?? analyzeState.error?.message ?? saveState.error?.message,
    reset: () => {
      setDraft(undefined);
      setError(undefined);
    },
    save,
    saving: saveState.loading,
    setDraft,
  };
}
