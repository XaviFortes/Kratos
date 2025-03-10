<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12">
    <div class="max-w-2xl mx-auto px-4">
      <div class="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-8 animate-fade-in-up">
        <h1 class="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Welcome Back
        </h1>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Input -->
          <div>
            <label class="block text-gray-300 mb-2">Email</label>
            <input 
              v-model="email" 
              type="email" 
              placeholder="your@email.com" 
              required
              class="w-full bg-gray-700/40 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
          </div>

          <!-- Password Input -->
          <div>
            <label class="block text-gray-300 mb-2">Password</label>
            <input 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              required
              class="w-full bg-gray-700/40 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="text-red-400 text-sm">
            ⚠️ {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transform hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            <span v-if="!isLoading">Login</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          </button>

          <!-- Additional Links -->
          <div class="text-center space-y-2">
            <NuxtLink 
              to="/auth/register" 
              class="text-blue-400 hover:text-blue-300 text-sm"
            >
              Create New Account
            </NuxtLink>
            <div class="text-gray-400"></div>
            <NuxtLink 
              to="/auth/forgot-password" 
              class="text-blue-400 hover:text-blue-300 text-sm"
            >
              Forgot Password?
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    await auth.login(email.value, password.value)
    await auth.initialize()
    
    // Handle cart restoration
    if (cart.tempCartId) {
      await cart.syncCart()
    }
    
    // Redirect logic
    const redirectPath = route.query.redirect || '/dashboard'
    await router.push(redirectPath)
    
  } catch (error) {
    errorMessage.value = error.message || 'Login failed. Please check your credentials.'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
/* Reuse animations from other pages */
.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>