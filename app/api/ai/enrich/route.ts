import { NextResponse } from 'next/server'

export async function GET(req: Request){
  const u = new URL(req.url)
  const q = u.searchParams.get('q') || ''
  const provider = (u.searchParams.get('provider') || process.env.AI_PROVIDER || 'openai').toLowerCase()
  if(!q) return NextResponse.json({ error:'missing q' }, { status:400 })

  if(provider === 'deepseek'){
    const key = process.env.DEEPSEEK_API_KEY
    const base = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
    if(!key) return NextResponse.json({ error:'no deepseek key' }, { status:400 })
    try{
      const prompt = `You are an expert UPSC backgrounder. Provide a concise context (2-3 lines), 2-3 bullets explaining why, and 3 bullets on political/economic/social/geographic impacts for: ${q}`
      const r = await fetch(`${base}/v1/chat/completions`, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${key}` }, body: JSON.stringify({ model:'deepseek-reasoner', messages:[{ role:'user', content: prompt }], max_tokens:400 }) })
      const j = await r.json()
      const out = j?.choices?.[0]?.message?.content || JSON.stringify(j)
      return NextResponse.json({ provider:'deepseek', summary: out })
    }catch(e){ console.error(e); return NextResponse.json({ error:'deepseek failed' }, { status:500 }) }
  }

  // default: openai
  const openaiKey = process.env.OPENAI_API_KEY
  if(!openaiKey) return NextResponse.json({ error:'no openai key' }, { status:400 })
  try{
    const prompt = `You are an expert UPSC backgrounder. Provide a concise context (2-3 lines), 2-3 bullets explaining why, and 3 bullets on political/economic/social/geographic impacts for: ${q}`
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${openaiKey}` }, body: JSON.stringify({ model:'gpt-4o-mini', messages:[{ role:'user', content: prompt }], max_tokens:400 }) })
    const j = await r.json()
    const out = j?.choices?.[0]?.message?.content || JSON.stringify(j)
    return NextResponse.json({ provider:'openai', summary: out })
  }catch(e){ console.error(e); return NextResponse.json({ error:'openai failed' }, { status:500 }) }
}
