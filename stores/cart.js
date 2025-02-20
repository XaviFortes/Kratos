export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        tempCartId: null
    }),
    actions: {
        addItem(item) {
            const existing = this.items.find(i => i.game.id === item.game.id)
            
            if (existing) {
              existing.quantity += 1
            } else {
              this.items.push({
                ...item,
                quantity: 1,
                addedAt: new Date().toISOString()
              })
            }
            
            this.persistCart()
        },
        removeItem(itemId) {
            this.items = this.items.filter(i => i.game.id !== itemId)
            this.persistCart()
        },
        removeAllItems() {
            this.items = []
            this.persistCart()
        },
        persistCart() {
            localStorage.setItem('cart', JSON.stringify(this.items))
        },
        loadCart() {
            const cart = localStorage.getItem('cart')
            if (cart) {
                this.items = JSON.parse(cart)
            }
        },
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