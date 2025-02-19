export default defineEventHandler(async (event) => {
    const user = await getCurrentUser(event);
    
    return $fetch(`https://invoice.inovexservices.com/api/v1/clients/${user.invoice_ninja_client_id}/invoices`, {
      headers: {
        'X-API-TOKEN': process.env.INVOICE_NINJA_TOKEN,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
});