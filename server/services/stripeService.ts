// ~/server/services/stripeService.ts
import Stripe from 'stripe'

// Initialize the Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
  typescript: true
})

// Customer management functions
export async function createStripeCustomer(user: any) {
  return stripe.customers.create({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    metadata: { userId: user.id }
  })
}

// Payment intent functions
export async function createStripePaymentIntent(amount: number, customerId: string) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'eur',
    customer: customerId,
    automatic_payment_methods: { enabled: true }
  })
}

// Subscription functions
export async function createStripeSubscription(customerId: string, priceId: string) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent']
  })
}

// Cancel subscription
export async function cancelStripeSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId)
}

export class StripeService {
  // Process webhook events from Stripe
  async processWebhook(event: Stripe.Event) {
    try {
      // Handle payment success
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await this.fulfillOrder(paymentIntent)
      }
      
      // Handle payment failure
      if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await this.handleFailedPayment(paymentIntent)
      }
      
      return { received: true }
    } catch (error) {
      console.error('Webhook error:', error)
      throw error
    }
  }
  
  // Fulfill the order after successful payment
  private async fulfillOrder(paymentIntent: Stripe.PaymentIntent) {
    const { userId } = paymentIntent.metadata || {}
    
    if (!userId) {
      throw new Error('User ID not found in payment metadata')
    }
    
    // Find pending orders for this user
    const order = await prisma.order.findFirst({
      where: {
        userId,
        status: 'PENDING'
      },
      include: {
        items: {
          include: { plan: true }
        }
      }
    })
    
    if (!order) {
      throw new Error('No pending order found')
    }
    
    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntent.id
      }
    })
    
    // Create invoice for the order
    await prisma.invoice.create({
      data: {
        userId,
        orderId: order.id,
        amount: order.totalAmount,
        status: 'PAID',
        paidAt: new Date(),
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    })
    
    // Provision services for the user
    await this.provisionServices(order)
  }
  
  // Handle failed payment
  private async handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
    const { userId } = paymentIntent.metadata || {}
    
    if (!userId) {
      throw new Error('User ID not found in payment metadata')
    }
    
    // Find pending orders for this user
    const order = await prisma.order.findFirst({
      where: {
        userId,
        status: 'PENDING'
      }
    })
    
    if (!order) {
      return // No order to update
    }
    
    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'FAILED',
        stripePaymentIntentId: paymentIntent.id
      }
    })
  }
  
  // Provision game services after payment
  private async provisionServices(order: any) {
    // Import provisioning service
    const { ProvisioningService } = await import('~/server/services/core/ProvisioningService')
    const provisioningService = new ProvisioningService()
    
    // Process each order item
    for (const item of order.items) {
      await provisioningService.provisionService({
        userId: order.userId,
        serviceType: item.plan.serviceType,
        configuration: item.configuration
      })
    }
  }
}