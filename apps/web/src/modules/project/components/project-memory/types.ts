export type MemoryKind = "decision" | "meeting" | "requirement";

export type MemoryEntity = {
  id: string;
  title: string;
  description?: string;
  summary?: string;
  status: string;
  priority?: string;
  decidedAt?: string;
  scheduledAt?: string;
  updatedAt?: string;
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
  actionItems?: ProjectAction[];
};

export type ProjectAction = {
  id: string;
  meetingId: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  externalAssigneeName?: string;
  deletedAt?: string | null;
  promotedTaskId?: string;
  promotedTask?: { id: string; title: string };
};

export type MemoryForm = Record<string, string>;

export const statusOptions: Record<MemoryKind, string[]> = {
  decision: ["proposed", "accepted", "superseded", "rejected"],
  meeting: ["scheduled", "completed", "cancelled"],
  requirement: ["draft", "approved", "implemented", "rejected"],
};

export function entityBody(entity: MemoryEntity) {
  return entity.description ?? entity.summary ?? "";
}
