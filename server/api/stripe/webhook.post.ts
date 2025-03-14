// ~/server/api/stripe/webhook.post.ts
import { stripe } from '~/server/services/stripeService'
import { prisma } from '~/server/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event)
  const sig = getHeader(event, 'stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body!,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        await prisma.invoice.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { 
            status: 'PAID',
            paidAt: new Date(),
            paymentMethod: paymentIntent.payment_method_types[0]
          }
        })
        break

        case 'invoice.payment_succeeded':
            const invoice = event.data.object
            const subscriptionId = invoice.subscription as string

            // Find the subscription
            const subscription = await prisma.subscription.findUnique({
              where: { stripeSubscriptionId: subscriptionId },
              include: { order: true }
            })
        
            if (!subscription?.order) {
              console.error('No order found for subscription:', subscriptionId)
              break
            }
        
            // Create invoice linked to the order
            await prisma.invoice.create({
              data: {
                amount: invoice.amount_due / 100,
                status: 'PAID',
                paidAt: new Date(invoice.created * 1000),
                orderId: subscription.order.id,
                userId: subscription.userId,
                stripePaymentIntentId: invoice.payment_intent?.toString() || '',
              }
            })
        break
          

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        await prisma.invoice.update({
          where: { stripePaymentIntentId: failedPayment.id },
          data: { status: 'FAILED' }
        })
        break
    }

    return { received: true }
  } catch (err) {
    console.error('Webhook error:', err)
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook Error: ${(err as Error).message}`
    })
  }
})