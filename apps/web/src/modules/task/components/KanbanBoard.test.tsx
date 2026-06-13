import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KanbanBoard } from "./KanbanBoard";

const dragConfigs = vi.hoisted(() => [] as { canDrag?: boolean }[]);

vi.mock("react-dnd", () => ({
  useDrop: () => [{}, vi.fn()],
  useDrag: (config: { canDrag?: boolean }) => {
    dragConfigs.push(config);
    return [{}, vi.fn()];
  },
}));

const task = {
  id: "task-1",
  title: "Task one",
  priority: "medium" as const,
  status: "todo",
  orderKey: "0000000000000001",
};

const baseProps = {
  tasks: [task],
  columns: [{ id: "column-1", key: "todo", name: "Todo", orderIndex: 0 }],
  moveTask: vi.fn(),
  moveColumn: vi.fn(),
  canEdit: true,
  canManageColumns: true,
  selectedTaskIds: new Set<string>(),
  onTaskSelectionChange: vi.fn(),
  onTaskClick: vi.fn(),
};

describe("KanbanBoard selection mode", () => {
  afterEach(cleanup);

  beforeEach(() => {
    dragConfigs.length = 0;
    vi.clearAllMocks();
  });

  it("selects a task instead of opening it and disables dragging", () => {
    render(<KanbanBoard {...baseProps} selectionMode />);

    fireEvent.click(screen.getByText("Task one"));

    expect(baseProps.onTaskSelectionChange).toHaveBeenCalledWith(
      "task-1",
      true,
    );
    expect(baseProps.onTaskClick).not.toHaveBeenCalled();
    expect(
      screen.getByRole("checkbox", { name: "Select Task one" }),
    ).toBeInTheDocument();
    expect(dragConfigs.every(({ canDrag }) => canDrag === false)).toBe(true);
  });

  it("opens a task normally outside selection mode", () => {
    render(<KanbanBoard {...baseProps} selectionMode={false} />);

    fireEvent.click(screen.getByText("Task one"));

    expect(baseProps.onTaskClick).toHaveBeenCalledWith(task);
    expect(baseProps.onTaskSelectionChange).not.toHaveBeenCalled();
  });
});
