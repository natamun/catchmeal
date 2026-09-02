-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "Role" USING (
    CASE "role"
      WHEN 'User' THEN 'USER'
      WHEN 'Admin' THEN 'ADMIN'
      ELSE 'USER'
    END
  )::"Role",
  ALTER COLUMN "role" SET DEFAULT 'USER';
