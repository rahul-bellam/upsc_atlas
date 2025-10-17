import './globals.css'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'UPSC Atlas Explorer' }
export default function Root({ children }: { children: React.ReactNode }) { return (<html lang="en"><body>{children}</body></html>) }
