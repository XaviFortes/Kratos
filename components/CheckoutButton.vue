<!-- components/CheckoutButton.vue -->
<template>
    <button 
      @click="handleCheckout"
      :disabled="processing"
      class="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl text-lg font-bold transition-colors disabled:opacity-50"
    >
      <span v-if="processing">Processing...</span>
      <slot v-else>Proceed to Checkout</slot>
    </button>
  </template>
  
  <script setup>
  const props = defineProps({
    game: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    }
  });
  const cart = useCartStore()
  const auth = useAuthStore()
  const router = useRouter()
  const processing = ref(false)
  const addToCart = () => {
    cart.addItem({
      game: props.game,
      config: props.config,
      total: props.totalPrice
    })
  }


  
  const handleCheckout = async () => {
    cart.removeAllItems()
    addToCart()
    console.log('Proceeding to checkout...')
    console.log('Cart items:', cart.items)
    try {
      processing.value = true
      
      if (!auth.isAuthenticated) {
        localStorage.setItem('pendingCheckout', JSON.stringify(cart.items))
        router.push({ 
          path: '/auth/login',
          query: { redirect: '/checkout' }
        })
        return
      }
  
      await proceedToPayment()
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout failed: ' + error.message)
    } finally {
      processing.value = false
    }
  }
  
  const proceedToPayment = async () => {
    if (!cart.items?.length) {
      throw new Error('Cart is empty. Please add items before checkout.')
    }
  // Prepare invoice data with proper line items
  // const invoiceData = {
  //   client_id: auth.user.invoiceNinjaId,
  //   gameSlug: props.game.slug,
  //   line_items: cart.items.map(item => ({
  //     product_key: item.game.slug,
  //     notes: `Game Server: ${item.config.ram}GB RAM, ${item.config.cpu} Cores`,
  //     cost: item.total,
  //     quantity: 1,
  //     tax_rate1: 0
  //   })),
  //   terms: "Your server will be provisioned after payment confirmation",
  //   footer: "Thank you for your purchase!"
  // }
  // console.log('Invoice Data:', invoiceData)
  // return

    // Send the config directly
    const configData = {
      gameSlug: props.game.slug,
      config: props.config,
      // items: cart.items
    }

  // Create invoice with proper headers
  const { data, error } = await useFetch('/api/invoices/create', {
    method: 'POST',
    // body: invoiceData,
    body: configData,
    headers: {
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json' // Explicit content type
    }
  })

  if (error.value) {
    console.error('Invoice Error Details:', error.value.data)
    throw new Error(error.value.data?.message || 'Invoice creation failed')
  }

  window.location.href = data.value.payment_url
}
  </script>