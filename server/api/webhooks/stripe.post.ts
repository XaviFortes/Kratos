import { stripe } from '~/server/services/stripeService'
import { StripeService } from '~/server/services/stripeService'

export default defineEventHandler(async (event) => {
  try {
    // Get the raw body and Stripe signature
    const body = await readRawBody(event)
    const signature = getHeader(event, 'stripe-signature')
    
    if (!body || !signature) {
      throw createError({ 
        statusCode: 400,
        message: 'Missing body or Stripe signature'
      })
    }
    
    // Verify webhook signature
    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
    
    // Process the webhook event
    const stripeService = new StripeService()
    const result = await stripeService.processWebhook(stripeEvent)
    
    return result
  } catch (error) {
    console.error('Stripe webhook error:', error)
    
    throw createError({
      statusCode: 400,
      message: `Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
})