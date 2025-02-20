import { gameServerPricing } from '../../config/pricing'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const gameConfig = gameServerPricing[body.gameSlug]
  if (!gameConfig) throw createError('Invalid game configuration')

  // Validate input parameters
  const isValidConfig = (
    gameConfig.ramTiers.some(t => t.gb === body.ram) &&
    gameConfig.cpuTiers.some(t => t.cores === body.cpu) &&
    gameConfig.storageTiers.some(t => t.gb === body.storage)
  )
  
  if (!isValidConfig) throw createError('Invalid server configuration')

  // Calculate total price
  const ramPrice = gameConfig.ramTiers.find(t => t.gb === body.ram).price
  const cpuPrice = gameConfig.cpuTiers.find(t => t.cores === body.cpu).price
  const storagePrice = gameConfig.storageTiers.find(t => t.gb === body.storage).price
  const dedicatedIpPrice = body.dedicatedIp ? gameConfig.dedicatedIpPrice : 0
  
  const total = gameConfig.basePrice + ramPrice + cpuPrice + storagePrice + dedicatedIpPrice

  return {
    total: parseFloat(total.toFixed(2)),
    currency: 'USD',
    configuration: {
      ram: body.ram,
      cpu: body.cpu,
      storage: body.storage,
      dedicatedIp: body.dedicatedIp
    }
  }
})