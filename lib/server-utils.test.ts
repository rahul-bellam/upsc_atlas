import { afterEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import { checkRateLimit, getFromCache, setCache } from './server-utils'

function requestFor(ip: string): NextRequest {
  return new Request('https://atlas.example/api/test', {
    headers: { 'x-forwarded-for': ip }
  }) as NextRequest
}

afterEach(() => {
  vi.useRealTimers()
})

describe('bounded in-memory cache', () => {
  it('returns a cached value until its TTL expires', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-14T00:00:00.000Z'))
    const key = `test-cache-${crypto.randomUUID()}`

    setCache(key, { value: 'Godavari' }, 1_000)
    expect(getFromCache<{ value: string }>(key)).toEqual({ value: 'Godavari' })

    vi.advanceTimersByTime(1_001)
    expect(getFromCache<{ value: string }>(key)).toBeNull()
  })
})

describe('per-client rate limiting', () => {
  it('allows requests up to the configured limit and then reports a retry delay', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-14T00:00:00.000Z'))
    const namespace = `test-rate-${crypto.randomUUID()}`
    const request = requestFor('203.0.113.10')

    expect((await checkRateLimit(request, namespace, { limit: 2, windowMs: 60_000 })).allowed).toBe(true)
    expect((await checkRateLimit(request, namespace, { limit: 2, windowMs: 60_000 })).allowed).toBe(true)

    const blocked = await checkRateLimit(request, namespace, { limit: 2, windowMs: 60_000 })
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBe(60)
  })
})
