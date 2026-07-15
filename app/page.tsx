import Link from 'next/link'
import AtlasMark from '../components/AtlasMark'

const features = [
  {
    eyebrow: '01',
    title: 'Locate precisely',
    description: 'Search global places and choose the correct map match when a name is ambiguous.'
  },
  {
    eyebrow: '02',
    title: 'Read the landscape',
    description: 'Switch between physical terrain and political-administrative perspectives.'
  },
  {
    eyebrow: '03',
    title: 'Connect it to India',
    description: 'Revise geography, current developments, and potential relevance for India in one dossier.'
  }
]

export default function Home() {
  return (
    <main id="main-content" className="relative isolate min-h-dvh overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_16%,rgba(14,116,144,0.48),transparent_27%),radial-gradient(circle_at_78%_72%,rgba(5,150,105,0.34),transparent_24%),linear-gradient(135deg,#0f172a_0%,#0b2545_48%,#0f172a_100%)]" />
      <div className="surface-grid absolute inset-0 -z-10 opacity-30" />
      <div className="absolute -left-24 top-1/3 -z-10 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="absolute -right-20 top-14 -z-10 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />

      <div className="mx-auto flex min-h-dvh max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300">
            <AtlasMark className="h-10 w-10 shrink-0" />
            <span>
              <span className="block text-sm font-bold tracking-tight">UPSC Atlas</span>
              <span className="block text-xs text-slate-300">Global geography · India impact</span>
            </span>
          </Link>
          <Link
            href="/explore"
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/15"
          >
            Open atlas
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16 sm:py-20 lg:py-24">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-200/20 bg-sky-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              A map-first geography revision workspace
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Understand any place.<br />
              <span className="text-sky-200">Know why it matters to India.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              Search a location, explore its physical and political setting, then open a structured PSC/UPSC
              dossier with geography, historical context, current developments, and a clear India-impact lens.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/explore"
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-sky-950/30 transition hover:-translate-y-0.5 hover:bg-sky-50"
              >
                Start exploring
              </Link>
              <a href="#how-it-works" className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10">
                How it works
              </a>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="grid gap-3 pb-4 md:grid-cols-3" aria-label="How UPSC Atlas works">
          {features.map((feature) => (
            <article key={feature.eyebrow} className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm">
              <p className="text-xs font-bold tracking-[0.16em] text-amber-200">{feature.eyebrow}</p>
              <h2 className="mt-4 text-lg font-bold text-white">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{feature.description}</p>
            </article>
          ))}
        </section>

        <footer className="pt-3 text-xs text-slate-400">
          AI-assisted revision support — verify time-sensitive facts against official sources.
        </footer>
      </div>
    </main>
  )
}
