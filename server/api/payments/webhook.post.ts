import prisma from "~/server/lib/prisma"
import crypto from 'crypto'
import { ServerCreateParams } from "~/types/pterodactyl"
import { PterodactylService } from "~/server/services/pterodactyl"
// import { deployPterodactylServer } from "~/server/services/pterodactyl"

// server/api/payments/webhook.post.ts
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const pterodactyl = new PterodactylService()

    console.log('Current time:', new Date().toISOString())
    console.log('Webhook received:', body)
    
    // Verify webhook signature
    const signature = getHeader(event, 'X-SupahSecret')
    console.log('Signature received:', signature)
    const secret = process.env.INVOICE_WEBHOOK_SECRET;
    if (!secret) {
      throw createError({ statusCode: 500, statusMessage: 'Webhook secret is not defined' });
    }
    if (signature !== secret) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
    }
    console.log('Signature verified')

    // Get the invoice from the post body
    const invoiceId = body.invoices[0].id
    const userId = body.invoices[0].user_id
    // Compare against the invoice in the database
    const invoice = await prisma.invoices.findUnique({
      where: { invoice_ninja_id: invoiceId },
        include: {
            users: true,
            }
    });
    if (!invoice) {
      throw createError({ statusCode: 404, statusMessage: 'Invoice not found' });
    }
    console.log('Invoice found:', invoice)

    // Update the invoice status
    await prisma.invoices.update({
        where: { invoice_ninja_id: invoiceId },
        data: { status: 'paid' }
    });
    console.log('Invoice updated')

    // Get the updated invoice from the database
    const updatedInvoice = await prisma.invoices.findUnique({
        where: { invoice_ninja_id: invoiceId },
        include: {
            users: true,
            order: true,
        }
    });

    if (!updatedInvoice) {
        throw createError({ statusCode: 404, statusMessage: 'Invoice not found' });
    }

    console.log('Updated invoice:', updatedInvoice);
    // get the jsonb config from the invoice
    const config = updatedInvoice.metadata;
    console.log('Config found:', config);

    // Convert the config to ServerCreateParams
    const serverParams = await createServerParams(updatedInvoice);
    console.log('Server params:', serverParams);

    pterodactyl.createServer(updatedInvoice.users, serverParams);



    
  
    // // Handle payment success
    // if (body.event_type === 'payment_success') {
    //   const invoiceId = body.invoice.id
    //   const userId = body.invoice.client_id
      
    //   // Retrieve deployment configuration
    //   const deploymentConfig = await prisma.invoices.findUnique({
    //     where: { invoice_ninja_id: invoiceId },
    //     include: { 
    //       user: true,
    //       game: {
    //         include: {
    //           pricingTiers: true,
    //           modifiers: true
    //         }
    //       },
    //       servers: true
    //     }
    //   });

    //   if (!deploymentConfig || !deploymentConfig.game) {
    //     throw createError({ 
    //       statusCode: 404, 
    //       statusMessage: 'Invoice or game config not found' 
    //     });
    //   }
  
    //   // Deploy server
    //   const serverDetails = await deployPterodactylServer({
    //     user: deploymentConfig.user,
    //     config: deploymentConfig.config,
    //     game: deploymentConfig.game
    //   })
  
    //   // Update database
    // await prisma.servers.create({
    //     data: {
    //       user_id: deploymentConfig.user_id,
    //       game_type: deploymentConfig.game.slug,
    //       config: deploymentConfig.metadata?.config || {},
    //       pterodactyl_server_id: serverDetails.id,
    //       status: 'installing'
    //     }
    // });
  
      // Send email notification
    //   await sendServerDeploymentEmail(
    //     deploymentConfig.user.email,
    //     serverDetails
    //   )
    // }
  
    return { status: 'ok' }
})

// Create async function to convert to ServerCreateParams type
async function createServerParams(config: any): Promise<ServerCreateParams> {
    if (!config) {
      throw createError({ statusCode: 404, statusMessage: 'Config not found' });
    }
    if (!config.metadata) {
      throw createError({ statusCode: 404, statusMessage: 'Metadata not found' });
    }
    // convert config.metadata to json
    const metadata = config.metadata;
    console.log('Metadata:', metadata);
    console.log('RAM:', metadata.server_specs.ram);
    console.log('CPU:', metadata.server_specs.cpu);
    console.log('Storage:', metadata.server_specs.storage);
    console.log('Server type:', metadata.server_specs.server_type);
    const nest = metadata.game_slug === 'minecraft' ? 1 : 2;
    return {
      servername: config.order.po_number,
      location: metadata.location || 1,
      nest: nest,
      egg: metadata.server_specs.server_type,
      cpu: Number(metadata.server_specs.cpu) * 100,
      memory: Number(metadata.server_specs.ram) * 1000,
      swap: metadata.server_specs.swap || 1024,
      disk: Number(metadata.server_specs.storage) * 1000,
      io: Number(metadata.server_specs.io) || 500,
      databases: metadata.server_specs.databases || 1,
      backups: metadata.server_specs.backups || 2,
      allocation_limit: metadata.server_specs.allocation || 1,
      allocation: {
        default: 1,
      }
    }
}