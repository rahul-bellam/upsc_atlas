'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

type MapViewportProps = {
  latitude: number
  longitude: number
  zoom: number
}

export default function MapViewport({ latitude, longitude, zoom }: MapViewportProps) {
  const map = useMap()

  useEffect(() => {
    map.setView([latitude, longitude], zoom, { animate: true })
  }, [latitude, longitude, map, zoom])

  return null
}
