/*
  Warnings:

  - Added the required column `ShiftStatus` to the `shift` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('OPEN', 'CLOSED', 'PAUSED');

-- AlterTable
ALTER TABLE "shift" ADD COLUMN     "ShiftStatus" "ShiftStatus" NOT NULL;
