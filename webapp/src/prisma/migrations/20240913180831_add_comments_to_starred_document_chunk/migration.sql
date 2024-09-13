/*
  Warnings:

  - Added the required column `comment` to the `StarredDocumentChunk` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StarredDocumentChunk" ADD COLUMN     "comment" TEXT NOT NULL;
