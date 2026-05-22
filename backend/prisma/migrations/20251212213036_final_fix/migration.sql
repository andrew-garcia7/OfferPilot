/*
  Warnings:

  - You are about to drop the column `finalScore` on the `Interview` table. All the data in the column will be lost.

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
    "score" REAL,
    "transcript" TEXT,
    CONSTRAINT "Interview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Interview" ("category", "endedAt", "id", "level", "startedAt", "userId") SELECT "category", "endedAt", "id", "level", "startedAt", "userId" FROM "Interview";
DROP TABLE "Interview";
ALTER TABLE "new_Interview" RENAME TO "Interview";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
