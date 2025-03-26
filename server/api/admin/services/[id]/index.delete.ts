import { getServerSession } from "#auth";
import { prisma } from "~/server/lib/prisma";
import { requireAdminUser } from "~/server/utils/adminAuth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401 })
    
  const isAdmin = prisma.user.findFirst({ where: { id: session.user.id, isAdmin: true } })
  if (!isAdmin) throw createError({ statusCode: 403 })
  
  const id = event.context.params?.id;
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Service ID is required'
    });
  }
  
  // Check for associated resources that should be deleted first
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      deployments: true,
      pterodactyl: true,
      network: true
    }
  });
  
  if (!service) {
    throw createError({
      statusCode: 404,
      message: 'Service not found'
    });
  }
  
  // Use a transaction to delete all related records
  await prisma.$transaction(async (tx) => {
    // Delete deployments
    if (service.deployments.length > 0) {
      await tx.serviceDeployment.deleteMany({
        where: { serviceId: id }
      });
    }
    
    // Delete pterodactyl info
    if (service.pterodactyl) {
      await tx.pterodactylServer.delete({
        where: { serviceId: id }
      });
    }
    
    // Delete network config
    if (service.network) {
      await tx.networkConfig.delete({
        where: { serviceId: id }
      });
    }
    
    // Delete the service itself
    await tx.service.delete({
      where: { id }
    });
  });
  
  return { success: true };
});