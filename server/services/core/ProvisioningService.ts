// server/services/core/ProvisioningService.ts
import { prisma } from "~/server/lib/prisma"
import type { ServiceType } from "@prisma/client" // Add import
import { NodeSelector } from "../NodeSelector"

interface ProvisioningParams {
  userId: string
  serviceType: ServiceType
  configuration: {
    gameType?: string
    slots?: number
    memory: number
    disk: number
    location: string
  }
}

export class ProvisioningService {
  private nodeSelector = new NodeSelector();

  async provisionService(params: {
    userId: string
    serviceType: ServiceType
    configuration: any
  }) {
    // 1. Validate resources
    const resourceRequirements = {
      memory: params.configuration.memory,
      disk: params.configuration.disk,
      location: params.configuration.location
    };

    // 2. Find suitable host
    const host = await this.nodeSelector.findOptimalHost(resourceRequirements);
    
    if (!host) {
      throw new Error('No available hosts matching requirements');
    }

    // 3. Create service record
    const service = await prisma.service.create({
      data: {
        type: params.serviceType,
        userId: params.userId,
        hostId: host.id,
        config: this.buildServiceConfig(params),
        networkConfig: {
          create: await this.generateNetworkConfig()
        }
      },
      include: { networkConfig: true }
    });

    // 4. Update host status
    await prisma.host.update({
      where: { id: host.id },
      data: { 
        status: 'ALLOCATED',
        allocatedAt: new Date()
      }
    });

    return service;
  }

  private buildServiceConfig(params: ProvisioningParams) {
    switch (params.serviceType) {
      case 'GAME_SERVER':
        return {
          game: params.configuration.gameType,
          slots: params.configuration.slots,
          memory: params.configuration.memory,
          disk: params.configuration.disk
        };
      case 'VPS':
        return {
          os: 'ubuntu',
          cpu: 2,
          memory: params.configuration.memory,
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
}