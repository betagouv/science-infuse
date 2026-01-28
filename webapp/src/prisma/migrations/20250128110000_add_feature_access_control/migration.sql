-- CreateTable
CREATE TABLE "RevokedSamlSession" (
    "sessionIndex" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevokedSamlSession_pkey" PRIMARY KEY ("sessionIndex")
);

-- CreateIndex
CREATE UNIQUE INDEX "RevokedSamlSession_sessionIndex_key" ON "RevokedSamlSession"("sessionIndex");
