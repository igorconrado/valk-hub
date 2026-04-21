/**
 * Simple in-memory sliding window rate limiter.
 * Suitable for single-instance deployments (Vercel serverless functions
 * share memory within a single invocation but not across cold starts).
 *
 * For multi-instance or persistent rate limiting, swap to @upstash/ratelimit.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

export function rateLimit(
  key: string,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number }
): { success: boolean; remaining: number; resetMs: number } {
  cleanup(windowMs);

  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const resetMs = oldestInWindow + windowMs - now;
    return {
      success: false,
      remaining: 0,
      resetMs: Math.max(resetMs, 0),
    };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    success: true,
    remaining: maxRequests - entry.timestamps.length,
    resetMs: 0,
  };
}
