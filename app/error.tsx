'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import AtlasMark from '../components/AtlasMark'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Application error', error)
  }, [error])

  return (
    <main id="main-content" className="surface-grid flex min-h-dvh items-center justify-center bg-slate-50 p-5">
      <section className="max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-lg sm:p-9">
        <AtlasMark className="h-12 w-12" label="UPSC Atlas Explorer" />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-red-700">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">The atlas could not complete that request.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your map search or study dossier is still safe. Try the request again, or return to the map and choose another place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
          >
            Try again
          </button>
          <Link href="/explore" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            Back to map
          </Link>
        </div>
      </section>
    </main>
  )
}
