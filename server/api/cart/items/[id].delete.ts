import { getServerSession } from "#auth"
import { prisma } from "~/server/lib/prisma"

// server/api/cart/items/[id].delete.ts
export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({ statusCode: 401 })
  
    const { id } = event.context.params || {}
  
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true }
    })
    
    if (!cart) throw createError({ statusCode: 404, message: 'Cart not found' })
    if (!cart.items.some(item => item.id === id)) {
      throw createError({ statusCode: 404, message: 'Item not in cart' })
    }
  
    await prisma.cartItem.delete({ where: { id } })
  
    return { success: true }
  })