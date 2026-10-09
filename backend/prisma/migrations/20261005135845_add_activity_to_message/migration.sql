-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "activityId" INTEGER;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
