export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();

    const $api = {
        // Pterodactyl API
        async createServer(serverData) {
            return $fetch('/api/pterodactyl/servers', {
                method: 'POST',
                body: serverData,
                headers: {
                    Authorization: `Bearer ${useAuthStore().token}`
                }
            });
        },

        // Invoice Ninja API
        async createInvoice(invoiceData) {
            return $fetch('/api/invoices/create', {
                method: 'POST',
                body: invoiceData
            });
        }
    };

    return {
        provide: {
            api: $api
        }
    };
});