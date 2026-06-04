import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { cache } from '../lib/cache.js';

const router = Router();
router.use(requireAuth);

const user = (req: Request) => (req as any).user;

// GET /api/routing/:numberId
router.get('/:numberId', async (req: Request, res: Response) => {
  const vn = await prisma.virtualNumber.findFirst({
    where: { id: req.params.numberId, userId: user(req).userId },
  });
  if (!vn) return res.status(404).json({ error: 'Not found' });

  const rules = await prisma.routingRule.findMany({
    where: { virtualNumberId: req.params.numberId },
    orderBy: { priority: 'asc' },
  });
  return res.json(rules.map(parseRule));
});

// POST /api/routing/:numberId
router.post('/:numberId', async (req: Request, res: Response) => {
  const vn = await prisma.virtualNumber.findFirst({
    where: { id: req.params.numberId, userId: user(req).userId },
  });
  if (!vn) return res.status(404).json({ error: 'Not found' });

  const { label, priority, activeDays, openTime, closeTime, action, destinations, ringStrategy, ringTimeout, sipUri } = req.body;

  const rule = await prisma.routingRule.create({
    data: {
      virtualNumberId: req.params.numberId,
      label: label || 'New Rule',
      priority: priority ?? 0,
      activeDays: Array.isArray(activeDays) ? activeDays.join(',') : (activeDays || '1,2,3,4,5'),
      openTime: openTime || null,
      closeTime: closeTime || null,
      action: action || 'FORWARD_PSTN',
      destinations: JSON.stringify(destinations || []),
      ringStrategy: ringStrategy || 'SEQUENTIAL',
      ringTimeout: ringTimeout || 30,
      sipUri: sipUri || null,
    },
  });

  cache.del(`num:${vn.e164Number}`);
  return res.status(201).json(parseRule(rule));
});

// PATCH /api/routing/:numberId/:ruleId
router.patch('/:numberId/:ruleId', async (req: Request, res: Response) => {
  const vn = await prisma.virtualNumber.findFirst({
    where: { id: req.params.numberId, userId: user(req).userId },
  });
  if (!vn) return res.status(404).json({ error: 'Not found' });

  const rule = await prisma.routingRule.findFirst({
    where: { id: req.params.ruleId, virtualNumberId: req.params.numberId },
  });
  if (!rule) return res.status(404).json({ error: 'Rule not found' });

  const updated = await prisma.routingRule.update({
    where: { id: req.params.ruleId },
    data: {
      label: req.body.label ?? rule.label,
      priority: req.body.priority ?? rule.priority,
      activeDays: Array.isArray(req.body.activeDays)
        ? req.body.activeDays.join(',')
        : req.body.activeDays ?? rule.activeDays,
      openTime: req.body.openTime !== undefined ? req.body.openTime : rule.openTime,
      closeTime: req.body.closeTime !== undefined ? req.body.closeTime : rule.closeTime,
      action: req.body.action ?? rule.action,
      destinations: req.body.destinations ? JSON.stringify(req.body.destinations) : rule.destinations,
      ringStrategy: req.body.ringStrategy ?? rule.ringStrategy,
      ringTimeout: req.body.ringTimeout ?? rule.ringTimeout,
      sipUri: req.body.sipUri !== undefined ? req.body.sipUri : rule.sipUri,
    },
  });

  cache.del(`num:${vn.e164Number}`);
  return res.json(parseRule(updated));
});

// DELETE /api/routing/:numberId/:ruleId
router.delete('/:numberId/:ruleId', async (req: Request, res: Response) => {
  const vn = await prisma.virtualNumber.findFirst({
    where: { id: req.params.numberId, userId: user(req).userId },
  });
  if (!vn) return res.status(404).json({ error: 'Not found' });

  await prisma.routingRule.deleteMany({
    where: { id: req.params.ruleId, virtualNumberId: req.params.numberId },
  });

  cache.del(`num:${vn.e164Number}`);
  return res.json({ deleted: true });
});

function parseRule(rule: any) {
  return {
    ...rule,
    activeDays: rule.activeDays ? rule.activeDays.split(',').map(Number) : [],
    destinations: (() => { try { return JSON.parse(rule.destinations); } catch { return []; } })(),
  };
}

export default router;
