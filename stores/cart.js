export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        tempCartId: null
    }),
    actions: {
        async syncCart() {
            if (this.tempCartId) {
                await this.restoreGuestCart(this.tempCartId)
            }
        },
        async restoreGuestCart(tempCartId) {
            const guestCart = localStorage.getItem(`guestCart_${tempCartId}`)
            if (guestCart) {
                this.items = JSON.parse(guestCart)
                localStorage.removeItem(`guestCart_${tempCartId}`)
            }
        }
    }
})