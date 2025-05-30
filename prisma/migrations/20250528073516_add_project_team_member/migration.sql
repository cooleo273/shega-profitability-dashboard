/*
  Warnings:

  - You are about to drop the `_ProjectTeam` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProjectTeam" DROP CONSTRAINT "_ProjectTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectTeam" DROP CONSTRAINT "_ProjectTeam_B_fkey";

-- DropTable
DROP TABLE "_ProjectTeam";

-- CreateTable
CREATE TABLE "ProjectTeamMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTeamMember_projectId_userId_key" ON "ProjectTeamMember"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
