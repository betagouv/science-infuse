-- CreateEnum
CREATE TYPE "ReportedDocumentChunkStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "ReportedDocumentChunk" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentChunkId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportedDocumentChunkStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportedDocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReportedDocumentChunk_userId_documentChunkId_key" ON "ReportedDocumentChunk"("userId", "documentChunkId");

-- AddForeignKey
ALTER TABLE "ReportedDocumentChunk" ADD CONSTRAINT "ReportedDocumentChunk_documentChunkId_fkey" FOREIGN KEY ("documentChunkId") REFERENCES "DocumentChunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportedDocumentChunk" ADD CONSTRAINT "ReportedDocumentChunk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
