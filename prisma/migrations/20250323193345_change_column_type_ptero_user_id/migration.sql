/*
  Warnings:

  - The `pterodactyl_user_id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "pterodactyl_user_id",
ADD COLUMN     "pterodactyl_user_id" INTEGER;
