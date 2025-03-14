// ~/server/api/payments/webhook.post.ts
import { stripe } from '~/server/services/stripeService'
import { prisma } from '~/server/lib/prisma'
import type Stripe from 'stripe'
import { InvoiceStatus, SubStatus } from '@prisma/client'

// Reuse or move this to a shared utilities file
const mapStripeStatus = (status: Stripe.Subscription.Status): SubStatus => {
  switch (status) {
    case 'active': return SubStatus.active
    case 'past_due': return SubStatus.past_due
    case 'unpaid': return SubStatus.unpaid
    case 'canceled': return SubStatus.canceled
    case 'incomplete': return SubStatus.incomplete
    case 'incomplete_expired': return SubStatus.incomplete_expired
    case 'trialing': return SubStatus.trialing
    default: return SubStatus.active
  }
}

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event)
  const sig = getHeader(event, 'stripe-signature')!

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      body!,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    
    switch (stripeEvent.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(stripeEvent.data.object as Stripe.Invoice)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(stripeEvent.data.object as Stripe.Subscription)
        break
    }

    return { received: true }
  } catch (err) {
    console.error(err)
    throw createError({ statusCode: 400, message: 'Webhook error' })
  }
})

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Handle optional due_date safely
  const dueDate = invoice.due_date ? new Date(invoice.due_date * 1000) : null

  await prisma.invoice.update({
    where: { 
      stripePaymentIntentId: invoice.payment_intent as string 
    },
    data: {
      status: InvoiceStatus.PAID,
      dueDate: dueDate,
      paidAt: new Date()
    }
  })
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: { 
      stripeSubscriptionId: subscription.id 
    },
    data: {
      status: mapStripeStatus(subscription.status),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  })
}