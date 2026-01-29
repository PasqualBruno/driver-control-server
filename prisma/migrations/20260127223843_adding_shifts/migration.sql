/*
  Warnings:

  - Added the required column `controlBy` to the `maintenances` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MaintenanceControl" AS ENUM ('KM', 'TIME');

-- AlterTable
ALTER TABLE "maintenances" ADD COLUMN     "controlBy" "MaintenanceControl" NOT NULL,
ALTER COLUMN "lastChangedDate" DROP NOT NULL,
ALTER COLUMN "lastChangedKm" DROP NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "shiftId" TEXT;

-- CreateTable
CREATE TABLE "shift" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "shift" ADD CONSTRAINT "shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift" ADD CONSTRAINT "shift_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
