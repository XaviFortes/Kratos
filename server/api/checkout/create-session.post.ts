import { getServerSession } from '#auth'
import { prisma } from '~/server/lib/prisma'
import { stripe } from '~/server/services/stripeService'

export default defineEventHandler(async (event) => {
  // Get authenticated user
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  
  const user = session.user
  
  // Get user's cart
  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { 
      items: {
        include: { plan: true }
      }
    }
  })
  
  if (!cart || cart.items.length === 0) {
    throw createError({ 
      statusCode: 400, 
      message: 'Your cart is empty' 
    })
  }
  
  // Calculate total amount
  const totalAmount = cart.items.reduce(
    (sum, item) => sum + (Number(item.unitPrice) * item.quantity), 
    0
  )
  
  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100),
    currency: 'usd',
    metadata: {
      userId: user.id,
      cartId: cart.id
    }
  })
  
  if (!paymentIntent.client_secret) {
    throw createError({ 
      statusCode: 500, 
      message: 'Failed to create payment session' 
    })
  }
  
  return {
    sessionId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    amount: totalAmount
  }
})