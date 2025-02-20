import { getGame } from '../../services/pricingServices';

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    
    try {
      return await getGame(body.gameSlug)
    } catch (error) {
      throw createError({
        statusCode: 400,
        message: (error as Error).message
      })
    }
  })