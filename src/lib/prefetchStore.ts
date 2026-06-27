export interface PrefetchEntry<T> {
  key: string;
  data: T;
  fetchedAt: number;
}

class PrefetchStore {
  private store = new Map<string, PrefetchEntry<unknown>>();

  get<T>(key: string): PrefetchEntry<T> | null {
    const value = this.store.get(key);
    if (!value) return null;
    return value as PrefetchEntry<T>;
  }

  set<T>(key: string, data: T) {
    this.store.set(key, {
      key,
      data,
      fetchedAt: Date.now(),
    });
  }

  has(key: string) {
    return this.store.has(key);
  }

  fresh(key: string, ttlMs: number) {
    const value = this.store.get(key);
    if (!value) return false;
    return Date.now() - value.fetchedAt < ttlMs;
  }
}

export const prefetchStore = new PrefetchStore();

export const PREFETCH_TTL_MS = 5 * 60 * 1000;
