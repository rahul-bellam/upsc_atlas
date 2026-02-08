'use client'
import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
const fetcher=(url)=>fetch(url).then(r=>r.json())
export default function Insights(){
  return (
    <Suspense fallback={<main className="p-6">Loading insights…</main>}>
      <InsightsContent />
    </Suspense>
  )
}

function InsightsContent(){
  const sp = useSearchParams()
  const place = sp.get('place') || ''
  const { data } = useSWR(
    place ? `/api/ai/summarize?q=${encodeURIComponent(place)}` : null,
    fetcher
  )
  const parts = data || {}
  return (<main className="p-6"><h1 className="text-2xl font-bold mb-4">Detailed Insights</h1><div className="mb-4 text-sm text-slate-600">Place: <strong>{place || '—'}</strong></div><div className="space-y-4"><Section title="Summary" content={parts.context || parts.raw || 'No summary available.'} /><Section title="Why it happened" content={parts.why || parts.parsed?.[1] || 'No data.'} /><Section title="Impact" content={parts.impact || parts.parsed?.[2] || 'No data.'} /><Section title="Possible Solutions & UPSC angle" content={parts.solutions || parts.upsc || 'No data.'} /></div></main>)
}
function Section({title,content}){ return (<section className="p-4 bg-white rounded shadow"><h3 className="font-semibold mb-2">{title}</h3><div className="text-sm whitespace-pre-line">{typeof content === 'string' ? content : JSON.stringify(content,null,2)}</div></section>) }
