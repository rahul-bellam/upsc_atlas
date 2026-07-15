import { NextRequest, NextResponse } from 'next/server'
import { normalizePlaceQuery } from '../../../../lib/place-types'
import {
  checkRateLimit,
  fetchWithTimeout,
  getFromCache,
  readJsonSafely,
  safeErrorMessage,
  setCache
} from '../../../../lib/server-utils'

type NominatimResult = {
  lat: string
  lon: string
  display_name: string
}

type GeocodeCandidate = {
  lat: number
  lng: number
  display_name: string
}

type GeocodeResponse = GeocodeCandidate & {
  results: GeocodeCandidate[]
}

const GEOCODE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const NOMINATIM_USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ||
  'UPSC-Atlas-Explorer/1.0 (https://github.com/rahul-bellam/upsc_atlas)'

function toCandidate(result: NominatimResult): GeocodeCandidate | null {
  const lat = Number.parseFloat(result.lat)
  const lng = Number.parseFloat(result.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !result.display_name) return null

  return { lat, lng, display_name: result.display_name }
}

export async function GET(request: NextRequest) {
  const query = normalizePlaceQuery(new URL(request.url).searchParams.get('q'))
  if (!query) {
    return NextResponse.json(
      { error: 'Enter a place name of up to 120 characters.', code: 'invalid_query' },
      { status: 400 }
    )
  }

  const rateLimit = await checkRateLimit(request, 'geocode', { limit: 40, windowMs: 60_000 })
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many map searches. Please wait a moment and try again.', code: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const cacheKey = `geocode:${query.toLowerCase()}`
  const cached = getFromCache<GeocodeResponse>(cacheKey)
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' }
    })
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('q', query)
    url.searchParams.set('limit', '5')
    url.searchParams.set('addressdetails', '1')

    const response = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': NOMINATIM_USER_AGENT,
        Accept: 'application/json',
        'Accept-Language': 'en'
      },
      timeoutMs: 8_000
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'The map search service is temporarily unavailable.', code: 'geocoder_unavailable' },
        { status: 503 }
      )
    }

    const results = await readJsonSafely<NominatimResult[]>(response)
    const candidates = (results || [])
      .map(toCandidate)
      .filter((candidate): candidate is GeocodeCandidate => candidate !== null)
    const primary = candidates[0]

    if (!primary) {
      return NextResponse.json(
        {
          error: 'No verified map location was found. Try a more specific place name.',
          code: 'place_not_found'
        },
        { status: 404 }
      )
    }

    const result: GeocodeResponse = { ...primary, results: candidates }
    setCache(cacheKey, result, GEOCODE_CACHE_TTL_MS)

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' }
    })
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorMessage(error, 'Unable to search for that place.'), code: 'geocoder_error' },
      { status: 502 }
    )
  }
}
