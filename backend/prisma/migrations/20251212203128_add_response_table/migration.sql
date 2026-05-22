/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Response` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Interview" ADD COLUMN "transcript" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Response" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "interviewId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "score" REAL NOT NULL,
    CONSTRAINT "Response_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Response" ("answer", "id", "interviewId", "question", "score") SELECT "answer", "id", "interviewId", "question", "score" FROM "Response";
DROP TABLE "Response";
ALTER TABLE "new_Response" RENAME TO "Response";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
