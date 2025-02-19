import { ref } from 'vue';

export const useFeaturedGames = () => {
    const featuredGames = ref([
        {
            id: 1,
            name: 'Minecraft',
            slug: 'minecraft', // Match this with the route param
            image: '/games/minecraft.png',
            description: 'Build, explore, and survive in your own blocky universe',
            minPrice: 4.99,
            features: ['Mod Support', '1-Click Install', 'SSD Storage'],
            urlBuy: 'https://cloud.inovexservices.com/minecraft'
        },
        {
            id: 2,
            name: 'Valheim',
            slug: 'valheim', // Match this with the route param
            image: '/games/valheim.png',
            description: 'Conquer the tenth Norse world with your clan',
            minPrice: 7.99,
            features: ['Auto Updates', 'World Backups', 'Dedicated IP'],
            urlBuy: 'https://cloud.inovexservices.com/minecraft'            
        },
        {
            id: 3,
            name: 'Rust',
            slug: 'rust', // Match this with the route param
            image: '/games/rust.jpg',
            description: 'Survive the ultimate multiplayer survival experience',
            minPrice: 9.99,
            features: ['Wipe Scheduler', 'High Performance', 'Mod Manager'],
            urlBuy: 'https://cloud.inovexservices.com/minecraft'
        },
    ]);
  
    return { featuredGames };
  };