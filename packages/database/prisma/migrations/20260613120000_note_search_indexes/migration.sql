CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Note_title_trgm_idx"
ON "Note" USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Note_content_trgm_idx"
ON "Note" USING GIN ("content" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "NoteTag_name_trgm_idx"
ON "NoteTag" USING GIN ("name" gin_trgm_ops);
