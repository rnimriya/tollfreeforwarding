import { Router, Request, Response } from 'express';
import { NumberService } from '../services/numberService.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/numbers/search?country=US&numberType=LOCAL&areaCode=415&limit=10
router.get(
  '/search',
  asyncHandler(async (req: Request, res: Response) => {
    const { country, numberType, areaCode, limit } = req.query;
    const results = await NumberService.searchAvailableNumbers({
      country: country as string,
      numberType: numberType as string,
      areaCode: areaCode as string,
      limit: limit ? Number(limit) : 10,
    });
    return res.json(results);
  })
);

// GET /api/numbers/recycled — list soft-deleted numbers (recycle bin)
router.get(
  '/recycled',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const numbers = await (await import('../lib/prisma.js')).prisma.virtualNumber.findMany({
      where: { userId, deletedAt: { not: null, gte: cutoff } },
      orderBy: { deletedAt: 'desc' },
    });
    return res.json(numbers);
  })
);

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

// PATCH /api/numbers/:id/restore — G-18: restore soft-deleted number
router.patch(
  '/:id/restore',
  asyncHandler(async (req: Request, res: Response) => {
    const restored = await NumberService.restoreNumber(req.params.id, req.user!.userId);
    return res.json(restored);
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
