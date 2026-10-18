-- AlterTable
ALTER TABLE "User" ADD COLUMN "oauthProvider" TEXT;

-- Backfill existing OAuth accounts that still carry the provider prefix
UPDATE "User" SET "oauthProvider" = 'google' WHERE "passwordHash" = '' AND "username" LIKE 'google\_%';
UPDATE "User" SET "oauthProvider" = 'github' WHERE "passwordHash" = '' AND "username" LIKE 'github\_%';
UPDATE "User" SET "oauthProvider" = '42' WHERE "passwordHash" = '' AND "username" LIKE '42\_%';
