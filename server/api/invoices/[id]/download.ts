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
    
    // Get invoice from Stripe
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoiceId)
    
    // Return download URL
    return {
      url: stripeInvoice.invoice_pdf,
      success: true
    }
  } catch (error) {
    console.error('Error getting invoice download URL:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get invoice download URL'
    })
  }
})