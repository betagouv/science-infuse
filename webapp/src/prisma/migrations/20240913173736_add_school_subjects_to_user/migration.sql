-- CreateTable
CREATE TABLE "SchoolsSubjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "SchoolsSubjects_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SchoolsSubjects" ADD CONSTRAINT "SchoolsSubjects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
