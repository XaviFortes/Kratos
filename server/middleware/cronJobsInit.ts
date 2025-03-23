import { registerCronJobs } from '../utils/cronJobs'

export default defineEventHandler(() => {
  // Only register in production to avoid duplicate runs in dev mode
  if (process.env.NODE_ENV === 'production') {
    registerCronJobs()
  }
})