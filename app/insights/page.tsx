'use client'

import Link from 'next/link'
import React, { Suspense } from 'react'
import AtlasMark from '../../components/AtlasMark'
import DossierActions from '../../components/DossierActions'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import type {
  ApiErrorResponse,
  PlaceNewsArticle,
  PlaceNewsResponse,
  PlaceProfile,
  PlaceReference
} from '../../lib/place-types'

class ApiRequestError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  const payload = (await response.json()) as T | ApiErrorResponse

  if (!response.ok) {
    const error = payload as ApiErrorResponse
    throw new ApiRequestError(error.error || 'The request could not be completed.', response.status, error.code)
  }

  return payload as T
}

function formatDate(value?: string): string {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Insights() {
  return (
    <Suspense fallback={<InsightsShell>Loading place dossier…</InsightsShell>}>
      <InsightsContent />
    </Suspense>
  )
}

function InsightsContent() {
  const searchParams = useSearchParams()
  const place = searchParams.get('topic') || searchParams.get('place') || ''
  const resolvedLocation = searchParams.get('location') || place
  const profileUrl = place
    ? `/api/ai/summarize?q=${encodeURIComponent(place)}&location=${encodeURIComponent(resolvedLocation)}`
    : null
  const newsUrl = place ? `/api/news?q=${encodeURIComponent(place)}` : null
  const profileRequest = useSWR<PlaceProfile>(profileUrl, fetchJson)
  const newsRequest = useSWR<PlaceNewsResponse>(newsUrl, fetchJson)

  if (!place) {
    return (
      <InsightsShell>
        <EmptyState
          title="Choose a place first"
          description="Search for a city, river, mountain range, protected area, border region, or other named place on the map."
        />
      </InsightsShell>
    )
  }

  return (
    <InsightsShell>
      <header className="relative overflow-hidden rounded-2xl border border-slate-200 border-t-[3px] border-t-[#0f4c81] bg-[#fffdf9] p-5 shadow-[0_10px_30px_rgba(28,42,56,0.08)] sm:p-7">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_30%,rgba(224,242,254,0.72),transparent_44%),radial-gradient(circle_at_28%_86%,rgba(209,250,229,0.42),transparent_35%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="flex max-w-3xl gap-4">
            <AtlasMark className="mt-0.5 h-11 w-11 shrink-0" label="UPSC Atlas dossier" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Place dossier · Global geography</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">{place}</h1>
              {resolvedLocation !== place && (
                <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Verified map match: {resolvedLocation}
                </p>
              )}
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                A revision-ready view of physical and political geography, historical context, current developments,
                and potential relevance to India.
              </p>
            </div>
          </div>
          <div className="no-print flex flex-wrap justify-end gap-2">
            <DossierActions
              place={place}
              refreshing={profileRequest.isValidating}
              onRefresh={() => void profileRequest.mutate()}
            />
            <Link
              href="/explore"
              className="rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
            >
              ← Search another place
            </Link>
          </div>
        </div>
      </header>

      <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold" aria-hidden="true">!</span>
        <p>
          <strong>Study wisely.</strong> Recent developments are synthesized only from linked news records. Verify
          boundaries, statistics, designations, and time-sensitive facts using official sources.
        </p>
      </div>

      <ProfilePanel
        place={place}
        profile={profileRequest.data}
        isLoading={profileRequest.isLoading}
        error={profileRequest.error}
        onRetry={() => void profileRequest.mutate()}
      />

      <NewsPanel
        news={newsRequest.data}
        isLoading={newsRequest.isLoading}
        error={newsRequest.error}
        onRetry={() => void newsRequest.mutate()}
      />
    </InsightsShell>
  )
}

type InsightsShellProps = {
  children: React.ReactNode
}

function InsightsShell({ children }: InsightsShellProps) {
  return (
    <main id="main-content" className="paper-surface min-h-dvh px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  )
}

type ProfilePanelProps = {
  place: string
  profile?: PlaceProfile
  isLoading: boolean
  error: unknown
  onRetry: () => void
}

type DossierSection = {
  id: string
  shortTitle: string
  title: string
  items: string[]
}

function ProfilePanel({ place, profile, isLoading, error, onRetry }: ProfilePanelProps) {
  if (isLoading) {
    return <LoadingCard title={`Building the ${place} geography dossier…`} />
  }

  if (error || !profile) {
    const message = error instanceof Error ? error.message : 'The place dossier could not be created.'
    return <ErrorCard title="Place dossier unavailable" message={message} onRetry={onRetry} />
  }

  const sections: DossierSection[] = [
    { id: 'physical-geography', shortTitle: 'Physical', title: 'Physical geography', items: profile.physicalGeography },
    { id: 'political-geography', shortTitle: 'Political', title: 'Political & administrative geography', items: profile.politicalGeography },
    { id: 'historical-context', shortTitle: 'History', title: 'Historical context', items: profile.historicalContext },
    { id: 'current-relevance', shortTitle: 'Current', title: 'Current geographical relevance', items: profile.currentContext },
    { id: 'recent-developments', shortTitle: 'News', title: 'Recent developments: sourced six-month summary', items: profile.recentDevelopments },
    { id: 'india-impact', shortTitle: 'India impact', title: 'India relevance & potential impact', items: profile.indiaImpact },
    { id: 'prelims-map-facts', shortTitle: 'Prelims', title: 'Prelims map facts', items: profile.prelimsMapFacts },
    { id: 'mains-angles', shortTitle: 'Mains', title: 'Mains angles', items: profile.mainsAngles }
  ]

  return (
    <section className="mt-6" aria-labelledby="dossier-heading">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#fffdf9] shadow-[0_8px_24px_rgba(28,42,56,0.06)]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 to-slate-800 px-5 py-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-200">Core geography brief</p>
          <h2 id="dossier-heading" className="mt-1 text-xl font-bold text-white">{profile.title}</h2>
        </div>
        {profile.overview && <p className="max-w-4xl px-5 py-5 text-sm leading-7 text-slate-700 sm:px-6">{profile.overview}</p>}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:items-start">
        <DossierContents sections={sections} />
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <BulletSection key={section.id} id={section.id} title={section.title} items={section.items} />
          ))}
        </div>
      </div>

      <ReferencePanel sources={profile.sources} verificationNotes={profile.verificationNotes} />
    </section>
  )
}

