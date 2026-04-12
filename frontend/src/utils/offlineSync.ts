import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_QUEUE_KEY = '@sync_queue';
const CACHE_PREFIX = '@cache:';

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  createdAt: number;
}

// ============ SYNC QUEUE ============

export async function getQueue(): Promise<QueuedRequest[]> {
  try {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: QueuedRequest[]): Promise<void> {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueue(request: Omit<QueuedRequest, 'id' | 'createdAt'>): Promise<void> {
  const queue = await getQueue();
  queue.push({
    ...request,
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: Date.now(),
  });
  await saveQueue(queue);
}

export async function flushQueue(): Promise<{ synced: number; failed: number }> {
  const queue = await getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  const remaining: QueuedRequest[] = [];
  let synced = 0;

  for (const req of queue) {
    try {
      const response = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
      if (response.ok) {
        synced++;
      } else {
        remaining.push(req);
      }
    } catch {
      remaining.push(req);
    }
  }

  await saveQueue(remaining);
  return { synced, failed: remaining.length };
}

// ============ DATA CACHE ============

export async function cacheData(key: string, data: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch {
    // Silent fail on cache write
  }
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ============ OFFLINE-AWARE FETCH ============

interface OfflineFetchOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  cacheKey?: string; // If provided, cache GET responses and return cached on failure
}

export async function offlineFetch<T>(options: OfflineFetchOptions): Promise<T | null> {
  const { url, method = 'GET', headers = { 'Content-Type': 'application/json' }, body, cacheKey } = options;

  // Automatically inject X-Device-ID from storage if available
  const deviceId = await AsyncStorage.getItem('device_id');
  if (deviceId) {
    headers['X-Device-ID'] = deviceId;
  }

  const bodyStr = body ? JSON.stringify(body) : undefined;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: bodyStr,
    });

    if (response.ok) {
      const data = await response.json();
      // Cache successful GET responses
      if (cacheKey && method === 'GET') {
        await cacheData(cacheKey, data);
      }
      return data as T;
    }
    throw new Error(`HTTP ${response.status}`);
  } catch {
    // For read operations, return cached data
    if (method === 'GET' && cacheKey) {
      return getCachedData<T>(cacheKey);
    }

    // For write operations, queue for later sync
    if (method !== 'GET') {
      await enqueue({ url, method, headers, body: bodyStr });
    }

    return null;
  }
}
