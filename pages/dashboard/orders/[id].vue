<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
    <NavBar class="sticky top-0 z-50" />

    <div v-if="loading" class="container mx-auto px-4 py-12 flex justify-center">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="error" class="container mx-auto px-4 py-12 text-center">
      <div class="text-red-400 text-2xl mb-4">Failed to load order details</div>
      <p class="text-gray-400 mb-6">{{ error }}</p>
      <NuxtLink to="/dashboard/orders" class="px-6 py-3 bg-blue-600 text-white rounded-lg">
        Return to Orders
      </NuxtLink>
    </div>

    <div v-else class="container mx-auto px-4 py-12 max-w-7xl">
      <!-- Order Header -->
      <div class="mb-8 animate-fade-in-up">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {{ order.items[0]?.plan?.name || 'Server' }} Manager
            </h1>
            <p class="text-gray-300 mt-2">Order ID: #{{ order.id?.slice(0,8) || 'N/A' }}</p>
          </div>
          <span class="px-4 py-2 rounded-full text-sm" 
                :class="statusBadge(order.status)">
            {{ order.status }}
          </span>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
            <div class="text-gray-400 text-sm mb-1">Next Payment</div>
            <div class="text-xl font-bold text-purple-400">
              {{ formatCurrency(order.totalAmount) }}
            </div>
            <div class="text-gray-400 text-xs mt-1">
              {{ formatDate(order.nextBillingDate || new Date(Date.now() + 30*24*60*60*1000)) }}
            </div>
          </div>
          
          <div class="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
            <div class="text-gray-400 text-sm mb-1">Uptime</div>
            <div class="text-xl font-bold text-green-400">99.97%</div>
            <div class="text-gray-400 text-xs mt-1">Last 30 days</div>
          </div>

          <div class="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
            <div class="text-gray-400 text-sm mb-1">Resources</div>
            <div class="text-xl font-bold text-blue-400">
              {{ order.items[0]?.configuration?.ram || '4' }} GB
            </div>
            <div class="text-gray-400 text-xs mt-1">RAM Allocation</div>
          </div>

          <div class="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
            <div class="text-gray-400 text-sm mb-1">Active Since</div>
            <div class="text-xl font-bold text-yellow-400">{{ formatDaysActive(order.createdAt) }}</div>
            <div class="text-gray-400 text-xs mt-1">Days Online</div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Service Controls -->
          <div class="bg-gray-800/40 p-6 rounded-xl border border-gray-700/50">
            <h2 class="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
              <Icon name="heroicons:command-line" class="text-blue-400" />
              Server Controls
            </h2>
            
            <div class="grid grid-cols-2 gap-4 text-gray-400">
              <button class="control-btn bg-green-500/20 hover:bg-green-500/30"
                      @click="restartServer">
                <Icon name="heroicons:arrow-path" class="text-green-400" />
                Restart Instance
              </button>
              <button class="control-btn bg-blue-500/20 hover:bg-blue-500/30"
                      @click="openBackupModal">
                <Icon name="heroicons:server-stack" class="text-blue-400" />
                Create Backup
              </button>
              <button class="control-btn bg-purple-500/20 hover:bg-purple-500/30"
                      @click="openStatsModal">
                <Icon name="heroicons:chart-bar" class="text-purple-400" />
                View Metrics
              </button>
              <button class="control-btn bg-yellow-500/20 hover:bg-yellow-500/30"
                      @click="openConfigEditor">
                <Icon name="heroicons:adjustments-vertical" class="text-yellow-400" />
                Edit Config
              </button>
            </div>
          </div>

          <!-- Billing Section -->
          <div class="bg-gray-800/40 p-6 rounded-xl border border-gray-700/50">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-100 flex items-center gap-2">
                <Icon name="heroicons:credit-card" class="text-purple-400" />
                Billing & Payments
              </h2>
              <button class="text-blue-400 hover:text-blue-300 text-sm"
                      @click="refreshPaymentStatus">
                Refresh Status
              </button>
            </div>

            <!-- Payment Methods -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-gray-400">Payment Method</h3>
                <button class="text-sm text-blue-400 hover:text-blue-300"
                        @click="openPaymentMethodModal">
                  Change Card
                </button>
              </div>
              <div class="bg-gray-900/50 p-4 rounded-lg flex items-center gap-4">
                <Icon name="heroicons:credit-card" class="text-2xl text-gray-400" />
                <span v-if="order.paymentMethod" class="font-mono text-lg text-gray-100">
                  **** **** **** {{ order.paymentMethod?.card?.last4 || '1234' }}
                </span>
                <span v-else class="text-sm text-gray-400">No payment method on file</span>
              </div>
            </div>

            <!-- Invoices -->
            <div>
              <h3 class="text-gray-400 mb-3">Recent Invoices</h3>
              <div v-if="order.invoices && order.invoices.length > 0">
                <div v-for="invoice in order.invoices" :key="invoice.id"
                     class="bg-gray-900/50 p-4 rounded-lg mb-2 flex items-center justify-between">
                  <div>
                    <div class="text-sm">{{ formatDate(invoice.createdAt) }}</div>
                    <div :class="invoiceStatusColor(invoice.status)"
                         class="text-xs">
                      {{ invoice.status }}
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right">
                      <div class="text-sm">{{ formatCurrency(invoice.amount) }}</div>
                      <div class="text-xs text-gray-400">Monthly</div>
                    </div>
                    <button v-if="invoice.status === 'UNPAID'"
                            class="pay-btn"
                            @click="payInvoice(invoice)">
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="bg-gray-900/50 p-4 rounded-lg text-center text-gray-400 text-sm">
                No invoices found
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Subscription Management -->
        <div class="space-y-6">
          <div class="bg-gray-800/40 p-6 rounded-xl border border-gray-700/50">
            <h2 class="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
              <Icon name="heroicons:clock" class="text-yellow-400" />
              Subscription
            </h2>

            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-400">Billing Cycle</span>
                <span class="text-gray-100">Monthly</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-400">Next Renewal</span>
                <span class="text-gray-100">
                  {{ formatDate(order.nextBillingDate || new Date(Date.now() + 30*24*60*60*1000)) }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-400">Auto Renew</span>
                <div class="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" 
                         :checked="autoRenew" 
                         @change="toggleAutoRenew"
                         class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                  <label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer"></label>
                </div>
              </div>

              <div class="pt-4 border-t border-gray-700/50 space-y-3">
                <button class="danger-btn w-full"
                        @click="openCancelModal"
                        v-if="order.status === 'ACTIVE'">
                  Cancel Subscription
                </button>

                <button class="danger-btn w-full"
                        @click="openPauseModal"
                        v-if="order.status === 'ACTIVE'">
                  Pause Service
                </button>

                <button class="success-btn w-full"
                        @click="openUpgradeModal"
                        v-if="order.status === 'ACTIVE'">
                  Upgrade Plan
                </button>

                <button class="success-btn w-full"
                        @click="retryPayment"
                        v-if="order.status === 'UNPAID' || order.status === 'PAST_DUE'">
                  Retry Payment
                </button>
              </div>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="bg-red-900/20 p-6 rounded-xl border border-red-700/50">
            <h2 class="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <Icon name="heroicons:exclamation-triangle" />
              Danger Zone
            </h2>

            <div class="space-y-4">
              <button class="danger-btn w-full"
                      @click="openDeleteModal">
                <Icon name="heroicons:trash" class="mr-2" />
                Delete Server Permanently
              </button>

              <p class="text-xs text-red-400/70">
                Warning: This will immediately terminate your service and delete all data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-700/50">
        <h3 class="text-xl font-bold mb-4">Cancel Subscription</h3>
        <p class="text-gray-300 mb-6">Are you sure you want to cancel your subscription? Your server will be deactivated at the end of your billing period.</p>
        <div class="flex justify-end gap-3">
          <button @click="showCancelModal = false" class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
            Keep Subscription
          </button>
          <button @click="cancelSubscription" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-700/50">
        <h3 class="text-xl font-bold mb-4">Delete Server Permanently</h3>
        <p class="text-gray-300 mb-6">This action cannot be undone. All data associated with this server will be permanently deleted.</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
            Cancel
          </button>
          <button @click="deleteServer" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  auth: true
});

