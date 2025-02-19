export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const pterodactylApiKey = process.env.PTERODACTYL_API_KEY;
  
    return $fetch('https://pterodactyl.app/api/application/servers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pterodactylApiKey}`,
        'Content-Type': 'application/json'
      },
      body
    });
  });