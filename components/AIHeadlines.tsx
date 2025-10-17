'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
export default function AIHeadlines({ onSelect }){
  const [articles,setArticles]=useState([]); const [loading,setLoading]=useState(false)
  useEffect(()=>{ fetchHeadlines() },[])
  async function fetchHeadlines(){ setLoading(true); try{ const res=await axios.get('/api/news'); setArticles(res.data.articles||[]) }catch(e){console.error(e)} setLoading(false) }
  return (<div className="mt-4"><h3 className="font-semibold">Headlines</h3>{loading && <div className="text-sm text-slate-500">Loading...</div>}<ul className="mt-2 space-y-2">{articles.map((a,i)=><li key={i} className="p-2 border rounded bg-white"><div className="font-semibold text-sm">{a.title}</div><div className="text-xs text-slate-600">{a.source?.name} • {new Date(a.publishedAt).toLocaleDateString()}</div><div className="mt-2 flex gap-2"><button onClick={()=> onSelect(a.title)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Locate</button><Link href={`/insights?place=${encodeURIComponent(a.title)}`}><a className="px-2 py-1 bg-gray-100 rounded text-xs">Insights</a></Link></div></li>)}</ul></div>) }
