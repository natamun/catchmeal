-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('MEAL_LOGGED', 'WEIGHT_LOGGED', 'GOAL_REACHED', 'CALORIE_GOAL_CHANGED');

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "ActivityType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_userId_createdAt_idx" ON "Activity"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
