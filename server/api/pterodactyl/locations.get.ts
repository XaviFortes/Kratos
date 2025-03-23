import { getServerSession } from '#auth'
import { PterodactylService } from '~/server/services/pterodactyl'

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  try {
    const pterodactyl = new PterodactylService()
    const locationsData = await pterodactyl.getLocations() as { data: Array<{ attributes: any }> }
    // console.log('Locations:', locationsData.data.map((location: any) => location.attributes.relationships.nodes.data[0].attributes))

    // Format the response to include only necessary data
    const locations = locationsData.data.map((location: any) => ({
      id: location.attributes.id,
      name: location.attributes.long || location.attributes.short,
      description: location.attributes.long,
      host: location.attributes.relationships.nodes.data[0].attributes || 
            location.attributes.options?.host ||
            window.location.hostname, // Fallback to current hostname
    }))
    
    return locations
  } catch (error) {
    console.error('Error fetching locations:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch server locations'
    })
  }
})