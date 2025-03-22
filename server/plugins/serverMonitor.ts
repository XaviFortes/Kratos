import { ServerMonitorService } from '../services/ServerMonitorService'

export default defineNitroPlugin(() => {
  // Start the server monitor service on server startup
  const serverMonitorService = new ServerMonitorService()
  serverMonitorService.startMonitoring()
})