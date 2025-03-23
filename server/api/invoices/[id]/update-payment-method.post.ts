import { getServerSession } from "#auth"
import { stripe } from '~/server/services/stripeService'
import { prisma } from '~/server/lib/prisma'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {}
  const { paymentMethodId } = await readBody(event)
  const session = await getServerSession(event)
  
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  
  if (!paymentMethodId) {
    throw createError({ statusCode: 400, message: 'Payment method ID is required' })
  }
  
  try {
    // Find invoice in database
    const invoice = await prisma.invoice.findUnique({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        order: {
          include: {
            subscription: true
          }
        }
      }
    })
    
    if (!invoice) {
      throw createError({ statusCode: 404, message: 'Invoice not found' })
    }
    
    if (!invoice.stripeInvoiceId) {
      throw createError({ statusCode: 400, message: 'No Stripe invoice ID available' })
    }
    
    // Update the subscription's default payment method
    if (invoice.order?.subscription?.stripeSubscriptionId) {
      await stripe.subscriptions.update(invoice.order.subscription.stripeSubscriptionId, {
        default_payment_method: paymentMethodId
      })
      
      // Update the invoice to use the new payment method
      await stripe.invoices.update(invoice.stripeInvoiceId, {
        default_payment_method: paymentMethodId
      })
      
      return {
        success: true,
        message: 'Payment method updated successfully'
      }
    } else {
      throw createError({ statusCode: 400, message: 'No subscription found for this invoice' })
    }
  } catch (error) {
    console.error('Error updating payment method for invoice:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update payment method: ' + (error instanceof Error ? error.message : 'Unknown error')
    })
  }
})