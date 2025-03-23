/*
  Warnings:

  - Added the required column `current_period_start` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "current_period_start" TIMESTAMP(6) NOT NULL;
