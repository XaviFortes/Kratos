import { stripe } from '../services/stripeService'
import { prisma } from '../lib/prisma'
import { InvoiceStatus } from '@prisma/client'

export async function syncRecentInvoices() {
  console.log('Running scheduled invoice sync')
  
  try {
    // Get all subscription IDs from our database
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: { in: ['active', 'trialing'] }
      },
      select: {
        stripeSubscriptionId: true,
        orderId: true,
        userId: true
      }
    })
    
    // Get recent invoices for each subscription
    for (const subscription of subscriptions) {
      try {
        // Get invoices from the last 30 days
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)
        
        const invoices = await stripe.invoices.list({
          subscription: subscription.stripeSubscriptionId,
          created: { gte: thirtyDaysAgo }
        })
        
        // Process each invoice
        // Process each invoice
        for (const invoice of invoices.data) {
          // Convert status from Stripe format to our format
          const statusMap: Record<string, InvoiceStatus> = {
            'draft': InvoiceStatus.CREATED,
            'open': InvoiceStatus.PENDING,
            'paid': InvoiceStatus.PAID,
            'uncollectible': InvoiceStatus.FAILED,
            'void': InvoiceStatus.VOID
          }
          
        //   type StripeInvoiceStatus = keyof typeof statusMap
          type StripeInvoiceStatus = keyof typeof statusMap
          
          // Upsert the invoice in our database
          await prisma.invoice.upsert({
            where: { 
              stripeInvoiceId: invoice.id 
            },
            update: {
              status: statusMap[invoice.status as StripeInvoiceStatus] || InvoiceStatus.PENDING,
              periodStart: new Date(invoice.period_start * 1000),
              periodEnd: new Date(invoice.period_end * 1000),
              paidAt: invoice.status === 'paid' ? new Date(invoice.created * 1000) : null
            },
            create: {
              stripeInvoiceId: invoice.id,
              orderId: subscription.orderId,
              userId: subscription.userId,
              amount: invoice.amount_due / 100,
              status: statusMap[invoice.status as StripeInvoiceStatus] || 'PENDING',
              periodStart: new Date(invoice.period_start * 1000),
              periodEnd: new Date(invoice.period_end * 1000),
              paidAt: invoice.status === 'paid' ? new Date(invoice.created * 1000) : null
            }
          })
          
          console.log(`Synced invoice ${invoice.id} for subscription ${subscription.stripeSubscriptionId}`)
        }
      } catch (error) {
        console.error(`Error syncing invoices for subscription ${subscription.stripeSubscriptionId}:`, error)
      }
    }
    
    console.log('Invoice sync completed')
  } catch (error) {
    console.error('Error in invoice sync job:', error)
  }
}

// Register cron jobs
export function registerCronJobs() {
  // Run invoice sync every day at 3am
  const cronSchedule = process.env.INVOICE_SYNC_SCHEDULE || '0 3 * * *'
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`Registering invoice sync cron job with schedule: ${cronSchedule}`)
    
    setInterval(() => {
      // Check if it's time to run the cron job
      const now = new Date()
      const hour = now.getHours()
      const minute = now.getMinutes()
      
      if (hour === 3 && minute === 0) {
        syncRecentInvoices()
      }
    }, 60 * 1000) // Check every minute
  }
}