import { prisma } from '~/server/lib/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  try {
    // Find user (note: model name should match your Prisma schema)
    const user = await prisma.users.findUnique({
      where: { email: body.email }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Verify password (ensure field name matches your schema)
    const validPassword = await bcrypt.compare(body.password, user.password_hash)
    if (!validPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Generate JWT token
    const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        invoice_ninja_client_id: user.invoice_ninja_client_id
      },
      token
    }

  } catch (error) {
    console.error('Login error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Login failed'
    })
  }
})