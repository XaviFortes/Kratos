declare interface PterodactylConfig {
    host: string
    apiKey: string
}

declare interface ServerCreateParams {
    nest: number
    egg: number
    memory: number
    swap: number
    disk: number
    io: number
    cpu: number
    location: number
    databases: number
    backups: number
    allocation: number
    port_range?: string
    port_array?: string
    servername?: string
}

declare interface PterodactylServer {
    id: string
    // identifier: string
    status: string
    allocation: {
        ip: string
        port: number
    }
}