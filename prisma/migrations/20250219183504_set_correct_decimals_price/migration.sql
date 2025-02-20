/*
  Warnings:

  - You are about to alter the column `basePrice` on the `Game` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `value` on the `PriceModifier` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `PricingTier` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "basePrice" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "PriceModifier" ALTER COLUMN "value" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "PricingTier" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);
