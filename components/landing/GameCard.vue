<template>
  <NuxtLink 
    :to="`/games/${game.slug}`"
    class="game-card relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900 transform hover:-translate-y-2 transition-all duration-300 group"
    :style="{ '--delay': index * 100 + 'ms' }"
  >
    <div class="relative overflow-hidden h-64">
      <NuxtImg 
        :src="game.image"
        :alt="game.name"
        provider="ipx"
        class="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-500"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
    </div>

    <div class="p-6">
      <h3 class="text-2xl font-bold mb-2 text-white">{{ game.name }}</h3>
      <p class="text-gray-400 mb-4">{{ game.description }}</p>
      
      <div class="flex items-center justify-between mb-4">
        <div class="text-blue-400 text-lg font-semibold">
          From ${{ game.minPrice }}/mo
        </div>
        <div class="flex items-center text-white hover:text-blue-400 transition-colors">
          Get Started
          <Icon name="heroicons:arrow-right-20-solid" class="ml-2 w-4 h-4" />
        </div>
      </div>

      <div class="border-t border-gray-800 pt-4">
        <div class="flex flex-wrap gap-2">
          <div 
            v-for="(feature, i) in game.features"
            :key="i"
            class="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
          >
            {{ feature }}
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  game: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  }
});
</script>

<style scoped>
.game-card {
  opacity: 0;
  animation: fade-in-up 0.6s ease-out forwards;
  animation-delay: var(--delay);
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
