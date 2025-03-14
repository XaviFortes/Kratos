// ~/server/api/user/[id]/index.get.ts
import { prisma } from "~/server/lib/prisma"
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  
  // Verify user is accessing their own profile
  const session = await getServerSession(event as any)
  if (session?.user?.id !== userId) {
    throw createError({ statusCode: 403, message: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      streetAddress: true,
      streetAddress2: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      companyName: true,
      taxId: true
    }
  })

  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  return user
})