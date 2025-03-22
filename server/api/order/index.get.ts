import { getServerSession } from '#auth'
import { prisma } from '~/server/lib/prisma'

export default defineEventHandler(async (event) => {
  // Get authenticated user
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  
  // Get user's orders
  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      items: {
        include: {
          plan: true
        }
      },
      invoices: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  return orders
})