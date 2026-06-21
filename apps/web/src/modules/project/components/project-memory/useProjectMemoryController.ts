import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ADD_MEETING_PARTICIPANT,
  CREATE_ACTION_ITEM,
  CREATE_DECISION,
  CREATE_MEETING,
  CREATE_REQUIREMENT,
  DELETE_ACTION_ITEM,
  DELETE_DECISION,
  DELETE_MEETING,
  DELETE_REQUIREMENT,
  PROJECT_KNOWLEDGE_QUERY,
  PROMOTE_ACTION_ITEM,
  REMOVE_MEETING_PARTICIPANT,
  RESTORE_ACTION_ITEM,
  RESTORE_DECISION,
  RESTORE_MEETING,
  RESTORE_REQUIREMENT,
  UPDATE_ACTION_ITEM,
  UPDATE_DECISION,
  UPDATE_MEETING,
  UPDATE_REQUIREMENT,
} from "../../graphql/projectKnowledge";
import type {
  MemoryEntity,
  MemoryForm,
  MemoryKind,
  ProjectAction,
} from "./types";
import { statusOptions } from "./types";

export type PromotedTask = {
  id: string;
  title: string;
  description?: string | null;
  priority: "low" | "medium" | "high";
  status: string;
  orderKey: string;
  dueDate?: string | null;
  projectId: string;
  assigneeId?: string | null;
  assignee?: { id: string; name: string; email: string } | null;
  tags?: { id: string; name: string; color?: string | null }[];
};

