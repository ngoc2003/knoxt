import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ArchiveRestore,
  CalendarDays,
  CheckCircle2,
  FileSearch,
  Gavel,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  ADD_MEETING_PARTICIPANT,
  CREATE_ACTION_ITEM,
  CREATE_DECISION,
  CREATE_MEETING,
  CREATE_REQUIREMENT,
  DELETE_DECISION,
  DELETE_MEETING,
  DELETE_REQUIREMENT,
  PROJECT_ACTIVITY,
  PROJECT_KNOWLEDGE_QUERY,
  PROJECT_KNOWLEDGE_SEARCH,
  PROMOTE_ACTION_ITEM,
  RESTORE_DECISION,
  RESTORE_MEETING,
  RESTORE_REQUIREMENT,
  UPDATE_ACTION_ITEM,
  UPDATE_DECISION,
  UPDATE_MEETING,
  UPDATE_REQUIREMENT,
  DELETE_ACTION_ITEM,
  REMOVE_MEETING_PARTICIPANT,
} from "../graphql/projectKnowledge";

type Kind = "decision" | "meeting" | "requirement";
type Entity = {
  id: string;
  title: string;
  description?: string;
  summary?: string;
  status: string;
  priority?: string;
  decidedAt?: string;
  scheduledAt?: string;
  deletedAt?: string | null;
  reason?: string;
  impact?: string;
  recordingUrl?: string;
  participants?: {
    id: string;
    externalName?: string;
    externalEmail?: string;
    user?: { name: string; email: string };
  }[];
  actionItems?: {
    id: string;
    title: string;
    status: string;
    dueDate?: string;
    promotedTaskId?: string;
    promotedTask?: { id: string; title: string };
  }[];
};

const statusOptions: Record<Kind, string[]> = {
  decision: ["proposed", "accepted", "superseded", "rejected"],
  meeting: ["scheduled", "completed", "cancelled"],
  requirement: ["draft", "approved", "implemented", "rejected"],
};

