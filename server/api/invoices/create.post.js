import prisma from '../../lib/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const authHeader = getHeader(event, 'Authorization')

  // Verify JWT
  const token = authHeader?.split(' ')[1]
  if (!token) throw createError({ statusCode: 401 })

  try {
    // Get user from token
    const { user_id } = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.users.findUnique({ where: { id: user_id } })

    if (!user) throw createError({ statusCode: 401 })

    const clientExists = await $fetch(`https://invoice.inovexservices.com/api/v1/clients/${user.invoice_ninja_client_id}`, {
      method: 'GET',
      headers: {
        'X-API-TOKEN': process.env.INVOICE_NINJA_TOKEN,
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    if (!clientExists) {
      // Create Invoice Ninja client
      const client = await $fetch('https://invoice.inovexservices.com/api/v1/clients', {
        method: 'POST',
        headers: {
          'X-API-TOKEN': process.env.INVOICE_NINJA_TOKEN,
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json'
        },
        body: {
          name: user.name,
          contact: user.email
        }
      })

      // Update user with Invoice Ninja client ID
      await prisma.users.update({
        where: { id: user.id },
        data: { invoice_ninja_client_id: client.data.id }
      })
    }

    // Show items
    console.log('Items:', body.line_items)

    // Create Invoice Ninja invoice
    const invoice = await $fetch('https://invoice.inovexservices.com/api/v1/invoices', {
      method: 'POST',
      headers: {
        'X-API-TOKEN': process.env.INVOICE_NINJA_TOKEN,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      body: {
        client_id: user.invoice_ninja_client_id,
        date: new Date().toISOString().split('T')[0], // Required field
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          .toISOString()
          .split('T')[0],
        line_items: body.line_items.map(item => ({
          product_key: item.product_key,
          notes: item.notes,
          cost: item.cost,
          quantity: item.quantity,
          tax_name1: "VAT", // Add if needed
          tax_rate1: 0 // Add tax rate if applicable
        })),
        terms: "Payment due within 7 days",
        footer: "Thank you for your business!",
        partial: 0,
        auto_bill: true

      }
    })

    // Save invoice to database
    const dbInvoice = await prisma.invoices.create({
      data: {
        user_id: user.id,
        invoice_ninja_id: invoice.data.id,
        amount: invoice.data.amount,
        status: 'pending'
      }
    })

    return {
      payment_url: invoice.data.invitations[0].link,
      invoice_id: dbInvoice.id
    }

  } catch (error) {
    console.error('Invoice creation error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Invoice creation failed'
    })
  }
})