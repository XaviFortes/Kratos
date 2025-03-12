import jwt from 'jsonwebtoken'
import { prisma } from '~/server/lib/prisma'
import { PterodactylService } from '~/server/services/pterodactyl'

export default defineEventHandler(async (event) => {
  // const body = await readBody(event)
  const authHeader = getHeader(event, 'Authorization')

  // Verify JWT
  const token = authHeader?.split(' ')[1]
  if (!token) throw createError({ statusCode: 401 })

    // Get the servers from the user
    if (!process.env.JWT_SECRET) throw createError({ statusCode: 500, message: 'JWT_SECRET is not defined' })
    const { user_id } = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload
    // console.log('User ID:', user_id)
    const servers = await prisma.servers.findMany({ where: { user_id } })
    // console.log('Servers:', servers)
    if (!servers) throw createError({ statusCode: 404, message: 'Servers not found' })
    
    // Call the Pterodactyl API to get the user's servers
    const pterodactyl = new PterodactylService()
    // For each server, get the server info
    const serverInfo = await Promise.all(servers.map(async server => {
        const serverData = await pterodactyl.getServerDetails(server.pterodactyl_server_id!)
        return serverData
    }))
    return serverInfo
    // const serverInfo = await pterodactyl.getServersFromUser(user.id)
    // return serverInfo
})