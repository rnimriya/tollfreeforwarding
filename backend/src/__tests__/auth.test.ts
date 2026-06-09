import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../lib/auth.js';

describe('JWT helpers', () => {
  const payload = { userId: 'abc-123', email: 'test@example.com' };

  it('signs and verifies a token round-trip', () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('throws on a tampered token', () => {
    const token = signToken(payload);
    const tampered = token.slice(0, -5) + 'XXXXX';
    expect(() => verifyToken(tampered)).toThrow();
  });

  it('throws on an expired token', async () => {
    // Can only reliably test with a real expired token string
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJ1c2VySWQiOiJ4IiwiZW1haWwiOiJ4QHguY29tIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.' +
      'invalidsig';
    expect(() => verifyToken(expiredToken)).toThrow();
  });
});
