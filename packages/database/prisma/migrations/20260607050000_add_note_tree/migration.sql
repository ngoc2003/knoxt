ALTER TABLE "Note"
ADD COLUMN "parentId" TEXT,
ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

WITH ranked_notes AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (
            PARTITION BY "userId"
            ORDER BY "createdAt" ASC, "id" ASC
        ) - 1 AS "position"
    FROM "Note"
    WHERE "deletedAt" IS NULL
)
UPDATE "Note"
SET "position" = ranked_notes."position"::INTEGER
FROM ranked_notes
WHERE "Note"."id" = ranked_notes."id";

CREATE INDEX "Note_userId_parentId_position_idx"
ON "Note"("userId", "parentId", "position");

ALTER TABLE "Note"
ADD CONSTRAINT "Note_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;
