import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UPSC Atlas Explorer',
  description: 'Global geography dossiers with physical and political maps and an India-impact lens.'
}

export default function Root({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[1000] -translate-y-20 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition focus:translate-y-0"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
