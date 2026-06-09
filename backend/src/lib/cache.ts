export interface ICache {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlSeconds: number): void;
  del(key: string): void;
  flush(): void;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// In-process LRU cache — swap for a Redis adapter in production by implementing ICache
// and replacing the export below. The rest of the codebase depends only on ICache.
class MemoryCache implements ICache {
  private store = new Map<string, CacheEntry<unknown>>();

  // Evict expired entries every 5 minutes to prevent unbounded growth
  constructor() {
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.evictExpired(), 5 * 60 * 1000).unref?.();
    }
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  flush(): void {
    this.store.clear();
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}

export const cache: ICache = new MemoryCache();
