/*
  Warnings:

  - You are about to alter the column `note` on the `Friend` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `note` on the `WeightLog` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Changed the type of `lastTimeConnected` on the `Friend` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Friend" ALTER COLUMN "note" SET DATA TYPE VARCHAR(255),
DROP COLUMN "lastTimeConnected",
ADD COLUMN     "lastTimeConnected" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "WeightLog" ALTER COLUMN "note" SET DATA TYPE VARCHAR(255);

-- CreateIndex
CREATE INDEX "Friend_userId_idx" ON "Friend"("userId");

-- CreateIndex
CREATE INDEX "Friend_friendId_idx" ON "Friend"("friendId");

-- CreateIndex
CREATE INDEX "GoalSetting_userId_startDate_idx" ON "GoalSetting"("userId", "startDate");

-- CreateIndex
CREATE INDEX "Meal_userId_loggedAt_idx" ON "Meal"("userId", "loggedAt");
