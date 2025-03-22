import { prisma } from "~/server/lib/prisma"
import { ServiceType, Service } from "@prisma/client"
import { NodeSelector } from "../NodeSelector"
import { PterodactylService } from "~/server/services/pterodactyl.service"

interface ProvisioningParams {
  userId: string
  serviceType: ServiceType
  configuration: {
    gameType?: string
    slots?: number
    ram: number
    cpu: number
    disk: number
    location?: string
    dedicatedIp?: boolean
  }
}

export class ProvisioningService {
  private nodeSelector = new NodeSelector();
  private pterodactyl = new PterodactylService();

  async provisionService(params: ProvisioningParams): Promise<Service> {
    console.log('Provisioning service:', params);
    
    // 1. Validate resources
    const resourceRequirements = {
      cpu: params.configuration.cpu * 100, // Convert cores to % (100% per core)
      memory: params.configuration.ram * 1024, // Convert GB to MB
      disk: params.configuration.disk * 1024, // Convert GB to MB
      location: params.configuration.location || 'eu'
    };

    console.log('Resource requirements:', resourceRequirements);

    try {
      // 2. Find suitable host
      const host = await this.nodeSelector.findOptimalHost(resourceRequirements);
      
      if (!host) {
        console.error('No available hosts matching requirements');
        throw new Error('No available hosts matching requirements');
      }

      // 3. If game server, handle with Pterodactyl
      if (params.serviceType === 'GAME_SERVER') {
        return this.provisionGameServer(params, host);
      } else {
        // 4. For other service types
        return this.provisionGenericService(params, host);
      }
    } catch (error) {
      console.error('Provisioning error:', error);
      throw new Error(`Service provisioning failed: ${error.message}`);
    }
  }

  private async provisionGameServer(params: ProvisioningParams, hostId: string): Promise<Service> {
    try {
      // 1. Get user
      const user = await prisma.user.findUnique({
        where: { id: params.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // 2. Set up game-specific configuration
      const gameConfig = this.getGameSpecificConfig(params.configuration);
      
      // 3. Create server using Pterodactyl service
      const serverConfig = {
        memory: params.configuration.ram * 1024,
        disk: params.configuration.disk * 1024,
        cpu: params.configuration.cpu * 100,
        nest: this.getNestIdForGame(params.configuration.gameType),
        egg: this.getEggIdForGame(params.configuration.gameType),
        location: params.configuration.location || 'eu',
        servername: `${params.configuration.gameType}-${Date.now().toString().substring(7)}`,
        ...gameConfig
      };
      
      // 4. Use Pterodactyl service to create the server
      const service = await this.pterodactyl.createServer(user, serverConfig);
      
      // 5. Update host status
      await prisma.host.update({
        where: { id: hostId },
        data: { 
          status: 'ALLOCATED',
        }
      });

      // 6. Create service tracking record for monitoring
      await prisma.serviceDeployment.create({
        data: {
          serviceId: service.id,
          status: 'PENDING',
          logs: ['Server provisioning started']
        }
      });
      
      return service;
    } catch (error) {
      console.error('Game server provisioning error:', error);
      throw error;
    }
  }

  private async provisionGenericService(params: ProvisioningParams, hostId: string): Promise<Service> {
    // Create the service record
    const service = await prisma.service.create({
      data: {
        type: params.serviceType,
        userId: params.userId,
        hostId: hostId,
        config: this.buildServiceConfig(params),
      },
    });

    // Update host status
    await prisma.host.update({
      where: { id: hostId },
      data: { status: 'ALLOCATED' }
    });

    return service;
  }

  private getGameSpecificConfig(config: any): any {
    const gameType = config.gameType?.toLowerCase();
    
    switch (gameType) {
      case 'minecraft':
        return {
          environment: {
            SERVER_JARFILE: 'server.jar',
            MINECRAFT_VERSION: config.version || 'latest',
            MEMORY: `${config.ram}G`,
            DIFFICULTY: 'normal',
            MAX_PLAYERS: config.slots || 20,
          }
        };
      case 'project_zomboid':
        return {
          environment: {
            ADMIN_PASSWORD: 'kratos_host',
            SERVER_MEMORY: `${config.ram}G`,
            PLAYERS: config.slots || 16,
            MOD_IDS: '',
            SERVER_PORT: 16261,
            RCON_PORT: 27015,
          }
        };
      case 'rust':
        return {
          environment: {
            MAX_PLAYERS: config.slots || 50,
            SERVER_LEVEL: 'Procedural Map',
            SERVER_MAP: 'Procedural Map',
            WORLD_SIZE: '3500',
            SEED: Math.floor(Math.random() * 100000).toString(),
          }
        };
      case 'valheim':
        return {
          environment: {
            SERVER_NAME: `Valheim Server ${Date.now().toString().substring(7)}`,
            WORLD_NAME: 'valheim_world',
            PASSWORD: 'change_me',
            PUBLIC: '1',
          }
        };
      default:
        return {};
    }
  }

  private getNestIdForGame(gameType: string): number {
    // Placeholder - replace with your actual nest IDs from Pterodactyl
    const gameNests = {
      'minecraft': 1,
      'project_zomboid': 2,
      'rust': 3,
      'valheim': 4,
    };

    return gameNests[gameType?.toLowerCase() as keyof typeof gameNests] || 1;
  }

  private getEggIdForGame(gameType: string): number {
    // Placeholder - replace with your actual egg IDs from Pterodactyl
    const gameEggs = {
      'minecraft': 1,
      'project_zomboid': 16,
      'rust': 2,
      'valheim': 15,
    };

    return gameEggs[gameType?.toLowerCase() as keyof typeof gameEggs] || 1;
  }

  private buildServiceConfig(params: ProvisioningParams) {
    switch (params.serviceType) {
      case 'GAME_SERVER':
        return {
          gameType: params.configuration.gameType,
          slots: params.configuration.slots,
          ram: params.configuration.ram,
          cpu: params.configuration.cpu,
          disk: params.configuration.disk
        };
      case 'VPS':
        return {
          os: 'ubuntu',
          ram: params.configuration.ram,
          cpu: params.configuration.cpu,
          disk: params.configuration.disk
        };
      default:
        return params.configuration;
    }
  }

  private async generateNetworkConfig() {
    // Implementation depends on your network management
    return {
      ipv4: await this.allocateIPv4Address(),
      ports: { tcp: [25565] }
    };
  }

  private async allocateIPv4Address(): Promise<string> {
    // This is a placeholder - implement your IP allocation strategy
    return '192.168.1.1';
  }
}