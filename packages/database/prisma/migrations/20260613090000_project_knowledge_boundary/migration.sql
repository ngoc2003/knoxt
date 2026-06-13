-- Normalize the existing status values before introducing the enum.
UPDATE "Project" SET "status" = 'on_hold' WHERE "status" = 'on-hold';
UPDATE "Project" SET "status" = 'active'
WHERE "status" NOT IN ('active', 'on_hold', 'completed', 'archived');

CREATE TYPE "ProjectStatus" AS ENUM ('active', 'on_hold', 'completed', 'archived');

ALTER TABLE "Project"
  ALTER COLUMN "customerId" DROP NOT NULL,
  ALTER COLUMN "startDate" DROP NOT NULL,
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "ProjectStatus" USING ("status"::"ProjectStatus"),
  ALTER COLUMN "status" SET DEFAULT 'active';

ALTER TABLE "Note" ADD COLUMN "projectId" TEXT;

ALTER TABLE "Note"
  ADD CONSTRAINT "Note_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

DROP INDEX IF EXISTS "Note_userId_parentId_position_idx";

CREATE INDEX "Project_userId_status_updatedAt_idx"
  ON "Project"("userId", "status", "updatedAt");
CREATE INDEX "Project_status_updatedAt_idx"
  ON "Project"("status", "updatedAt");
CREATE INDEX "Note_projectId_parentId_position_idx"
  ON "Note"("projectId", "parentId", "position");
CREATE INDEX "Note_projectId_updatedAt_idx"
  ON "Note"("projectId", "updatedAt");
CREATE INDEX "Note_projectId_deletedAt_idx"
  ON "Note"("projectId", "deletedAt");

-- PostgreSQL cannot express this cross-row invariant as a CHECK constraint.
-- The API validates that a parent and child share the same project.
