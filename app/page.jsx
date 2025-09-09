'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import axios from 'axios'

// Dynamically import Leaflet components (SSR disabled)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })

// Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png'
})

export default function Page() {
  const [position, setPosition] = useState({ lat: 20.5937, lng: 78.9629 })
  const [zoom, setZoom] = useState(4)
  const [query, setQuery] = useState('')
  const [marker, setMarker] = useState(null)
  const [aiProvider, setAiProvider] = useState(process.env.NEXT_PUBLIC_AI_PROVIDER || 'openai')

  useEffect(() => {
    // Client-only logic if needed
  }, [])

  async function searchPlace() {
    if (!query) return
    try {
      const res = await axios.get(`/api/ai/geocode?q=${encodeURIComponent(query)}`)
      if (res.data && res.data.lat && res.data.lng) {
        setPosition({ lat: res.data.lat, lng: res.data.lng })
        setZoom(10)
        setMarker({ lat: res.data.lat, lng: res.data.lng, display_name: res.data.display_name })
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function enrich() {
    if (!marker) return alert('Search for a place first')
    try {
      const res = await axios.get(
        `/api/ai/enrich?q=${encodeURIComponent(marker.display_name)}&provider=${aiProvider}`
      )
      alert('AI summary (top):\n' + (res.data.summary || JSON.stringify(res.data)))
    } catch (e) {
      console.error(e)
      alert('AI call failed')
    }
  }

  return (
    <div className="w-screen h-screen flex">
      <aside className="w-96 p-4 bg-white shadow h-full overflow-auto">
        <h2 className="text-lg font-semibold">UPSC Atlas AI (OpenAI + DeepSeek)</h2>
        <div className="mt-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search place"
            className="w-full border p-2 rounded"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={searchPlace} className="px-3 py-1 bg-black text-white rounded">
              Search (Geocode)
            </button>
            <button onClick={enrich} className="px-3 py-1 bg-blue-600 text-white rounded">
              AI Enrich
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm">AI Provider</label>
          <select
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value)}
            className="mt-1 border p-1 rounded w-full"
          >
            <option value="openai">OpenAI</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>

        <div className="mt-6 text-xs text-slate-600">
          Use OpenAI for geocoding; choose provider for enrichment.
        </div>
      </aside>

      <main id="map-root" className="flex-1 relative">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={zoom}
          style={{ height: '100%' }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {marker && (
            <Marker position={[marker.lat, marker.lng]}>
              <Popup>{marker.display_name}</Popup>
            </Marker>
          )}
        </MapContainer>
      </main>
    </div>
  )
}
