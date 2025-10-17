'use client'
import Link from 'next/link'
export default function Home(){ return (
  <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white">
    <div className="max-w-2xl text-center p-8 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-4">UPSC Atlas Explorer</h1>
      <p className="text-sm text-slate-600 mb-6">AI-assisted maps, news and deep-dive insights for UPSC preparation.</p>
      <Link href="/explore"><a className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">Launch UPSC Atlas Explorer</a></Link>
    </div>
  </main>
) }
