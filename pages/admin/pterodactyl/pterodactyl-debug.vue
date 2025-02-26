<!-- pages/admin/pterodactyl-debug.vue -->
<template>
    <div class="p-8 space-y-6 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div class="bg-gray-800/50 p-6 rounded-xl">
        <h2 class="text-2xl font-bold mb-4 text-purple-400">Pterodactyl Debug</h2>
        
        <div class="space-y-4">
          <div class="bg-gray-700/30 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-gray-300 mb-2">Test User Creation</h3>
            <input v-model="testUser.email" placeholder="Email" class="bg-gray-600/50 text-gray-300 p-2 rounded mb-2">
            <!-- <input v-model="testUser.username" placeholder="Username" class="bg-gray-600/50 text-gray-300 p-2 rounded mb-2"> -->
            <input v-model="testUser.first_name" placeholder="name" class="bg-gray-600/50 text-gray-300 p-2 rounded mb-2">
            <button @click="testAction('create-user')" class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
              Test User Creation
            </button>
          </div>
  
          <div class="bg-gray-700/30 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-gray-300 mb-2">Test Server Creation</h3>
            <div class="grid grid-cols-2 gap-4">
                <!-- Add label on top so the user knows what field it is -->
                <div class="flex flex-col">
                    <label class="text-gray-400 mr-2">User ID</label>
                    <input v-model="serverConfig.user_id" placeholder="User ID" type="string" class="bg-gray-600/50 text-gray-300 p-2 rounded">
                </div>
                <div class="flex flex-col">
                    <label class="text-gray-400 mr-2">Nest ID</label>
                    <input v-model="serverConfig.nest" placeholder="Nest ID" type="number" class="bg-gray-600/50 text-gray-300 p-2 rounded">
                </div>
                <div class="flex flex-col">
                    <label class="text-gray-400 mr-2">Egg ID</label>
                    <input v-model="serverConfig.egg" placeholder="Egg ID" type="number" class="bg-gray-600/50 text-gray-300 p-2 rounded">
                </div>
                <div class="flex flex-col">
                    <label class="text-gray-400 mr-2">CPU</label>
                    <input v-model="serverConfig.memory" placeholder="CPU (100)%" type="number" class="bg-gray-600/50 text-gray-300 p-2 rounded">
                </div>
                <div class="flex flex-col">
                    <label class="text-gray-400 mr-2">Memory</label>
                    <input v-model="serverConfig.memory" placeholder="Memory (MB)" type="number" class="bg-gray-600/50 text-gray-300 p-2 rounded">
                </div>
                <div class="flex flex-col">
                    <label class="text-gray-400 mr-2">Storage</label>
                    <input v-model="serverConfig.disk" placeholder="Disk (MB)" type="number" class="bg-gray-600/50 text-gray-300 p-2 rounded">
                </div>
            </div>
            <button @click="testAction('create-server')" class="bg-green-500 hover:bg-green-600 text-gray-300 px-4 py-2 rounded mt-4">
              Test Server Creation
            </button>
          </div>
  
          <div class="bg-gray-700/30 p-4 rounded-lg">
            <pre class="text-sm text-gray-300 overflow-auto max-h-96">{{ JSON.stringify(results, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const testUser = ref({
    email: 'thextay@gmail.com',
    // username: 'testuser',
    first_name: 'Test'
})
  const serverConfig = ref({
    user_id: 1,
    nest: 1,
    egg: 1,
    memory: 1024,
    disk: 5120,
    cpu: 100,
    swap: 0,
    io: 500,
    port_range: '25500-25600',
    databases: 1,
    backups: 1,
    allocation_limit: 1,
    allocation: {
      default: 1
    }
  })
  
  const results = ref([])
  
  async function testAction(action) {
    try {
      const { data } = await $fetch('/api/pterodactyl/debug', {
        method: 'POST',
        body: {
          action,
          user: testUser.value,
          config: serverConfig.value
        }
      })
      results.value.unshift(data)
    } catch (error) {
      results.value.unshift({
        error: error.data?.error || error.message,
        stack: error.data?.stack,
        request: error.data?.requestData
      })
    }
  }
  </script>