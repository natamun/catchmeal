/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Meal" ALTER COLUMN "loggedAt" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl";
