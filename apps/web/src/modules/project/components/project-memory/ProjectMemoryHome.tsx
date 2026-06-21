import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Gavel } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ProjectMemoryActionRow } from "./ProjectMemoryActionRow";
import { ProjectMemoryQuickCapture } from "./ProjectMemoryQuickCapture";
import type { MemoryEntity, ProjectAction } from "./types";
import { entityBody } from "./types";

export function ProjectMemoryHome({
  decisions,
  meetings,
  requirements,
  loading,
  canEdit,
  onQuickRecap,
  onQuickDecision,
  onQuickRequirement,
  onQuickAction,
  onEditAction,
  onCompleteAction,
  onCreateTask,
  onDeleteAction,
  onRestoreAction,
}: {
  decisions: MemoryEntity[];
  meetings: MemoryEntity[];
  requirements: MemoryEntity[];
  loading: boolean;
  canEdit: boolean;
  onQuickRecap: (input: {
    title: string;
    summary: string;
    actions: string[];
  }) => void;
  onQuickDecision: (title: string) => void;
  onQuickRequirement: (title: string) => void;
  onQuickAction: (meetingId: string, title: string) => void;
  onEditAction: (meeting: MemoryEntity, action: ProjectAction) => void;
  onCompleteAction: (id: string) => void;
  onCreateTask: (id: string) => void;
  onDeleteAction: (id: string) => void;
  onRestoreAction: (id: string) => void;
}) {
  const openActions = useMemo(
    () =>
      meetings
        .flatMap((meeting) =>
          (meeting.actionItems ?? []).map((action) => ({ meeting, action })),
        )
        .filter(({ action }) => !action.deletedAt && action.status === "open"),
    [meetings],
  );
  const recentDecisions = decisions
    .filter((decision) => !decision.deletedAt)
    .slice(0, 5);
  const openRequirements = requirements
    .filter(
      (requirement) =>
        !requirement.deletedAt &&
        !["implemented", "rejected"].includes(requirement.status),
    )
    .slice(0, 5);
  const recentRecaps = meetings
    .filter((meeting) => !meeting.deletedAt)
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {canEdit ? (
        <ProjectMemoryQuickCapture
          onQuickRecap={onQuickRecap}
          onQuickDecision={onQuickDecision}
          onQuickRequirement={onQuickRequirement}
        />
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-gray-500">
          You can view project memory. Ask an editor to update it.
        </p>
      )}
      {loading && (
        <p className="rounded-md border p-6 text-sm text-gray-500">
          Loading...
        </p>
      )}
      {!loading &&
        openActions.length === 0 &&
        recentDecisions.length === 0 &&
        openRequirements.length === 0 &&
        recentRecaps.length === 0 && (
          <p className="rounded-md border border-dashed p-8 text-center text-sm text-gray-500">
            Project memory is empty. Start with a recap, decision or
            requirement.
          </p>
        )}

      <section className="space-y-2">
        <SectionHeader
          icon={<CheckCircle2 className="size-4" />}
          title="Open actions"
          count={openActions.length}
        />
        {openActions.length ? (
          <div className="space-y-2">
            {openActions.map(({ meeting, action }) => (
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
          <EmptyLine text="No open actions." />
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <MemoryColumn
          title="Recent decisions"
          icon={<Gavel className="size-4" />}
          items={recentDecisions}
          emptyText="No decisions saved yet."
        />
        <MemoryColumn
          title="Open requirements"
          icon={<CheckCircle2 className="size-4" />}
          items={openRequirements}
          emptyText="No open requirements."
        />
        <RecentRecaps
          meetings={recentRecaps}
          canEdit={canEdit}
          onQuickAction={onQuickAction}
        />
      </div>
    </div>
  );
}

function RecentRecaps({
  meetings,
  canEdit,
  onQuickAction,
}: {
  meetings: MemoryEntity[];
  canEdit: boolean;
  onQuickAction: (meetingId: string, title: string) => void;
}) {
  return (
    <section className="space-y-2 rounded-lg border p-4">
      <SectionHeader
        icon={<CalendarDays className="size-4" />}
        title="Recent recaps"
        count={meetings.length}
      />
      {meetings.length ? (
        <div className="space-y-3">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="space-y-2 rounded-md bg-gray-50 p-3"
            >
              <div className="font-medium">{meeting.title}</div>
              <p className="line-clamp-3 text-sm text-gray-600">
                {entityBody(meeting) || "No summary yet."}
              </p>
              {canEdit && (
                <InlineActionInput
                  onAdd={(title) => onQuickAction(meeting.id, title)}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyLine text="No recaps yet." />
      )}
    </section>
  );
}

function MemoryColumn({
  title,
  icon,
  items,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  items: MemoryEntity[];
  emptyText: string;
}) {
  return (
    <section className="space-y-2 rounded-lg border p-4">
      <SectionHeader icon={icon} title={title} count={items.length} />
      {items.length ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-md bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.title}</span>
                <Badge variant="outline">{item.status}</Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                {entityBody(item) || "No details yet."}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyLine text={emptyText} />
      )}
    </section>
  );
}

function InlineActionInput({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");

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
        className="h-8 min-w-0 flex-1 rounded-md border px-2 text-sm"
        placeholder="Add action..."
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Button type="submit" size="sm" variant="outline">
        Add
      </Button>
    </form>
  );
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <Badge variant="secondary">{count}</Badge>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
      {text}
    </p>
  );
}
