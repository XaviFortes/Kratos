<template>
    <div class="dashboard-container">
      <NavBar />
      
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">Your Game Servers</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="server in servers"
            :key="server.id"
            class="bg-gray-800 p-6 rounded-lg"
          >
            <h3 class="text-xl font-bold mb-2">{{ server.name }}</h3>
            <p class="text-gray-400 mb-4">{{ server.game }}</p>
            <ServerControls :server="server" />
          </div>
        </div>
  
        <button 
          @click="showCreateServerModal = true"
          class="mt-8 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg"
        >
          Create New Server
        </button>
      </div>
  
      <CreateServerModal 
        v-if="showCreateServerModal"
        @close="showCreateServerModal = false"
      />
    </div>
  </template>
  
  <script setup>
  const { $api } = useNuxtApp();
  const authStore = useAuthStore();
  
  const servers = ref([]);
  const showCreateServerModal = ref(false);
  
  onMounted(async () => {
    const response = await $api.getUserServers(authStore.user.id);
    servers.value = response.data;
  });
  </script>