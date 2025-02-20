import { ofetch } from 'ofetch'
import { servers, users } from '@prisma/client'
import prisma from '../lib/prisma'

export class PterodactylService {
  private readonly config = {
    host: useRuntimeConfig().pterodactylHost,
    apiKey: useRuntimeConfig().pterodactylApiKey
  }

  async createServer(user: users, config: ServerCreateParams): Promise<servers> {
    const pterodactylUserId = await this.findOrCreateUser(user)
    const serverDetails = await this.createPterodactylServer(pterodactylUserId, config)
    
    return prisma.servers.create({
      data: {
        user_id: user.id,
        pterodactyl_server_id: serverDetails.id,
        // identifier: serverDetails.identifier,
        config: {
          memory: config.memory,
          cpu: config.cpu,
          disk: config.disk
        },
        status: 'installing',
        game_type: 'minecraft'
        // game_type: config.game_type // Add the missing game_type property
      }
    })
  }

  private async findOrCreateUser(user: users): Promise<string> {
    try {
      const response = await ofetch(`${this.config.host}/api/application/users?filter[email]=${user.email}`, {
        headers: this.getHeaders()
      })

      if (response.data.length > 0) return response.data[0].attributes.id

      const newUser = await ofetch(`${this.config.host}/api/application/users`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: {
          email: user.email,
          username: this.generateUsername(user.email),
          first_name: user.name,
          last_name: 'User',
          password: this.generatePassword()
        }
      })

      return newUser.data.attributes.id
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Pterodactyl user creation failed: ${(error as any).data?.errors?.[0]?.detail || error.message}`)
      } else {
        throw new Error('Pterodactyl user creation failed: Unknown error')
      }
    }
  }

  private async createPterodactylServer(userId: string, config: ServerCreateParams): Promise<PterodactylServer> {
    try {
      const eggData = await this.getEggData(config.nest, config.egg)
      const serverName = config.servername || `Server-${Date.now()}`

      const server = await ofetch(`${this.config.host}/api/application/servers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: {
          name: serverName,
          user: userId,
          egg: config.egg,
          docker_image: eggData.docker_image,
          startup: eggData.startup,
          environment: await this.processEnvironment(eggData, config),
          limits: {
            memory: config.memory,
            swap: config.swap,
            disk: config.disk,
            io: config.io,
            cpu: config.cpu
          },
          feature_limits: {
            databases: config.databases,
            backups: config.backups,
            allocations: config.allocation
          }
        }
      })

      return {
        id: server.data.attributes.id,
        // identifier: server.data.attributes.identifier,
        status: server.data.attributes.status,
        allocation: server.data.attributes.allocation
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Server creation failed: ${(error as any).data?.errors?.[0]?.detail || error.message}`)
      } else {
        throw new Error('Server creation failed: Unknown error')
      }
    }
  }

  private async getEggData(nestId: number, eggId: number) {
    const response = await ofetch(
      `${this.config.host}/api/application/nests/${nestId}/eggs/${eggId}?include=variables`,
      { headers: this.getHeaders() }
    )
    return response.data.attributes
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
      Accept: 'Application/vnd.Pterodactyl.v1+json',
      'Content-Type': 'application/json'
    }
  }

  private generateUsername(email: string): string {
    return email.split('@')[0].replace(/[^\w]/g, '').slice(0, 15)
  }

  private generatePassword(length = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
    return Array.from(crypto.getRandomValues(new Uint32Array(length)))
      .map((n) => chars[n % chars.length])
      .join('')
  }

  // Add this method inside the PterodactylService class
private async processEnvironment(
    eggData: any,
    config: ServerCreateParams
  ): Promise<Record<string, any>> {
    const environment: Record<string, any> = {};
  
    // Process egg variables
    if (eggData?.relationships?.variables?.data) {
      for (const variable of eggData.relationships.variables.data) {
        const attr = variable.attributes;
        const envVar = attr.env_variable;
        
        // Use config value if provided, otherwise use egg default
        environment[envVar] = config[envVar as keyof ServerCreateParams] || attr.default_value;
      }
    }
  
    // Add port allocation handling if needed
    if (config.port_array) {
      try {
        const portConfig = JSON.parse(config.port_array);
        Object.assign(environment, this.processPortEnvironment(portConfig));
      } catch (error) {
        console.error('Invalid port array configuration:', error);
      }
    }
  
    return environment;
  }
  
  // Add port environment processing
  private processPortEnvironment(portConfig: Record<string, any>): Record<string, any> {
    const portEnvironment: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(portConfig)) {
      if (key !== 'SERVER_PORT' && key !== 'NONE') {
        portEnvironment[key] = value;
      }
    }
    
    return portEnvironment;
  }
}