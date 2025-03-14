// ~/server/api/payments/checkout.post.ts
import { prisma } from "~/server/lib/prisma"
import { stripe } from "~/server/services/stripeService"
import type { User } from '@prisma/client'
import type Stripe from 'stripe'
import { BillingCycle, OrderStatus, SubStatus, InvoiceStatus } from '@prisma/client'

// Map Stripe status to our SubStatus enum
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
    const body = await readBody(event)
    const user = event.context.user as User

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            metadata: { userId: user.id }
        })
        
        await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customer.id }
        })
        customerId = customer.id
    }

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: body.priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
    })

    // Cast to Stripe.Invoice and Stripe.PaymentIntent for TypeScript
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent

    // Create order first
    const order = await prisma.order.create({
        data: {
            userId: user.id,
            poNumber: `PO-${Date.now().toString(36).toUpperCase()}`,
            status: OrderStatus.ACTIVE, // Use enum value
            billingCycle: BillingCycle.MONTHLY, // Use enum value
            subscription: {
                create: {
                    stripeSubscriptionId: subscription.id,
                    status: mapStripeStatus(subscription.status), // Convert Stripe status to our enum
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    userId: user.id
                }
            }
        }
    })

    // Create invoice and link to order
    const invoice = await prisma.invoice.create({
        data: {
            amount: latestInvoice.amount_due / 100,
            status: InvoiceStatus.CREATED,
            stripePaymentIntentId: paymentIntent.id,
            userId: user.id,
            orderId: order.id
        }
    })

    return {
        clientSecret: paymentIntent.client_secret,
        invoiceId: invoice.id
    }
})