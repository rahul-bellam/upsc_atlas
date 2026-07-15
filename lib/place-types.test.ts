import { describe, expect, it } from 'vitest'
import { normalizePlaceQuery, sixMonthsAgo, todayIsoDate } from './place-types'

describe('place query helpers', () => {
  it('normalizes whitespace in a valid place name', () => {
    expect(normalizePlaceQuery('  Strait   of   Malacca  ')).toBe('Strait of Malacca')
  })

  it('rejects blank and overlong queries', () => {
    expect(normalizePlaceQuery('   ')).toBeNull()
    expect(normalizePlaceQuery('a'.repeat(121))).toBeNull()
  })

  it('calculates a calendar-aware six-month news window', () => {
    expect(sixMonthsAgo(new Date('2026-07-14T12:00:00.000Z'))).toBe('2026-01-14')
    expect(sixMonthsAgo(new Date('2026-03-31T12:00:00.000Z'))).toBe('2025-09-30')
  })

  it('formats a UTC date for NewsAPI parameters', () => {
    expect(todayIsoDate(new Date('2026-07-14T23:59:59.000Z'))).toBe('2026-07-14')
  })
})
