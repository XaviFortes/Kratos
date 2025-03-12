import { prisma } from '~/server/lib/prisma'


async function seed() {
    // Create Minecraft game
    const minecraft = await prisma.game.create({
      data: {
        name: 'Minecraft',
        slug: 'minecraft',
        basePrice: 2.99,
        pricingTiers: {
          create: [
            // Location
            { type: 'location', label: 'EU', value: '1', price: 0 },
            // { type: 'location', label: 'NA', value: '2', price: 3 },
            // { type: 'location', label: 'Asia', value: 'asia', price: 0 },
            // RAM Tiers
            { type: 'ram', label: '1GB', value: '1', price: 0 },
            { type: 'ram', label: '2GB', value: '2', price: 2 },
            { type: 'ram', label: '4GB', value: '4', price: 4 },
            { type: 'ram', label: '8GB', value: '8', price: 8 },
            { type: 'ram', label: '16GB', value: '16', price: 15 },
            { type: 'ram', label: '32GB', value: '32', price: 30 },
            // Server Types
            { type: 'server_type', label: 'Vanilla', value: '4', price: 0 },
            { type: 'server_type', label: 'Paper', value: '1', price: 0 },
            { type: 'server_type', label: 'Forge', value: '2', price: 0 },
            { type: 'server_type', label: 'Sponge', value: '3', price: 0 },
            // CPU Tiers
            { type: 'cpu', label: '2 Cores', value: '2', price: 0 },
            { type: 'cpu', label: '3 Cores', value: '3', price: 2 },
            { type: 'cpu', label: '4 Cores', value: '4', price: 3 },
            { type: 'cpu', label: '8 Cores', value: '8', price: 6 },
            { type: 'cpu', label: '16 Cores', value: '16', price: 12 },
            // Disk Tiers
            { type: 'storage', label: '10GB', value: '10', price: 0 },
            { type: 'storage', label: '20GB', value: '20', price: 0.5 },
            { type: 'storage', label: '40GB', value: '40', price: 1 },
            // Extras
            { type: 'extra', label: 'Dedicated IP', value: 'true', price: 2 },
            { type: 'extra', label: 'Dedicated Server', value: 'true', price: 5 }
          ]
        },
        modifiers: {
          create: [
            {
              type: 'conditional',
              condition: { field: 'server_type', value: 'spigot' },
              value: 1.2,
              description: '20% increase for Spigot servers'
            }
          ]
        }
      }
    })
}

seed().then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

