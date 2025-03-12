import { prisma } from "~/server/lib/prisma"
import StripeService from "~/server/services/stripeService"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const stripe = new StripeService()

    const user = event.context.user
    if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
        const customer = await stripe.createCustomer(user.email, `${user.firstName} ${user.lastName}`)
        await prisma.users.update({
            where: { id: user.id },
            data: { stripe_customer_id: customer.id }
        })
        customerId = customer.id
    }


    // Create subscription
    const subscription = await stripe.createSubscription(customerId, body.priceId)
    if (!subscription) throw createError({ statusCode: 400, message: 'Failed to create subscription' })
    console.log(subscription)
    

    // Create invoice
    await prisma.invoices.create({
        data: {
            user_id: { connect: { id: user.id } },
            amount: subscription.latest_invoice?.amount_due / 100,
            status: 'created',
            stripeId: subscription.latest_invoice.id,
            items: body.config,
            subscription: {
                create: {
                    stripeSubscription: subscription.id,
                    status: subscription.status,
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    user: { connect: { id: session.user.id } }
                }
            }
        }
    })

    return { url: subscription.latest_invoice.payment_intent.client_secret }
})