import jwt from 'jsonwebtoken'
import { prisma } from '~/server/lib/prisma'

export default defineNuxtRouteMiddleware((to) => {
  // console.log('Auth middleware executing for path:', event.path)
  // console.log('Event:', event)
  const authToken = useCookie('authToken')
  console.log('Auth token:', authToken)

  if (!authToken) return

  try {
    // const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as unknown as JwtPayload
    // const user = prisma.users.findUnique({
      // where: { id: decoded.userId },
      // select: {
        // id: true,
        // email: true,
        // first_name: true,
        // last_name: true,
        // is_admin: true,
        // stripe_customer_id: true,
        // invoice_ninja_client_id: true
      // }
    // })
// 
    // console.log('User in context:', event.context.user)
// 
    // if (user) {
      // event.context.user = {
        // id: user.id,
        // email: user.email,
        // firstName: user.first_name,
        // lastName: user.last_name,
        // isAdmin: user.is_admin,
        // stripeCustomerId: user.stripe_customer_id,
        // invoiceNinjaClientId: user.invoice_ninja_client_id
      // }
    // }
  } catch (error) {
    console.error('Auth middleware error:', error)
    // deleteCookie(event, 'authToken')
  }
})