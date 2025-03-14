// ~/server/api/invoices/create.post.ts
import { getServerSession } from '#auth'
import { prisma } from '~/server/lib/prisma'
import { calculatePrice } from '~/server/services/pricingServices'
import { stripe, createStripeCustomer, createStripePaymentIntent } from '~/server/services/stripeService'
// import { BillingCycle, OrderStatus } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const session = await getServerSession(event as any)

  if (!session?.user?.id) {
    throw createError({ statusCode: 403, message: 'Unauthorized' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscriptions: true }
    })

    if (!user) throw createError({ statusCode: 404, message: 'User not found' })

    // Calculate pricing
    const { total, lineItems } = await calculatePrice(body.gameSlug, body.config)
    
    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(user)
      stripeCustomerId = customer.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId }
      })
    }

    // Create Stripe payment intent
    const paymentIntent = await createStripePaymentIntent(
      Number(total),
      stripeCustomerId
    )

    const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;

    // Create local invoice
    // First create the Order
    const order = await prisma.order.create({
    data: {
        poNumber,
        userId: user.id,
        status: "ACTIVE",
        billingCycle: "MONTHLY",
        // Add game/server relations if needed
        gameId: body.gameId,
        serverId: body.serverId
    }
    })
  
    // Then create the Invoice linked to the Order
    const invoice = await prisma.invoice.create({
    data: {
        amount: total,
        status: 'PENDING',
        stripePaymentIntentId: paymentIntent.id,
        userId: user.id,
        orderId: order.id, // Connect to the created order
        metadata: {
        gameSlug: body.gameSlug,
        config: body.config,
        lineItems: lineItems.map(item => ({
            description: item.notes,
            price: item.cost,
            quantity: 1
        }))
        },
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
    })

    return {
      clientSecret: paymentIntent.client_secret,
      invoiceId: invoice.id
    }

  } catch (error) {
    console.error('Invoice creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Invoice creation failed'
    })
  }
})