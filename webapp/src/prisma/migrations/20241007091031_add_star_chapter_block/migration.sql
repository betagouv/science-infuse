-- CreateTable
CREATE TABLE "StarredBlock" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "blockId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StarredBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StarredBlock_userId_blockId_keyword_key" ON "StarredBlock"("userId", "blockId", "keyword");

-- AddForeignKey
ALTER TABLE "StarredBlock" ADD CONSTRAINT "StarredBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarredBlock" ADD CONSTRAINT "StarredBlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
