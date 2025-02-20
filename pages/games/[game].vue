<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <NavBar />
    
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Configuration Section -->
        <div class="lg:col-span-2">
          <Configurator 
            v-if="pricingData"
            :game="game"
            :pricing-data="pricingData"
            :config="serverConfig"
            @update:ram="handleRamUpdate"
            @update:cpu="handleCpuUpdate"
            @update:storage="handleStorageUpdate"
          />
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <OrderSummary 
            v-if="pricingData"
            :game="game"
            :config="serverConfig"
            :pricing-data="pricingData"
            :total-price="totalPrice"
          />
          
          <CheckoutButton
            v-if="pricingData"
            :game="game"
            :config="serverConfig"
            :total-price="totalPrice"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const { featuredGames } = useFeaturedGames();

// Server configuration state
const serverConfig = ref({
  ram: null,
  cpu: null,
  storage: null,
  dedicatedIp: false
});

// Find the game
const game = ref(featuredGames.value.find(g => g.slug === route.params.game));

// Fetch pricing data
const { data: pricingData } = await useFetch('/api/pricing/prices', {
  method: 'POST',
  body: { gameSlug: game.value.slug }
});

// Helper function to find base tier
const findBaseTier = (type, data) => {
  const baseTier = data.pricingTiers.find(t => 
    t.type === type && Number(t.price) === 0
  );
  return baseTier ? Number(baseTier.value) : 0;
};

// Initialize server config with base tiers
watch(pricingData, (newData) => {
  if (newData) {
    serverConfig.value = {
      ram: findBaseTier('ram', newData),
      cpu: findBaseTier('cpu', newData),
      storage: findBaseTier('storage', newData),
      dedicatedIp: false
    };
  }
}, { immediate: true });

// Calculate total price
const totalPrice = computed(() => {
  if (!pricingData.value) return 0;
  
  let total = Number(pricingData.value.basePrice);
  
  // Add RAM cost
  const ramTier = pricingData.value.pricingTiers.find(t => 
    t.type === 'ram' && Number(t.value) === serverConfig.value.ram
  );
  total += Number(ramTier?.price) || 0;

  // Add CPU cost
  const cpuTier = pricingData.value.pricingTiers.find(t => 
    t.type === 'cpu' && Number(t.value) === serverConfig.value.cpu
  );
  total += Number(cpuTier?.price) || 0;

  // Add Storage cost
  const storageTier = pricingData.value.pricingTiers.find(t => 
    t.type === 'storage' && Number(t.value) === serverConfig.value.storage
  );
  total += Number(storageTier?.price) || 0;

  return total;
});

// Update handlers
const handleRamUpdate = (newVal) => { serverConfig.value.ram = Number(newVal) };
const handleCpuUpdate = (newVal) => { serverConfig.value.cpu = Number(newVal) };
const handleStorageUpdate = (newVal) => { serverConfig.value.storage = Number(newVal) };
</script>