// composables/useInvoice.js
export const useInvoice = () => {
    const createInvoice = async (serverConfig) => {
      const authStore = useAuthStore()
      
      const { data } = await useFetch('/api/invoices/create', {
        method: 'POST',
        body: {
          clientId: authStore.user.invoiceNinjaId,
          items: [{
            product_key: serverConfig.game,
            cost: serverConfig.totalPrice,
            notes: `Game Server: ${serverConfig.ram}GB RAM, ${serverConfig.cpu} Cores`
          }]
        }
      })
  
      return data.value.payment_url
    }
  
    return { createInvoice }
  }