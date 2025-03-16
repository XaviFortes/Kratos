import { JsonObject } from "@prisma/client/runtime/library"
import { prisma } from "~/server/lib/prisma"
import { getServerSession } from '#auth'


// server/api/cart/checkout.post.ts
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event as any)
    const user = session?.user
    if (!user) throw createError({ statusCode: 401 })
  
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { plan: true } } }
    })
  
    if (!cart || cart.items.length === 0) {
      throw createError({ statusCode: 400, message: 'Cart is empty' })
    }
  
    // Create order from cart
    const order = await prisma.$transaction(async (tx) => {
      // Calculate total
      const total = cart.items.reduce((sum, item) => {
        return sum + item.plan.priceMonthly.toNumber() * item.quantity
      }, 0)
  
      // Create order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          status: 'PENDING',
          totalAmount: total,
          items: {
            create: cart.items.map(item => ({
              planId: item.planId,
              configuration: item.configuration as JsonObject,
              unitPrice: item.plan.priceMonthly,
              quantity: item.quantity
            }))
          }
        }
      })
  
      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
      await tx.cart.delete({ where: { id: cart.id } })
  
      return order
    })
  
    return order
  })