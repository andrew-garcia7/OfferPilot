/*
  Warnings:

  - You are about to drop the column `transcript` on the `Interview` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Interview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "finalScore" REAL,
    CONSTRAINT "Interview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Interview" ("category", "endedAt", "finalScore", "id", "level", "startedAt", "userId") SELECT "category", "endedAt", "finalScore", "id", "level", "startedAt", "userId" FROM "Interview";
DROP TABLE "Interview";
ALTER TABLE "new_Interview" RENAME TO "Interview";
CREATE TABLE "new_Response" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "interviewId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Response_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Response" ("answer", "id", "interviewId", "question", "score") SELECT "answer", "id", "interviewId", "question", "score" FROM "Response";
DROP TABLE "Response";
ALTER TABLE "new_Response" RENAME TO "Response";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
