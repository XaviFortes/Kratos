-- CreateTable
CREATE TABLE "service_deployments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "logs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "service_deployments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_deployments" ADD CONSTRAINT "service_deployments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
