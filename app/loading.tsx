import AtlasMark from '../components/AtlasMark'

export default function Loading() {
  return (
    <main id="main-content" className="surface-grid flex min-h-dvh items-center justify-center bg-slate-50 p-5" role="status">
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <AtlasMark className="h-10 w-10" label="Loading UPSC Atlas Explorer" />
        <div>
          <p className="text-sm font-bold text-slate-900">Preparing the atlas</p>
          <p className="mt-0.5 text-xs text-slate-500">Loading map and study tools…</p>
        </div>
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-700" aria-hidden="true" />
      </div>
    </main>
  )
}
