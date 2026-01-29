/*
  Warnings:

  - You are about to drop the column `cost` on the `maintenances` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "maintenances" DROP COLUMN "cost",
ADD COLUMN     "estimateCost" DECIMAL(10,2);
