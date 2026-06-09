import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthService } from '../services/authService.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password reset requests, please try again in an hour.' },
});

// POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    return res.status(201).json(result);
  })
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
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
    const userId = req.user!.userId;
    const result = await AuthService.getMe(userId);
    return res.json(result);
  })
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
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
