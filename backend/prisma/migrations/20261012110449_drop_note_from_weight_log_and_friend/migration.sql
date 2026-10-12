/*
  Warnings:

  - You are about to drop the column `note` on the `Friend` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `WeightLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Friend" DROP COLUMN "note";

-- AlterTable
ALTER TABLE "WeightLog" DROP COLUMN "note";
