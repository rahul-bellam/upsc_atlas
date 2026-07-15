import { NextRequest, NextResponse } from 'next/server'
import { normalizePlaceQuery } from '../../../lib/place-types'
import { getPlaceNews, NewsArchiveError } from '../../../lib/place-news'
import { checkRateLimit, safeErrorMessage } from '../../../lib/server-utils'

export async function GET(request: NextRequest) {
  const query = normalizePlaceQuery(new URL(request.url).searchParams.get('q'))
  if (!query) {
    return NextResponse.json(
      { error: 'Enter a place name to load related news.', code: 'invalid_query' },
      { status: 400 }
    )
  }

  const rateLimit = await checkRateLimit(request, 'news', { limit: 30, windowMs: 60_000 })
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many news requests. Please wait a moment and try again.', code: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  try {
    const news = await getPlaceNews(query)
    return NextResponse.json(news, {
      headers: { 'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800' }
    })
  } catch (error) {
    const status = error instanceof NewsArchiveError ? error.status : 502
    const code = error instanceof NewsArchiveError ? error.code : 'news_error'
    return NextResponse.json(
      { error: safeErrorMessage(error, 'Unable to load place-related news.'), code },
      { status }
    )
  }
}
