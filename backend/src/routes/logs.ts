import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();
router.use(requireAuth);

const user = (req: Request) => (req as any).user;

// GET /api/logs?numberId=&page=&limit=
router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const where: any = { userId: user(req).userId };
  if (req.query.numberId) where.virtualNumberId = req.query.numberId;
  if (req.query.status) where.status = req.query.status;

  const [total, logs] = await Promise.all([
    prisma.callLog.count({ where }),
    prisma.callLog.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip,
      take: limit,
      include: { virtualNumber: { select: { e164Number: true, friendlyName: true } } },
    }),
  ]);

  return res.json({ total, page, limit, data: logs });
});

// POST /api/logs/simulate — create a fake call log for testing
router.post('/simulate', async (req: Request, res: Response) => {
  const numbers = await prisma.virtualNumber.findMany({
    where: { userId: user(req).userId },
    take: 1,
  });
  if (!numbers.length) return res.status(400).json({ error: 'No virtual numbers found. Create one first.' });

  const vn = numbers[0];
  const statuses = ['COMPLETED', 'NO_ANSWER', 'VOICEMAIL', 'FAILED'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const duration = status === 'COMPLETED' ? Math.floor(30 + Math.random() * 300) : null;

  const areaCode = Math.floor(200 + Math.random() * 800);
  const lineNum = Math.floor(1000000 + Math.random() * 9000000);
  const callerNumber = `+1${areaCode}${lineNum}`;

  const log = await prisma.callLog.create({
    data: {
      virtualNumberId: vn.id,
      userId: user(req).userId,
      callerNumber,
      calledNumber: vn.e164Number,
      forwardedTo: req.body.forwardedTo || '+15550001234',
      status,
      duration,
      direction: 'INBOUND',
      startedAt: new Date(),
      endedAt: duration ? new Date(Date.now() + duration * 1000) : null,
    },
  });
  return res.status(201).json(log);
});

export default router;
