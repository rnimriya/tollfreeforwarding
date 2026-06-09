// Single source of truth for JWT token persistence.
// Both api.ts and authStore.ts import from here so the token is
// written and read from exactly one localStorage key.
const KEY = 'token';

export const tokenStorage = {
  get: (): string | null => {
    try { return localStorage.getItem(KEY); } catch { return null; }
  },
  set: (token: string): void => {
    try { localStorage.setItem(KEY, token); } catch { /* ignore */ }
  },
  clear: (): void => {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  },
};
