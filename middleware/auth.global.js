export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore();

    // if (!authStore.user && to.path !== '/auth/login') {
    //     return navigateTo('/auth/login');
    // }
});