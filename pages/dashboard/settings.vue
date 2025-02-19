<template>
    <div>
      <h2 class="text-2xl font-bold mb-6">Account Settings</h2>
      
      <div class="space-y-6">
        <div class="bg-gray-800 p-6 rounded-lg">
          <h3 class="text-lg font-bold mb-4">Billing Information</h3>
          <InvoiceNinjaIntegration />
        </div>
        
        <div class="bg-gray-800 p-6 rounded-lg">
          <h3 class="text-lg font-bold mb-4">Payment Methods</h3>
          <PaymentMethods />
        </div>
      </div>
    </div>
  </template>