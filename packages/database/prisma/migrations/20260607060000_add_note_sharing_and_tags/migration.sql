CREATE TYPE "NotePermission" AS ENUM ('viewer', 'editor');

CREATE TABLE "NoteShare" (
    "noteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "NotePermission" NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NoteShare_pkey" PRIMARY KEY ("noteId", "userId")
);

CREATE TABLE "NotePublicLink" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "includeChildren" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotePublicLink_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NoteShare_userId_idx" ON "NoteShare"("userId");
CREATE UNIQUE INDEX "NotePublicLink_noteId_key" ON "NotePublicLink"("noteId");
CREATE UNIQUE INDEX "NotePublicLink_tokenHash_key" ON "NotePublicLink"("tokenHash");
CREATE UNIQUE INDEX "NoteTag_userId_name_key" ON "NoteTag"("userId", "name");

ALTER TABLE "NoteShare"
ADD CONSTRAINT "NoteShare_noteId_fkey"
FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NoteShare"
ADD CONSTRAINT "NoteShare_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotePublicLink"
ADD CONSTRAINT "NotePublicLink_noteId_fkey"
FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NoteTag"
ADD CONSTRAINT "NoteTag_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
