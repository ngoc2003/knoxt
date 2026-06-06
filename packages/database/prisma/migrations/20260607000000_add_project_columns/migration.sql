-- Store task status as a project-defined column key.
ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'todo';
DROP TYPE "TaskStatus";

CREATE TABLE "ProjectColumn" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectColumn_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectColumn_projectId_key_key" ON "ProjectColumn"("projectId", "key");
CREATE UNIQUE INDEX "ProjectColumn_projectId_name_key" ON "ProjectColumn"("projectId", "name");
CREATE INDEX "ProjectColumn_projectId_orderIndex_idx" ON "ProjectColumn"("projectId", "orderIndex");

ALTER TABLE "ProjectColumn"
ADD CONSTRAINT "ProjectColumn_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "ProjectColumn" ("id", "projectId", "key", "name", "orderIndex", "updatedAt")
SELECT gen_random_uuid()::TEXT, "id", 'todo', 'To-do', 0, CURRENT_TIMESTAMP FROM "Project";

INSERT INTO "ProjectColumn" ("id", "projectId", "key", "name", "orderIndex", "updatedAt")
SELECT gen_random_uuid()::TEXT, "id", 'doing', 'Doing', 1, CURRENT_TIMESTAMP FROM "Project";

INSERT INTO "ProjectColumn" ("id", "projectId", "key", "name", "orderIndex", "updatedAt")
SELECT gen_random_uuid()::TEXT, "id", 'done', 'Done', 2, CURRENT_TIMESTAMP FROM "Project";
