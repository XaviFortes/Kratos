import { H3Event, EventHandlerRequest } from "h3"
import { prisma } from "~/server/lib/prisma"

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session?.user) throw createError({ statusCode: 401 })

    return prisma.subscription.findFirst({
        where: { user_id: session.user.id },
        orderBy: { createdAt: 'desc' }
    })
})