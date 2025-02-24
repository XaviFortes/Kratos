/*
  Warnings:

  - Added the required column `po_number` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "po_number" VARCHAR(255) NOT NULL;
