import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MeetingIntelligenceDialog } from "./MeetingIntelligenceDialog";

const mutationFns = vi.hoisted(() => ({
  analyze: vi.fn(),
  save: vi.fn(),
}));

vi.mock("@apollo/client/react", () => ({
  useMutation: vi.fn(() => {
    const calls =
      (globalThis as typeof globalThis & { __mutationCalls?: number })
        .__mutationCalls ?? 0;
    (
      globalThis as typeof globalThis & { __mutationCalls?: number }
    ).__mutationCalls = calls + 1;
    return calls % 2 === 0
      ? [mutationFns.analyze, { loading: false }]
      : [mutationFns.save, { loading: false }];
  }),
}));

describe("MeetingIntelligenceDialog", () => {
  afterEach(cleanup);

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { __mutationCalls?: number }
    ).__mutationCalls = 0;
    vi.clearAllMocks();
    mutationFns.analyze.mockResolvedValue({
      data: {
        analyzeMeetingTranscript: {
          __typename: "MeetingIntelligenceDraft",
          title: "Planning sync",
          summary: "Agreed launch scope",
          warnings: [],
          decisions: [
            {
              __typename: "DraftDecision",
              title: "Use Stripe",
              description: "Stripe is simpler",
              reason: null,
            },
          ],
          actionItems: [
            {
              __typename: "DraftActionItem",
              title: "Send proposal",
              description: "By Friday",
              externalAssigneeName: null,
              dueDate: null,
            },
          ],
        },
      },
    });
    mutationFns.save.mockResolvedValue({
      data: { saveMeetingIntelligenceDraft: { id: "meeting-1" } },
    });
  });

  it("lets users review and save selected AI draft items", async () => {
    const onSaved = vi.fn();

    render(
      <MeetingIntelligenceDialog
        projectId="project-1"
        open
        onOpenChange={vi.fn()}
        onSaved={onSaved}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/paste transcript/i), {
      target: {
        value:
          "Planning sync transcript with enough content. Decision: use Stripe. Action: send proposal.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /generate draft/i }));

    await waitFor(() =>
      expect(screen.getByDisplayValue("Planning sync")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText(/save decision/i));
    fireEvent.click(
      screen.getByRole("button", { name: /save to project memory/i }),
    );

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(mutationFns.save).toHaveBeenCalledWith({
      variables: {
        input: expect.objectContaining({
          projectId: "project-1",
          title: "Planning sync",
          decisions: [],
          actionItems: [
            expect.objectContaining({
              title: "Send proposal",
              description: "By Friday",
            }),
          ],
        }),
      },
    });
    const savedInput = mutationFns.save.mock.calls[0][0].variables.input;
    expect(JSON.stringify(savedInput)).not.toContain("__typename");
  });
});
