/*
  Warnings:

  - You are about to alter the column `plate` on the `vehicles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(7)`.
  - A unique constraint covering the columns `[plate]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "vehicles" ALTER COLUMN "plate" SET DATA TYPE VARCHAR(7);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");