const route = useRoute();
const { $toast } = useNuxtApp();

const loading = ref(true);
const error = ref(null);
const order = ref({});
const autoRenew = ref(true);

// Modal states
const showCancelModal = ref(false);
const showDeleteModal = ref(false);
const showPaymentMethodModal = ref(false);

// Fetch order details
const fetchOrder = async () => {
  try {
    loading.value = true;
    error.value = null;
    const { data, error: fetchError } = await useFetch(`/api/order/${route.params.id}`);
    
    if (fetchError.value) {
      throw new Error(fetchError.value.message || 'Failed to load order');
    }
    
    if (!data.value) {
      throw new Error('Order not found');
    }
    
    order.value = data.value;
    autoRenew.value = data.value.autoRenew ?? true;
    
  } catch (err) {
    console.error('Error fetching order:', err);
    error.value = err.message || 'Failed to load order details';
  } finally {
    loading.value = false;
  }
};

// Formatter helpers
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDaysActive = (createdAt) => {
  if (!createdAt) return 'N/A';
  
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Status and badges 
const statusBadge = (status) => {
  return {
    'ACTIVE': 'bg-green-400/20 text-green-400',
    'PENDING': 'bg-blue-400/20 text-blue-400',
    'UNPAID': 'bg-red-400/20 text-red-400',
    'PAST_DUE': 'bg-red-400/20 text-red-400',
    'PAUSED': 'bg-yellow-400/20 text-yellow-400',
    'CANCELLED': 'bg-gray-400/20 text-gray-400'
  }[status] || 'bg-gray-400/20 text-gray-400';
};

const invoiceStatusColor = (status) => {
  return {
    'PAID': 'text-green-400',
    'UNPAID': 'text-red-400',
    'PENDING': 'text-yellow-400'
  }[status] || 'text-gray-400';
};

// Server controls
const restartServer = async () => {
  try {
    $toast.info('Restarting server...');
    await $fetch(`/api/server/${order.value.serviceId}/restart`, {
      method: 'POST'
    });
    $toast.success('Server restart initiated');
  } catch (error) {
    $toast.error('Failed to restart server');
    console.error(error);
  }
};

const openBackupModal = () => {
  $toast.info('Backup feature coming soon');
};

const openStatsModal = () => {
  $toast.info('Statistics feature coming soon');
};

const openConfigEditor = () => {
  $toast.info('Configuration editor coming soon');
};

// Payment methods
const refreshPaymentStatus = async () => {
  $toast.info('Refreshing payment status...');
  await fetchOrder();
  $toast.success('Payment status updated');
};

const payInvoice = async (invoice) => {
  try {
    $toast.info('Preparing payment...');
    const { url } = await $fetch(`/api/order/${order.value.id}/pay`, {
      method: 'POST',
      body: {
        invoiceId: invoice.id
      }
    });
    
    if (url) {
      window.location.href = url;
    } else {
      throw new Error('No payment URL received');
    }
  } catch (error) {
    $toast.error('Failed to process payment');
    console.error(error);
  }
};

// Subscription management
const toggleAutoRenew = async () => {
  autoRenew.value = !autoRenew.value;
  
  try {
    $toast.info(`Auto-renewal ${autoRenew.value ? 'enabled' : 'disabled'}`);
    await $fetch(`/api/order/${order.value.id}/auto-renew`, {
      method: 'POST',
      body: {
        autoRenew: autoRenew.value
      }
    });
  } catch (error) {
    // Revert UI state if API call fails
    autoRenew.value = !autoRenew.value;
    $toast.error('Failed to update auto-renewal settings');
    console.error(error);
  }
};

const cancelSubscription = async () => {
  try {
    $toast.info('Processing cancellation...');
    await $fetch(`/api/order/${order.value.id}/cancel`, {
      method: 'POST'
    });
    showCancelModal.value = false;
    await fetchOrder();
    $toast.success('Subscription cancelled successfully');
  } catch (error) {
    $toast.error('Failed to cancel subscription');
    console.error(error);
  }
};

const retryPayment = async () => {
  try {
    $toast.info('Retrying payment...');
    const { url } = await $fetch(`/api/order/${order.value.id}/retry-payment`, {
      method: 'POST'
    });
    
    if (url) {
      window.location.href = url;
    } else {
      throw new Error('No payment URL received');
    }
  } catch (error) {
    $toast.error('Failed to retry payment');
    console.error(error);
  }
};

const deleteServer = async () => {
  try {
    $toast.info('Deleting server...');
    await $fetch(`/api/order/${order.value.id}`, {
      method: 'DELETE'
    });
    showDeleteModal.value = false;
    $toast.success('Server deleted successfully');
    // Redirect to orders page
    navigateTo('/dashboard/orders');
  } catch (error) {
    $toast.error('Failed to delete server');
    console.error(error);
  }
};

const openPaymentMethodModal = () => {
  $toast.info('Payment method update coming soon');
};

const openPauseModal = () => {
  $toast.info('Pause feature coming soon');
};

const openUpgradeModal = () => {
  $toast.info('Upgrade feature coming soon');
};

// Initialize data
onMounted(fetchOrder);
</script>

<style scoped>
.control-btn {
  @apply p-3 rounded-lg flex items-center justify-center gap-2 
         transition-all duration-200 border border-transparent
         hover:border-gray-700/50 text-sm;
}

.pay-btn {
  @apply px-4 py-2 bg-green-500/20 text-green-400 rounded-lg 
         hover:bg-green-500/30 transition-colors text-sm;
}

.danger-btn {
  @apply px-4 py-2 bg-red-500/20 text-red-400 rounded-lg 
         hover:bg-red-500/30 transition-colors flex items-center 
         justify-center text-sm;
}

.success-btn {
  @apply px-4 py-2 bg-green-500/20 text-green-400 rounded-lg 
         hover:bg-green-500/30 transition-colors text-sm;
}

.toggle-checkbox:checked {
  @apply right-0 border-blue-500;
}
.toggle-checkbox:checked + .toggle-label {
  @apply bg-blue-500;
}
.toggle-checkbox {
  right: 0;
  z-index: 1;
  border-color: #68D391;
  top: -0.25rem;
}
.toggle-label {
  @apply block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}

@keyframes fadeInUp {
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