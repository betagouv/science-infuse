-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "duration" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "H5PContent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "s3ObjectName" TEXT NOT NULL,
    "h5pId" TEXT NOT NULL,

    CONSTRAINT "H5PContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentToH5PContent" (
    "A" UUID NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentToH5PContent_AB_unique" ON "_DocumentToH5PContent"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentToH5PContent_B_index" ON "_DocumentToH5PContent"("B");

-- AddForeignKey
ALTER TABLE "_DocumentToH5PContent" ADD CONSTRAINT "_DocumentToH5PContent_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToH5PContent" ADD CONSTRAINT "_DocumentToH5PContent_B_fkey" FOREIGN KEY ("B") REFERENCES "H5PContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
