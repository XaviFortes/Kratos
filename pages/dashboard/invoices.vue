<template>
    <div>
      <h2 class="text-2xl font-bold mb-6">Your Invoices</h2>
      
      <div v-for="invoice in invoices" :key="invoice.id" class="bg-gray-800 p-4 rounded-lg mb-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold">#{{ invoice.number }}</h3>
            <p class="text-gray-400">Amount: ${{ invoice.amount }}</p>
            <p :class="statusColor(invoice.status_id)">{{ invoiceStatus(invoice.status_id) }}</p>
          </div>
          <NuxtLink :to="`/invoices/${invoice.id}`" class="bg-blue-600 px-4 py-2 rounded">
            View Details
          </NuxtLink>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const { data: invoices } = await useFetch('/api/invoices', {
    headers: { Authorization: `Bearer ${useAuthToken()}` }
  });
  
  function invoiceStatus(status) {
    const statuses = {
      1: 'Draft',
      2: 'Sent',
      3: 'Partial',
      4: 'Paid',
      5: 'Cancelled'
    };
    return statuses[status] || 'Unknown';
  }
  </script>