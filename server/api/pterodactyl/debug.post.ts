// server/api/pterodactyl/debug.post.ts
import { prisma } from '~/server/lib/prisma'
import { PterodactylService } from '../../services/pterodactyl'
import jwt from 'jsonwebtoken'


export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const pterodactyl = new PterodactylService()
    const authHeader = getHeader(event, 'Authorization')
    const token = authHeader?.split(' ')[1]
    // if (!token) throw createError({ statusCode: 401 })

    const secret = process.env.JWT_SECRET;
    // if (!secret) {
        // throw createError({ statusCode: 500, message: 'JWT secret is not defined' });
    // }

    // Get user from token
    // const { user_id } = jwt.verify(token, secret) as jwt.JwtPayload
    // const user = await prisma.users.findUnique({ where: { id: user_id } })

    // if (!user) throw createError({ statusCode: 401 })

    try {
        let result
        switch (body.action) {
            case 'create-user':
                console.log('Creating user:', body.user)
                result = await pterodactyl.findOrCreateUser(body.user)
                break
            case 'create-server':
                result = await pterodactyl.createServer(body.user, body.config)
                break
            case 'get-egg':
                result = await pterodactyl.getEggData(body.nestId, body.eggId)
                break
            default:
                throw new Error('Invalid test action')
        }

        return { success: true, result }
    } catch (error) {
        console.error('Pterodactyl Debug Error:', error)
        return {
            success: false,
            error: (error as Error).message,
            stack: (error as Error).stack,
            requestData: body
        }
    }
})