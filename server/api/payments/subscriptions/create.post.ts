import { prisma } from "~/server/lib/prisma"
import { getServerSession } from '#auth'
import { stripe } from '~/server/services/stripeService'
import Stripe from "stripe"
import { BillingCycle, InvoiceStatus, OrderStatus, SubStatus } from "@prisma/client"

// ~/server/api/subscriptions/create.post.ts
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event as any)
    const body = await readBody(event)
  
    if (!session?.user?.id) {
      throw createError({ statusCode: 403, message: 'Unauthorized' })
    }
  
    // Create database records

    // Create order first
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        poNumber: `PO-${Date.now().toString(36).toUpperCase()}`,
        status: OrderStatus.ACTIVE,
        billingCycle: BillingCycle.MONTHLY
      }
    });

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: body.stripe_customer_id,
      items: [{ price: body.price_id }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });

    // Create database subscription
    const dbSubscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        orderId: order.id,
        stripeSubscriptionId: subscription.id,
        status: SubStatus.active,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });
  
    const invoice = await prisma.invoice.create({
        data: {
          userId: session.user.id,
          orderId: order.id,
          amount: (subscription.latest_invoice as Stripe.Invoice).amount_due / 100,
          status: InvoiceStatus.PENDING,
          stripePaymentIntentId: typeof (subscription.latest_invoice as Stripe.Invoice).payment_intent,
        }
    });
  
    return {
      subscription_id: subscription.id,
      client_secret: (subscription.latest_invoice as Stripe.Invoice).payment_intent,
      invoice_id: invoice.id
    }
  })