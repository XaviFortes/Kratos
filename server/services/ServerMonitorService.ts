import { prisma } from "~/server/lib/prisma"
import { PterodactylService } from "./pterodactyl.service"
import { StripeService } from "./stripeService"

export class ServerMonitorService {
  private pterodactylService = new PterodactylService()
  private stripeService = new StripeService()
  
  // Check and update pending server deployments
  async checkPendingDeployments() {
    try {
      const pendingDeployments = await prisma.serviceDeployment.findMany({
        where: { status: 'PENDING' },
        include: { service: true },
        orderBy: { createdAt: 'asc' }
      })
      
      console.log(`Found ${pendingDeployments.length} pending deployments`)
      
      for (const deployment of pendingDeployments) {
        try {
          // Get Pterodactyl server ID from service config
          const pterodactylServerId = (deployment.service?.config as { pterodactylServerId?: string })?.pterodactylServerId
          
          if (!pterodactylServerId) {
            console.error(`No pterodactylServerId found for service ${deployment.serviceId}`)
            continue
          }
          
          // Check server status in Pterodactyl
          const serverDetails = await this.pterodactylService.getServerDetails(pterodactylServerId)
          
          if (serverDetails.status === 'installing') {
            // Still installing
            await this.updateDeploymentLog(deployment.id, 'Server installation in progress')
          } else if (serverDetails.status === 'install_failed') {
            // Installation failed
            await prisma.serviceDeployment.update({
              where: { id: deployment.id },
              data: { 
                status: 'FAILED',
                logs: [...(deployment.logs || []), 'Server installation failed']
              }
            })
            
            // Notify admin about failure
            // Implement notification logic
          } else if (serverDetails.status === 'installed') {
            // Server is ready
            await prisma.serviceDeployment.update({
              where: { id: deployment.id },
              data: { 
                status: 'COMPLETED',
                logs: [...(deployment.logs || []), 'Server successfully installed'],
                completedAt: new Date()
              }
            })
            
            // Update service status
            await prisma.service.update({
              where: { id: deployment.serviceId },
              data: { status: 'ACTIVE' }
            })
            
            // Send notification to user
            await this.sendServerReadyNotification(deployment.service.userId, serverDetails)
          }
          
        } catch (error) {
          console.error(`Error processing deployment ${deployment.id}:`, error)
          const errorMessage = error instanceof Error ? error.message : String(error)
          await this.updateDeploymentLog(deployment.id, `Error: ${errorMessage}`)
        }
      }
    } catch (error) {
      console.error('Error checking pending deployments:', error)
    }
  }
  
  private async updateDeploymentLog(deploymentId: string, message: string) {
    const deployment = await prisma.serviceDeployment.findUnique({
      where: { id: deploymentId }
    })
    
    if (!deployment) return
    
    await prisma.serviceDeployment.update({
      where: { id: deploymentId },
      data: {
        logs: [...(deployment.logs || []), message]
      }
    })
  }
  
  private async sendServerReadyNotification(userId: string, serverDetails: any) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      })
      
      if (!user?.email) return
      
      // Implement email notification
      console.log(`Server ready notification would be sent to ${user.email}`)
      
      // Here you would call your email service
      // await emailService.sendMail({...})
      
    } catch (error) {
      console.error('Error sending server ready notification:', error)
    }
  }
  
  // Start monitoring
  startMonitoring() {
    // Check every minute
    setInterval(() => this.checkPendingDeployments(), 60000)
    console.log('Server monitor service started')
    // Run immediately on start
    this.checkPendingDeployments()
  }
}