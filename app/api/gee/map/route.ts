import { NextResponse } from 'next/server'
import { JWT } from 'google-auth-library'

const PRESETS = {
  population: { imageId: 'WorldPop/GP/100m/pop', visParams: { min: 0, max: 1000, palette: ['#f7fbff','#c6dbef','#6baed6','#2171b5','#08306b'] } },
  viirs: { imageId: 'NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG', visParams: { min: 0, max: 60, palette: ['#000000','#4b0082','#ff8c00','#ffff00'] } },
  seismic: { imageId: 'USGS/NEIC/earthquakes', visParams: { min:0, max:10, palette: ['#ffffcc','#ffeda0','#feb24c','#f03b20','#bd0026'] } }
}

async function getAccessToken() {
  const client = new JWT({
    email: process.env.GEE_SERVICE_ACCOUNT,
    key: process.env.GEE_PRIVATE_KEY ? process.env.GEE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    scopes: ['https://www.googleapis.com/auth/earthengine']
  })
  await client.authorize()
  return client.credentials.access_token
}

export async function GET(req: Request) {
  try {
    const u = new URL(req.url)
    const id = u.searchParams.get('id') || 'population'
    if (!PRESETS[id]) return NextResponse.json({ error: 'Unknown preset' }, { status: 400 })

    const token = await getAccessToken()
    if (!token) return NextResponse.json({ error: 'GEE auth failed' }, { status: 500 })

    const project = process.env.GEE_PROJECT_ID
    if (!project) return NextResponse.json({ error: 'Missing GEE_PROJECT_ID in env' }, { status: 500 })

    const res = await fetch(`https://earthengine.googleapis.com/v1/projects/${project}/maps`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: { eeImageId: PRESETS[id].imageId }, visParams: PRESETS[id].visParams })
    })

    if (!res.ok) {
      const txt = await res.text()
      return NextResponse.json({ error: 'GEE map request failed', details: txt }, { status: 502 })
    }
    const j = await res.json()
    return NextResponse.json(j)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
