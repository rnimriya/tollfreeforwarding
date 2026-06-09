import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateE164,
  validateTimeFormat,
  validateRoutingAction,
  validateRingStrategy,
  validateActiveDays,
  validateRingTimeout,
  validateNumberType,
} from '../lib/validate.js';
import { ApiError } from '../lib/apiError.js';

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('User@Example.COM')).toBe('user@example.com');
    expect(validateEmail('  test@foo.io  ')).toBe('test@foo.io');
  });
  it('rejects invalid emails', () => {
    expect(() => validateEmail('notanemail')).toThrow(ApiError);
    expect(() => validateEmail('')).toThrow(ApiError);
    expect(() => validateEmail(null)).toThrow(ApiError);
  });
});

describe('validatePassword', () => {
  it('accepts passwords >= 8 chars', () => {
    expect(() => validatePassword('12345678')).not.toThrow();
  });
  it('rejects short passwords', () => {
    expect(() => validatePassword('short')).toThrow(ApiError);
    expect(() => validatePassword('')).toThrow(ApiError);
  });
});

describe('validateE164', () => {
  it('accepts valid E.164 numbers', () => {
    expect(validateE164('+12025551234')).toBe('+12025551234');
    expect(validateE164('+442071234567')).toBe('+442071234567');
  });
  it('rejects invalid formats', () => {
    expect(() => validateE164('12025551234')).toThrow(ApiError);
    expect(() => validateE164('+1')).toThrow(ApiError);
    expect(() => validateE164('not-a-number')).toThrow(ApiError);
  });
});

describe('validateTimeFormat', () => {
  it('accepts valid HH:mm strings', () => {
    expect(() => validateTimeFormat('09:00', 'openTime')).not.toThrow();
    expect(() => validateTimeFormat('23:59', 'closeTime')).not.toThrow();
    expect(() => validateTimeFormat(null, 'openTime')).not.toThrow();
    expect(() => validateTimeFormat(undefined, 'openTime')).not.toThrow();
  });
  it('rejects invalid formats', () => {
    expect(() => validateTimeFormat('9:00', 'openTime')).toThrow(ApiError);
    expect(() => validateTimeFormat('24:00', 'openTime')).toThrow(ApiError);
    expect(() => validateTimeFormat('9am', 'openTime')).toThrow(ApiError);
  });
});

describe('validateRoutingAction', () => {
  it('accepts valid actions', () => {
    for (const a of ['FORWARD_PSTN', 'FORWARD_SIP', 'RING_GROUP', 'VOICEMAIL', 'REJECT']) {
      expect(() => validateRoutingAction(a)).not.toThrow();
    }
  });
  it('rejects unknown actions', () => {
    expect(() => validateRoutingAction('UNKNOWN')).toThrow(ApiError);
    expect(() => validateRoutingAction('')).toThrow(ApiError);
  });
});

describe('validateRingStrategy', () => {
  it('accepts SEQUENTIAL and SIMULTANEOUS', () => {
    expect(() => validateRingStrategy('SEQUENTIAL')).not.toThrow();
    expect(() => validateRingStrategy('SIMULTANEOUS')).not.toThrow();
  });
  it('rejects other values', () => {
    expect(() => validateRingStrategy('ROUND_ROBIN')).toThrow(ApiError);
  });
});

describe('validateActiveDays', () => {
  it('accepts valid day arrays', () => {
    expect(validateActiveDays([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    expect(validateActiveDays([7])).toEqual([7]);
  });
  it('rejects days outside 1-7', () => {
    expect(() => validateActiveDays([0, 1, 2])).toThrow(ApiError);
    expect(() => validateActiveDays([8])).toThrow(ApiError);
  });
});

describe('validateRingTimeout', () => {
  it('accepts 5–120 seconds', () => {
    expect(validateRingTimeout(30)).toBe(30);
    expect(validateRingTimeout(5)).toBe(5);
    expect(validateRingTimeout(120)).toBe(120);
  });
  it('rejects out-of-range values', () => {
    expect(() => validateRingTimeout(4)).toThrow(ApiError);
    expect(() => validateRingTimeout(121)).toThrow(ApiError);
    expect(() => validateRingTimeout('abc')).toThrow(ApiError);
  });
});

describe('validateNumberType', () => {
  it('accepts valid types', () => {
    expect(() => validateNumberType('LOCAL')).not.toThrow();
    expect(() => validateNumberType('TOLL_FREE')).not.toThrow();
    expect(() => validateNumberType('INTERNATIONAL')).not.toThrow();
  });
  it('rejects invalid types', () => {
    expect(() => validateNumberType('PREMIUM')).toThrow(ApiError);
  });
});
