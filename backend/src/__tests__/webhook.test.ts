import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';

// Replicate the signature logic from routes/webhook.ts to test it in isolation
function computeSignature(secret: string, to: string, from: string, sid: string): string {
  return createHmac('sha256', secret).update(`${to}${from}${sid}`).digest('hex');
}

describe('webhook HMAC signature', () => {
  const SECRET = 'test-secret';
  const TO = '+18005550100';
  const FROM = '+15551234567';
  const SID = 'CA1234567890';

  it('produces a consistent signature for the same inputs', () => {
    const sig1 = computeSignature(SECRET, TO, FROM, SID);
    const sig2 = computeSignature(SECRET, TO, FROM, SID);
    expect(sig1).toBe(sig2);
    expect(sig1).toHaveLength(64);
  });

  it('produces different signatures for different inputs', () => {
    const sig1 = computeSignature(SECRET, TO, FROM, SID);
    const sig2 = computeSignature(SECRET, TO, '+15559999999', SID);
    expect(sig1).not.toBe(sig2);
  });

  it('produces different signatures for different secrets', () => {
    const sig1 = computeSignature('secret-a', TO, FROM, SID);
    const sig2 = computeSignature('secret-b', TO, FROM, SID);
    expect(sig1).not.toBe(sig2);
  });
});
