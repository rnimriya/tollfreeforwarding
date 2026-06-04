import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();
router.use(requireAuth);

const user = (req: Request) => (req as any).user;

// GET /api/dashboard/stats
router.get('/stats', async (req: Request, res: Response) => {
  const userId = user(req).userId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [totalNumbers, totalLogs, monthLogs, lastMonthLogs, statusBreakdown] = await Promise.all([
    prisma.virtualNumber.count({ where: { userId } }),
    prisma.callLog.count({ where: { userId } }),
    prisma.callLog.count({ where: { userId, startedAt: { gte: startOfMonth } } }),
    prisma.callLog.count({ where: { userId, startedAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    prisma.callLog.groupBy({
      by: ['status'],
      where: { userId, startedAt: { gte: startOfMonth } },
      _count: true,
    }),
  ]);

  // Average duration for completed calls this month
  const completedLogs = await prisma.callLog.findMany({
    where: { userId, status: 'COMPLETED', startedAt: { gte: startOfMonth }, duration: { not: null } },
    select: { duration: true },
  });
  const avgDuration = completedLogs.length
    ? Math.round(completedLogs.reduce((s: number, l: any) => s + (l.duration || 0), 0) / completedLogs.length)
    : 0;

  // Recent 7-day call volume
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentLogs = await prisma.callLog.findMany({
    where: { userId, startedAt: { gte: sevenDaysAgo } },
    select: { startedAt: true, status: true },
    orderBy: { startedAt: 'asc' },
  });

  // Group by day
  const dailyMap: Record<string, number> = {};
  recentLogs.forEach((l: any) => {
    const day = l.startedAt.toISOString().slice(0, 10);
    dailyMap[day] = (dailyMap[day] || 0) + 1;
  });

  const dailyCalls = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  const callGrowth = lastMonthLogs > 0
    ? Math.round(((monthLogs - lastMonthLogs) / lastMonthLogs) * 100)
    : monthLogs > 0 ? 100 : 0;

  return res.json({
    totalNumbers,
    totalCalls: totalLogs,
    monthCalls: monthLogs,
    callGrowth,
    avgDuration,
    statusBreakdown: statusBreakdown.map((s: any) => ({ status: s.status, count: s._count })),
    dailyCalls,
  });
});

export default router;
