'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import React, { useEffect, useState, type FormEvent } from 'react'
import 'leaflet/dist/leaflet.css'
import AtlasMark from '../../components/AtlasMark'
import MapToggle, { type MapStyle } from '../../components/MapToggle'
import type { LatLngExpression } from 'leaflet'

const MapContainer = dynamic(
  () => import('react-leaflet').then((module) => module.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((module) => module.TileLayer),
  { ssr: false }
)
const Marker = dynamic(() => import('react-leaflet').then((module) => module.Marker), {
  ssr: false
})
const Popup = dynamic(() => import('react-leaflet').then((module) => module.Popup), {
  ssr: false
})
const MapViewport = dynamic(() => import('../../components/MapViewport'), { ssr: false })

type Coordinates = {
  lat: number
  lng: number
}

type MarkerLocation = Coordinates & {
  displayName: string
  topic: string
}

type GeocodeCandidate = Coordinates & {
  display_name: string
}

type GeocodeResponse = Partial<GeocodeCandidate> & {
  results?: GeocodeCandidate[]
  error?: string
}

type Feedback = {
  tone: 'error' | 'success'
  message: string
} | null

const INDIA_CENTER: Coordinates = { lat: 20.5937, lng: 78.9629 }

function dossierHref(marker: MarkerLocation): string {
  const params = new URLSearchParams({ topic: marker.topic, location: marker.displayName })
  return `/insights?${params.toString()}`
}

export default function Explore() {
  const [position, setPosition] = useState<Coordinates>(INDIA_CENTER)
  const [zoom, setZoom] = useState(4)
  const [marker, setMarker] = useState<MarkerLocation | null>(null)
  const [matches, setMatches] = useState<MarkerLocation[]>([])
  const [mapStyle, setMapStyle] = useState<MapStyle>('physical')
  const [isSearching, setIsSearching] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const center: LatLngExpression = [position.lat, position.lng]

  useEffect(() => {
    let isMounted = true

    void import('leaflet').then((leafletModule) => {
      if (!isMounted) return

      const leaflet = leafletModule.default
      delete (leaflet.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png'
      })
    })

    return () => {
      isMounted = false
    }
  }, [])

  function selectMatch(match: MarkerLocation) {
    setPosition({ lat: match.lat, lng: match.lng })
    setZoom(10)
    setMarker(match)
    setFeedback({ tone: 'success', message: `Located ${match.displayName}.` })
  }

  async function onSearch(query: string) {
    const trimmedQuery = query.trim()
    if (!trimmedQuery || isSearching) return

    setIsSearching(true)
    setFeedback(null)
    setMatches([])

    try {
      const response = await fetch(`/api/ai/geocode?q=${encodeURIComponent(trimmedQuery)}`)
      const payload = (await response.json()) as GeocodeResponse

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to search for that place.')
      }

      const rawCandidates = payload.results?.length
        ? payload.results
        : payload.lat !== undefined && payload.lng !== undefined && payload.display_name
          ? [payload as GeocodeCandidate]
          : []
      const foundMatches = rawCandidates
        .map((candidate) => {
          const lat = Number(candidate.lat)
          const lng = Number(candidate.lng)
          if (!Number.isFinite(lat) || !Number.isFinite(lng) || !candidate.display_name) return null

          return { lat, lng, displayName: candidate.display_name, topic: trimmedQuery }
        })
        .filter((candidate): candidate is MarkerLocation => candidate !== null)
      const primary = foundMatches[0]

      if (!primary) {
        throw new Error('No verified map location was found for that search.')
      }

      setMatches(foundMatches)
      selectMatch(primary)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed. Please try again.'
      setFeedback({ tone: 'error', message })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#071725] p-0 md:h-dvh md:p-3">
      <div className="flex min-h-dvh flex-col overflow-hidden bg-[#0b2235] md:h-[calc(100dvh-1.5rem)] md:flex-row md:rounded-2xl md:border md:border-white/10 md:shadow-[0_20px_55px_rgba(2,12,22,0.42)]">
        <aside className="z-10 w-full shrink-0 border-b border-white/10 bg-[#0b2235] md:h-full md:w-[27rem] md:overflow-y-auto md:border-b-0 md:border-r">
          <div className="mx-auto max-w-xl p-4 sm:p-5 md:max-w-none md:p-6">
            <header className="flex items-start justify-between gap-4">
              <Link href="/" className="group flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600">
                <AtlasMark className="h-11 w-11 shrink-0 transition group-hover:scale-105" />
                <span className="min-w-0">
                  <span className="block truncate text-base font-bold tracking-tight text-white">UPSC Atlas Explorer</span>
                  <span className="mt-0.5 block text-xs font-medium text-slate-300">Global geography · India impact lens</span>
                </span>
              </Link>
              <Link
                href="/"
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                Home
              </Link>
            </header>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="search-heading">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="6" />
                    <path d="m16 16 4 4" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Step 1</p>
                  <h1 id="search-heading" className="mt-0.5 text-base font-bold text-slate-950">Find a place</h1>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Use a city, river, region, sea, strait, mountain, border, or protected area.</p>
                </div>
              </div>
              <div className="mt-4">
                <SearchBox onSearch={onSearch} isSearching={isSearching} feedback={feedback} />
              </div>
            </section>

            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6.5 12 3l8 3.5-8 3.5-8-3.5Z" strokeLinejoin="round" />
                    <path d="M4 12 12 15.5 20 12M4 17.5 12 21l8-3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Step 2</p>
                  <div className="mt-1">
                    <MapToggle mapStyle={mapStyle} setMapStyle={setMapStyle} />
                  </div>
                </div>
              </div>
            </section>

            <PlaceDossierCard marker={marker} matches={matches} onSelectMatch={selectMatch} />

          <section className="mt-5 rounded-xl border border-dashed border-white/15 bg-white/[0.04] p-4" aria-labelledby="study-guide-heading">
            <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                <h2 id="study-guide-heading" className="text-sm font-bold text-white">Your dossier will cover</h2>
              </div>
              <ul className="mt-3 grid gap-2 text-xs leading-5 text-slate-300">
                <li>Physical setting: terrain, water systems, climate, ecology, resources, and hazards.</li>
                <li>Political setting: borders, administration, connectivity, and strategic relevance.</li>
                <li>Recent developments and how they may affect India.</li>
              </ul>
            </section>
          </div>
        </aside>

        <main id="main-content" className="relative h-[58dvh] min-h-[390px] flex-1 bg-sky-100 md:h-full">
          <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom>
            <MapViewport latitude={position.lat} longitude={position.lng} zoom={zoom} />
            {mapStyle === 'physical' ? (
              <TileLayer
                key="physical"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
              />
            ) : (
              <>
                <TileLayer
                  key="political-base"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles &copy; Esri"
                />
                <TileLayer
                  key="political-boundaries"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  attribution="Boundaries &copy; Esri"
                />
              </>
            )}
            {marker && (
              <Marker position={[marker.lat, marker.lng]}>
                <Popup>
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-950">{marker.displayName}</p>
                    <Link href={dossierHref(marker)} className="text-sm font-semibold text-blue-700 underline underline-offset-2">
                      Open geography dossier
                    </Link>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          <div className="pointer-events-none absolute left-3 top-3 z-[500] flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur md:left-5 md:top-5">
            <span className={`h-2 w-2 rounded-full ${mapStyle === 'physical' ? 'bg-emerald-500' : 'bg-violet-500'}`} />
            {mapStyle === 'physical' ? 'Physical terrain view' : 'Political boundary view'}
          </div>

          {!marker && (
            <div className="pointer-events-none absolute bottom-7 left-1/2 z-[500] w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-white/80 bg-white/90 p-4 text-center shadow-lg backdrop-blur">
              <p className="text-sm font-bold text-slate-900">Start with a place</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">Search the sidebar to pin a location and unlock its geography dossier.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

type PlaceDossierCardProps = {
  marker: MarkerLocation | null
  matches: MarkerLocation[]
  onSelectMatch: (match: MarkerLocation) => void
}

function PlaceDossierCard({ marker, matches, onSelectMatch }: PlaceDossierCardProps) {
  if (!marker) return null

  return (
    <section className="mt-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm sm:p-5" aria-labelledby="dossier-card-heading">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
            <circle cx="12" cy="10" r="2" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Verified map match</p>
          <h2 id="dossier-card-heading" className="mt-1 text-sm font-bold leading-5 text-slate-950">{marker.displayName}</h2>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-600">
        Build a global place dossier with physical, political, historical, current-affairs, and India-impact context.
      </p>

      {matches.length > 1 && (
        <details className="mt-3 rounded-xl border border-blue-100 bg-white p-3 text-xs text-slate-700">
          <summary className="cursor-pointer font-semibold text-blue-800">Choose a different map match · {matches.length} found</summary>
          <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto pr-1">
            {matches.map((match) => {
              const selected = match.lat === marker.lat && match.lng === marker.lng
              return (
                <li key={`${match.lat}-${match.lng}-${match.displayName}`}>
                  <button
                    type="button"
                    onClick={() => onSelectMatch(match)}
                    aria-pressed={selected}
                    className={`w-full rounded-lg px-2.5 py-2 text-left leading-4 transition focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      selected ? 'bg-blue-100 font-semibold text-blue-950' : 'hover:bg-slate-100'
                    }`}
                  >
                    {match.displayName}
                  </button>
                </li>
              )
            })}
          </ul>
        </details>
      )}

      <Link
        href={dossierHref(marker)}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
      >
        Open geography dossier
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}

type SearchBoxProps = {
  onSearch: (query: string) => Promise<void>
  isSearching: boolean
  feedback: Feedback
}

function SearchBox({ onSearch, isSearching, feedback }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const quickSearches = ['Godavari', 'Sundarbans', 'Strait of Malacca', 'Congo']

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSearch(query)
  }

  async function runQuickSearch(value: string) {
    setQuery(value)
    await onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          id="place-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. Godavari, Kutch, Malacca"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          disabled={isSearching}
          maxLength={120}
          required
          aria-describedby="search-help"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSearching ? 'Finding…' : 'Search'}
        </button>
      </div>
      <p id="search-help" className="mt-2 text-xs leading-5 text-slate-500">Specific names produce the most reliable map and news results.</p>
      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Example searches">
        {quickSearches.map((place) => (
          <button
            key={place}
            type="button"
            disabled={isSearching}
            onClick={() => void runQuickSearch(place)}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {place}
          </button>
        ))}
      </div>
      {feedback && (
        <p
          role={feedback.tone === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`mt-3 rounded-xl px-3 py-2 text-xs font-medium leading-5 ${
            feedback.tone === 'error' ? 'bg-red-50 text-red-800 ring-1 ring-red-200' : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
          }`}
        >
          {feedback.message}
        </p>
      )}
    </form>
  )
}
