/*
  Warnings:

  - You are about to drop the column `bodyFat` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bodyWater` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fatFreeMass` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `muscleMass` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "bodyFat",
DROP COLUMN "bodyWater",
DROP COLUMN "fatFreeMass",
DROP COLUMN "muscleMass";
