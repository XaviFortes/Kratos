// api/auth/validate.ts
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    const token = getHeader(event, 'Authorization')?.split(' ')[1]

    if (!token) {
        throw createError({ statusCode: 401, message: 'No token provided' })
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw createError({ statusCode: 500, message: 'JWT secret is not defined' });
        }
        const decoded = jwt.verify(token, secret) as jwt.JwtPayload
        return { valid: true, user: decoded.user }
    } catch (error) {
        throw createError({ statusCode: 401, message: 'Invalid token' })
    }
})