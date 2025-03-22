import { getServerSession } from '#auth'
import { prisma } from '~/server/lib/prisma'
import { PterodactylService } from '~/server/services/pterodactyl.service'

export default defineEventHandler(async (event) => {
  // Get authenticated user
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, pteroUserId: true }
  })
  
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }
  
  // If user has no pterodactyl_user_id, they don't have any servers yet
  if (!user.pteroUserId) {
    return []
  }
  
  // Get servers from Pterodactyl
  try {
    const pterodactyl = new PterodactylService()
    const servers = await pterodactyl.getServersFromUser(user.pteroUserId)
    return servers
  } catch (error) {
    console.error('Error fetching pterodactyl servers:', error)
    throw createError({ 
      statusCode: 500, 
      message: 'Failed to get servers from Pterodactyl' 
    })
  }
})