-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "subtotal" DECIMAL(10,2),
ADD COLUMN     "tax" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canceled_at" TIMESTAMP(6);
