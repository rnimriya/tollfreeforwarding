import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    return res.status(201).json(result);
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    return res.json(result);
  })
);

// GET /api/auth/me
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const result = await AuthService.getMe(userId);
    return res.json(result);
  })
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.forgotPassword(req.body.email);
    return res.json(result);
  })
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.resetPassword(req.body);
    return res.json(result);
  })
);

export default router;
