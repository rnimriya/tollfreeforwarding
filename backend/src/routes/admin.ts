// G-16: Admin panel routes — protected by role=admin
import { Router, Request, Response } from 'express';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { ApiError } from '../lib/apiError.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Middleware: require admin role
function requireAdmin(req: Request, res: Response, next: Function) {
  requireAuth(req, res, async () => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (user?.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    next();
  });
}

// GET /api/admin/users — list all users with stats
router.get('/users', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 25);
  const search = req.query.search as string | undefined;

  const where = search
    ? { OR: [{ email: { contains: search, mode: 'insensitive' as any } }, { firstName: { contains: search, mode: 'insensitive' as any } }] }
    : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        plan: true, role: true, createdAt: true, minutesUsedThisPeriod: true,
        stripeCustomerId: true, stripeSubscriptionId: true, trialEndsAt: true,
        _count: { select: { virtualNumbers: true, callLogs: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.json({ total, page, limit, data: users });
}));

// GET /api/admin/users/:id — single user detail
router.get('/users/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      virtualNumbers: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
      _count: { select: { callLogs: true, auditLogs: true, smsLogs: true } },
    },
  });
  if (!user) throw ApiError.notFound('User not found');
  const { passwordHash, resetToken, ...safe } = user as any;
  res.json(safe);
}));

// PATCH /api/admin/users/:id — override plan or role
router.patch('/users/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { plan, role } = req.body;
  const data: any = {};
  if (plan) data.plan = plan;
  if (role) data.role = role;

  const updated = await prisma.user.update({ where: { id: req.params.id }, data });
  res.json({ id: updated.id, email: updated.email, plan: updated.plan, role: updated.role });
}));

// GET /api/admin/stats — platform-wide stats
router.get('/stats', requireAdmin, asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalNumbers, totalCalls, totalSms, planBreakdown, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.virtualNumber.count({ where: { deletedAt: null } }),
    prisma.callLog.count(),
    prisma.smsLog.count(),
    prisma.user.groupBy({ by: ['plan'], _count: { id: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' }, take: 10,
      select: { id: true, email: true, firstName: true, lastName: true, plan: true, createdAt: true },
    }),
  ]);

  res.json({
    totalUsers,
    totalNumbers,
    totalCalls,
    totalSms,
    planBreakdown: planBreakdown.map(p => ({ plan: p.plan, count: p._count.id })),
    recentUsers,
  });
}));

// GET /api/admin/audit — global audit log
router.get('/audit', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 50);

  const [total, logs] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.json({ total, page, limit, data: logs });
}));

// POST /api/admin/users/:id/reset-minutes — reset minute counter
router.post('/users/:id/reset-minutes', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  await prisma.user.update({ where: { id: req.params.id }, data: { minutesUsedThisPeriod: 0, billingPeriodStart: new Date() } });
  res.json({ ok: true });
}));

export default router;
