import prisma from "~/server/lib/prisma";
import { requireAdminUser } from "~/server/utils/adminAuth";

// server/api/admin/stats.get.ts
export default defineEventHandler(async (event) => {
    // await requireAdminUser(event);
  
    const [totalServers, activeUsers, monthlyRevenue] = await Promise.all([
      prisma.servers.count(),
    //   prisma.users.count({ where: { status: 'active' }}),
      prisma.users.count(),
    //   prisma.invoices.aggregate({
        // _sum: { amount: true }
    //   })
      prisma.invoices.aggregate({
        _sum: { amount: true },
        where: { 
          status: 'paid',
          created_at: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        }
      })
    ]);
  
    return {
      totalServers,
      activeUsers,
      monthlyRevenue: monthlyRevenue._sum.amount || 0
    };
  });