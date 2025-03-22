<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <NavBar />
    
    <div class="container mx-auto px-4 py-16">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Configuration Section -->
        <div class="lg:col-span-2 bg-gray-800 rounded-xl p-6">
          <h1 class="text-3xl font-bold mb-6">{{ game.name }} Configuration</h1>
          
          <div class="space-y-8">
            <!-- Server resources configuration -->
            <div v-for="field in configFields" :key="field.key" class="space-y-3">
              <div class="flex justify-between">
                <h3 class="text-lg font-medium">{{ field.label }}</h3>
                <span v-if="getModifierPrice(field.key)" class="text-blue-400">
                  +${{ getModifierPrice(field.key) }}/mo
                </span>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div v-for="option in field.options" :key="option.value" class="col-span-1">
                  <label class="flex flex-col cursor-pointer">
                    <input
                      type="radio"
                      :name="field.key"
                      :value="option.value"
                      v-model="serverConfig[field.key]"
                      class="hidden"
                    >
                    <div
                      :class="[
                        'p-4 rounded-lg border transition-all text-center',
                        serverConfig[field.key] === option.value
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 hover:border-blue-400'
                      ]"
                    >
                      <div class="text-lg font-semibold">{{ option.label }}</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <div class="bg-gray-800 p-6 rounded-xl sticky top-8">
            <h3 class="text-2xl font-bold mb-6">Order Summary</h3>
            
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-400">Base Price:</span>
                <span>${{ basePrice }}/mo</span>
              </div>
              
              <div v-for="(price, field) in modifierPrices" :key="field" class="flex justify-between">
                <span class="text-gray-400">{{ getFieldLabel(field) }} ({{ serverConfig[field] }}{{ getFieldUnit(field) }}):</span>
                <span>+${{ price }}/mo</span>
              </div>
              
              <div class="pt-4 border-t border-gray-700">
                <div class="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>${{ totalPrice.toFixed(2) }}/mo</span>
                </div>
              </div>
            </div>
            
            <button 
              @click="addToCart"
              :disabled="isAddingToCart"
              class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {{ isAddingToCart ? 'Adding to Cart...' : 'Add to Cart' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const { $toast } = useNuxtApp();

// State variables
const loading = ref(true);
const game = ref({});
const pricingPlan = ref(null);
const serverConfig = ref({});
const isAddingToCart = ref(false);

// Get game data
const getGameData = async () => {
  try {
    // Fetch the game details (adjust endpoint as needed)
    const gameData = await $fetch(`/api/games/${route.params.game}`);
    game.value = gameData;
    
    // Fetch the pricing plan for this game
    const plans = await $fetch('/api/admin/pricing-plans');
    pricingPlan.value = plans.find(p => 
      p.serviceType === 'GAME_SERVER' && 
      p.name.toLowerCase().includes(route.params.game.toLowerCase())
    );
    
    if (!pricingPlan.value) {
      // Use default game plan if specific one not found
      pricingPlan.value = plans.find(p => p.serviceType === 'GAME_SERVER');
    }
    
    // Initialize the server configuration with defaults
    initializeConfig();
    
    loading.value = false;
  } catch (error) {
    console.error('Error fetching game data:', error);
    $toast.error('Failed to load game data');
  }
};

// Initialize configuration based on pricing plan
const initializeConfig = () => {
  // Create default configuration based on pricing model
  const config = {};
  
  // Use the configuration template or extract from pricing model modifiers
  if (pricingPlan.value.configTemplate) {
    for (const [key, value] of Object.entries(pricingPlan.value.configTemplate)) {
      config[key] = value;
    }
  }
  
  // Add fields from pricing model modifiers
  if (pricingPlan.value.pricingModel?.modifiers) {
    for (const modifier of pricingPlan.value.pricingModel.modifiers) {
      // Only set if not already defined
      if (config[modifier.field] === undefined) {
        // Set default values based on type
        if (modifier.type === 'per_unit') {
          config[modifier.field] = modifier.unit === 'gb' ? 4 : 
                                   modifier.unit === 'cores' ? 2 : 1;
        }
      }
    }
  }
  
  serverConfig.value = config;
};

// Configuration fields with their labels and options
const configFields = computed(() => {
  if (!pricingPlan.value?.pricingModel?.modifiers) return [];
  
  return pricingPlan.value.pricingModel.modifiers.map(modifier => {
    // Create options based on the field type
    let options = [];
    
    if (modifier.field === 'ram') {
      options = [4, 8, 16, 32].map(value => ({ 
        value, 
        label: `${value} GB` 
      }));
    } 
    else if (modifier.field === 'cpu') {
      options = [2, 4, 8].map(value => ({ 
        value, 
        label: `${value} Cores` 
      }));
    }
    else if (modifier.field === 'storage') {
      options = [50, 100, 200, 500].map(value => ({ 
        value, 
        label: `${value} GB` 
      }));
    }
    else {
      // Default options if specific options not defined
      options = [1, 2, 4, 8].map(value => ({ 
        value, 
        label: `${value}` 
      }));
    }
    
    return {
      key: modifier.field,
      label: getFieldLabel(modifier.field),
      options: options
    };
  });
});

// Base price from the pricing plan
const basePrice = computed(() => {
  return pricingPlan.value?.pricingModel?.basePrice || 
         Number(pricingPlan.value?.priceMonthly) || 0;
});

// Calculate individual modifier prices
const modifierPrices = computed(() => {
  if (!pricingPlan.value?.pricingModel?.modifiers) return {};
  
  const prices = {};
  
  for (const modifier of pricingPlan.value.pricingModel.modifiers) {
    const value = serverConfig.value[modifier.field];
    if (value !== undefined) {
      if (modifier.type === 'per_unit') {
        prices[modifier.field] = value * modifier.price;
      } else if (modifier.type === 'fixed') {
        prices[modifier.field] = modifier.price;
      }
    }
  }
  
  return prices;
});

// Calculate total price
const totalPrice = computed(() => {
  let total = basePrice.value;
  
  for (const price of Object.values(modifierPrices.value)) {
    total += price;
  }
  
  return total;
});

// Get the price of a specific modifier
const getModifierPrice = (field) => {
  return modifierPrices.value[field] || 0;
};

// Get human-readable field labels
const getFieldLabel = (field) => {
  const labels = {
    ram: 'Memory',
    cpu: 'CPU',
    storage: 'Storage',
    slots: 'Player Slots',
    backups: 'Backups'
  };
  
  return labels[field] || field.charAt(0).toUpperCase() + field.slice(1);
};

// Get unit for a field
const getFieldUnit = (field) => {
  const units = {
    ram: 'GB',
    cpu: ' Cores',
    storage: 'GB',
    slots: ' Players'
  };
  
  return units[field] || '';
};

// Add the configured server to cart
const addToCart = async () => {
  isAddingToCart.value = true;
  
  try {
    await $fetch('/api/cart/items', {
      method: 'POST',
      body: {
        planId: pricingPlan.value.id,
        configuration: serverConfig.value,
        quantity: 1
      }
    });
    
    $toast.success('Added to cart successfully');
    router.push('/checkout');
  } catch (error) {
    console.error('Error adding to cart:', error);
    $toast.error('Failed to add to cart');
  } finally {
    isAddingToCart.value = false;
  }
};

// Fetch data on mount
onMounted(getGameData);
</script>