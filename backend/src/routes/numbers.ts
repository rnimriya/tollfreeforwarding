import { Router, Request, Response } from 'express';
import { NumberService } from '../services/numberService.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/numbers?page=&limit=
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const numbers = await NumberService.listNumbers(req.user!.userId, page, limit);
    return res.json(numbers);
  })
);

// GET /api/numbers/:id
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const vn = await NumberService.getNumberDetails(req.params.id, req.user!.userId);
    return res.json(vn);
  })
);

// POST /api/numbers
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const vn = await NumberService.provisionNumber(req.user!.userId, req.body);
    return res.status(201).json(vn);
  })
);

// PATCH /api/numbers/:id
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const updated = await NumberService.updateNumberSettings(req.params.id, req.user!.userId, req.body);
    return res.json(updated);
  })
);

// DELETE /api/numbers/:id
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await NumberService.deleteNumber(req.params.id, req.user!.userId);
    return res.json(result);
  })
);

export default router;
