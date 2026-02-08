interface CacheEntry<T> {
  data: T;
  timestamp: number;
  fetching?: Promise<T>;
}

const cache = new Map<string, CacheEntry<any>>();

export const getCachedOrFetch = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  maxAge: number = 30 * 60 * 1000
): Promise<T> => {
  const cached = cache.get(key);
  const now = Date.now();
  const age = cached ? now - cached.timestamp : Infinity;
  const isValid = cached && age < maxAge;
  const shouldRevalidate = cached && age > maxAge * 0.7;

  if (isValid && cached && shouldRevalidate && !cached.fetching) {
    cached.fetching = fetchFn()
      .then((newData) => {
        cache.set(key, { data: newData, timestamp: Date.now() });
        return newData;
      })
      .catch((err) => {
        console.error(`Background fetch failed for ${key}:`, err);
        return cached.data;
      })
      .finally(() => {
        const entry = cache.get(key);
        if (entry) delete entry.fetching;
      });
    return cached.data;
  }

  if (isValid && cached) {
    return cached.data;
  }

  if (cached?.fetching) {
    return cached.fetching;
  }

  try {
    const fetchPromise = fetchFn();

    if (cached) {
      cached.fetching = fetchPromise;
    } else {
      cache.set(key, { data: null as T, timestamp: 0, fetching: fetchPromise });
    }

    const data = await fetchPromise;
    cache.set(key, { data, timestamp: now });
    return data;
  } catch (err) {
    if (cached?.data) {
      return cached.data;
    }
    throw err;
  }
};

export const invalidateCache = (key: string) => {
  cache.delete(key);
};

export const clearAllCache = () => {
  cache.clear();
};
