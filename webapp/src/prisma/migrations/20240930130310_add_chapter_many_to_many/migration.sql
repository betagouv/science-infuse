/*
  Warnings:

  - You are about to drop the column `chapterId` on the `EducationLevel` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `EducationLevel` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EducationLevel" DROP CONSTRAINT "EducationLevel_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "EducationLevel" DROP CONSTRAINT "EducationLevel_userId_fkey";

-- AlterTable
ALTER TABLE "EducationLevel" DROP COLUMN "chapterId",
DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "_ChapterToEducationLevel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_EducationLevelToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChapterToEducationLevel_AB_unique" ON "_ChapterToEducationLevel"("A", "B");

-- CreateIndex
CREATE INDEX "_ChapterToEducationLevel_B_index" ON "_ChapterToEducationLevel"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EducationLevelToUser_AB_unique" ON "_EducationLevelToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_EducationLevelToUser_B_index" ON "_EducationLevelToUser"("B");

-- AddForeignKey
ALTER TABLE "_ChapterToEducationLevel" ADD CONSTRAINT "_ChapterToEducationLevel_A_fkey" FOREIGN KEY ("A") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChapterToEducationLevel" ADD CONSTRAINT "_ChapterToEducationLevel_B_fkey" FOREIGN KEY ("B") REFERENCES "EducationLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EducationLevelToUser" ADD CONSTRAINT "_EducationLevelToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "EducationLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EducationLevelToUser" ADD CONSTRAINT "_EducationLevelToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
