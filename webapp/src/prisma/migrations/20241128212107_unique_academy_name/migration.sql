/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Academy` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Academy_name_key" ON "Academy"("name");
