import { ApiError } from './apiError.js';

const E164_RE = /^\+[1-9]\d{6,14}$/;
const HH_MM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_ACTIONS = new Set(['FORWARD_PSTN', 'FORWARD_SIP', 'RING_GROUP', 'VOICEMAIL', 'REJECT']);
const VALID_STRATEGIES = new Set(['SEQUENTIAL', 'SIMULTANEOUS']);
const VALID_NUMBER_TYPES = new Set(['LOCAL', 'TOLL_FREE', 'INTERNATIONAL']);

export function validateEmail(email: unknown): string {
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    throw ApiError.badRequest('Invalid email address');
  }
  return email.trim().toLowerCase();
}

export function validatePassword(password: unknown): void {
  if (typeof password !== 'string' || password.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters');
  }
}

export function validateE164(number: unknown, field = 'number'): string {
  if (typeof number !== 'string' || !E164_RE.test(number)) {
    throw ApiError.badRequest(`${field} must be a valid E.164 phone number (e.g. +12025551234)`);
  }
  return number;
}

export function validateTimeFormat(time: unknown, field: string): void {
  if (time !== null && time !== undefined && (typeof time !== 'string' || !HH_MM_RE.test(time))) {
    throw ApiError.badRequest(`${field} must be in HH:mm format (e.g. 09:00)`);
  }
}

export function validateRoutingAction(action: unknown): string {
  if (typeof action !== 'string' || !VALID_ACTIONS.has(action)) {
    throw ApiError.badRequest(`action must be one of: ${[...VALID_ACTIONS].join(', ')}`);
  }
  return action;
}

export function validateRingStrategy(strategy: unknown): string {
  if (typeof strategy !== 'string' || !VALID_STRATEGIES.has(strategy)) {
    throw ApiError.badRequest(`ringStrategy must be one of: ${[...VALID_STRATEGIES].join(', ')}`);
  }
  return strategy;
}

export function validateNumberType(type: unknown): string {
  if (typeof type !== 'string' || !VALID_NUMBER_TYPES.has(type)) {
    throw ApiError.badRequest(`numberType must be one of: ${[...VALID_NUMBER_TYPES].join(', ')}`);
  }
  return type;
}

export function validateActiveDays(days: unknown): number[] {
  const arr = Array.isArray(days) ? days : (typeof days === 'string' ? days.split(',').map(Number) : []);
  if (arr.length === 0) {
    throw ApiError.badRequest('activeDays must not be empty — select at least one day');
  }
  if (!arr.every((d: unknown) => Number.isInteger(d) && (d as number) >= 1 && (d as number) <= 7)) {
    throw ApiError.badRequest('activeDays must be an array of integers 1–7 (Mon–Sun)');
  }
  return arr as number[];
}

export function validateRingTimeout(timeout: unknown): number {
  const n = Number(timeout);
  if (!Number.isInteger(n) || n < 5 || n > 120) {
    throw ApiError.badRequest('ringTimeout must be an integer between 5 and 120 seconds');
  }
  return n;
}
