import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/auth.js';
import { ApiError } from '../lib/apiError.js';

export class AuthService {
  static async register(reqBody: any) {
    const { email, password, firstName, lastName } = reqBody;
    if (!email || !password) {
      throw ApiError.badRequest('Email and password required');
    }

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
        lastName: lastName || '' 
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
        plan: user.plan 
      },
    };
  }

  static async login(reqBody: any) {
    const { email, password } = reqBody;
    if (!email || !password) {
      throw ApiError.badRequest('Email and password required');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const token = signToken({ userId: user.id, email: user.email });
    return {
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        plan: user.plan 
      },
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return { 
      id: user.id, 
      email: user.email, 
      firstName: user.firstName, 
      lastName: user.lastName, 
      plan: user.plan 
    };
  }

  static async forgotPassword(email: string) {
    if (!email) {
      throw ApiError.badRequest('Email is required');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Security standard: don't reveal if email exists or not
      return { message: 'If the email exists, a reset link has been generated.' };
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpires: expires },
    });

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    console.log(`\n🔑 [PASSWORD RESET LINK]: ${resetLink}\n`);

    return {
      message: 'If the email exists, a reset link has been generated.',
      resetLink,
      token
    };
  }

  static async resetPassword(reqBody: any) {
    const { token, password } = reqBody;
    if (!token || !password) {
      throw ApiError.badRequest('Token and password required');
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired token');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    return { message: 'Password reset successful' };
  }
}
