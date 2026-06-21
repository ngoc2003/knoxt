import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectMemorySearch } from "./ProjectMemorySearch";

vi.mock("@apollo/client/react", () => ({
  useQuery: () => ({
    data: {
      projectKnowledgeSearch: {
        items: [
          {
            id: "action-1",
            type: "action",
            title: "Send proposal",
            snippet: "Send proposal",
            status: "open",
          },
        ],
      },
    },
    error: undefined,
    loading: false,
  }),
}));

describe("ProjectMemorySearch", () => {
  afterEach(cleanup);

  it("groups action results and opens their context", () => {
    const onOpenResult = vi.fn();

    render(
      <ProjectMemorySearch projectId="project-1" onOpenResult={onOpenResult} />,
    );

    fireEvent.change(screen.getByPlaceholderText(/search project memory/i), {
      target: { value: "proposal" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send proposal/i }));

    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(onOpenResult).toHaveBeenCalledWith(
      expect.objectContaining({ id: "action-1", type: "action" }),
    );
  });
});
