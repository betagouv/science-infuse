-- CreateTable
CREATE TABLE "DocumentTag" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "DocumentTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentToDocumentTag" (
    "A" UUID NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTag_title_key" ON "DocumentTag"("title");

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentToDocumentTag_AB_unique" ON "_DocumentToDocumentTag"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentToDocumentTag_B_index" ON "_DocumentToDocumentTag"("B");

-- AddForeignKey
ALTER TABLE "_DocumentToDocumentTag" ADD CONSTRAINT "_DocumentToDocumentTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToDocumentTag" ADD CONSTRAINT "_DocumentToDocumentTag_B_fkey" FOREIGN KEY ("B") REFERENCES "DocumentTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
