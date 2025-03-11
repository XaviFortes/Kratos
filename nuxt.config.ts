// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // plugins: [
  //   '~/plugins/auth.client.js',
  // ],
  compatibilityDate: '2024-11-01',
  routeRules: {
    // Public pages
    '/': { ssr: true },
    '/about': { ssr: true },
    '/contact': { ssr: true },

    // Auth pages
    // '/auth/**': { ssr: false },

    // '/dashboard': { ssr: false },
    '/dashboard/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
      },
    },

    // Protected pages
    // '/dashboard/**': { middleware: 'auth' }
  },
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: [['@pinia/nuxt', { autoImports: ['defineStore'] }], // Add persisted state
    'pinia-plugin-persistedstate/nuxt', '@nuxtjs/tailwindcss', '@nuxt/image', '@nuxt/icon', '@sidebase/nuxt-auth'],
  auth: {
    isEnabled: true,
    disableServerSideAuth: false,
    originEnvKey: 'AUTH_ORIGIN',
    baseURL: 'http://localhost:3000/api/auth',
    // provider: { /* your provider config */ },
    provider: {
      type: 'authjs',
      trustHost: false,
      defaultProvider: 'discord',
      addDefaultCallbackUrl: true
    },
    sessionRefresh: {
      enablePeriodically: true,
      enableOnWindowFocus: true,
    },
  },
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
    dir: 'public',
    presets: {
      game: {
        modifiers: {
          format: 'webp',
          quality: '80'
        }
      }
    }
  },
  imports: {
    autoImport: true,
    presets: [
      {
        from: 'h3',
        imports: ['defineEventHandler', 'getCookie', 'setCookie', 'deleteCookie']
      }
    ]
  }
})