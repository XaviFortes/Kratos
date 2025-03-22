-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('PENDING', 'INSTALLING', 'ACTIVE', 'SUSPENDED', 'CANCELLED');

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING';
