import Stripe from 'stripe'

export default class StripeService {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia'
    })
  }

  async createCustomer(user: any) {
    return this.stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: { userId: user.id }
    })
  }

  async createStripePaymentIntent(amount: number, customerId: string) {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      customer: customerId,
      automatic_payment_methods: { enabled: true }
    })
  }

  async createStripeSubscription(customerId: string, priceId: string) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    })
  }

  async createSubscription(customerId: string, priceId: string) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    })
  }

  async constructEvent(payload: Buffer, sig: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  }
}