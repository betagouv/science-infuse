/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `SchoolSubject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `Theme` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SchoolSubject_name_key" ON "SchoolSubject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_title_key" ON "Theme"("title");
