/*
  Warnings:

  - Added the required column `contentType` to the `H5PContent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `H5PContent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "showcasedH5PContentId" TEXT;

-- AlterTable
ALTER TABLE "H5PContent" ADD COLUMN     "contentType" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_showcasedH5PContentId_fkey" FOREIGN KEY ("showcasedH5PContentId") REFERENCES "H5PContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "H5PContent" ADD CONSTRAINT "H5PContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
