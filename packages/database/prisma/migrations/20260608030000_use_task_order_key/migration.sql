ALTER TABLE "Task" ADD COLUMN "orderKey" VARCHAR(16) COLLATE "C";

CREATE OR REPLACE FUNCTION pg_temp.to_base36(value bigint)
RETURNS text AS $$
DECLARE
    alphabet text := '0123456789abcdefghijklmnopqrstuvwxyz';
    result text := '';
    current_value bigint := value;
BEGIN
    WHILE current_value > 0 LOOP
        result := substr(alphabet, (current_value % 36)::integer + 1, 1) || result;
        current_value := current_value / 36;
    END LOOP;
    RETURN CASE WHEN result = '' THEN '0' ELSE result END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

WITH ranked_tasks AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (
            PARTITION BY "projectId", "status"
            ORDER BY "orderIndex", "createdAt", "id"
        ) AS position
    FROM "Task"
)
UPDATE "Task"
SET "orderKey" = LPAD(
    pg_temp.to_base36((ranked_tasks.position * 2821109907456)::bigint),
    16,
    '0'
)
FROM ranked_tasks
WHERE "Task"."id" = ranked_tasks."id";

ALTER TABLE "Task" ALTER COLUMN "orderKey" SET NOT NULL;

DROP INDEX IF EXISTS "Task_projectId_status_orderIndex_idx";
ALTER TABLE "Task" DROP COLUMN "orderIndex";

CREATE INDEX "Task_projectId_status_orderKey_idx"
ON "Task"("projectId", "status", "orderKey");
