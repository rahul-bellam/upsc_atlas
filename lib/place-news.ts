import {
  sixMonthsAgo,
  todayIsoDate,
  type PlaceNewsArticle,
  type PlaceNewsResponse
} from './place-types'
import { fetchWithTimeout, getFromCache, readJsonSafely, setCache } from './server-utils'

type NewsApiArticle = {
  title?: string | null
  description?: string | null
  url?: string | null
  publishedAt?: string | null
  source?: {
    name?: string | null
  }
}

type NewsApiResponse = {
  status?: string
  code?: string
  message?: string
  articles?: NewsApiArticle[]
}

const NEWS_CACHE_TTL_MS = 30 * 60 * 1000

export class NewsArchiveError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, status: number, code: string) {
    super(message)
    this.name = 'NewsArchiveError'
    this.status = status
    this.code = code
  }
}

function asNewsArticle(article: NewsApiArticle): PlaceNewsArticle | null {
  if (!article.title || !article.url) return null

  try {
    const url = new URL(article.url)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

    return {
      title: article.title,
      description: article.description || undefined,
      url: url.toString(),
      publishedAt: article.publishedAt || undefined,
      source: article.source?.name || 'Unknown source'
    }
  } catch {
    return null
  }
}

export async function getPlaceNews(query: string): Promise<PlaceNewsResponse> {
  const from = sixMonthsAgo()
  const to = todayIsoDate()
  const cacheKey = `news:${query.toLocaleLowerCase()}:${from}:${to}`
  const cached = getFromCache<PlaceNewsResponse>(cacheKey)
  if (cached) return cached

  const key = process.env.NEWS_KEY
  if (!key) {
    throw new NewsArchiveError(
      'News is not configured. Add NEWS_KEY to the server environment.',
      503,
      'news_not_configured'
    )
  }

  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.set('q', `"${query}"`)
  url.searchParams.set('from', from)
  url.searchParams.set('to', to)
  url.searchParams.set('language', 'en')
  url.searchParams.set('sortBy', 'publishedAt')
  url.searchParams.set('pageSize', '20')
  url.searchParams.set('apiKey', key)

  const response = await fetchWithTimeout(url, { timeoutMs: 10_000 })
  const payload = await readJsonSafely<NewsApiResponse>(response)

  if (!response.ok || payload?.status === 'error') {
    const archiveUnavailable = response.status === 426 || response.status === 401 || response.status === 403
    throw new NewsArchiveError(
      archiveUnavailable
        ? 'This NewsAPI plan does not permit the requested six-month archive. Upgrade its historical-search access or configure another provider.'
        : 'The news archive is temporarily unavailable. Please try again later.',
      archiveUnavailable ? 424 : 502,
      archiveUnavailable ? 'news_archive_unavailable' : 'news_provider_error'
    )
  }

  const articles = (payload?.articles || [])
    .map(asNewsArticle)
    .filter((article): article is PlaceNewsArticle => article !== null)

  const result: PlaceNewsResponse = { query, from, to, articles }
  setCache(cacheKey, result, NEWS_CACHE_TTL_MS)

  return result
}
