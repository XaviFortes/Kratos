<template>
    <div class="bg-gray-800 p-6 rounded-xl sticky top-8">
      <h3 class="text-2xl font-bold mb-6">Order Summary</h3>
      
      <div class="space-y-4">
        <div class="flex justify-between">
          <span class="text-gray-400">Base Price:</span>
          <span>${{ game.minPrice }}/mo</span>
        </div>
        
        <div v-if="config.ram > 4" class="flex justify-between">
          <span class="text-gray-400">Extra RAM ({{ config.ram }}GB):</span>
          <span>+${{ ramPrice }}/mo</span>
        </div>
        
        <div v-if="config.cpu > 2" class="flex justify-between">
          <span class="text-gray-400">Extra CPU ({{ config.cpu }} Cores):</span>
          <span>+${{ cpuPrice }}/mo</span>
        </div>
        
        <div v-if="config.storage > 50" class="flex justify-between">
          <span class="text-gray-400">Extra Storage ({{ config.storage }}GB):</span>
          <span>+${{ storagePrice }}/mo</span>
        </div>
        
        <div v-if="config.dedicatedIp" class="flex justify-between">
          <span class="text-gray-400">Dedicated IP:</span>
          <span>+${{ dedicatedIpPrice }}/mo</span>
        </div>
        
        <div class="pt-4 border-t border-gray-700">
            <div class="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>${{ totalPrice.toFixed(2) }}/mo</span>
            </div>
        </div>
      </div>
    </div>
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
  
  const { priceConfig } = useServerConfig();

    const ramPrice = computed(() => 
      priceConfig.value.ram.tiers.find(t => t.gb === props.config.ram).price
    );
  
    const cpuPrice = computed(() => 
      priceConfig.value.cpu.tiers.find(t => t.cores === props.config.cpu).price
    );
  
    const storagePrice = computed(() => 
      priceConfig.value.storage.tiers.find(t => t.gb === props.config.storage).price
    );
  
    const dedicatedIpPrice = computed(() => 
      props.config.dedicatedIp ? priceConfig.value.dedicatedIp.price : 0
    );

</script>