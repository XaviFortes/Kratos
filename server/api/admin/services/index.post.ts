import { prisma } from "~/server/lib/prisma";
import { requireAdminUser } from "~/server/utils/adminAuth";

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);
  
  const body = await readBody(event);
  
  if (!body.userId || !body.type || !body.config) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields'
    });
  }
  
  const service = await prisma.service.create({
    data: {
      type: body.type,
      userId: body.userId,
      hostId: body.hostId || undefined,
      status: body.status || 'PENDING',
      config: body.config
    }
  });
  
  return service;
});