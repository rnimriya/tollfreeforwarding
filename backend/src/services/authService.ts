import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/auth.js';
import { ApiError } from '../lib/apiError.js';
import { validateEmail, validatePassword } from '../lib/validate.js';

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
    if (existing) {
      throw new ApiError(409, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName || '',
        lastName: lastName || '',
      },
    });

    const token = signToken({ userId: user.id, email: user.email });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
      },
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
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
      },
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      plan: user.plan,
    };
  }

  static async forgotPassword(email: string) {
    const normalised = validateEmail(email);

    const user = await prisma.user.findUnique({ where: { email: normalised } });
    if (!user) {
      return { message: 'If the email exists, a reset link has been generated.' };
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { email: normalised },
      data: { resetToken: token, resetTokenExpires: expires },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    console.log(`\n[PASSWORD RESET LINK]: ${resetLink}\n`);

    return {
      message: 'If the email exists, a reset link has been generated.',
      resetLink,
      token,
    };
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
}
