ALTER TABLE "ProjectInvitation" ADD COLUMN "token" TEXT;

UPDATE "ProjectInvitation"
SET "token" = gen_random_uuid()::TEXT
WHERE "token" IS NULL;

ALTER TABLE "ProjectInvitation" ALTER COLUMN "token" SET NOT NULL;
ALTER TABLE "ProjectInvitation" ALTER COLUMN "token" SET DEFAULT gen_random_uuid()::TEXT;

CREATE UNIQUE INDEX "ProjectInvitation_token_key" ON "ProjectInvitation"("token");