function DossierContents({ sections }: { sections: DossierSection[] }) {
  return (
    <nav className="no-print rounded-2xl border border-slate-200 bg-[#fffdf9] p-4 shadow-[0_8px_24px_rgba(28,42,56,0.05)] lg:sticky lg:top-5" aria-label="Dossier sections">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">In this dossier</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">A focused path through the revision brief.</p>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
        {sections.map((section, index) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="group flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 lg:w-full"
          >
            <span className="font-mono text-[10px] text-slate-400 group-hover:text-blue-700">{String(index + 1).padStart(2, '0')}</span>
            <span>{section.shortTitle}</span>
          </a>
        ))}
        <div className="my-2 hidden border-t border-slate-200 lg:block" />
        <a href="#source-records" className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 lg:w-full">
          <span className="font-mono text-[10px] text-slate-400">↗</span>
          Sources
        </a>
        <a href="#place-news" className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 lg:w-full">
          <span className="font-mono text-[10px] text-slate-400">↗</span>
          News archive
        </a>
      </div>
    </nav>
  )
}

type BulletSectionProps = {
  id: string
  title: string
  items: string[]
}

function BulletSection({ id, title, items }: BulletSectionProps) {
  const isIndiaImpact = title.startsWith('India')
  const isNews = title.startsWith('Recent')
  const accent = isIndiaImpact ? 'bg-amber-500' : isNews ? 'bg-rose-500' : 'bg-blue-600'

  return (
    <section id={id} className="scroll-mt-5 rounded-xl border border-slate-200 bg-[#fffdf9] p-5 shadow-[0_5px_18px_rgba(28,42,56,0.045)]">
      <div className="flex items-start gap-3">
        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${accent}`} aria-hidden="true" />
        <h3 className="text-base font-bold leading-6 text-slate-950">{title}</h3>
      </div>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-500">No reliable revision point was returned for this section.</p>
      )}
    </section>
  )
}

type ReferencePanelProps = {
  sources: PlaceReference[]
  verificationNotes: string[]
}

function ReferencePanel({ sources, verificationNotes }: ReferencePanelProps) {
  return (
    <section id="source-records" className="scroll-mt-5 mt-4 grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Transparency</p>
        <h3 className="mt-1 text-base font-bold text-slate-950">Background records consulted</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          These orient the AI brief; they are not claim-by-claim citations. Open the original records to verify
          important facts.
        </p>
        {sources.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {sources.map((source) => (
              <li key={source.url} className="text-sm">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium text-blue-700 underline hover:text-blue-900"
                >
                  {source.label}
                </a>
                {source.excerpt && <p className="mt-1 leading-5 text-slate-600">{source.excerpt}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No background record was available for this query.</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Before you revise</p>
        <h3 className="mt-1 text-base font-bold text-slate-950">Verification checklist</h3>
        {verificationNotes.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            {verificationNotes.map((note, index) => (
              <li key={index} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Cross-check boundaries, statistics, protected-area status, and contemporary policy using official
            government or institutional sources.
          </p>
        )}
      </div>
    </section>
  )
}

type NewsPanelProps = {
  news?: PlaceNewsResponse
  isLoading: boolean
  error: unknown
  onRetry: () => void
}

function NewsPanel({ news, isLoading, error, onRetry }: NewsPanelProps) {
  return (
    <section id="place-news" className="scroll-mt-5 mt-9 border-t border-slate-200 pt-8" aria-labelledby="news-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">Sourced current affairs</p>
          <h2 id="news-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            News at this place
          </h2>
          <p className="mt-1 text-sm text-slate-600">Articles matching the place name from the previous six months.</p>
          {news && (
            <p className="mt-2 inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
              Search window: {formatDate(news.from)} – {formatDate(news.to)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onRetry}
          disabled={isLoading}
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {isLoading ? 'Refreshing…' : 'Refresh news'}
        </button>
      </div>

      {isLoading && <LoadingCard title="Searching the six-month news archive…" />}
      {Boolean(error) && !isLoading && (
        <ErrorCard
          title="Six-month news archive unavailable"
          message={error instanceof Error ? error.message : 'Unable to load related news.'}
          onRetry={onRetry}
        />
      )}
      {!isLoading && !error && news && <NewsList articles={news.articles} />}
    </section>
  )
}

function NewsList({ articles }: { articles: PlaceNewsArticle[] }) {
  if (articles.length === 0) {
    return (
      <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
        No English-language articles matching this exact place name were returned in the requested six-month
        window. Try a broader or alternate place name.
      </p>
    )
  }

  return (
    <ul className="mt-4 grid gap-4 md:grid-cols-2">
      {articles.map((article, index) => (
        <li key={`${article.url}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{article.source}</p>
          <h3 className="mt-2 text-base font-bold leading-6 text-slate-950">
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-slate-300 underline-offset-2 hover:text-blue-800 hover:decoration-blue-800"
            >
              {article.title}
            </a>
          </h3>
          {article.description && <p className="mt-2 text-sm leading-6 text-slate-600">{article.description}</p>}
          <p className="mt-3 text-xs font-medium text-slate-500">Published {formatDate(article.publishedAt)}</p>
        </li>
      ))}
    </ul>
  )
}

function LoadingCard({ title }: { title: string }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-600 shadow-sm" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-700" aria-hidden="true" />
      {title}
    </div>
  )
}

type ErrorCardProps = {
  title: string
  message: string
  onRetry: () => void
}

function ErrorCard({ title, message, onRetry }: ErrorCardProps) {
  return (
    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 shadow-sm" role="alert">
      <div className="flex gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-200 text-xs font-bold" aria-hidden="true">!</span>
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="mt-1 leading-6">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg bg-white px-3 py-1.5 font-bold text-red-800 shadow-sm transition hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}

type EmptyStateProps = {
  title: string
  description: string
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <AtlasMark className="h-11 w-11" label="UPSC Atlas Explorer" />
      <h1 className="mt-5 text-xl font-bold text-slate-950">{title}</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      <Link
        href="/explore"
        className="mt-5 inline-block rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
      >
        Open map
      </Link>
    </div>
  )
}
