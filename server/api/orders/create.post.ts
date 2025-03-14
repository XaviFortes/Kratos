// ~/server/api/orders/create.post.ts
import { getServerSession } from '#auth'
import { prisma } from '~/server/lib/prisma'
import { stripe } from '~/server/services/stripeService'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event as any)
  const body = await readBody(event)

  if (!session?.user?.id) {
    throw createError({ statusCode: 403, message: 'Unauthorized' })
  }

  // Create order first
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      poNumber: `PO-${Date.now().toString(36).toUpperCase()}`,
      status: 'ACTIVE'
    }
  })

  // Create initial invoice
  const invoice = await prisma.invoice.create({
    data: {
      userId: session.user.id,
      orderId: order.id,
      amount: body.amount,
      status: 'PENDING',
      metadata: body.metadata
    }
  })

  // Create Stripe Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(body.amount * 100),
    currency: 'eur',
    metadata: {
      order_id: order.id,
      invoice_id: invoice.id
    }
  })

  // Update invoice with Stripe ID
  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: { stripePaymentIntentId: paymentIntent.id }
  })

  return {
    order_id: order.id,
    client_secret: paymentIntent.client_secret,
    invoice_id: updatedInvoice.id
  }
})