/*
  Warnings:

  - Added the required column `informedKm` to the `maintenanceHistory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionNature" AS ENUM ('PERSONAL', 'WORK');

-- DropForeignKey
ALTER TABLE "maintenanceHistory" DROP CONSTRAINT "maintenanceHistory_maintenanceId_fkey";

-- AlterTable
ALTER TABLE "maintenanceHistory" ADD COLUMN     "informedKm" INTEGER NOT NULL,
ADD COLUMN     "observation" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "transactionNature" "TransactionNature" NOT NULL DEFAULT 'WORK';

-- AddForeignKey
ALTER TABLE "maintenanceHistory" ADD CONSTRAINT "maintenanceHistory_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
