import { createHash } from 'node:crypto'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'

const DEFAULT_TIMEOUT_MS = 10_000
const MAX_CACHE_ENTRIES = 250
const MAX_RATE_LIMIT_ENTRIES = 2_000

type FetchOptions = RequestInit & {
  timeoutMs?: number
}

type CacheEntry<T> = {
  expiresAt: number
  value: T
}

const cache = new Map<string, CacheEntry<unknown>>()

type RateLimitOptions = {
  limit: number
  windowMs: number
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimitBuckets = new Map<string, RateLimitEntry>()
const distributedLimiters = new Map<string, Ratelimit>()

export type RateLimitDecision = {
  allowed: boolean
  retryAfterSeconds: number
  source: 'memory' | 'upstash'
}

export class UpstreamServiceError extends Error {
  readonly status: number

  constructor(message: string, status = 502) {
    super(message)
    this.name = 'UpstreamServiceError'
    this.status = status
  }
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  { timeoutMs = DEFAULT_TIMEOUT_MS, ...init }: FetchOptions = {}
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new UpstreamServiceError('The upstream service timed out. Please try again.', 504)
    }
    throw new UpstreamServiceError('The upstream service is unavailable. Please try again.', 502)
  } finally {
    clearTimeout(timeout)
  }
}

export async function readJsonSafely<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

export function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()

  return request.headers.get('x-real-ip') || 'anonymous'
}

function getUpstashLimiter(namespace: string, options: RateLimitOptions): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const key = `${namespace}:${options.limit}:${options.windowMs}`
  const existing = distributedLimiters.get(key)
  if (existing) return existing

  const windowSeconds = Math.max(1, Math.ceil(options.windowMs / 1_000))
  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.fixedWindow(options.limit, `${windowSeconds} s`),
    analytics: false,
    prefix: `upsc-atlas:${namespace}`
  })
  distributedLimiters.set(key, limiter)

  return limiter
}

function pruneExpiredRateLimitEntries(now: number): void {
  if (rateLimitBuckets.size < MAX_RATE_LIMIT_ENTRIES) return

  for (const [key, value] of rateLimitBuckets) {
    if (value.resetAt <= now) rateLimitBuckets.delete(key)
  }

  while (rateLimitBuckets.size >= MAX_RATE_LIMIT_ENTRIES) {
    const oldestKey = rateLimitBuckets.keys().next().value as string | undefined
    if (!oldestKey) return
    rateLimitBuckets.delete(oldestKey)
  }
}

function checkInMemoryRateLimit(
  request: NextRequest,
  namespace: string,
  { limit, windowMs }: RateLimitOptions
): RateLimitDecision {
  const now = Date.now()
  pruneExpiredRateLimitEntries(now)
  const key = `${namespace}:${getClientIdentifier(request)}`
  const current = rateLimitBuckets.get(key)

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0, source: 'memory' }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
      source: 'memory'
    }
  }

  current.count += 1
  return { allowed: true, retryAfterSeconds: 0, source: 'memory' }
}

/**
 * Uses Upstash Redis when its REST credentials are configured; otherwise falls
 * back to a bounded per-process limiter for local development.
 */
export async function checkRateLimit(
  request: NextRequest,
  namespace: string,
  options: RateLimitOptions
): Promise<RateLimitDecision> {
  const limiter = getUpstashLimiter(namespace, options)
  if (!limiter) return checkInMemoryRateLimit(request, namespace, options)

  try {
    const identifier = createHash('sha256').update(getClientIdentifier(request)).digest('base64url')
    const result = await limiter.limit(identifier)
    return {
      allowed: result.success,
      retryAfterSeconds: result.success
        ? 0
        : Math.max(1, Math.ceil((result.reset - Date.now()) / 1_000)),
      source: 'upstash'
    }
  } catch (error) {
    console.warn('Distributed rate limiter failed; using bounded in-memory fallback.', error)
    return checkInMemoryRateLimit(request, namespace, options)
  }
}

export function getFromCache<T>(key: string): T | null {
  const item = cache.get(key)
  if (!item) return null

  if (item.expiresAt <= Date.now()) {
    cache.delete(key)
    return null
  }

  return item.value as T
}

export function setCache<T>(key: string, value: T, ttlMs: number): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value as string | undefined
    if (oldestKey) cache.delete(oldestKey)
  }

  cache.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function safeErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof UpstreamServiceError) return error.message
  return fallback
}
