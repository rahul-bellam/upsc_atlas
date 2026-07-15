'use client'

import { useState } from 'react'

type DossierActionsProps = {
  place: string
  onRefresh: () => void
  refreshing: boolean
}

export default function DossierActions({ place, onRefresh, refreshing }: DossierActionsProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2_000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2" aria-label={`Actions for ${place} dossier`}>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
      >
        {refreshing ? 'Refreshing…' : 'Refresh dossier'}
      </button>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
      >
        {copied ? 'Link copied' : 'Copy link'}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
      >
        Print / Save PDF
      </button>
    </div>
  )
}
