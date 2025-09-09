import { NextResponse } from 'next/server'

export async function GET(req: Request){
  const u = new URL(req.url)
  const q = u.searchParams.get('q') || ''
  if(!q) return NextResponse.json({ error:'missing q' }, { status:400 })

  // First try Nominatim (reliable and free)
  try{
    const nom = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`)
    const nj = await nom.json()
    if(nj && nj[0]){
      return NextResponse.json({ lat: parseFloat(nj[0].lat), lng: parseFloat(nj[0].lon), display_name: nj[0].display_name })
    }
  }catch(e){ console.warn('nominatim failed', e) }

  // Fallback: if OpenAI available, ask it to parse coordinates (best-effort)
  const openaiKey = process.env.OPENAI_API_KEY
  if(!openaiKey) return NextResponse.json({ error:'geocode failed' }, { status:500 })
  try{
    const prompt = `Extract coordinates for this place in JSON {lat:..., lng:..., display_name:"..."} if known, otherwise return an empty object. Place: ${q}`
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${openaiKey}` }, body: JSON.stringify({ model:'gpt-4o-mini', messages:[{ role:'user', content: prompt }], max_tokens:150 }) })
    const j = await r.json()
    const text = j?.choices?.[0]?.message?.content || ''
    // Try to parse JSON inside text
    const m = text.match(/\{[\s\S]*\}/)
    if(m){
      const obj = JSON.parse(m[0])
      return NextResponse.json(obj)
    }
  }catch(e){ console.error('openai geocode failed', e) }

  return NextResponse.json({ error:'unable to geocode' }, { status:500 })
}
