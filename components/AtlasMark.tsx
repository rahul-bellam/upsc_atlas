type AtlasMarkProps = {
  className?: string
  label?: string
}

export default function AtlasMark({ className = 'h-10 w-10', label = 'UPSC Atlas Explorer' }: AtlasMarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={label} fill="none">
      <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#atlas-gradient)" />
      <path d="M11 24h26M24 11c4.5 4.1 6.8 8.4 6.8 13S28.5 32.9 24 37c-4.5-4.1-6.8-8.4-6.8-13S19.5 15.1 24 11Z" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14 16.5c2.9 1.4 6.2 2.1 10 2.1s7.1-.7 10-2.1M14 31.5c2.9-1.4 6.2-2.1 10-2.1s7.1.7 10 2.1" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="30.8" cy="18.2" r="2.5" fill="#fbbf24" stroke="white" strokeWidth="1.2" />
      <defs>
        <linearGradient id="atlas-gradient" x1="6" y1="5" x2="43" y2="45" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f4c81" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>
    </svg>
  )
}
