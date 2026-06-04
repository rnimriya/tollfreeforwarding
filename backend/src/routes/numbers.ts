import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { cache } from '../lib/cache.js';
import { v4 as uuid } from 'uuid';

const router = Router();
router.use(requireAuth);

const user = (req: Request) => (req as any).user;

// GET /api/numbers
router.get('/', async (req: Request, res: Response) => {
  const numbers = await prisma.virtualNumber.findMany({
    where: { userId: user(req).userId },
    include: { _count: { select: { callLogs: true, routingRules: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(numbers);
});

// GET /api/numbers/:id
router.get('/:id', async (req: Request, res: Response) => {
  const vn = await prisma.virtualNumber.findFirst({
    where: { id: req.params.id, userId: user(req).userId },
    include: { routingRules: { orderBy: { priority: 'asc' } } },
  });
  if (!vn) return res.status(404).json({ error: 'Not found' });
  return res.json(vn);
});

// POST /api/numbers - provision a new (simulated) number
router.post('/', async (req: Request, res: Response) => {
  const { friendlyName, countryCode = 'US', numberType = 'LOCAL', timezone = 'America/New_York' } = req.body;

  // Generate a fake E.164 number for local dev
  const area = Math.floor(200 + Math.random() * 800);
  const line = Math.floor(1000000 + Math.random() * 9000000);
  const e164 = `+1${area}${line}`;

  const vn = await prisma.virtualNumber.create({
    data: {
      userId: user(req).userId,
      e164Number: e164,
      friendlyName: friendlyName || `My Number ${area}`,
      countryCode,
      numberType,
      timezone,
      status: 'ACTIVE',
    },
  });
  return res.status(201).json(vn);
});

// PATCH /api/numbers/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const vn = await prisma.virtualNumber.findFirst({
    where: { id: req.params.id, userId: user(req).userId },
  });
  if (!vn) return res.status(404).json({ error: 'Not found' });

  const updated = await prisma.virtualNumber.update({
    where: { id: req.params.id },
    data: {
      friendlyName: req.body.friendlyName ?? vn.friendlyName,
      timezone: req.body.timezone ?? vn.timezone,
      ivrEnabled: req.body.ivrEnabled ?? vn.ivrEnabled,
      ivrFlow: req.body.ivrFlow ? JSON.stringify(req.body.ivrFlow) : vn.ivrFlow,
      voicemailGreeting: req.body.voicemailGreeting ?? vn.voicemailGreeting,
      status: req.body.status ?? vn.status,
    },
  });

  // Invalidate cache
  cache.del(`num:${vn.e164Number}`);
  return res.json(updated);
});

// DELETE /api/numbers/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const vn = await prisma.virtualNumber.findFirst({
    where: { id: req.params.id, userId: user(req).userId },
  });
  if (!vn) return res.status(404).json({ error: 'Not found' });

  await prisma.virtualNumber.delete({ where: { id: req.params.id } });
  cache.del(`num:${vn.e164Number}`);
  return res.json({ deleted: true });
});

export default router;
