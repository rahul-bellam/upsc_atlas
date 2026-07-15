'use client'

import React from 'react'

export type MapStyle = 'physical' | 'political'

type MapToggleProps = {
  mapStyle: MapStyle
  setMapStyle: (style: MapStyle) => void
}

const styles: Array<{ id: MapStyle; label: string; description: string; accent: string }> = [
  { id: 'physical', label: 'Physical', description: 'Terrain, relief & water systems', accent: 'bg-emerald-500' },
  { id: 'political', label: 'Political', description: 'Borders, places & administration', accent: 'bg-violet-500' }
]

export default function MapToggle({ mapStyle, setMapStyle }: MapToggleProps) {
  return (
    <fieldset>
      <legend className="text-sm font-bold text-slate-900">Choose your map lens</legend>
      <p className="mt-1 text-xs leading-5 text-slate-500">Switch perspectives without losing your selected place.</p>
      <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Map type">
        {styles.map((style) => {
          const selected = mapStyle === style.id
          return (
            <button
              key={style.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setMapStyle(style.id)}
              className={`rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                selected
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${selected ? style.accent : 'bg-slate-300'}`} />
                <span className="text-sm font-bold">{style.label}</span>
              </span>
              <span className={`mt-1.5 block text-[11px] leading-4 ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
                {style.description}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
