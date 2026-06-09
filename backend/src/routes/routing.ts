import { Router, Request, Response } from 'express';
import { RoutingService } from '../services/routingService.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();
router.use(requireAuth);

const user = (req: Request) => (req as any).user;

// GET /api/routing/:numberId
router.get(
  '/:numberId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = user(req).userId;
    const rules = await RoutingService.listRules(req.params.numberId, userId);
    return res.json(rules);
  })
);

// POST /api/routing/:numberId
router.post(
  '/:numberId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = user(req).userId;
    const rule = await RoutingService.createRule(req.params.numberId, userId, req.body);
    return res.status(201).json(rule);
  })
);

// PATCH /api/routing/:numberId/:ruleId
router.patch(
  '/:numberId/:ruleId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = user(req).userId;
    const updated = await RoutingService.updateRule(req.params.numberId, req.params.ruleId, userId, req.body);
    return res.json(updated);
  })
);

// DELETE /api/routing/:numberId/:ruleId
router.delete(
  '/:numberId/:ruleId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = user(req).userId;
    const result = await RoutingService.deleteRule(req.params.numberId, req.params.ruleId, userId);
    return res.json(result);
  })
);

export default router;
