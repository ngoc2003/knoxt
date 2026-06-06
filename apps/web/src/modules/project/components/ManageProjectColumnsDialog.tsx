import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useDrag, useDrop } from "react-dnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  CREATE_PROJECT_COLUMN_MUTATION,
  DELETE_PROJECT_COLUMN_MUTATION,
  PROJECT_DETAIL_QUERY,
  REORDER_PROJECT_COLUMNS_MUTATION,
} from "../graphql/project";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

interface ProjectColumn {
  id: string;
  key: string;
  name: string;
  orderIndex: number;
}

const COLUMN_TYPE = "MANAGE_PROJECT_COLUMN";

function SortableColumnRow({
  column,
  index,
  taskCount,
  canDelete,
  moveColumn,
  saveOrder,
  resetOrder,
  onDelete,
}: {
  column: ProjectColumn;
  index: number;
  taskCount: number;
  canDelete: boolean;
  moveColumn: (fromIndex: number, toIndex: number) => void;
  saveOrder: () => void;
  resetOrder: () => void;
  onDelete: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: COLUMN_TYPE,
    item: { id: column.id, index },
    end: (_item, monitor) => {
      if (monitor.didDrop()) {
        saveOrder();
      } else {
        resetOrder();
      }
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  const [, drop] = useDrop({
    accept: COLUMN_TYPE,
    hover: (item: { id: string; index: number }) => {
      if (item.index === index) return;
      moveColumn(item.index, index);
      item.index = index;
    },
    drop: () => ({ columnId: column.id }),
  });

  drag(drop(rowRef));

  return (
    <div
      ref={rowRef}
      className={`flex items-center gap-3 rounded-md border p-3 transition-opacity ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <GripVertical className="size-5 cursor-grab text-gray-400 active:cursor-grabbing" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{column.name}</p>
        <p className="text-xs text-gray-500">{taskCount} tasks</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canDelete}
        aria-label={`Delete ${column.name}`}
        onClick={onDelete}
      >
        <Trash2 className="text-red-600" />
      </Button>
    </div>
  );
}

export function ManageProjectColumnsDialog({
  isOpen,
  onClose,
  projectId,
  columns,
  taskCounts,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  columns: ProjectColumn[];
  taskCounts: Record<string, number>;
}) {
  const [orderedColumns, setOrderedColumns] = useState(columns);
  const orderedColumnsRef = useRef(columns);
  const [newColumnName, setNewColumnName] = useState("");
  const [columnToDelete, setColumnToDelete] = useState<ProjectColumn | null>(
    null,
  );
  const [createColumn, { loading: creating }] = useMutation(
    CREATE_PROJECT_COLUMN_MUTATION,
  );
  const [reorderColumns, { loading: reordering }] = useMutation(
    REORDER_PROJECT_COLUMNS_MUTATION,
  );
  const [deleteColumn, { loading: deleting }] = useMutation(
    DELETE_PROJECT_COLUMN_MUTATION,
  );
  const refetch = [
    { query: PROJECT_DETAIL_QUERY, variables: { id: projectId } },
  ];

  useEffect(() => {
    const sortedColumns = [...columns].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
    orderedColumnsRef.current = sortedColumns;
    setOrderedColumns(sortedColumns);
  }, [columns]);

  const handleAdd = async () => {
    const name = newColumnName.trim();
    if (!name) return;

    await createColumn({
      variables: { data: { projectId, name } },
      refetchQueries: refetch,
      awaitRefetchQueries: true,
    });
    setNewColumnName("");
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    const next = [...orderedColumnsRef.current];
    const [movedColumn] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, movedColumn);
    orderedColumnsRef.current = next;
    setOrderedColumns(next);
  };

  const handleResetOrder = () => {
    const sortedColumns = [...columns].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
    orderedColumnsRef.current = sortedColumns;
    setOrderedColumns(sortedColumns);
  };

  const handleSaveOrder = async () => {
    try {
      await reorderColumns({
        variables: {
          data: {
            projectId,
            columnIds: orderedColumnsRef.current.map((column) => column.id),
          },
        },
        refetchQueries: refetch,
        awaitRefetchQueries: true,
      });
    } catch (error) {
      handleResetOrder();
      console.error("Failed to reorder project columns", error);
    }
  };

  const handleDelete = async () => {
    if (!columnToDelete) return;

    await deleteColumn({
      variables: {
        data: { projectId, columnId: columnToDelete.id },
      },
      refetchQueries: refetch,
      awaitRefetchQueries: true,
    });
    setColumnToDelete(null);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Manage columns</DialogTitle>
            <DialogDescription>
              Add, reorder, or delete project columns.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2">
            <Input
              value={newColumnName}
              onChange={(event) => setNewColumnName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleAdd();
              }}
              placeholder="New column name"
            />
            <Button
              disabled={!newColumnName.trim() || creating}
              onClick={handleAdd}
            >
              <Plus />
              Add
            </Button>
          </div>

          <DndProvider backend={HTML5Backend}>
            <div
              className={`space-y-2 ${reordering ? "pointer-events-none opacity-70" : ""}`}
            >
              {orderedColumns.map((column, index) => (
                <SortableColumnRow
                  key={column.id}
                  column={column}
                  index={index}
                  taskCount={taskCounts[column.key] ?? 0}
                  canDelete={orderedColumns.length > 1}
                  moveColumn={handleMove}
                  saveOrder={() => void handleSaveOrder()}
                  resetOrder={handleResetOrder}
                  onDelete={() => setColumnToDelete(column)}
                />
              ))}
            </div>
          </DndProvider>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(columnToDelete)}
        onOpenChange={(open) => {
          if (!open) setColumnToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {columnToDelete?.name} column?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the column and deletes all{" "}
              {taskCounts[columnToDelete?.key ?? ""] ?? 0} tasks in it,
              including their assignee assignments. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => void handleDelete()}
            >
              Delete column and tasks
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
