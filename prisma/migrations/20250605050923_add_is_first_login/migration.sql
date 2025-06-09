-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hashedPassword" TEXT,
ADD COLUMN     "isFirstLogin" BOOLEAN NOT NULL DEFAULT true;
