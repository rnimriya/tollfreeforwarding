// G-13/G-14: Cache — Upstash Redis when env vars set, in-memory fallback otherwise.

export interface ICache {
  get<T>(key: string): T | null;
  getAsync?<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): void;
  del(key: string): void;
  flush(): void;
}

// ─── In-memory (local dev) ────────────────────────────────────────────────────

class MemoryCache implements ICache {
  private store = new Map<string, { value: unknown; expiresAt: number }>();

  constructor() {
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.evictExpired(), 5 * 60 * 1000).unref?.();
    }
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return null; }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  del(key: string): void { this.store.delete(key); }
  flush(): void { this.store.clear(); }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}

// ─── Upstash Redis via REST API (no package needed, works on Vercel edge) ─────

class UpstashCache implements ICache {
  constructor(private url: string, private token: string) {}

  private async cmd(...parts: (string | number)[]): Promise<any> {
    try {
      const res = await fetch(`${this.url}/${parts.map(encodeURIComponent).join('/')}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      const json = await res.json() as any;
      return json.result ?? null;
    } catch { return null; }
  }

  // Sync get always returns null — use getAsync for real Redis reads
  get<T>(_key: string): T | null { return null; }

  async getAsync<T>(key: string): Promise<T | null> {
    const raw = await this.cmd('GET', key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return raw as unknown as T; }
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.cmd('SET', key, JSON.stringify(value), 'EX', ttlSeconds).catch(() => {});
  }

  del(key: string): void { this.cmd('DEL', key).catch(() => {}); }
  flush(): void { this.cmd('FLUSHDB').catch(() => {}); }
}

// ─── Export singleton ─────────────────────────────────────────────────────────

function buildCache(): ICache {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    console.log('[cache] Upstash Redis');
    return new UpstashCache(url, token);
  }
  return new MemoryCache();
}

export const cache: ICache = buildCache();
