import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Gavel,
  Plus,
  RotateCcw,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ProjectMemoryActionRow } from "./ProjectMemoryActionRow";
import type { MemoryEntity, MemoryKind, ProjectAction } from "./types";
import { entityBody } from "./types";

export function ProjectMemoryEntityList({
  kind,
  items,
  loading,
  canEdit,
  onCreate,
  onEdit,
  onDelete,
  onRestore,
  onQuickAction,
  onEditAction,
  onParticipant,
  onRemoveParticipant,
  onCreateTask,
  onCompleteAction,
  onDeleteAction,
  onRestoreAction,
}: {
  kind: MemoryKind;
  items: MemoryEntity[];
  loading: boolean;
  canEdit: boolean;
  onCreate: () => void;
  onEdit: (entity: MemoryEntity) => void;
  onDelete: (entity: MemoryEntity) => void;
  onRestore: (entity: MemoryEntity) => void;
  onQuickAction: (meetingId: string, title: string) => void;
  onEditAction: (meeting: MemoryEntity, action: ProjectAction) => void;
  onParticipant: (entity: MemoryEntity) => void;
  onRemoveParticipant: (id: string) => void;
  onCreateTask: (id: string) => void;
  onCompleteAction: (id: string) => void;
  onDeleteAction: (id: string) => void;
  onRestoreAction: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canEdit && (
          <Button onClick={onCreate}>
            <Plus />
            Add {labelFor(kind)}
          </Button>
        )}
      </div>
      {loading && (
        <p className="rounded-md border p-6 text-sm text-gray-500">
          Loading...
        </p>
      )}
      {!loading && items.length === 0 && (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-gray-500">
          No {labelFor(kind)} records match this view.
        </p>
      )}
      {items.map((item) => (
        <EntityCard
          key={item.id}
          kind={kind}
          item={item}
          canEdit={canEdit}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
          onQuickAction={onQuickAction}
          onEditAction={(action) => onEditAction(item, action)}
          onParticipant={onParticipant}
          onRemoveParticipant={onRemoveParticipant}
          onCreateTask={onCreateTask}
          onCompleteAction={onCompleteAction}
          onDeleteAction={onDeleteAction}
          onRestoreAction={onRestoreAction}
        />
      ))}
    </div>
  );
}

function EntityCard({
  kind,
  item,
  canEdit,
  onEdit,
  onDelete,
  onRestore,
  onQuickAction,
  onEditAction,
  onParticipant,
  onRemoveParticipant,
  onCreateTask,
  onCompleteAction,
  onDeleteAction,
  onRestoreAction,
}: {
  kind: MemoryKind;
  item: MemoryEntity;
  canEdit: boolean;
  onEdit: (entity: MemoryEntity) => void;
  onDelete: (entity: MemoryEntity) => void;
  onRestore: (entity: MemoryEntity) => void;
  onQuickAction: (meetingId: string, title: string) => void;
  onEditAction: (action: ProjectAction) => void;
  onParticipant: (entity: MemoryEntity) => void;
  onRemoveParticipant: (id: string) => void;
  onCreateTask: (id: string) => void;
  onCompleteAction: (id: string) => void;
  onDeleteAction: (id: string) => void;
  onRestoreAction: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <KindIcon kind={kind} />
            <h3 className="font-medium">{item.title}</h3>
            <Badge variant="outline">{item.status}</Badge>
            {item.priority && (
              <Badge variant="secondary">{item.priority}</Badge>
            )}
            {item.deletedAt && <Badge variant="destructive">deleted</Badge>}
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
            {entityBody(item) || "No details yet."}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-1">
            {item.deletedAt ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRestore(item)}
              >
                <RotateCcw />
                Restore
              </Button>
            ) : (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(item)}
                >
                  <Edit3 className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      {kind === "meeting" && !item.deletedAt && (
        <div className="mt-4 space-y-4 border-t pt-4">
          <QuickActionInput
            canEdit={canEdit}
            onAdd={(title) => onQuickAction(item.id, title)}
          />
          <div className="space-y-2">
            {item.actionItems?.length ? (
              item.actionItems.map((action) => (
                <ProjectMemoryActionRow
                  key={action.id}
                  action={action}
                  canEdit={canEdit}
                  onComplete={onCompleteAction}
                  onCreateTask={onCreateTask}
                  onEdit={onEditAction}
                  onDelete={onDeleteAction}
                  onRestore={onRestoreAction}
                />
              ))
            ) : (
              <p className="rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
                No actions captured for this recap yet.
              </p>
            )}
          </div>
          <details className="text-sm text-gray-500">
            <summary className="cursor-pointer">Participants</summary>
            <div className="mt-2 space-y-1">
              {canEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onParticipant(item)}
                >
                  <Users className="size-4" />
                  Add participant
                </Button>
              )}
              {item.participants?.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between rounded-md px-2 py-1"
                >
                  <span>
                    {participant.user?.name ?? participant.externalName}{" "}
                    {participant.user?.email ?? participant.externalEmail}
                  </span>
                  {canEdit && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onRemoveParticipant(participant.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function QuickActionInput({
  canEdit,
  onAdd,
}: {
  canEdit: boolean;
  onAdd: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  if (!canEdit) return null;

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim()) return;
        onAdd(title.trim());
        setTitle("");
      }}
    >
      <input
        className="h-9 min-w-0 flex-1 rounded-md border px-3 text-sm"
        placeholder="Add action..."
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Button type="submit" size="sm">
        Add
      </Button>
    </form>
  );
}

function KindIcon({ kind }: { kind: MemoryKind }) {
  if (kind === "decision") return <Gavel className="size-4" />;
  if (kind === "meeting") return <CalendarDays className="size-4" />;
  return <CheckCircle2 className="size-4" />;
}

function labelFor(kind: MemoryKind) {
  if (kind === "meeting") return "recap";
  if (kind === "decision") return "decision";
  return "requirement";
}
