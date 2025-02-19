// composables/usePayment.js
export const usePayment = () => {
    const createPaymentSession = async (planId) => {
      const { $api } = useNuxtApp();
      const authStore = useAuthStore();
  
      // 1. Create Invoice Ninja invoice
      const invoice = await $api.createInvoice({
        user_id: authStore.user.id,
        plan_id: planId
      });
  
      // 2. Redirect to payment page
      window.location.href = invoice.payment_url;
    };
  
    return { createPaymentSession };
  };