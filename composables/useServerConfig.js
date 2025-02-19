export const useServerConfig = () => {
    // Pricing configuration
    const priceConfig = ref({
        ram: {
          tiers: [
            { gb: 4, price: 0 },
            { gb: 8, price: 5 },
            { gb: 16, price: 10 },
            { gb: 32, price: 20 }
          ]
        },
        cpu: {
          tiers: [
            { cores: 2, price: 0 },
            { cores: 4, price: 8 },
            { cores: 8, price: 15 }
          ]
        },
        storage: {
          tiers: [
            { gb: 50, price: 0 },
            { gb: 100, price: 5 },
            { gb: 200, price: 10 }
          ]
        },
        dedicatedIp: {
          price: 3
        }
      });
    

    const calculateTotal = (basePrice, config) => {
        let total = Number(basePrice);

        total += priceConfig.value.ram.tiers.find(t => t.gb === config.ram).price;
        total += priceConfig.value.cpu.tiers.find(t => t.cores === config.cpu).price;
        total += priceConfig.value.storage.tiers.find(t => t.gb === config.storage).price;
        if (config.dedicatedIp) total += priceConfig.value.dedicatedIp.price;

        // Round to 2 decimal places
        return Math.round(total * 100) / 100;
    };

    return { priceConfig, calculateTotal };
};