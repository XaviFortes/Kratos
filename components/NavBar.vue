<!-- components/NavBar.vue -->
<template>
    <nav class="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center space-x-2">
            <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Inovex Cloud
            </span>
          </NuxtLink>
  
          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink 
              to="/#games" 
              class="text-gray-300 hover:text-white transition-colors"
              @click="scrollToGames"
            >
              Games
            </NuxtLink>
            <!-- <NuxtLink 
              to="/pricing" 
              class="text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </NuxtLink> -->
            <NuxtLink 
              to="/support" 
              class="text-gray-300 hover:text-white transition-colors"
            >
              Support
            </NuxtLink>
  
            <!-- Auth Links -->
            <template v-if="!auth.isAuthenticated">
              <NuxtLink 
                to="/auth/login" 
                class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Login
              </NuxtLink>
              <NuxtLink 
                to="/auth/register" 
                class="text-gray-300 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Get Started
              </NuxtLink>
            </template>
  
            <!-- User Dropdown -->
            <div v-else class="relative group">
              <button class="flex items-center space-x-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                  <span class="text-white text-sm font-bold">
                    {{ auth.user.email[0].toUpperCase() }}
                  </span>
                </div>
                <span class="text-gray-300">{{ auth.user.email }}</span>
              </button>
  
              <!-- Dropdown Menu -->
              <div class="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <NuxtLink 
                  to="/dashboard" 
                  class="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Dashboard
                </NuxtLink>
                <NuxtLink 
                  to="/dashboard/invoices" 
                  class="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Invoices
                </NuxtLink>
                <button 
                  @click="auth.logout()" 
                  class="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
  
          <!-- Mobile Menu Button -->
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
  
        <!-- Mobile Menu -->
        <div v-show="isMobileMenuOpen" class="md:hidden py-4 space-y-4">
          <NuxtLink 
            to="/#games" 
            class="block text-gray-300 hover:text-white"
            @click="scrollToGames"
          >
            Games
          </NuxtLink>
          <!-- <NuxtLink 
            to="/pricing" 
            class="block text-gray-300 hover:text-white"
          >
            Pricing
          </NuxtLink> -->
          <NuxtLink 
            to="/support" 
            class="block text-gray-300 hover:text-white"
          >
            Support
          </NuxtLink>
  
          <template v-if="!auth.isAuthenticated">
            <NuxtLink 
              to="/auth/login" 
              class="block px-4 py-2 text-gray-300 hover:text-white"
            >
              Login
            </NuxtLink>
            <NuxtLink 
              to="/auth/register" 
              class="block bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Get Started
            </NuxtLink>
          </template>
  
          <template v-else>
            <NuxtLink 
              to="/dashboard" 
              class="block px-4 py-2 text-gray-300 hover:text-white"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink 
              to="/dashboard/invoices" 
              class="block px-4 py-2 text-gray-300 hover:text-white"
            >
              Invoices
            </NuxtLink>
            <button 
              @click="auth.logout()" 
              class="block w-full text-left px-4 py-2 text-gray-300 hover:text-white"
            >
              Logout
            </button>
          </template>
        </div>
      </div>
    </nav>
  </template>
  
  <script setup>
  const auth = useAuthStore()
  const isMobileMenuOpen = ref(false)
  
  const scrollToGames = () => {
    const gamesSection = document.querySelector('#games')
    if (gamesSection) {
      gamesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }
  </script>
  
  <style scoped>
  .router-link-active {
    @apply text-white font-semibold;
  }
  
  .nuxt-link-exact-active {
    @apply text-white font-semibold;
  }
  </style>