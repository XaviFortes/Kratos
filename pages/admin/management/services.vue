<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12">
    <div class="container mx-auto px-4">
      <!-- Header Section -->
      <section class="mb-12 animate-fade-in-up">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Services Management
            </h1>
            <p class="text-gray-300 mt-2">Manage and monitor all customer services</p>
          </div>
          <div class="space-x-4">
            <button 
              @click="openCreateModal"
              class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              + New Service
            </button>
          </div>
        </div>
      </section>

      <!-- Filters -->
      <div class="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 mb-6 animate-slide-in-right flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm text-gray-400 mb-1">Service Type</label>
          <select v-model="filters.type" class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-100">
            <option value="">All Types</option>
            <option value="GAME_SERVER">Game Server</option>
            <option value="VPS">VPS</option>
            <option value="DEDICATED_SERVER">Dedicated Server</option>
          </select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm text-gray-400 mb-1">Status</label>
          <select v-model="filters.status" class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-100">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="INSTALLING">Installing</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm text-gray-400 mb-1">Search</label>
          <input 
            type="text"
            v-model="filters.search"
            placeholder="Search by ID or user email"
            class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-100"
          />
        </div>
      </div>

      <!-- Services Table -->
      <div class="bg-gray-800/50 rounded-xl border border-gray-700/50 animate-slide-in-right">
        <table class="w-full">
          <thead class="border-b border-gray-700/50">
            <tr>
              <th class="px-6 py-4 text-left text-gray-400 font-medium">ID</th>
              <th class="px-6 py-4 text-left text-gray-400 font-medium">Type</th>
              <th class="px-6 py-4 text-left text-gray-400 font-medium">User</th>
              <th class="px-6 py-4 text-left text-gray-400 font-medium">Host</th>
              <th class="px-6 py-4 text-left text-gray-400 font-medium">Status</th>
              <th class="px-6 py-4 text-left text-gray-400 font-medium">Created</th>
              <th class="px-6 py-4 text-left text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="border-b border-gray-700/50">
              <td colspan="7" class="px-6 py-8 text-center text-gray-400">
                <div class="flex justify-center items-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              </td>
            </tr>
            <tr 
              v-for="service in filteredServices" 
              :key="service.id"
              class="border-b border-gray-700/50 last:border-0 hover:bg-gray-800/20 transition-colors"
            >
              <td class="px-6 py-4 text-gray-200 font-mono">{{ service.id.substring(0, 8) }}...</td>
              <td class="px-6 py-4 text-gray-300">{{ formatServiceType(service.type) }}</td>
              <td class="px-6 py-4 text-gray-300">
                {{ service.user?.email || 'Unknown' }}
              </td>
              <td class="px-6 py-4 text-gray-300">
                {{ service.host?.hostname || 'Not assigned' }}
              </td>
              <td class="px-6 py-4">
                <span :class="statusClasses(service.status)" class="px-3 py-1 rounded-full text-sm">
                  {{ service.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-300">{{ formatDate(service.createdAt) }}</td>
              <td class="px-6 py-4">
                <div class="flex space-x-4">
                  <button 
                    @click="viewDetails(service)"
                    class="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View
                  </button>
                  <button 
                    @click="openStatusModal(service)"
                    class="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    Status
                  </button>
                  <button 
                    @click="confirmDelete(service)"
                    class="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && filteredServices.length === 0" class="border-b border-gray-700/50">
              <td colspan="7" class="px-6 py-8 text-center text-gray-400">No services found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Service Details Modal -->
      <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-gray-800 rounded-xl border border-gray-700/50 w-full max-w-3xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-100">
                Service Details
              </h2>
              <button @click="showDetailsModal = false" class="text-gray-400 hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div v-if="selectedService" class="space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <div class="text-sm text-gray-400 mb-1">Service ID</div>
                  <div class="text-gray-100 font-mono">{{ selectedService.id }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-400 mb-1">Status</div>
                  <span :class="statusClasses(selectedService.status)" class="px-3 py-1 rounded-full text-sm">
                    {{ selectedService.status }}
                  </span>
                </div>
              </div>

              <div>
                <div class="text-sm text-gray-400 mb-1">User</div>
                <div class="text-gray-100">{{ selectedService.user?.email || 'Unknown' }}</div>
              </div>

              <div>
                <div class="text-sm text-gray-400 mb-1">Host</div>
                <div class="text-gray-100">{{ selectedService.host?.hostname || 'Not assigned' }}</div>
              </div>

              <div>
                <div class="text-sm text-gray-400 mb-1">Created</div>
                <div class="text-gray-100">{{ formatDate(selectedService.createdAt) }}</div>
              </div>

              <div>
                <div class="text-sm text-gray-400 mb-1">Configuration</div>
                <pre class="bg-gray-900/50 p-4 rounded-lg text-gray-100 overflow-auto text-sm">{{ JSON.stringify(selectedService.config, null, 2) }}</pre>
              </div>

              <div v-if="selectedService.pterodactyl">
                <div class="text-sm text-gray-400 mb-1">Pterodactyl Server</div>
                <div class="text-gray-100">ID: {{ selectedService.pterodactyl.pteroId }}</div>
              </div>

              <div v-if="selectedService.deployments && selectedService.deployments.length">
                <div class="text-sm text-gray-400 mb-1">Recent Deployment</div>
                <div class="bg-gray-900/50 p-4 rounded-lg">
                  <div class="flex justify-between">
                    <span :class="statusClasses(selectedService.deployments[0].status)" class="px-3 py-1 rounded-full text-sm">
                      {{ selectedService.deployments[0].status }}
                    </span>
                    <span class="text-gray-400 text-sm">{{ formatDate(selectedService.deployments[0].createdAt) }}</span>
                  </div>
                  <div class="mt-4 space-y-2">
                    <div v-for="(log, i) in selectedService.deployments[0].logs" :key="i" class="text-sm text-gray-300">
                      {{ log }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Status Modal -->
      <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-gray-800 rounded-xl border border-gray-700/50 w-full max-w-md animate-fade-in-up">
          <div class="p-6">
            <h2 class="text-2xl font-bold text-gray-100 mb-6">
              Change Service Status
            </h2>
            
            <form @submit.prevent="updateServiceStatus">
              <div class="space-y-6">
                <div>
                  <label class="block text-sm text-gray-300 mb-2">Status</label>
                  <select 
                    v-model="statusForm.status" 
                    required 
                    class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PENDING" class="bg-gray-800">Pending</option>
                    <option value="INSTALLING" class="bg-gray-800">Installing</option>
                    <option value="ACTIVE" class="bg-gray-800">Active</option>
                    <option value="SUSPENDED" class="bg-gray-800">Suspended</option>
                    <option value="CANCELLED" class="bg-gray-800">Cancelled</option>
                  </select>
                </div>

                <div class="mt-8 flex justify-end gap-3">
                  <button 
                    type="button" 
                    @click="showStatusModal = false"
                    class="px-5 py-2.5 text-gray-300 hover:text-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    :disabled="submitting"
                    class="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {{ submitting ? 'Updating...' : 'Update Status' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-gray-800 rounded-xl border border-gray-700/50 w-full max-w-md animate-fade-in-up">
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-100 mb-3">Confirm Delete</h3>
            <p class="text-gray-300 mb-6">Delete service for "{{ selectedService?.user?.email || 'Unknown' }}" permanently?</p>
            <div class="flex justify-end gap-3">
              <button 
                @click="showDeleteModal = false" 
                class="px-5 py-2.5 text-gray-300 hover:text-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="deleteService" 
                :disabled="deleting"
                class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {{ deleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Service Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-gray-800 rounded-xl border border-gray-700/50 w-full max-w-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <h2 class="text-2xl font-bold text-gray-100 mb-6">
              New Service
            </h2>
            
            <form @submit.prevent="submitForm">
              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm text-gray-300 mb-2">Service Type</label>
                    <select 
                      v-model="form.type" 
                      required
                      class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-100"
                    >
                      <option value="GAME_SERVER" class="bg-gray-800">Game Server</option>
                      <option value="VPS" class="bg-gray-800">VPS</option>
                      <option value="DEDICATED_SERVER" class="bg-gray-800">Dedicated Server</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm text-gray-300 mb-2">User</label>
                    <select 
                      v-model="form.userId" 
                      required
                      class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-100"
                    >
                      <option v-for="user in users" :key="user.id" :value="user.id" class="bg-gray-800">
                        {{ user.email }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm text-gray-300 mb-2">Host (Optional)</label>
                    <select 
                      v-model="form.hostId"
                      class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-100"
                    >
                      <option value="">None</option>
                      <option v-for="host in hosts" :key="host.id" :value="host.id" class="bg-gray-800">
                        {{ host.hostname }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm text-gray-300 mb-2">Status</label>
                    <select 
                      v-model="form.status"
                      required
                      class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-100"
                    >
                      <option value="PENDING" class="bg-gray-800">Pending</option>
                      <option value="INSTALLING" class="bg-gray-800">Installing</option>
                      <option value="ACTIVE" class="bg-gray-800">Active</option>
                      <option value="SUSPENDED" class="bg-gray-800">Suspended</option>
                      <option value="CANCELLED" class="bg-gray-800">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-gray-300 mb-2">Configuration (JSON)</label>
                  <textarea
                    v-model="form.configJson"
                    rows="8"
                    required
                    class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-100 font-mono text-sm"
                  ></textarea>
                </div>

                <div class="mt-8 flex justify-end gap-3">
                  <button 
                    type="button" 
                    @click="closeModal"
                    class="px-5 py-2.5 text-gray-300 hover:text-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    :disabled="submitting"
                    class="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {{ submitting ? 'Creating...' : 'Create Service' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $toast } = useNuxtApp()

const services = ref([])
const hosts = ref([])
const users = ref([])
const loading = ref(true)
const showModal = ref(false)
const showDetailsModal = ref(false)
const showStatusModal = ref(false)
const showDeleteModal = ref(false)
const selectedService = ref(null)
const submitting = ref(false)
const deleting = ref(false)

// Filters
const filters = ref({
  type: '',
  status: '',
  search: ''
})

// Form for changing status
const statusForm = ref({
  status: ''
})

definePageMeta({
  layout: 'admin'
})

const defaultForm = () => ({
  type: 'GAME_SERVER',
  userId: '',
  hostId: '',
  status: 'PENDING',
  configJson: JSON.stringify({
    // Default config based on type
    game: 'minecraft',
    slots: 10,
    ram: 4,
    cpu: 2,
    storage: 10
  }, null, 2)
})

const form = ref(defaultForm())

// Computed filtered services
const filteredServices = computed(() => {
  let result = services.value

  if (filters.value.type) {
    result = result.filter(service => service.type === filters.value.type)
  }

  if (filters.value.status) {
    result = result.filter(service => service.status === filters.value.status)
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(service => 
      service.id.toLowerCase().includes(search) || 
      (service.user?.email && service.user.email.toLowerCase().includes(search))
    )
  }

  return result
})

// Format helpers
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const formatServiceType = (type) => {
  const types = {
    'GAME_SERVER': 'Game Server',
    'VPS': 'Virtual Private Server',
    'DEDICATED_SERVER': 'Dedicated Server'
  }
  return types[type] || type
}

const statusClasses = (status) => {
  return {
    'PENDING': 'bg-yellow-400/20 text-yellow-400',
    'INSTALLING': 'bg-blue-400/20 text-blue-400',
    'ACTIVE': 'bg-green-400/20 text-green-400',
    'SUSPENDED': 'bg-orange-400/20 text-orange-400',
    'CANCELLED': 'bg-red-400/20 text-red-400'
  }[status] || 'bg-gray-400/20 text-gray-400'
}

// Modal functions
const openCreateModal = async () => {
  form.value = defaultForm()
  await Promise.all([
    fetchUsers(),
    fetchHosts()
  ])
  showModal.value = true
}

const viewDetails = (service) => {
  selectedService.value = service
  showDetailsModal.value = true
}

const openStatusModal = (service) => {
  selectedService.value = service
  statusForm.value.status = service.status
  showStatusModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = defaultForm()
}

const confirmDelete = (service) => {
  selectedService.value = service
  showDeleteModal.value = true
}

// Form submission
const submitForm = async () => {
  submitting.value = true
  try {
    // Parse JSON config
    const config = JSON.parse(form.value.configJson)
    
    const url = '/api/admin/services'
    const method = 'POST'

    await $fetch(url, {
      method,
      body: {
        type: form.value.type,
        userId: form.value.userId,
        hostId: form.value.hostId || undefined,
        status: form.value.status,
        config
      }
    })

    $toast.success('Service created successfully')
    await fetchServices()
    closeModal()
  } catch (error) {
    console.error(error)
    $toast.error(error.data?.message || 'An error occurred')
  } finally {
    submitting.value = false
  }
}

// Update service status
const updateServiceStatus = async () => {
  submitting.value = true
  try {
    await $fetch(`/api/admin/services/${selectedService.value.id}/status`, {
      method: 'PUT',
      body: {
        status: statusForm.value.status
      }
    })

    $toast.success('Service status updated successfully')
    await fetchServices()
    showStatusModal.value = false
  } catch (error) {
    $toast.error(error.data?.message || 'Failed to update service status')
  } finally {
    submitting.value = false
  }
}

// Delete service
const deleteService = async () => {
  deleting.value = true
  try {
    await $fetch(`/api/admin/services/${selectedService.value.id}`, {
      method: 'DELETE'
    })
    $toast.success('Service deleted successfully')
    await fetchServices()
  } catch (error) {
    $toast.error(error.data?.message || 'Failed to delete service')
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

// Fetch data
const fetchServices = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/admin/services')
    services.value = response
  } catch (error) {
    $toast.error('Failed to load services')
  } finally {
    loading.value = false
  }
}

const fetchHosts = async () => {
  try {
    const response = await $fetch('/api/admin/hosts')
    hosts.value = response
  } catch (error) {
    $toast.error('Failed to load hosts')
  }
}

const fetchUsers = async () => {
  try {
    const response = await $fetch('/api/admin/users')
    users.value = response
  } catch (error) {
    $toast.error('Failed to load users')
  }
}

// Initialize
onMounted(fetchServices)
</script>