export function StructuredKnowledge({
  projectId,
  canEdit,
  canViewActivity,
}: {
  projectId: string;
  canEdit: boolean;
  canViewActivity: boolean;
}) {
  const [search, setSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [editor, setEditor] = useState<{ kind: Kind; entity?: Entity }>();
  const [form, setForm] = useState<Record<string, string>>({});
  const query = useQuery(PROJECT_KNOWLEDGE_QUERY, {
    variables: {
      projectId,
      filter: { search: search || undefined, includeDeleted },
      pagination: { take: 100 },
    },
    fetchPolicy: "cache-and-network",
  });
  const data = query.data as
    | {
        decisions?: { items: Entity[] };
        meetings?: { items: Entity[] };
        requirements?: { items: Entity[] };
      }
    | undefined;
  const refetch = () => query.refetch();
  const mutationOptions = {
    onCompleted: () => {
      setEditor(undefined);
      setForm({});
      void refetch();
    },
  };
  const [createDecision] = useMutation(CREATE_DECISION, mutationOptions);
  const [updateDecision] = useMutation(UPDATE_DECISION, mutationOptions);
  const [createMeeting] = useMutation(CREATE_MEETING, mutationOptions);
  const [updateMeeting] = useMutation(UPDATE_MEETING, mutationOptions);
  const [createRequirement] = useMutation(CREATE_REQUIREMENT, mutationOptions);
  const [updateRequirement] = useMutation(UPDATE_REQUIREMENT, mutationOptions);
  const [deleteDecision] = useMutation(DELETE_DECISION, {
    onCompleted: refetch,
  });
  const [restoreDecision] = useMutation(RESTORE_DECISION, {
    onCompleted: refetch,
  });
  const [deleteMeeting] = useMutation(DELETE_MEETING, { onCompleted: refetch });
  const [restoreMeeting] = useMutation(RESTORE_MEETING, {
    onCompleted: refetch,
  });
  const [deleteRequirement] = useMutation(DELETE_REQUIREMENT, {
    onCompleted: refetch,
  });
  const [restoreRequirement] = useMutation(RESTORE_REQUIREMENT, {
    onCompleted: refetch,
  });
  const [createActionItem] = useMutation(CREATE_ACTION_ITEM, {
    onCompleted: refetch,
  });
  const [addParticipant] = useMutation(ADD_MEETING_PARTICIPANT, {
    onCompleted: refetch,
  });
  const [promote] = useMutation(PROMOTE_ACTION_ITEM, { onCompleted: refetch });
  const [updateActionItem] = useMutation(UPDATE_ACTION_ITEM, {
    onCompleted: refetch,
  });
  const [deleteActionItem] = useMutation(DELETE_ACTION_ITEM, {
    onCompleted: refetch,
  });
  const [removeParticipant] = useMutation(REMOVE_MEETING_PARTICIPANT, {
    onCompleted: refetch,
  });

  const openEditor = (kind: Kind, entity?: Entity) => {
    setEditor({ kind, entity });
    setForm(
      entity
        ? {
            title: entity.title,
            description: entity.description ?? entity.summary ?? "",
            status: entity.status,
            priority: entity.priority ?? "medium",
            date:
              entity.scheduledAt?.slice(0, 16) ??
              entity.decidedAt?.slice(0, 16) ??
              "",
          }
        : {
            status: statusOptions[kind][0],
            priority: "medium",
            date: new Date().toISOString().slice(0, 16),
          },
    );
  };
  const save = async () => {
    if (!editor || !form.title?.trim()) return;
    const common = { title: form.title.trim(), status: form.status };
    if (editor.kind === "decision") {
      const payload = {
        ...common,
        description: form.description ?? "",
        decidedAt: form.date ? new Date(form.date).toISOString() : null,
      };
      await (editor.entity
        ? updateDecision({ variables: { id: editor.entity.id, data: payload } })
        : createDecision({ variables: { data: { ...payload, projectId } } }));
    } else if (editor.kind === "meeting") {
      const payload = {
        ...common,
        summary: form.description || null,
        scheduledAt: new Date(form.date).toISOString(),
      };
      await (editor.entity
        ? updateMeeting({ variables: { id: editor.entity.id, data: payload } })
        : createMeeting({ variables: { data: { ...payload, projectId } } }));
    } else {
      const payload = {
        ...common,
        description: form.description ?? "",
        priority: form.priority,
      };
      await (editor.entity
        ? updateRequirement({
            variables: { id: editor.entity.id, data: payload },
          })
        : createRequirement({
            variables: { data: { ...payload, projectId } },
          }));
    }
  };

  const lists = useMemo(
    () => ({
      decision: data?.decisions?.items ?? [],
      meeting: data?.meetings?.items ?? [],
      requirement: data?.requirements?.items ?? [],
    }),
    [data],
  );
  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Structured Knowledge</CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              Decisions, meetings and requirements for this project.
            </p>
          </div>
          {canEdit && (
            <Button
              variant={includeDeleted ? "secondary" : "outline"}
              onClick={() => setIncludeDeleted((x) => !x)}
            >
              <ArchiveRestore />
              {includeDeleted ? "Hide deleted" : "View deleted"}
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Filter structured knowledge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="decision">
          <TabsList className="mb-4">
            <TabsTrigger value="decision">Decisions</TabsTrigger>
            <TabsTrigger value="meeting">Meetings</TabsTrigger>
            <TabsTrigger value="requirement">Requirements</TabsTrigger>
            <TabsTrigger value="search">Project search</TabsTrigger>
            {canViewActivity && (
              <TabsTrigger value="activity">Activity</TabsTrigger>
            )}
          </TabsList>
          {query.error && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {query.error.message}
            </p>
          )}
          {(["decision", "meeting", "requirement"] as Kind[]).map((kind) => (
            <TabsContent key={kind} value={kind}>
              <EntityList
                kind={kind}
                items={lists[kind]}
                loading={query.loading}
                canEdit={canEdit}
                onCreate={() => openEditor(kind)}
                onEdit={(e) => openEditor(kind, e)}
                onDelete={(e) =>
                  void {
                    decision: deleteDecision,
                    meeting: deleteMeeting,
                    requirement: deleteRequirement,
                  }[kind]({ variables: { id: e.id } })
                }
                onRestore={(e) =>
                  void {
                    decision: restoreDecision,
                    meeting: restoreMeeting,
                    requirement: restoreRequirement,
                  }[kind]({ variables: { id: e.id } })
                }
                onActionItem={(meeting) => {
                  const title = window.prompt("Action item title");
                  if (title)
                    void createActionItem({
                      variables: { data: { meetingId: meeting.id, title } },
                    });
                }}
                onParticipant={(meeting) => {
                  const externalName = window.prompt(
                    "External participant name",
                  );
                  if (externalName)
                    void addParticipant({
                      variables: {
                        data: { meetingId: meeting.id, externalName },
                      },
                    });
                }}
                onRemoveParticipant={(id) =>
                  void removeParticipant({ variables: { id } })
                }
                onPromote={(id) => void promote({ variables: { id } })}
                onCompleteActionItem={(id) =>
                  void updateActionItem({
                    variables: { id, data: { status: "completed" } },
                  })
                }
                onDeleteActionItem={(id) =>
                  void deleteActionItem({ variables: { id } })
                }
              />
            </TabsContent>
          ))}
          <TabsContent value="search">
            <KnowledgeSearch projectId={projectId} />
          </TabsContent>
          {canViewActivity && (
            <TabsContent value="activity">
              <Activity projectId={projectId} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      <Dialog
        open={Boolean(editor)}
        onOpenChange={(open) => !open && setEditor(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editor?.entity ? "Edit" : "Create"} {editor?.kind}
            </DialogTitle>
            <DialogDescription>
              Structured knowledge stays scoped to this project.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Title"
            value={form.title ?? ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            placeholder={editor?.kind === "meeting" ? "Summary" : "Description"}
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {(editor?.kind === "meeting" || editor?.kind === "decision") && (
            <Input
              type="datetime-local"
              value={form.date ?? ""}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          )}
          <select
            className="h-9 rounded-md border px-3 text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {editor &&
              statusOptions[editor.kind].map((x) => (
                <option key={x}>{x}</option>
              ))}
          </select>
          {editor?.kind === "requirement" && (
            <select
              className="h-9 rounded-md border px-3 text-sm"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {["low", "medium", "high", "critical"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditor(undefined)}>
              Cancel
            </Button>
            <Button onClick={() => void save()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function EntityList({
  kind,
  items,
  loading,
  canEdit,
  onCreate,
  onEdit,
  onDelete,
  onRestore,
  onActionItem,
  onParticipant,
  onRemoveParticipant,
  onPromote,
  onCompleteActionItem,
  onDeleteActionItem,
}: {
  kind: Kind;
  items: Entity[];
  loading: boolean;
  canEdit: boolean;
  onCreate: () => void;
  onEdit: (e: Entity) => void;
  onDelete: (e: Entity) => void;
  onRestore: (e: Entity) => void;
  onActionItem: (e: Entity) => void;
  onParticipant: (e: Entity) => void;
  onRemoveParticipant: (id: string) => void;
  onPromote: (id: string) => void;
  onCompleteActionItem: (id: string) => void;
  onDeleteActionItem: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canEdit && (
          <Button onClick={onCreate}>
            <Plus />
            Create {kind}
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
          No {kind}s match this view.
        </p>
      )}
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {kind === "decision" ? (
                  <Gavel className="size-4" />
                ) : kind === "meeting" ? (
                  <CalendarDays className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                <h3 className="font-medium">{item.title}</h3>
                <Badge variant="outline">{item.status}</Badge>
                {item.priority && (
                  <Badge variant="secondary">{item.priority}</Badge>
                )}
                {item.deletedAt && <Badge variant="destructive">deleted</Badge>}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                {item.description ?? item.summary ?? "No description"}
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
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
          {kind === "meeting" && !item.deletedAt && (
            <div className="mt-4 grid gap-3 border-t pt-3 md:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-medium">
                  <span>Participants ({item.participants?.length ?? 0})</span>
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onParticipant(item)}
                    >
                      <Users />
                      Add
                    </Button>
                  )}
                </div>
                {item.participants?.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs text-gray-500"
                  >
                    <span>
                      {p.user?.name ?? p.externalName}{" "}
                      {p.user?.email ?? p.externalEmail}
                    </span>
                    {canEdit && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onRemoveParticipant(p.id)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-medium">
                  <span>Action items ({item.actionItems?.length ?? 0})</span>
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onActionItem(item)}
                    >
                      <Plus />
                      Add
                    </Button>
                  )}
                </div>
                {item.actionItems?.map((a) => (
                  <div
                    key={a.id}
                    className="mb-1 flex flex-wrap items-center justify-between gap-1 rounded bg-gray-50 px-2 py-1 text-xs"
                  >
                    <span>
                      {a.title} · {a.status}
                    </span>
                    <div className="flex items-center gap-1">
                      {canEdit && a.status === "open" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onCompleteActionItem(a.id)}
                        >
                          Complete
                        </Button>
                      )}
                      {canEdit && !a.promotedTaskId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onPromote(a.id)}
                        >
                          Promote
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDeleteActionItem(a.id)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                      {a.promotedTask && (
                        <Badge variant="outline">
                          Task: {a.promotedTask.title}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function KnowledgeSearch({ projectId }: { projectId: string }) {
  const [query, setQuery] = useState("");
  const result = useQuery(PROJECT_KNOWLEDGE_SEARCH, {
    variables: { input: { projectId, query }, pagination: { take: 50 } },
    skip: query.trim().length < 2,
  });
  const items =
    (
      result.data as
        | {
            projectKnowledgeSearch?: {
              items: {
                id: string;
                type: string;
                title: string;
                snippet: string;
                status?: string;
              }[];
            };
          }
        | undefined
    )?.projectKnowledgeSearch?.items ?? [];
  return (
    <div className="space-y-3">
      <div className="relative">
        <FileSearch className="absolute left-3 top-2.5 size-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Search documents and structured knowledge..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {items.map((x) => (
        <div key={`${x.type}-${x.id}`} className="rounded-md border p-3">
          <div className="flex gap-2">
            <Badge>{x.type}</Badge>
            <strong>{x.title}</strong>
            {x.status && <Badge variant="outline">{x.status}</Badge>}
          </div>
          <p className="mt-1 text-sm text-gray-500">{x.snippet}</p>
        </div>
      ))}
    </div>
  );
}

function Activity({ projectId }: { projectId: string }) {
  const result = useQuery(PROJECT_ACTIVITY, {
    variables: { projectId, pagination: { take: 100 } },
  });
  const items =
    (
      result.data as
        | {
            projectActivity?: {
              items: {
                id: string;
                action: string;
                entity?: string;
                createdAt: string;
              }[];
            };
          }
        | undefined
    )?.projectActivity?.items ?? [];
  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-sm text-gray-500">
          No structured knowledge activity yet.
        </p>
      )}
      {items.map((x) => (
        <div
          key={x.id}
          className="flex justify-between rounded-md border p-3 text-sm"
        >
          <span>
            {x.action} · {x.entity}
          </span>
          <span className="text-gray-500">
            {new Date(x.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
