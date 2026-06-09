import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthService } from '../services/authService.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many password reset requests, please try again in an hour.' },
});

router.post('/register', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  return res.status(201).json(result);
}));

router.post('/login', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  return res.json(result);
}));

router.get('/me', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.getMe(req.user!.userId);
  return res.json(result);
}));

// G-6: Update profile (name, email)
router.patch('/profile', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.updateProfile(req.user!.userId, req.body);
  return res.json(result);
}));

// G-6: Change password
router.patch('/password', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  await AuthService.changePassword(req.user!.userId, req.body);
  return res.json({ message: 'Password updated successfully' });
}));

// G-15: Refresh access token
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) { res.status(401).json({ error: 'Refresh token required' }); return; }
  const result = await AuthService.refreshToken(refreshToken);
  return res.json(result);
}));

// G-15: Logout (revoke refresh token)
router.post('/logout', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) await AuthService.logout(refreshToken);
  return res.json({ message: 'Logged out' });
}));

// G-6: Generate API key
router.post('/api-keys', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.createApiKey(req.user!.userId, req.body.name || 'My API Key');
  return res.status(201).json(result);
}));

// G-6: List API keys
router.get('/api-keys', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.listApiKeys(req.user!.userId);
  return res.json(result);
}));

// G-6: Delete API key
router.delete('/api-keys/:id', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  await AuthService.deleteApiKey(req.user!.userId, req.params.id);
  return res.json({ deleted: true });
}));

router.post('/forgot-password', forgotPasswordLimiter, asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body.email);
  return res.json(result);
}));

router.post('/reset-password', asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);
  return res.json(result);
}));

export default router;
