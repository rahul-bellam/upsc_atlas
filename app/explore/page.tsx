'use client'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import AIHeadlines from '../../components/AIHeadlines'
import MapToggle from '../../components/MapToggle'
import type { LatLngExpression } from 'leaflet'
const MapContainer = dynamic(() => import('react-leaflet').then(m=>m.MapContainer), { ssr:false })
const TileLayer = dynamic(() => import('react-leaflet').then(m=>m.TileLayer), { ssr:false })
const Marker = dynamic(() => import('react-leaflet').then(m=>m.Marker), { ssr:false })
const Popup = dynamic(() => import('react-leaflet').then(m=>m.Popup), { ssr:false })
export default function Explore(){
  const [position, setPosition] = useState({lat:20.5937,lng:78.9629})
  const [zoom, setZoom] = useState(4)
  const [marker, setMarker] = useState(null)
  const [mapStyle, setMapStyle] = useState('physical')
  const center: LatLngExpression = [position.lat, position.lng]
  useEffect(() => {
    let isMounted = true
    import('leaflet').then((leaflet) => {
      if (!isMounted) return
      const L = leaflet.default
      delete (L.Icon.Default as any).prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png'
      })
    })
    return () => {
      isMounted = false
    }
  }, [])
  function onSearch(q){ if(!q) return; axios.get(`/api/ai/geocode?q=${encodeURIComponent(q)}`).then(res=>{ if(res.data && res.data.lat){ const lat = Number(res.data.lat), lng = Number(res.data.lng); setPosition({lat,lng}); setZoom(10); setMarker({lat,lng, display_name: res.data.display_name}) } }).catch(()=>alert('Search failed')) }
  return (
    <div className="w-screen h-screen flex">
      <aside className="w-96 p-4 bg-white shadow h-full overflow-auto">
        <h2 className="text-lg font-semibold">UPSC Atlas Explorer</h2>
        <div className="mt-3"><SearchBox onSearch={onSearch} /></div>
        <div className="mt-4"><MapToggle mapStyle={mapStyle} setMapStyle={(s)=>setMapStyle(s)} /></div>
        <AIHeadlines onSelect={(place)=>onSearch(place)} />
      </aside>
      <main className="flex-1 relative" id="map-root">
        <MapContainer center={center} zoom={zoom} style={{height:'100%'}}>
          {mapStyle==='physical' ? (
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          ) : (
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
          )}
          {marker && <Marker position={[marker.lat, marker.lng]}><Popup>{marker.display_name}</Popup></Marker>}
        </MapContainer>
      </main>
    </div>
  )
}
function SearchBox({ onSearch }){ const [q,setQ]=useState(''); return (<div><input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search place" className="w-full border p-2 rounded" /><div className="mt-2 flex gap-2"><button onClick={()=>onSearch(q)} className="px-3 py-1 bg-black text-white rounded">Search</button></div></div>) }
