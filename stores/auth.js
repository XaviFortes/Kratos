import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    returnUrl: null,
    isAuthenticated: false,
    _isInitialized: false // Add initialization flag
  }),
  persist: true,
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
    async initialize() {
      if (process.server) return // Only run on client
      
      const authData = localStorage.getItem('auth')
      if (!authData) {
        this._isInitialized = true
        return
      }

      try {
        const { user, token } = JSON.parse(authData)
        if (token && this.isTokenValid(token)) {
          this.user = user
          this.token = token
          this.isAuthenticated = true
          
          // Optional: Verify token with backend
          await this.validateToken()
        }
      } catch (error) {
        console.error('Auth init error:', error)
        this.logout()
      } finally {
        this._isInitialized = true
      }
    },

    isTokenValid(token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.exp * 1000 > Date.now()
      } catch {
        return false
      }
    },

    async validateToken() {
      try {
        await $fetch('/api/auth/validate', {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        return true
      } catch (error) {
        this.logout()
        return false
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
  },
  getters: {
    isReady: (state) => state._isInitialized
  }
})