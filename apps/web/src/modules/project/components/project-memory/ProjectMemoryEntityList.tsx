import { Plus, RotateCcw, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { MemoryEntity, MemoryKind, ProjectAction } from "./types";
import { entityBody } from "./types";
import { ProjectMemoryActionRow } from "./ProjectMemoryActionRow";

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
  onParticipant: (meeting: MemoryEntity) => void;
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
            Create {kind === "meeting" ? "recap" : kind}
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
          No {kind === "meeting" ? "recaps" : `${kind}s`} yet.
        </p>
      )}
      {items.map((item) => (
        <MemoryEntityRow
          key={item.id}
          kind={kind}
          item={item}
          canEdit={canEdit}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
          onQuickAction={onQuickAction}
          onEditAction={onEditAction}
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

function MemoryEntityRow({
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
  onEditAction: (meeting: MemoryEntity, action: ProjectAction) => void;
  onParticipant: (meeting: MemoryEntity) => void;
  onRemoveParticipant: (id: string) => void;
  onCreateTask: (id: string) => void;
  onCompleteAction: (id: string) => void;
  onDeleteAction: (id: string) => void;
  onRestoreAction: (id: string) => void;
}) {
  const deleted = Boolean(item.deletedAt);

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{item.title}</h3>
            <Badge variant={deleted ? "secondary" : "outline"}>
              {deleted ? "deleted" : item.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {entityBody(item) || "No details yet."}
          </p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            {deleted ? (
              <Button size="sm" variant="outline" onClick={() => onRestore(item)}>
                <RotateCcw />
                Restore
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 />
                  Delete
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      {kind === "meeting" && (
        <MeetingDetails
          meeting={item}
          canEdit={canEdit && !deleted}
          onQuickAction={onQuickAction}
          onEditAction={onEditAction}
          onParticipant={onParticipant}
          onRemoveParticipant={onRemoveParticipant}
          onCreateTask={onCreateTask}
          onCompleteAction={onCompleteAction}
          onDeleteAction={onDeleteAction}
          onRestoreAction={onRestoreAction}
        />
      )}
    </div>
  );
}

function MeetingDetails({
  meeting,
  canEdit,
  onQuickAction,
  onEditAction,
  onParticipant,
  onRemoveParticipant,
  onCreateTask,
  onCompleteAction,
  onDeleteAction,
  onRestoreAction,
}: {
  meeting: MemoryEntity;
  canEdit: boolean;
  onQuickAction: (meetingId: string, title: string) => void;
  onEditAction: (meeting: MemoryEntity, action: ProjectAction) => void;
  onParticipant: (meeting: MemoryEntity) => void;
  onRemoveParticipant: (id: string) => void;
  onCreateTask: (id: string) => void;
  onCompleteAction: (id: string) => void;
  onDeleteAction: (id: string) => void;
  onRestoreAction: (id: string) => void;
}) {
  return (
    <div className="space-y-3 border-t pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Actions</p>
        {canEdit && <InlineAction onAdd={(title) => onQuickAction(meeting.id, title)} />}
      </div>
      {(meeting.actionItems ?? []).length ? (
        <div className="space-y-2">
          {(meeting.actionItems ?? []).map((action) => (
            <ProjectMemoryActionRow
              key={action.id}
              action={action}
              canEdit={canEdit}
              onComplete={onCompleteAction}
              onCreateTask={onCreateTask}
              onEdit={(item) => onEditAction(meeting, item)}
              onDelete={onDeleteAction}
              onRestore={onRestoreAction}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-3 text-sm text-gray-500">
          No actions for this recap.
        </p>
      )}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Participants</p>
          {canEdit && (
            <Button size="sm" variant="outline" onClick={() => onParticipant(meeting)}>
              <UserPlus />
              Add
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(meeting.participants ?? []).map((participant) => (
            <Badge key={participant.id} variant="secondary">
              {participant.user?.name ?? participant.externalName ?? "Guest"}
              {canEdit && (
                <button
                  className="ml-2"
                  type="button"
                  onClick={() => onRemoveParticipant(participant.id)}
                >
                  x
                </button>
              )}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function InlineAction({ onAdd }: { onAdd: (title: string) => void }) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        const title = window.prompt("Action item title");
        if (title?.trim()) onAdd(title.trim());
      }}
    >
      <Plus />
      Add action
    </Button>
  );
}
