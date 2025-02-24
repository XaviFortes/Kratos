// server/api/invoices.get.js
import prisma from '../../lib/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'Authorization')
  const token = authHeader?.split(' ')[1]
  if (!token) throw createError({ statusCode: 401 })

  try {
    // Verify JWT
    const { user_id } = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.users.findUnique({ 
      where: { id: user_id },
      include: { invoices: true }
    })

    if (!user) throw createError({ statusCode: 401 })

    // Fetch invoices with related data
    const dbInvoices = await prisma.invoices.findMany({
      where: { user_id: user.id },
      include: {
        order: {
          include: {
            server: true,
            game: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // Fetch invoice details from Invoice Ninja
    const invoices = await Promise.all(
      dbInvoices.map(async (dbInvoice) => {
        try {
          const invoiceNinja = await $fetch(
            `https://invoice.inovexservices.com/api/v1/invoices/${dbInvoice.invoice_ninja_id}`,
            {
              headers: {
                'X-API-TOKEN': process.env.INVOICE_NINJA_TOKEN,
                'X-Requested-With': 'XMLHttpRequest'
              }
            }
          )

          return {
            id: dbInvoice.id,
            po_number: invoiceNinja.data.po_number,
            date: invoiceNinja.data.date,
            amount: parseFloat(invoiceNinja.data.amount),
            status: dbInvoice.status, // Use our database status
            game: dbInvoice.order?.game?.name || 'Unknown Game',
            line_items: invoiceNinja.data.line_items.map(item => ({
              product_key: item.product_key,
              cost: parseFloat(item.cost),
              notes: item.notes
            })),
            payment_url: invoiceNinja.data.invitations[0]?.link || '#',
            ninja_status: invoiceNinja.data.status_id
          }
        } catch (error) {
          console.error('Error fetching invoice from Ninja:', error)
          return {
            ...dbInvoice,
            error: 'Failed to load invoice details'
          }
        }
      })
    )

    // Filter out invalid invoices
    const validInvoices = invoices.filter(invoice => 
      !invoice.error && invoice.status !== 'failed'
    )

    return validInvoices
  } catch (error) {
    console.error('Invoice API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch invoices'
    })
  }
})