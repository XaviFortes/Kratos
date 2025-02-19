export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Verify webhook signature if needed
    if (body.event === 'invoice_paid') {
        // Update invoice status in DB
        await prisma.invoice.update({
            where: { ninjaInvoiceId: body.invoice.id },
            data: { status: 'paid' }
        })

        // Provision server
        const userId = await getUserIdFromInvoice(body.invoice.id)
        const cart = await getCartFromInvoice(body.invoice.id)

        await provisionServer(userId, cart)
    }

    return { status: 'received' }
})

async function provisionServer(userId, cart) {
    // Implement your server provisioning logic here
    // Use Pterodactyl API to create the server
    console.log('Provisioning server for user', userId)
}