/*
  Warnings:

  - You are about to drop the column `color` on the `userHomework` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `userHomework` table. All the data in the column will be lost.
  - You are about to drop the column `userAdded` on the `userHomework` table. All the data in the column will be lost.
  - You are about to drop the `iCalHomeworkState` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "iCalHomeworkState" DROP CONSTRAINT "iCalHomeworkState_userId_fkey";

-- AlterTable
ALTER TABLE "userHomework" DROP COLUMN "color",
DROP COLUMN "status",
DROP COLUMN "userAdded";

-- DropTable
DROP TABLE "iCalHomeworkState";

-- CreateTable
CREATE TABLE "homeworkState" (
    "id" TEXT NOT NULL,
    "homeworkId" TEXT NOT NULL,
    "status" "Status",
    "color" "HighlightColor",
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homeworkState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "homeworkState_userId_homeworkId_idx" ON "homeworkState"("userId", "homeworkId");

-- CreateIndex
CREATE UNIQUE INDEX "homeworkState_userId_homeworkId_key" ON "homeworkState"("userId", "homeworkId");

-- AddForeignKey
ALTER TABLE "homeworkState" ADD CONSTRAINT "homeworkState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
