-- AlterTable
ALTER TABLE "GoalSetting" ADD COLUMN     "dailyCarbs" INTEGER,
ADD COLUMN     "dailyFat" INTEGER,
ADD COLUMN     "dailyProtein" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bodyFat" DOUBLE PRECISION,
ADD COLUMN     "bodyWater" DOUBLE PRECISION,
ADD COLUMN     "fatFreeMass" DOUBLE PRECISION,
ADD COLUMN     "muscleMass" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "WeightLog" ADD COLUMN     "bodyWater" DOUBLE PRECISION,
ADD COLUMN     "fatFreeMass" DOUBLE PRECISION,
ADD COLUMN     "muscleMass" DOUBLE PRECISION;
