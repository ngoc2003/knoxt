import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectMemoryHome } from "./ProjectMemoryHome";
import type { MemoryEntity } from "./types";

const meeting: MemoryEntity = {
  id: "meeting-1",
  title: "Client recap",
  summary: "Scope discussion",
  status: "completed",
  actionItems: [
    {
      id: "action-1",
      meetingId: "meeting-1",
      title: "Send proposal",
      status: "open",
    },
  ],
};

const callbacks = {
  onQuickRecap: vi.fn(),
  onQuickDecision: vi.fn(),
  onQuickRequirement: vi.fn(),
  onQuickAction: vi.fn(),
  onEditAction: vi.fn(),
  onCompleteAction: vi.fn(),
  onCreateTask: vi.fn(),
  onDeleteAction: vi.fn(),
  onRestoreAction: vi.fn(),
};

describe("ProjectMemoryHome", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps viewer in read-only mode", () => {
    render(
      <ProjectMemoryHome
        decisions={[]}
        meetings={[meeting]}
        requirements={[]}
        loading={false}
        canEdit={false}
        {...callbacks}
      />,
    );

    expect(
      screen.getByText(/you can view project memory/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/meeting title/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /create task/i }),
    ).not.toBeInTheDocument();
  });

  it("captures a recap with action lines in one flow", () => {
    render(
      <ProjectMemoryHome
        decisions={[]}
        meetings={[]}
        requirements={[]}
        loading={false}
        canEdit
        {...callbacks}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/meeting title/i), {
      target: { value: "Planning sync" },
    });
    fireEvent.change(screen.getByPlaceholderText("Summary"), {
      target: { value: "Agreed on launch scope" },
    });
    fireEvent.change(screen.getByPlaceholderText(/actions, one per line/i), {
      target: { value: "Send proposal\nBook kickoff" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save recap/i }));

    expect(callbacks.onQuickRecap).toHaveBeenCalledWith({
      title: "Planning sync",
      summary: "Agreed on launch scope",
      actions: ["Send proposal", "Book kickoff"],
    });
  });

  it("shows project memory empty state", () => {
    render(
      <ProjectMemoryHome
        decisions={[]}
        meetings={[]}
        requirements={[]}
        loading={false}
        canEdit={false}
        {...callbacks}
      />,
    );

    expect(screen.getByText(/project memory is empty/i)).toBeInTheDocument();
  });
});
