// services/NodeSelector.ts
import type { Node, ServerRequirements, NodeSelectionResult } from '@/types/pterodactyl';

export class NodeSelector {
    private nodeCache: Node[] = [];
    private lastFetch: number = 0;
  
    constructor(private apiUrl: string, private apiKey: string) {}
  
    async findOptimalNode(locationId: number, requirements: ServerRequirements): Promise<number | null> {
      await this.refreshNodes();
      
      const viableNodes = this.nodeCache
        .filter(node => 
          node.attributes.location_id === locationId &&
          !node.attributes.maintenance_mode
        )
        .map(node => ({
          node,
          score: this.calculateNodeScore(node, requirements)
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score);
  
      return viableNodes[0]?.node.id || null;
    }
  
    private calculateNodeScore(node: Node, req: ServerRequirements): number {
      const unlimitedResources = 
        node.attributes.memory_overallocate === -1 && 
        node.attributes.disk_overallocate === -1;
  
      if (unlimitedResources) return Infinity;
  
      const availableMemory = this.calculateAvailableResource(
        node.attributes.memory,
        node.attributes.memory_overallocate,
        node.attributes.allocated_resources.memory,
        req.memory
      );
  
      const availableDisk = this.calculateAvailableResource(
        node.attributes.disk,
        node.attributes.disk_overallocate,
        node.attributes.allocated_resources.disk,
        req.disk
      );
  
      if (availableMemory < 0 || availableDisk < 0) return 0;
  
      // Prioritize nodes with more resources and lower utilization
      return (availableMemory + availableDisk) * 0.8 + 
             (node.attributes.memory - node.attributes.allocated_resources.memory) * 0.2;
    }
  
    private calculateAvailableResource(
      total: number,
      overallocate: number,
      allocated: number,
      required: number
    ): number {
      const maxAllowed = overallocate === -1 
        ? Infinity 
        : total * (1 + overallocate / 100);
        
      const available = maxAllowed - allocated;
      return available - required;
    }
  
    private async refreshNodes(): Promise<void> {
      if (Date.now() - this.lastFetch < 300000) return; // 5 min cache
      
      try {
        const response = await fetch(`${this.apiUrl}/nodes`, {
          headers: { Authorization: `Bearer ${this.apiKey}` }
        });
        
        this.nodeCache = await response.json();
        this.lastFetch = Date.now();
      } catch (error) {
        console.error('Failed to refresh nodes:', error);
        throw new Error('Node availability check failed');
      }
    }
  }
  
  // Usage example:
  const nodeSelector = new NodeSelector('https://ptero.example.com', 'API_KEY');
  
  // Get user-selected location from UI
  // const selectedLocation = getUserSelectedLocation(); 
  const selectedLocation = 1;
  
  const requirements = {
    memory: 4096, // MB
    disk: 20480 // MB
  };
  
  const optimalNodeId = await nodeSelector.findOptimalNode(selectedLocation, requirements);
  