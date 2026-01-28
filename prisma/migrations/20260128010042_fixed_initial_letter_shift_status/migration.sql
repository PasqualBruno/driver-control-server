/*
  Warnings:

  - You are about to drop the column `ShiftStatus` on the `shift` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "shift" DROP COLUMN "ShiftStatus",
ADD COLUMN     "shiftStatus" "ShiftStatus" NOT NULL DEFAULT 'OPEN';
