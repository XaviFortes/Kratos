// plugins/cart-persistence.client.js
export default defineNuxtPlugin(() => {
    const cart = useCartStore()

    // Load guest cart on initial load
    if (!process.server) {
        const tempCartId = localStorage.getItem('tempCartId')
        if (tempCartId) {
            cart.tempCartId = tempCartId
            cart.restoreGuestCart(tempCartId)
        }
    }

    // Save cart to localStorage on changes
    watch(() => cart.items, (newItems) => {
        if (!useAuthStore().isAuthenticated) {
            localStorage.setItem(`guestCart_${cart.tempCartId}`, JSON.stringify(newItems))
        }
    }, { deep: true })
})