/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - Added the required column `city` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street_address` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip_code` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
ADD COLUMN     "city" VARCHAR(100) NOT NULL,
ADD COLUMN     "company_name" VARCHAR(255),
ADD COLUMN     "country" VARCHAR(50) NOT NULL,
ADD COLUMN     "first_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "last_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "phone_number" VARCHAR(20),
ADD COLUMN     "state" VARCHAR(50) NOT NULL,
ADD COLUMN     "street_address" VARCHAR(255) NOT NULL,
ADD COLUMN     "street_address2" VARCHAR(255),
ADD COLUMN     "tax_id" VARCHAR(50),
ADD COLUMN     "zip_code" VARCHAR(20) NOT NULL;

-- CreateIndex
CREATE INDEX "idx_users_country" ON "users"("country");

-- CreateIndex
CREATE INDEX "idx_users_tax_id" ON "users"("tax_id");
