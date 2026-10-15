-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "readAt" TIMESTAMP(3);

-- Existing messages count as read
UPDATE "Message" SET "readAt" = "sentAt";