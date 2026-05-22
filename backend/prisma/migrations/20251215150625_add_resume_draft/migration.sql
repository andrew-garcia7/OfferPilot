-- CreateTable
CREATE TABLE "ResumeDraft" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "title" TEXT NOT NULL DEFAULT 'Untitled Resume',
    "payload" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL DEFAULT 'software_engineer',
    "atsScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ResumeDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
