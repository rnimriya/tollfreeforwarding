import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('WARNING: JWT_SECRET is not set. Using insecure default — set this env var immediately.');
}

export interface AuthPayload {
  userId: string;
  email: string;
}

// Augment the Express Request type so every route file gets req.user typed
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, SECRET) as AuthPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
