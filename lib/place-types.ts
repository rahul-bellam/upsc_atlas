export const MAX_PLACE_QUERY_LENGTH = 120

export type PlaceReference = {
  label: string
  url: string
  excerpt?: string
}

export type PlaceProfile = {
  title: string
  resolvedLocation: string
  overview: string
  physicalGeography: string[]
  politicalGeography: string[]
  historicalContext: string[]
  currentContext: string[]
  recentDevelopments: string[]
  indiaImpact: string[]
  prelimsMapFacts: string[]
  mainsAngles: string[]
  verificationNotes: string[]
  sources: PlaceReference[]
  generatedAt: string
}

export type PlaceNewsArticle = {
  title: string
  description?: string
  url: string
  publishedAt?: string
  source: string
}

export type PlaceNewsResponse = {
  query: string
  from: string
  to: string
  articles: PlaceNewsArticle[]
}

export type ApiErrorResponse = {
  error: string
  code?: string
}

export function normalizePlaceQuery(value: string | null): string | null {
  if (!value) return null

  const normalized = value.replace(/\s+/g, ' ').trim()
  if (!normalized || normalized.length > MAX_PLACE_QUERY_LENGTH) return null

  return normalized
}

export function sixMonthsAgo(date = new Date()): string {
  const originalDay = date.getUTCDate()
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
  result.setUTCMonth(result.getUTCMonth() - 6)

  const lastDayOfTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate()
  result.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth))

  return result.toISOString().slice(0, 10)
}

export function todayIsoDate(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}
