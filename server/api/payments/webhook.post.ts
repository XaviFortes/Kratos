import StripeService from '~/server/services/stripeService'
import prisma from '~/server/lib/prisma'
import Stripe from 'stripe'

const stripe = new StripeService()

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event)
  const sig = getHeader(event, 'stripe-signature')!

  try {
    const stripeEvent = await stripe.constructEvent(body!, sig)
    
    switch (stripeEvent.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(stripeEvent.data.object)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(stripeEvent.data.object)
        break
    }

    return { received: true }
  } catch (err) {
    console.error(err)
    throw createError({ statusCode: 400, message: 'Webhook error' })
  }
})

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  await prisma.invoices.update({
    where: { stripe_id: invoice.id },
    data: {
      status: 'paid',
      due_date: new Date(invoice.due_date * 1000)
    }
  })
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  await prisma.Subscription.update({
    where: { stripe_subscription: subscription.id },
    data: {
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000)
    }
  })
}