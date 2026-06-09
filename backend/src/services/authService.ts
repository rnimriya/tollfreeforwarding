import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/auth.js';
import { ApiError } from '../lib/apiError.js';
import { validateEmail, validatePassword } from '../lib/validate.js';
import { sendWelcome, sendPasswordReset } from '../lib/email.js';

// Pre-computed hash used when the requested email does not exist.
// Running bcrypt.compare against this ensures the response time for unknown
// emails is indistinguishable from the time for wrong passwords, preventing
// timing-based email enumeration attacks. hashSync runs once at module init.
const TIMING_SAFE_DUMMY_HASH = bcrypt.hashSync('__timing_safe_placeholder__', 10);

export class AuthService {
  static async register(reqBody: any) {
    const { password, firstName, lastName } = reqBody;
    const email = validateEmail(reqBody.email);
    validatePassword(password);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError(409, 'Email already registered');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName: firstName || '', lastName: lastName || '' },
    });

    const token = signToken({ userId: user.id, email: user.email });
    const refreshToken = await AuthService._createRefreshToken(user.id);

    sendWelcome(email, firstName || 'there').catch(() => {});

    return {
      token, refreshToken,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, plan: user.plan, role: user.role },
    };
  }

  static async login(reqBody: any) {
    const { password } = reqBody;
    const email = validateEmail(reqBody.email);
    if (!password) throw ApiError.badRequest('Email and password required');

    const user = await prisma.user.findUnique({ where: { email } });

    // Always run bcrypt regardless of whether the user exists.
    // Short-circuiting on !user would leak which emails are registered via timing.
    const valid = await bcrypt.compare(password, user?.passwordHash ?? TIMING_SAFE_DUMMY_HASH);

    if (!user || !valid) throw ApiError.unauthorized('Invalid credentials');

    const token = signToken({ userId: user.id, email: user.email });
    const refreshToken = await AuthService._createRefreshToken(user.id);

    return {
      token, refreshToken,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, plan: user.plan, role: user.role },
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');
    return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, plan: user.plan, role: user.role };
  }

  // G-6: Update profile
  static async updateProfile(userId: string, body: any) {
    const data: any = {};
    if (body.firstName !== undefined) data.firstName = body.firstName;
    if (body.lastName !== undefined) data.lastName = body.lastName;
    if (body.email !== undefined) {
      const normalised = validateEmail(body.email);
      const existing = await prisma.user.findUnique({ where: { email: normalised } });
      if (existing && existing.id !== userId) throw new ApiError(409, 'Email already in use');
      data.email = normalised;
    }
    const updated = await prisma.user.update({ where: { id: userId }, data });
    return { id: updated.id, email: updated.email, firstName: updated.firstName, lastName: updated.lastName, plan: updated.plan, role: updated.role };
  }

  // G-6: Change password
  static async changePassword(userId: string, body: any) {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) throw ApiError.badRequest('currentPassword and newPassword required');
    validatePassword(newPassword);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw ApiError.unauthorized('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  // G-15: Refresh access token using refresh token (rotation)
  static async refreshToken(token: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { token } }).catch(() => {});
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) throw ApiError.unauthorized('User not found');

    // Rotate: delete old, issue new
    await prisma.refreshToken.delete({ where: { token } });
    const newRefreshToken = await AuthService._createRefreshToken(user.id);
    const accessToken = signToken({ userId: user.id, email: user.email });

    return { token: accessToken, refreshToken: newRefreshToken };
  }

  // G-15: Revoke refresh token on logout
  static async logout(token: string) {
    await prisma.refreshToken.deleteMany({ where: { token } }).catch(() => {});
  }

  // G-6: Create API key (returns raw key once — only time it's visible)
  static async createApiKey(userId: string, name: string) {
    const rawKey = `cpbx_${crypto.randomBytes(32).toString('hex')}`;
    const prefix = rawKey.slice(0, 12);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const apiKey = await prisma.apiKey.create({ data: { userId, name, keyHash, prefix } });
    return { id: apiKey.id, name: apiKey.name, prefix: apiKey.prefix, key: rawKey, createdAt: apiKey.createdAt };
  }

  // G-6: List API keys (hashes never returned)
  static async listApiKeys(userId: string) {
    return prisma.apiKey.findMany({
      where: { userId },
      select: { id: true, name: true, prefix: true, lastUsed: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // G-6: Delete API key
  static async deleteApiKey(userId: string, id: string) {
    const key = await prisma.apiKey.findFirst({ where: { id, userId } });
    if (!key) throw ApiError.notFound('API key not found');
    await prisma.apiKey.delete({ where: { id } });
  }

  static async forgotPassword(email: string) {
    const normalised = validateEmail(email);
    const user = await prisma.user.findUnique({ where: { email: normalised } });
    if (!user) return { message: 'If the email exists, a reset link has been sent.' };

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 3600000);
    await prisma.user.update({ where: { email: normalised }, data: { resetToken: token, resetTokenExpires: expires } });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    sendPasswordReset(normalised, user.firstName || 'there', resetLink).catch(() => {
      console.log(`\n[PASSWORD RESET LINK]: ${resetLink}\n`);
    });

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  static async resetPassword(reqBody: any) {
    const { token, password } = reqBody;
    if (!token || !password) throw ApiError.badRequest('Token and password required');
    validatePassword(password);

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpires: { gt: new Date() } },
    });
    if (!user) throw ApiError.badRequest('Invalid or expired token');

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpires: null },
    });

    return { message: 'Password reset successful' };
  }

  private static async _createRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex');
    await prisma.refreshToken.create({
      data: { userId, token, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });
    return token;
  }
}
