<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <NavBar />
    
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Configuration Section -->
        <div class="lg:col-span-2">
          <Configurator 
            :game="game"
            :config="serverConfig"
          />
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <OrderSummary 
            :game="game"
            :config="serverConfig"
            :total-price="totalPrice"
          />
          
          <CheckoutButton
            :game="game"
            :config="serverConfig"
            :total-price="totalPrice"
          />
          <!-- <button
            @click="proceedToCheckout"
            class="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl text-lg font-bold transition-colors"
          >
            Continue to Payment
          </button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const { featuredGames } = useFeaturedGames();
const { calculateTotal } = useServerConfig();

// Server configuration state
// Make sure to initialize with numbers
const serverConfig = reactive({
  ram: 4,
  cpu: 2,
  storage: 50,
  dedicatedIp: false
});

// Add watcher for debugging
watch(serverConfig, (newVal) => {
  console.log('Config updated:', newVal);
}, { deep: true });

// Find the game
const game = ref(featuredGames.value.find(g => g.slug === route.params.game));

// Calculate total price
const totalPrice = computed(() => 
  calculateTotal(game.value.minPrice, serverConfig)
);

const proceedToCheckout = async () => {
  // Prepare order payload
  const orderData = {
    game: game.value.slug,
    config: serverConfig,
    total: totalPrice.value
  };

  // Create invoice via API
  const { data: invoice } = await useFetch('/api/invoices/create', {
    method: 'POST',
    body: orderData
  });

  // Redirect to Invoice Ninja
  window.location.href = invoice.value.payment_url;
};
</script>