/*
  Warnings:

  - You are about to drop the column `test` on the `DocumentChunk` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "sourceCreationDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "DocumentChunk" DROP COLUMN "test";
