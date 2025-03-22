import { prisma } from "~/server/lib/prisma"

// server/utils/serverMonitor.ts
export async function checkServerInstallation() {
  const config = useRuntimeConfig()
    const installingServers = await prisma.servers.findMany({
      where: { status: 'installing' }
    })
  
    for (const server of installingServers) {
      const serverStatus = await $fetch(
        `${process.env.PTERODACTYL_URL}/api/application/servers/${server.pterodactyl_server_id}`,
        {
          headers: {
            Authorization: `Bearer ${config.pterodactylApiKey}`
          }
        }
      )
        /*
      if (serverStatus.attributes.status === 'running') {
        await prisma.server.update({
          where: { id: server.id },
          data: { status: 'installed' }
        })
        
        await sendServerReadyEmail(server.user_id, {
          ip: serverStatus.attributes.allocation.ip,
          port: serverStatus.attributes.allocation.port
        })
      }
      */
    }
  }
  
  // Run every 5 minutes
  setInterval(checkServerInstallation, 300000)