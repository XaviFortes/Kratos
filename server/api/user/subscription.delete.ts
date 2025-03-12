import { H3Event, EventHandlerRequest } from "h3"
import { prisma } from "~/server/lib/prisma"
import StripeService from "~/server/services/stripeService"

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session?.user) throw createError({ statusCode: 401 })

    const stripe = new StripeService()
    const subscription = await prisma.Subscription.findFirst({
        where: { userId: session.user.id }
    })

    if (subscription) {
        await stripe.cancelSubscription(subscription.stripeSubscription)
        return { success: true }
    }

    throw createError({ statusCode: 404, message: 'No subscription found' })
})

function getServerSession(event: H3Event<EventHandlerRequest>) {
    throw new Error("Function not implemented.")
}
