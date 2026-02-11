import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    console.warn("[rate-limit] Upstash env vars not set. Rate limiting disabled.")
    return null
  }
  return new Redis({ url, token })
}

const redis = createRedis()

/**
 * Rate limiter for AI analysis: 10 requests per 60 seconds per user.
 */
export const analyzeRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "ratelimit:analyze",
    })
  : null

/**
 * General API rate limiter: 100 requests per 60 seconds per user.
 */
export const generalRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "60 s"),
      prefix: "ratelimit:general",
    })
  : null

/**
 * Check rate limit. Returns { success: true } if no rate limiter configured.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (!limiter) {
    return { success: true, remaining: 999, reset: 0 }
  }
  const result = await limiter.limit(identifier)
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  }
}
