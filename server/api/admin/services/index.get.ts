import { getServerSession } from "#auth";
import { prisma } from "~/server/lib/prisma";
import { requireAdminUser } from "~/server/utils/adminAuth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401 })
  
  const isAdmin = prisma.user.findFirst({ where: { id: session.user.id, isAdmin: true } })
  if (!isAdmin) throw createError({ statusCode: 403 })
  
  const services = await prisma.service.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true
        }
      },
      host: true,
      pterodactyl: true,
      deployments: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return services;
});