export function useProjectMemoryController(
  projectId: string,
  options: {
    onTaskCreated?: (task: PromotedTask) => void | Promise<void>;
  } = {},
) {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [editor, setEditor] = useState<{
    kind: MemoryKind;
    entity?: MemoryEntity;
  }>();
  const [actionItemEditor, setActionItemEditor] = useState<{
    meetingId: string;
    item?: ProjectAction;
  }>();
  const [form, setForm] = useState<MemoryForm>({});
  const [actionItemForm, setActionItemForm] = useState<MemoryForm>({});

  const query = useQuery(PROJECT_KNOWLEDGE_QUERY, {
    variables: {
      projectId,
      filter: { includeDeleted },
      pagination: { take: 100 },
    },
    fetchPolicy: "cache-and-network",
  });
  const data = query.data as
    | {
        decisions?: { items: MemoryEntity[] };
        meetings?: { items: MemoryEntity[] };
        requirements?: { items: MemoryEntity[] };
      }
    | undefined;
  const refetch = () => query.refetch();
  const closeEntityEditor = () => {
    setEditor(undefined);
    setForm({});
  };
  const closeActionEditor = () => {
    setActionItemEditor(undefined);
    setActionItemForm({});
  };
  const mutationOptions = { onCompleted: closeEntityEditor };

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
    onCompleted: () => {
      closeActionEditor();
      void refetch();
    },
  });
  const [deleteActionItem] = useMutation(DELETE_ACTION_ITEM, {
    onCompleted: refetch,
  });
  const [restoreActionItem] = useMutation(RESTORE_ACTION_ITEM, {
    onCompleted: refetch,
  });
  const [removeParticipant] = useMutation(REMOVE_MEETING_PARTICIPANT, {
    onCompleted: refetch,
  });

  const lists = useMemo(
    () => ({
      decision: data?.decisions?.items ?? [],
      meeting: data?.meetings?.items ?? [],
      requirement: data?.requirements?.items ?? [],
    }),
    [data],
  );

  const openEditor = (kind: MemoryKind, entity?: MemoryEntity) => {
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

  const openActionEditor = (meetingId: string, item?: ProjectAction) => {
    setActionItemEditor({ meetingId, item });
    setActionItemForm(
      item
        ? {
            title: item.title,
            description: item.description ?? "",
            status: item.status,
            dueDate: item.dueDate?.slice(0, 16) ?? "",
            externalAssigneeName: item.externalAssigneeName ?? "",
          }
        : { title: "", description: "", status: "open", dueDate: "" },
    );
  };

  const saveEntity = async () => {
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
    void refetch();
  };

  const saveAction = async () => {
    if (!actionItemEditor || !actionItemForm.title?.trim()) return;
    const payload = {
      title: actionItemForm.title.trim(),
      description: actionItemForm.description || null,
      status: actionItemForm.status,
      dueDate: actionItemForm.dueDate
        ? new Date(actionItemForm.dueDate).toISOString()
        : null,
      externalAssigneeName: actionItemForm.externalAssigneeName || null,
    };
    await (actionItemEditor.item
      ? updateActionItem({
          variables: { id: actionItemEditor.item.id, data: payload },
        })
      : createActionItem({
          variables: {
            data: { ...payload, meetingId: actionItemEditor.meetingId },
          },
        }));
    closeActionEditor();
  };

  const quickAction = (meetingId: string, title: string) => {
    void createActionItem({ variables: { data: { meetingId, title } } });
  };
  const quickDecision = (title: string) => {
    void createDecision({
      variables: {
        data: { projectId, title, description: "", status: "accepted" },
      },
    }).then(() => refetch());
  };
  const quickRequirement = (title: string) => {
    void createRequirement({
      variables: {
        data: {
          projectId,
          title,
          description: title,
          priority: "medium",
          status: "draft",
        },
      },
    }).then(() => refetch());
  };
  const quickRecap = (input: {
    title: string;
    summary: string;
    actions: string[];
  }) => {
    void createMeeting({
      variables: {
        data: {
          projectId,
          title: input.title,
          summary: input.summary || null,
          scheduledAt: new Date().toISOString(),
          status: "completed",
        },
      },
    }).then(async (result) => {
      const meetingId = (result.data as { createMeeting?: { id: string } })
        .createMeeting?.id;
      if (meetingId) {
        await Promise.all(
          input.actions.map((title) =>
            createActionItem({ variables: { data: { meetingId, title } } }),
          ),
        );
      }
      await refetch();
    });
  };

  const handleParticipant = (meeting: MemoryEntity) => {
    const externalName = window.prompt("External participant name");
    const externalEmail =
      externalName && window.prompt("External participant email");
    if (externalName) {
      void addParticipant({
        variables: {
          data: {
            meetingId: meeting.id,
            externalName,
            externalEmail: externalEmail || undefined,
          },
        },
      });
    }
  };
  const deleteByKind = (kind: MemoryKind, entity: MemoryEntity) => {
    const mutation = {
      decision: deleteDecision,
      meeting: deleteMeeting,
      requirement: deleteRequirement,
    }[kind];
    void mutation({ variables: { id: entity.id } });
  };
  const restoreByKind = (kind: MemoryKind, entity: MemoryEntity) => {
    const mutation = {
      decision: restoreDecision,
      meeting: restoreMeeting,
      requirement: restoreRequirement,
    }[kind];
    void mutation({ variables: { id: entity.id } });
  };

  return {
    actionItemEditor,
    actionItemForm,
    closeActionEditor,
    closeEntityEditor,
    deleteAction: (id: string) => void deleteActionItem({ variables: { id } }),
    deleteByKind,
    editor,
    form,
    includeDeleted,
    lists,
    openActionEditor,
    openEditor,
    query,
    quickAction,
    quickDecision,
    quickRecap,
    quickRequirement,
    removeParticipant: (id: string) =>
      void removeParticipant({ variables: { id } }),
    restoreAction: (id: string) =>
      void restoreActionItem({ variables: { id } }),
    restoreByKind,
    saveAction,
    saveEntity,
    setActionItemForm,
    setForm,
    setIncludeDeleted,
    addParticipant: handleParticipant,
    completeAction: (id: string) =>
      void updateActionItem({
        variables: { id, data: { status: "completed" } },
      }),
    createTask: (id: string) =>
      void promote({ variables: { id } }).then(async (result) => {
        const task = (result.data as { promoteActionItem?: PromotedTask })
          .promoteActionItem;
        await refetch();
        if (task) await options.onTaskCreated?.(task);
      }),
  };
}
