CREATE TYPE "DecisionStatus" AS ENUM ('proposed', 'accepted', 'superseded', 'rejected');
CREATE TYPE "MeetingStatus" AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE "ActionItemStatus" AS ENUM ('open', 'completed', 'cancelled');
CREATE TYPE "RequirementPriority" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "RequirementStatus" AS ENUM ('draft', 'approved', 'implemented', 'rejected');

ALTER TABLE "ActivityLog" ADD COLUMN "projectId" TEXT;

CREATE TABLE "Decision" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "createdById" TEXT NOT NULL,
  "sourceNoteId" TEXT, "title" TEXT NOT NULL, "description" TEXT NOT NULL,
  "reason" TEXT, "impact" TEXT, "decidedAt" TIMESTAMP(3),
  "status" "DecisionStatus" NOT NULL DEFAULT 'proposed',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Meeting" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "createdById" TEXT NOT NULL,
  "sourceNoteId" TEXT, "title" TEXT NOT NULL, "scheduledAt" TIMESTAMP(3) NOT NULL,
  "summary" TEXT, "recordingUrl" TEXT, "status" "MeetingStatus" NOT NULL DEFAULT 'scheduled',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "MeetingParticipant" (
  "id" TEXT NOT NULL, "meetingId" TEXT NOT NULL, "userId" TEXT,
  "externalName" TEXT, "externalEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeetingParticipant_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ActionItem" (
  "id" TEXT NOT NULL, "meetingId" TEXT NOT NULL, "createdById" TEXT NOT NULL,
  "assigneeId" TEXT, "promotedTaskId" TEXT, "externalAssigneeName" TEXT,
  "title" TEXT NOT NULL, "description" TEXT, "dueDate" TIMESTAMP(3),
  "status" "ActionItemStatus" NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, "deletedAt" TIMESTAMP(3),
  CONSTRAINT "ActionItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Requirement" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "createdById" TEXT NOT NULL,
  "sourceNoteId" TEXT, "title" TEXT NOT NULL, "description" TEXT NOT NULL,
  "priority" "RequirementPriority" NOT NULL DEFAULT 'medium',
  "status" "RequirementStatus" NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MeetingParticipant_meetingId_userId_key" ON "MeetingParticipant"("meetingId", "userId");
CREATE UNIQUE INDEX "ActionItem_promotedTaskId_key" ON "ActionItem"("promotedTaskId");
CREATE INDEX "Decision_projectId_deletedAt_updatedAt_idx" ON "Decision"("projectId", "deletedAt", "updatedAt");
CREATE INDEX "Decision_projectId_status_decidedAt_idx" ON "Decision"("projectId", "status", "decidedAt");
CREATE INDEX "Decision_sourceNoteId_idx" ON "Decision"("sourceNoteId");
CREATE INDEX "Meeting_projectId_deletedAt_scheduledAt_idx" ON "Meeting"("projectId", "deletedAt", "scheduledAt");
CREATE INDEX "Meeting_projectId_status_scheduledAt_idx" ON "Meeting"("projectId", "status", "scheduledAt");
CREATE INDEX "Meeting_sourceNoteId_idx" ON "Meeting"("sourceNoteId");
CREATE INDEX "MeetingParticipant_meetingId_idx" ON "MeetingParticipant"("meetingId");
CREATE INDEX "MeetingParticipant_userId_idx" ON "MeetingParticipant"("userId");
CREATE INDEX "ActionItem_meetingId_deletedAt_createdAt_idx" ON "ActionItem"("meetingId", "deletedAt", "createdAt");
CREATE INDEX "ActionItem_assigneeId_status_dueDate_idx" ON "ActionItem"("assigneeId", "status", "dueDate");
CREATE INDEX "Requirement_projectId_deletedAt_updatedAt_idx" ON "Requirement"("projectId", "deletedAt", "updatedAt");
CREATE INDEX "Requirement_projectId_status_priority_idx" ON "Requirement"("projectId", "status", "priority");
CREATE INDEX "Requirement_sourceNoteId_idx" ON "Requirement"("sourceNoteId");
CREATE INDEX "ActivityLog_projectId_createdAt_idx" ON "ActivityLog"("projectId", "createdAt");

ALTER TABLE "Decision" ADD CONSTRAINT "Decision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_sourceNoteId_fkey" FOREIGN KEY ("sourceNoteId") REFERENCES "Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_sourceNoteId_fkey" FOREIGN KEY ("sourceNoteId") REFERENCES "Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MeetingParticipant" ADD CONSTRAINT "MeetingParticipant_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetingParticipant" ADD CONSTRAINT "MeetingParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_promotedTaskId_fkey" FOREIGN KEY ("promotedTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_sourceNoteId_fkey" FOREIGN KEY ("sourceNoteId") REFERENCES "Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
