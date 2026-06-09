import { Request, Response, NextFunction } from 'express';
import { ApiError } from './apiError.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error('[Error Boundary Caught]:', err);
  res.status(500).json({ error: 'Internal Server Error' });
}
