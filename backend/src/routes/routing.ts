import { Router, Request, Response } from 'express';
import { RoutingService } from '../services/routingService.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/routing/:numberId
router.get(
  '/:numberId',
  asyncHandler(async (req: Request, res: Response) => {
    const rules = await RoutingService.listRules(req.params.numberId, req.user!.userId);
    return res.json(rules);
  })
);

// POST /api/routing/:numberId
router.post(
  '/:numberId',
  asyncHandler(async (req: Request, res: Response) => {
    const rule = await RoutingService.createRule(req.params.numberId, req.user!.userId, req.body);
    return res.status(201).json(rule);
  })
);

// PATCH /api/routing/:numberId/:ruleId
router.patch(
  '/:numberId/:ruleId',
  asyncHandler(async (req: Request, res: Response) => {
    const updated = await RoutingService.updateRule(
      req.params.numberId,
      req.params.ruleId,
      req.user!.userId,
      req.body
    );
    return res.json(updated);
  })
);

// DELETE /api/routing/:numberId/:ruleId
router.delete(
  '/:numberId/:ruleId',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await RoutingService.deleteRule(
      req.params.numberId,
      req.params.ruleId,
      req.user!.userId
    );
    return res.json(result);
  })
);

export default router;
