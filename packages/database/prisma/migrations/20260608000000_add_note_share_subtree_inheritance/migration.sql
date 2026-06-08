ALTER TABLE "NoteShare"
DROP CONSTRAINT "NoteShare_pkey",
ADD COLUMN "id" TEXT,
ADD COLUMN "sourceNoteId" TEXT,
ADD COLUMN "includeChildren" BOOLEAN NOT NULL DEFAULT false;

UPDATE "NoteShare"
SET "id" = gen_random_uuid()::TEXT,
    "sourceNoteId" = "noteId";

ALTER TABLE "NoteShare"
ALTER COLUMN "id" SET NOT NULL,
ALTER COLUMN "sourceNoteId" SET NOT NULL,
ADD CONSTRAINT "NoteShare_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "NoteShare_noteId_userId_sourceNoteId_key"
ON "NoteShare"("noteId", "userId", "sourceNoteId");

CREATE INDEX "NoteShare_sourceNoteId_userId_idx"
ON "NoteShare"("sourceNoteId", "userId");
