'use client'
import React from 'react'
export default function MapToggle({ mapStyle, setMapStyle }){ return (<div className="mt-2"><div className="flex items-center justify-between"><div>Map type</div><div className="flex gap-2"><button onClick={()=>setMapStyle('physical')} className={`px-2 py-1 rounded ${mapStyle==='physical' ? 'bg-black text-white':'bg-gray-100'}`}>Physical</button><button onClick={()=>setMapStyle('political')} className={`px-2 py-1 rounded ${mapStyle==='political' ? 'bg-black text-white':'bg-gray-100'}`}>Political</button></div></div></div>) }
