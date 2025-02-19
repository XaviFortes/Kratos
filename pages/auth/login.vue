<template>
    <div class="max-w-md mx-auto mt-20">
      <h1 class="text-3xl font-bold mb-8">Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="space-y-4">
          <input v-model="email" type="email" placeholder="Email" required class="w-full p-2 border rounded">
          <input v-model="password" type="password" placeholder="Password" required class="w-full p-2 border rounded">
          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Login
          </button>
        </div>
        <div v-if="errorMessage" class="mt-4 text-red-500">{{ errorMessage }}</div>
      </form>
      
      <div class="mt-4 text-center">
        <NuxtLink to="/auth/register" class="text-blue-400 hover:text-blue-300">
          Create Account
        </NuxtLink>
      </div>
    </div>
  </template>
  
  <script setup>
  const email = ref('')
  const password = ref('')
  const errorMessage = ref('')
  const router = useRouter()
  const route = useRoute()
  const cart = useCartStore()
  const auth = useAuthStore()
  
  const handleLogin = async () => {
    errorMessage.value = ''
    try {
      await auth.login(email.value, password.value)
      
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
    }
  }
  </script>