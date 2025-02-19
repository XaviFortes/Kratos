// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxt/image', '@nuxt/icon'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
    '~/components/landing',
  ],
  runtimeConfig: {
    public: {
      invoiceNinjaKey: process.env.NUXT_PUBLIC_INVOICE_NINJA_TOKEN,
      pterodactylUrl: process.env.NUXT_PUBLIC_PTERODACTYL_URL
    }
  },
  css: [
    '~/assets/css/main.css'
  ],
  image: {
    domains: [],
    dir: 'public/images',
    presets: {
      game: {
        modifiers: {
          format: 'webp',
          quality: '80'
        }
      }
    }
  },
  plugins: [
    '~/plugins/auth.client.js',
  ],
})