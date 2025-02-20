import { calculatePrice } from "~/server/services/pricingServices"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    
    try {
      return await calculatePrice(body.gameSlug, body.configuration)
    } catch (error) {
      throw createError({
        statusCode: 400,
        message: (error as Error).message
      })
    }
  })