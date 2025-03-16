// services/NodeSelector.ts
import { prisma } from "~/server/lib/prisma"

interface HostRequirements {
  cpu: number // 100 = 1 core
  memory: number // MB
  disk: number   // MB
  location: string
}

export class NodeSelector {
  async findOptimalHost(requirements: HostRequirements): Promise<string | null> {
    const viableHosts = await prisma.host.findMany({
      where: {
        dataCenter: { name: requirements.location },
        status: 'AVAILABLE',
        spec: {
          path: ['cpu'],
          gte: requirements.cpu
        }
      },
      include: { dataCenter: true }
    });

    const scoredHosts = viableHosts.map(host => ({
      host,
      score: this.calculateHostScore(host, requirements)
    })).filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    return scoredHosts[0]?.host.id || null;
  }

  private calculateHostScore(host: any, req: HostRequirements): number {
    const spec = host.spec as Record<string, number>;
    const availableMemory = spec.memory - (host.allocatedMemory || 0);
    const availableDisk = spec.disk - (host.allocatedDisk || 0);

    return Math.min(
      availableMemory - req.memory,
      availableDisk - req.disk,
      spec.cpu - req.cpu
    );
  }
}