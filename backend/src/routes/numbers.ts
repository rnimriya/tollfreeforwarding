import { Router, Request, Response } from 'express';
import { NumberService } from '../services/numberService.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();
router.use(requireAuth);

const user = (req: Request) => (req as any).user;

// GET /api/numbers
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = user(req).userId;
    const numbers = await NumberService.listNumbers(userId);
    return res.json(numbers);
  })
);

// GET /api/numbers/:id
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = user(req).userId;
    const vn = await NumberService.getNumberDetails(req.params.id, userId);
    return res.json(vn);
  })
);

// POST /api/numbers
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = user(req).userId;
    const vn = await NumberService.provisionNumber(userId, req.body);
    return res.status(201).json(vn);
  })
);

// PATCH /api/numbers/:id
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = user(req).userId;
    const updated = await NumberService.updateNumberSettings(req.params.id, userId, req.body);
    return res.json(updated);
  })
);

// DELETE /api/numbers/:id
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = user(req).userId;
    const result = await NumberService.deleteNumber(req.params.id, userId);
    return res.json(result);
  })
);

export default router;
