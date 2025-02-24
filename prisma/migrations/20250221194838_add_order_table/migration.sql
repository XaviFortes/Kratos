/*
  Warnings:

  - Added the required column `recurring_id` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "recurring_id" VARCHAR(255) NOT NULL;
