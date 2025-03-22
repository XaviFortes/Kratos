import { loadStripe } from '@stripe/stripe-js'

let stripePromise: Promise<any> | null = null

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  return {
    provide: {
      stripe: async () => {
        if (!stripePromise) {
          // Use the public runtime config instead of process.env
          stripePromise = loadStripe(config.public.stripePublishableKey)
        }
        return stripePromise
      }
    }
  }
})