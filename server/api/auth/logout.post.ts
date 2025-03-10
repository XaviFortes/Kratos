export default defineEventHandler((event) => {
    deleteCookie(event, 'authToken')
    return { success: true }
})