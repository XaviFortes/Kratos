// plugins/pterodactyl.client.ts
import ptero from "pterodactyl-api-wrapper";

export default defineNuxtPlugin(() => {
  if (process.env.PTERODACTYL_URL) {
    ptero.Setup.setPanel(process.env.PTERODACTYL_URL);
  } else {
    throw new Error("PTERODACTYL_URL is not defined");
  }
});