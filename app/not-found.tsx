import Link from 'next/link'
import AtlasMark from '../components/AtlasMark'

export default function NotFound() {
  return (
    <main id="main-content" className="surface-grid flex min-h-dvh items-center justify-center bg-slate-50 p-5">
      <section className="max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-lg sm:p-9">
        <AtlasMark className="h-12 w-12" label="UPSC Atlas Explorer" />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">404 · Page not found</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">This coordinate is outside the atlas.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Return to the map to search for a place or open a new geography dossier.</p>
        <Link href="/explore" className="mt-6 inline-block rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800">
          Open map
        </Link>
      </section>
    </main>
  )
}
