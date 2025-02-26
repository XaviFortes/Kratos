// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  plugins: [
    '~/plugins/auth.client.js',
  ],
  compatibilityDate: '2024-11-01',
  routeRules: {
    // Public pages
    '/': { ssr: true },
    '/about': { ssr: true },
    '/contact': { ssr: true },
    
    // Auth pages
    '/auth/**': { ssr: false },
    
    // Protected pages
    //'/dashboard/**': { middleware: 'auth' }
  },
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: [
    ['@pinia/nuxt', { autoImports: ['defineStore'] }],
    'pinia-plugin-persistedstate/nuxt', // Add persisted state
     '@nuxtjs/tailwindcss', '@nuxt/image', '@nuxt/icon'
  ],
  // piniaPluginPersistedstate: {
    // storage: 'localStorage'
  // },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
    '~/components/landing',
  ],
  runtimeConfig: {
    pterodactylApiKey: process.env.NUXT_PTERODACTYL_API_KEY,
    public: {
      invoiceNinjaKey: process.env.NUXT_PUBLIC_INVOICE_NINJA_TOKEN,
      pterodactylUrl: process.env.NUXT_PUBLIC_PTERODACTYL_URL,
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
})