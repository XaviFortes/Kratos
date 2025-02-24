// plugins/auth.js
export default defineNuxtPlugin(async (nuxtApp) => {
    const auth = useAuthStore()

    // Initialize auth before any component loads
    await auth.initialize()

    // Optional: Wait for auth to settle before proceeding
    if (!process.server) {
        await new Promise(resolve => setTimeout(resolve, 50))
    }
})