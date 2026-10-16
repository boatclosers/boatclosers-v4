import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { MAX_PHOTOS, type Photo } from '@/lib/express/content'
import { ensurePhotoBucket, photoBytes, photoPath, PHOTO_BUCKET } from '@/lib/express/photos'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Handoff photos for a paid BC Express purchase.
//   GET  ?token&id                       -> the image (private link only)
//   POST { token, label, image }          -> add a photo (JPEG data URL, resized in the browser)
//   POST { token, action:'delete', id }   -> remove one

const MAX_BYTES = 2.5 * 1024 * 1024

async function load(token: unknown) {
  if (typeof token !== 'string' || !/^[a-f0-9]{48}$/.test(token)) return null
  const { data } = await supabaseAdmin.from('express_deals').select('id,status,progress').eq('access_token', token).maybeSingle()
  return data as any
}

export async function GET(req: Request) {
  const u = new URL(req.url)
  const deal = await load(u.searchParams.get('token'))
  const id = u.searchParams.get('id') || ''
  if (!deal || deal.status !== 'paid') return new Response('Not found.', { status: 404 })
  const photos: Photo[] = deal.progress?.photos || []
  if (!photos.some((p) => p.id === id)) return new Response('Not found.', { status: 404 })
  const bytes = await photoBytes(deal.id, id)
  if (!bytes) return new Response('Not found.', { status: 404 })
  return new Response(Buffer.from(bytes), {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=3600', 'X-Robots-Tag': 'noindex' },
  })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const deal = await load(body?.token)
  if (!deal) return NextResponse.json({ error: 'Link not valid.' }, { status: 404 })
  if (deal.status !== 'paid') return NextResponse.json({ error: 'Unlock the inspection first.' }, { status: 402 })
  const photos: Photo[] = Array.isArray(deal.progress?.photos) ? deal.progress.photos : []

  if (body?.action === 'delete') {
    const id = String(body?.id || '')
    if (!photos.some((p) => p.id === id)) return NextResponse.json({ error: 'Photo not found.' }, { status: 404 })
    await supabaseAdmin.storage.from(PHOTO_BUCKET).remove([photoPath(deal.id, id)])
    const progress = { ...(deal.progress || {}), photos: photos.filter((p) => p.id !== id) }
    await supabaseAdmin.from('express_deals').update({ progress, updated_at: new Date().toISOString() }).eq('id', deal.id)
    return NextResponse.json({ progress })
  }

  if (photos.length >= MAX_PHOTOS) return NextResponse.json({ error: `Up to ${MAX_PHOTOS} photos.` }, { status: 400 })
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(body?.image || ''))
  if (!m) return NextResponse.json({ error: 'Send a JPEG photo.' }, { status: 400 })
  const bytes = Buffer.from(m[1], 'base64')
  if (bytes.length > MAX_BYTES) return NextResponse.json({ error: 'That photo is too large.' }, { status: 413 })
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return NextResponse.json({ error: 'Send a JPEG photo.' }, { status: 400 })

  await ensurePhotoBucket()
  const id = crypto.randomBytes(12).toString('hex')
  const { error } = await supabaseAdmin.storage.from(PHOTO_BUCKET).upload(photoPath(deal.id, id), bytes, { contentType: 'image/jpeg', upsert: false })
  if (error) return NextResponse.json({ error: 'Could not save the photo.' }, { status: 500 })

  const label = String(body?.label || 'Photo').replace(/\s+/g, ' ').trim().slice(0, 60) || 'Photo'
  const progress = { ...(deal.progress || {}), photos: [...photos, { id, label, at: Date.now() }] }
  await supabaseAdmin.from('express_deals').update({ progress, updated_at: new Date().toISOString() }).eq('id', deal.id)
  return NextResponse.json({ progress })
}
