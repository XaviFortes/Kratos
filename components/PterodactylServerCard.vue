<!-- components/PterodactylServerCard.vue -->
<template>
    <div class="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-colors">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-white">{{ server.name }}</h3>
        <span class="flex items-center text-sm" :class="statusColor">
          {{ server.status }}
        </span>
      </div>
      
      <div class="space-y-2 text-gray-400">
        <div class="flex justify-between">
          <span>Memory:</span>
          <span>{{ server.memory }}GB</span>
        </div>
        <div class="flex justify-between">
          <span>CPU:</span>
          <span>{{ server.cpu }}Cores</span>
        </div>
        <div class="flex justify-between">
          <span>Disk:</span>
          <span>{{ server.disk }}GB</span>
        </div>
      </div>
  
      <div class="mt-4 flex justify-end space-x-2">
        <button 
          @click="$emit('manage')"
          class="text-blue-400 hover:text-blue-300"
        >
          Manage →
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    server: {
      type: Object,
      required: true
    }
  });
  
  const statusColor = computed(() => {
    return {
      running: 'text-green-400',
      offline: 'text-red-400',
      installing: 'text-yellow-400'
    }[props.server.status] || 'text-gray-400';
  });
  </script>