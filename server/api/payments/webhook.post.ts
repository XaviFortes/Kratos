import prisma from "~/server/lib/prisma"
import crypto from 'crypto'
import { deployPterodactylServer } from "~/server/services/pterodactyl"

// server/api/payments/webhook.post.ts
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    
    // Verify webhook signature
    const signature = getHeader(event, 'X-InvoiceNinja-Signature')
    const secret = process.env.INVOICE_WEBHOOK_SECRET;
    if (!secret) {
      throw createError({ statusCode: 500, statusMessage: 'Webhook secret is not defined' });
    }
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex')
  
    if (signature !== computedSignature) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
    }
  
    // Handle payment success
    if (body.event_type === 'payment_success') {
      const invoiceId = body.invoice.id
      const userId = body.invoice.client_id
      
      // Retrieve deployment configuration
      const deploymentConfig = await prisma.invoices.findUnique({
        where: { invoice_ninja_id: invoiceId },
        include: { 
          user: true,
          game: {
            include: {
              pricingTiers: true,
              modifiers: true
            }
          },
          servers: true
        }
      });

      if (!deploymentConfig || !deploymentConfig.game) {
        throw createError({ 
          statusCode: 404, 
          statusMessage: 'Invoice or game config not found' 
        });
      }
  
      // Deploy server
      const serverDetails = await deployPterodactylServer({
        user: deploymentConfig.user,
        config: deploymentConfig.config,
        game: deploymentConfig.game
      })
  
      // Update database
    await prisma.servers.create({
        data: {
          user_id: deploymentConfig.user_id,
          game_type: deploymentConfig.game.slug,
          config: deploymentConfig.metadata?.config || {},
          pterodactyl_server_id: serverDetails.id,
          status: 'installing'
        }
    });
  
      // Send email notification
      await sendServerDeploymentEmail(
        deploymentConfig.user.email,
        serverDetails
      )
    }
  
    return { status: 'ok' }
  })