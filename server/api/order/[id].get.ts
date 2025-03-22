// server/api/orders/[id].get.ts
import { z } from 'zod'
import { prisma } from '~/server/lib/prisma'
import { getServerSession } from '#auth'

const paramsSchema = z.object({
  id: z.string().uuid()
})

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  
  // Get authenticated user
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  
  // Get the specific order
  const order = await prisma.order.findUnique({
    where: {
      id,
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
        }
      }
    }
  })
  
  if (!order) {
    throw createError({ statusCode: 404, message: 'Order not found' })
  }
  
  return order
})