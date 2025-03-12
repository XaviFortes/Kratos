import { prisma } from '~/server/lib/prisma'
import { calculatePrice } from '~/server/services/pricingServices'
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
          name: user.company_name || user.first_name + ' ' + user.last_name,
          contacts: [
            {
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              phone: user.phone_number
            }
          ],
          private_notes: 'Created by Cloud Panel',
          contact: user.email,
          phone: user.phone,
          address1: user.street_address,
          address2: user.street_address2,
          city: user.city,
          state: user.state,
          postal_code: user.postal_code,
      }
      })

      // Update user with Invoice Ninja client ID
      // await 
      prisma.users.update({
        where: { id: user.id },
        data: { invoice_ninja_client_id: client.data.id }
      })
    }

    // Show items
    // console.log('Items:', body.line_items)

    console.log('Body:', body)

    const { total, lineItems } = await calculatePrice(body.gameSlug, body.config)

    console.log('Calculated cost:', total)

    // Temp end
    // return

    // Generate a Project Order Number (PO-XXXXX)
    const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;

    // Get game details
    const game = await prisma.game.findUnique({
      where: { slug: body.gameSlug },
      select: { id: true }
    });

    if (!game) throw createError({ statusCode: 404, message: 'Game not found' });

    // Create server first (if not already existing)
    // const server = await prisma.servers.create({
      // data: {
        // user_id: user.id,
        // game_type: body.gameSlug,
        // config: body.config,
        // status: 'pending',
        // pterodactyl_server_id: null
      // }
    // });

    // Create Invoice Ninja invoice
    const recurringInvoice = await $fetch('https://invoice.inovexservices.com/api/v1/recurring_invoices', {
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
        po_number: poNumber,
        line_items: lineItems.map(item => ({
          product_key: item.product_key,
          notes: item.notes,
          cost: item.cost.toFixed(2),
          quantity: 1, // All items are quantity 1
          tax_name1: "VAT",
          tax_rate1: 0
        })),  
        terms: "Payment due within 7 days",
        footer: "Thank you for your business!",
        frequency_id: 5, // Monthly. 1- Daily 2- Weekly 3- Bi-weekly 4- Four-weekly 5- Monthly 6- Two-monthly 7- Quarterly 8- Four-monthly 9- Six-monthly 10- Annually
        remaining_cycles: -1, // Infinite
        partial: 0,
        auto_bill: "Always",
        auto_bill_enabled: true,

      }
    })

    // Create project order
    const order = await prisma.order.create({
      data: {
        users: {
          connect: {
            id: user.id
          }
        },
        // server_id: server.id,
        // game_id: game.id,
        po_number: poNumber,
        recurring_id: recurringInvoice.data.id,
        billing_cycle: 'MONTHLY',
        status: 'ACTIVE'
      }
    });

    // Action start recurring invoice
    const startInvoice = await $fetch(`https://invoice.inovexservices.com/api/v1/recurring_invoices/bulk`, {
      method: 'POST',
      headers: {
        'X-API-TOKEN': process.env.INVOICE_NINJA_TOKEN,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      body: {
        action: 'send_now',
        ids: [recurringInvoice.data.id]
      }
    })

    console.log('Invoice Start:', startInvoice)

    const invoice = await $fetch(`https://invoice.inovexservices.com/api/v1/invoices?client_id=${user.invoice_ninja_client_id}`, {
      method: 'GET',
      headers: {
        'X-API-TOKEN': process.env.INVOICE_NINJA_TOKEN,
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    // Get the latest invoice from the user that contains the "PO"
    const latestInvoice = invoice.data.filter(inv => inv.po_number === poNumber).sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    console.log('Latest Invoice:', latestInvoice)

    // Save invoice to database
    const dbInvoice = await prisma.invoices.create({
      data: {
        user_id: user.id,
        invoice_ninja_id: latestInvoice.id,
        order_id: order.id,
        amount: recurringInvoice.data.amount,
        status: 'pending',
        metadata: {
          game_slug: body.gameSlug,
          server_specs: body.config,
        }
      }
    })

    return {
      payment_url: latestInvoice.invitations[0].link,
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