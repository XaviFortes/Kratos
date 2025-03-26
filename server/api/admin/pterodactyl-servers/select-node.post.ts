import { NodeSelector } from '~/server/services/NodeSelector'
import { requireAdminUser } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdminUser(event)
  
  const body = await readBody(event)
  
  if (!body.location || !body.memory || !body.disk) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameters: location, memory, and disk are required'
    })
  }
  
  try {
    const nodeSelector = new NodeSelector()
    const result = await nodeSelector.findOptimalNode({
      location: parseInt(body.location),
      memory: parseInt(body.memory),
      disk: parseInt(body.disk),
      cpu: parseInt(body.cpu || '100')
    })
    
    return {
      success: true,
      selected: result,
      requirements: {
        location: body.location,
        memory: body.memory,
        disk: body.disk,
        cpu: body.cpu || 100
      }
    }
  } catch (error) {
    console.error('Node selection failed:', error)
    throw createError({
      statusCode: 500,
      message: (error as Error).message || 'Failed to select optimal node'
    })
  }
})