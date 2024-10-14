-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'UniverScience',
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
