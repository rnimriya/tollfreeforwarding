// G-12: SMS inbox routes
import { Router, Request, Response } from 'express';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { ApiError } from '../lib/apiError.js';
import { prisma } from '../lib/prisma.js';
import { sendSms } from '../lib/twilio.js';

const router = Router();

router.use(requireAuth);

// GET /api/sms — list SMS logs with filters
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const page  = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
  const numberId = req.query.numberId as string | undefined;
  const direction = req.query.direction as string | undefined;

  const where: any = { userId };
  if (numberId) where.virtualNumberId = numberId;
  if (direction) where.direction = direction;

  const [total, logs] = await Promise.all([
    prisma.smsLog.count({ where }),
    prisma.smsLog.findMany({
      where,
      include: { virtualNumber: { select: { e164Number: true, friendlyName: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.json({ total, page, limit, data: logs });
}));

// POST /api/sms/send — send outbound SMS
router.post('/send', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { virtualNumberId, to, body } = req.body;

  if (!virtualNumberId || !to || !body) throw ApiError.badRequest('virtualNumberId, to, and body are required');

  const vn = await prisma.virtualNumber.findFirst({ where: { id: virtualNumberId, userId, deletedAt: null } });
  if (!vn) throw ApiError.notFound('Virtual number not found');

  const sid = await sendSms(to, vn.e164Number, body);

  const log = await prisma.smsLog.create({
    data: {
      virtualNumberId: vn.id,
      userId,
      direction: 'OUTBOUND',
      fromNumber: vn.e164Number,
      toNumber: to,
      body,
      status: 'SENT',
      providerSid: sid,
    },
  });

  res.status(201).json(log);
}));

// GET /api/sms/thread/:numberId/:contact — conversation thread
router.get('/thread/:numberId/:contact', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { numberId, contact } = req.params;

  const vn = await prisma.virtualNumber.findFirst({ where: { id: numberId, userId, deletedAt: null } });
  if (!vn) throw ApiError.notFound('Virtual number not found');

  const messages = await prisma.smsLog.findMany({
    where: {
      virtualNumberId: numberId,
      OR: [{ fromNumber: contact }, { toNumber: contact }],
    },
    orderBy: { createdAt: 'asc' },
  });

  res.json(messages);
}));

export default router;
