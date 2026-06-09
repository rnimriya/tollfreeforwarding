// G-11: Outbound call routes
import { Router, Request, Response } from 'express';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { ApiError } from '../lib/apiError.js';
import { prisma } from '../lib/prisma.js';
import { initiateCall } from '../lib/twilio.js';

const router = Router();

router.use(requireAuth);

// POST /api/calls/originate — initiate outbound call
router.post('/originate', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { virtualNumberId, to } = req.body;

  if (!virtualNumberId || !to) throw ApiError.badRequest('virtualNumberId and to are required');

  const vn = await prisma.virtualNumber.findFirst({ where: { id: virtualNumberId, userId, deletedAt: null } });
  if (!vn) throw ApiError.notFound('Virtual number not found');

  const webhookBase = process.env.BACKEND_URL || `https://tollfreeforwarding-backend.vercel.app`;
  const callSid = await initiateCall(to, vn.e164Number, webhookBase);

  const log = await prisma.callLog.create({
    data: {
      virtualNumberId: vn.id,
      userId,
      providerCallSid: callSid,
      direction: 'OUTBOUND',
      callerNumber: vn.e164Number,
      calledNumber: to,
      status: 'INITIATED',
    },
  });

  res.status(201).json({ callSid, logId: log.id });
}));

// GET /api/calls/active — active/in-progress calls count (G-9)
router.get('/active', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const activeCalls = await prisma.callLog.count({
    where: {
      userId,
      status: 'INITIATED',
      startedAt: { gte: fiveMinutesAgo },
    },
  });

  res.json({ activeCalls });
}));

export default router;
