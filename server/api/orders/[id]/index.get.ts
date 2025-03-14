import { prisma } from "~/server/lib/prisma"

// ~/server/api/orders/[id]/index.get.ts
export default defineEventHandler(async (event) => {
    const orderId = getRouterParam(event, 'id')

    return prisma.order.findUnique({
        where: { id: orderId },
        include: {
            invoices: true,
            subscription: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    stripeCustomerId: true
                }
            }
        }
    })
})