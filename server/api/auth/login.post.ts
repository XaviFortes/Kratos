import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '~/server/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event)

  const user = await prisma.users.findUnique({
    where: { email: body.email },
    select: {
      id: true,
      email: true,
      password_hash: true,
      first_name: true,
      last_name: true,
      is_admin: true,
      stripe_customer_id: true,
      invoice_ninja_client_id: true
    }
  })

  if (!user || !(await bcrypt.compare(body.password, user.password_hash))) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  const token = jwt.sign(
    { userId: user.id, isAdmin: user.is_admin },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  setCookie(event, 'authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 604800 // 7 days
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isAdmin: user.is_admin,
      stripeCustomerId: user.stripe_customer_id,
      invoiceNinjaClientId: user.invoice_ninja_client_id
    }
  }
})