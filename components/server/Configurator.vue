<script setup>
    const props = defineProps({
        game: {
            type: Object,
            required: true
        },
        config: {
            type: Object,
            required: true
        }
    });
    
    const { priceConfig } = useServerConfig();

    const activeRam = computed({
        get: () => props.config.ram,
        set: (value) => props.config.ram = value
    });

    const activeCpu = computed({
        get: () => props.config.cpu,
        set: (value) => props.config.cpu = value
    });

    const activeStorage = computed({
        get: () => props.config.storage,
        set: (value) => props.config.storage = value
    });

</script>
<template>
    <div class="space-y-8">
      <!-- RAM Selection -->
      <div class="bg-gray-800 p-6 rounded-xl">
        <h3 class="text-xl font-bold mb-4">Memory (RAM)</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label
                v-for="tier in priceConfig.ram.tiers"
                :key="tier.gb"
                class="cursor-pointer"
            >
                <input 
                type="radio" 
                v-model="activeRam"
                :value="tier.gb"
                class="hidden"
                >
                <div
                :class="[
                    'p-4 rounded-lg border transition-all',
                    activeRam === tier.gb
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-blue-400'
                ]"
                >
                <div class="text-lg font-semibold">{{ tier.gb }}GB</div>
                <div v-if="tier.price > 0" class="text-sm text-gray-400">
                    +${{ tier.price }}/mo
                </div>
                </div>
            </label>
            </div>
      </div>
  
      <!-- CPU Selection -->
      <div class="bg-gray-800 p-6 rounded-xl">
        <h3 class="text-xl font-bold mb-4">CPU Cores</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            v-for="tier in priceConfig.cpu.tiers"
            :key="tier.cores"
            @click="config.cpu = tier.cores"
            :class="[
              'p-4 rounded-lg border',
              config.cpu === tier.cores 
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-blue-400'
            ]"
          >
            <div class="text-lg font-semibold">{{ tier.cores }} Cores</div>
            <div v-if="tier.price > 0" class="text-sm text-gray-400">
              +${{ tier.price }}/mo
            </div>
          </button>
        </div>
      </div>
  
      <!-- Storage Selection -->
      <div class="bg-gray-800 p-6 rounded-xl">
        <h3 class="text-xl font-bold mb-4">Storage</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            v-for="tier in priceConfig.storage.tiers"
            :key="tier.gb"
            @click="config.storage = tier.gb"
            :class="[
              'p-4 rounded-lg border',
              config.storage === tier.gb 
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-blue-400'
            ]"
          >
            <div class="text-lg font-semibold">{{ tier.gb }}GB SSD</div>
            <div v-if="tier.price > 0" class="text-sm text-gray-400">
              +${{ tier.price }}/mo
            </div>
          </button>
        </div>
      </div>
  
      <!-- Dedicated IP -->
      <div class="bg-gray-800 p-6 rounded-xl">
        <label class="flex items-center space-x-4 cursor-pointer">
          <input
            type="checkbox"
            v-model="config.dedicatedIp"
            class="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
          />
          <div>
            <div class="text-lg font-semibold">Dedicated IP Address</div>
            <div class="text-gray-400">+${{ priceConfig.dedicatedIp.price }}/mo</div>
          </div>
        </label>
      </div>
    </div>
</template>