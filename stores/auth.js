import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    returnUrl: null
  }),
  actions: {
    async login(email, password) {
      try {
        const { data, error } = await useFetch('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        })

        if (error.value) {
          throw new Error(error.value.data?.message || 'Login failed')
        }

        this.user = data.value.user
        this.token = data.value.token
        this.isAuthenticated = true

        // Store in localStorage
        localStorage.setItem('auth', JSON.stringify({
          user: data.value.user,
          token: data.value.token
        }))
        // localStorage.setItem('authToken', data.value.token)

      } catch (error) {
        throw new Error(error.message)
      }
    },
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('auth')
    },
    initialize() {
      const authData = localStorage.getItem('auth')
      if (authData) {
        const { user, token } = JSON.parse(authData)
        this.user = user
        this.token = token
      }
    },
    async register(userData) {
      const { data } = await useFetch('/api/auth/register', {
        method: 'POST',
        body: userData
      })

      if (data.value) {
        await this.login(userData.email, userData.password)
      }
    }
  }
})