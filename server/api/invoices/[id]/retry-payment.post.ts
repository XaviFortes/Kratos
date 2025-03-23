import { getServerSession } from "#auth"
import { stripe } from '~/server/services/stripeService'
import { prisma } from '~/server/lib/prisma'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {}
  const session = await getServerSession(event)
  
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  
  try {
    // Find invoice in database
    const invoice = await prisma.invoice.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    })
    
    if (!invoice) {
      throw createError({ statusCode: 404, message: 'Invoice not found' })
    }
    
    if (!invoice.stripeInvoiceId) {
      throw createError({ statusCode: 400, message: 'No Stripe invoice ID available' })
    }
    
    // Retry the payment
    const retryResult = await stripe.invoices.pay(invoice.stripeInvoiceId)
    
    // Update our database
    await prisma.invoice.update({
      where: { id },
      data: {
        status: retryResult.status === 'paid' ? 'PAID' : 'PENDING',
        paidAt: retryResult.status === 'paid' ? new Date() : null
      }
    })
    
    // Create payment attempt record
    await prisma.paymentAttempt.create({
      data: {
        invoiceId: invoice.id,
        status: retryResult.status === 'paid' ? 'SUCCEEDED' : 'PENDING',
        attemptedAt: new Date()
      }
    })
    
    return {
      success: retryResult.status === 'paid',
      status: retryResult.status,
      message: retryResult.status === 'paid' ? 'Payment successful' : 'Payment initiated'
    }
  } catch (error) {
    console.error('Error retrying invoice payment:', error)
    
    // Record the failed attempt
    try {
      await prisma.paymentAttempt.create({
        data: {
          invoiceId: id,
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          attemptedAt: new Date()
        }
      })
    } catch (e) {
      console.error('Error logging payment attempt:', e)
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to process payment: ' + (error instanceof Error ? error.message : 'Unknown error')
    })
  }
})