import { prisma } from "~/server/lib/prisma";
import { requireAdminUser } from "~/server/utils/adminAuth";

export default defineEventHandler(async (event) => {
  await requireAdminUser(event);
  
  const id = event.context.params?.id;
  const body = await readBody(event);
  
  if (!id || !body.status) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields'
    });
  }
  
  const service = await prisma.service.update({
    where: {
      id: id
    },
    data: {
      status: body.status
    }
  });
  
  return service;
});