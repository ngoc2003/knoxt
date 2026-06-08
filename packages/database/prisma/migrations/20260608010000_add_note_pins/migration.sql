CREATE TABLE "NotePin" (
    "noteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotePin_pkey" PRIMARY KEY ("noteId", "userId")
);

CREATE INDEX "NotePin_userId_createdAt_idx" ON "NotePin"("userId", "createdAt");

ALTER TABLE "NotePin"
ADD CONSTRAINT "NotePin_noteId_fkey"
FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotePin"
ADD CONSTRAINT "NotePin_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
