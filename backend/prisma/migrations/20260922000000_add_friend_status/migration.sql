-- CreateEnum
CREATE TYPE "FriendStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- AlterTable
ALTER TABLE "Friend" ADD COLUMN     "status" "FriendStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "lastTimeConnected" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Friend_userId_friendId_key" ON "Friend"("userId", "friendId");
