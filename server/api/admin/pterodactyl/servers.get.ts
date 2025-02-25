import prisma from "~/server/lib/prisma";
import { requireAdminUser } from "~/server/utils/adminAuth";

// server/api/admin/pterodactyl/servers.get.ts
export default defineEventHandler(async (event) => {
    // await requireAdminUser(event);
    
    const servers = await prisma.servers.findMany({
      include: {
        users: true,
        // games: true
      }
    });
  
    return servers.map(server => ({
      id: server.id,
      // name: server.name,
      status: server.status,
      memory: (server.config as any).ram,
      cpu: (server.config as any).cpu,
      disk: (server.config as any).disk,
      user: server.user_id,
      game: server.game_type
    }));
  });