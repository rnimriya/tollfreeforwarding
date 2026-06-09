import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();
router.use(requireAuth);

// GET /api/dashboard/stats
router.get(
  '/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [totalNumbers, totalLogs, monthLogs, lastMonthLogs, statusBreakdown, durationAgg] =
      await Promise.all([
        prisma.virtualNumber.count({ where: { userId, deletedAt: null } }),
        prisma.callLog.count({ where: { userId } }),
        prisma.callLog.count({ where: { userId, startedAt: { gte: startOfMonth } } }),
        prisma.callLog.count({ where: { userId, startedAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
        prisma.callLog.groupBy({
          by: ['status'],
          where: { userId, startedAt: { gte: startOfMonth } },
          _count: true,
        }),
        // Single aggregate query replaces fetching all records to compute average
        prisma.callLog.aggregate({
          where: { userId, status: 'COMPLETED', startedAt: { gte: startOfMonth }, duration: { not: null } },
          _avg: { duration: true },
        }),
      ]);

    const avgDuration = Math.round(durationAgg._avg.duration ?? 0);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = await prisma.callLog.findMany({
      where: { userId, startedAt: { gte: sevenDaysAgo } },
      select: { startedAt: true },
      orderBy: { startedAt: 'asc' },
    });

    const dailyMap: Record<string, number> = {};
    for (const l of recentLogs) {
      const day = l.startedAt.toISOString().slice(0, 10);
      dailyMap[day] = (dailyMap[day] ?? 0) + 1;
    }
    const dailyCalls = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    const callGrowth =
      lastMonthLogs > 0
        ? Math.round(((monthLogs - lastMonthLogs) / lastMonthLogs) * 100)
        : monthLogs > 0
          ? 100
          : 0;

    return res.json({
      totalNumbers,
      totalCalls: totalLogs,
      monthCalls: monthLogs,
      callGrowth,
      avgDuration,
      statusBreakdown: statusBreakdown.map((s: any) => ({ status: s.status, count: s._count })),
      dailyCalls,
    });
  })
);

export default router;
