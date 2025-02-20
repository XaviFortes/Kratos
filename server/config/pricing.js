export const gameServerPricing = {
    minecraft: {
      basePrice: 4.99,
      ramTiers: [
        { gb: 4, price: 0 },
        { gb: 8, price: 5 },
        { gb: 16, price: 10 }
      ],
      cpuTiers: [
        { cores: 2, price: 0 },
        { cores: 4, price: 3 },
        { cores: 8, price: 6 }
      ],
      storageTiers: [
        { gb: 50, price: 0 },
        { gb: 100, price: 2 }
      ],
      dedicatedIpPrice: 3
    },
    // Add other games similarly
  }