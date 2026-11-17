import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail, emailLayout } from '@/lib/sendEmail'

// "Someone just started" alerts for the owner, across the suite, once an hour.
//
// Looks for anything started in the last hour and sends ONE email listing them, so the owner
// can reach out while it's fresh. Nothing new, no email.
//   BoatClosers deals          deals.created_at (this database)
//   My Boat Closing purchases  express_deals.created_at (this database)
//   My Boat Inspector boats    its owner endpoint (MBI_ADMIN_KEY), createdAt
//   My Boat Logs boats         owner_overview() in its database (MBL_ADMIN_KEY), createdAt
//   My Boat Listing listings   listing_overview() in the same database (same key), createdAt
// The owner's own test deals are left out. Runs at :40 past every hour (vercel.json).
// Goes to SUPPORT_EMAIL (or the owner's address). Set ALERTS_OFF=true in Vercel to pause it.

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const WINDOW_MS = 60 * 60 * 1000
const OWNER = process.env.SUPPORT_EMAIL || 'chupurdy@gmail.com'
const ADMIN = `${(process.env.NEXT_PUBLIC_APP_URL || 'https://www.boatclosers.com').replace(/\/$/, '')}/admin`

const esc = (s: any) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
const boatOf = (v: any) => [v?.year, v?.make, v?.model].map((x: any) => String(x ?? '').trim()).filter(Boolean).join(' ')
const time = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })

type Line = { at: string; who: string; what: string; link?: string }

async function boatclosers(since: string): Promise<Line[]> {
  const { data } = await supabaseAdmin
    .from('deals')
    .select('id, created_at, vessel, parties, initiator_role, negotiate')
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(50)
  return (data || [])
    .filter((d: any) => !d?.negotiate?.testDeal)
    .map((d: any) => {
      const role = d.initiator_role === 'seller' ? 'seller' : 'buyer'
      const p = d.parties?.[role] || {}
      const from = d.vessel?.fromInspector ? ` · came from ${d.vessel?.fromApp || 'My Boat Inspector'}` : d.vessel?.fromExpress ? ' · moved up from My Boat Closing' : ''
      return {
        at: d.created_at,
        who: [p.name, p.email].filter(Boolean).join(' · ') || 'New account',
        what: `Started a deal as the ${role}${boatOf(d.vessel) ? `: ${boatOf(d.vessel)}` : ''}${from}`,
      }
    })
}

async function myBoatClosing(since: string): Promise<Line[]> {
  const { data } = await supabaseAdmin
    .from('express_deals')
    .select('id, created_at, buyer_name, buyer_email, items, price_cents, progress')
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(50)
  return (data || [])
    .filter((e: any) => !e?.progress?.testDeal)
    .map((e: any) => {
      const it = e.items || {}
      const boat = it.boat?.description || it.motor?.description || it.trailer?.description || ''
      const price = e.price_cents ? ` · $${Math.round(e.price_cents / 100).toLocaleString('en-US')}` : ''
      return {
        at: e.created_at,
        who: [e.buyer_name, e.buyer_email].filter(Boolean).join(' · ') || 'New buyer',
        what: `Started a purchase${boat ? `: ${boat}` : ''}${price}`,
      }
    })
}

async function inspector(since: number): Promise<Line[]> {
  const key = process.env.MBI_ADMIN_KEY
  if (!key) return []
  const r = await fetch(`${process.env.MBI_URL || 'https://myboatinspector.com'}/api/admin`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
    body: JSON.stringify({ action: 'list' }),
  })
  const j = await r.json().catch(() => null)
  return (j?.inspections || [])
    .filter((b: any) => b?.createdAt && !b.test && new Date(b.createdAt).getTime() >= since)
    .map((b: any) => ({
      at: b.createdAt,
      who: b.email || 'Guest (no account needed)',
      what: `Started an inspection as a ${String(b.role || 'buyer').toLowerCase()}: ${b.boat || 'Boat'}`,
      link: b.link,
    }))
}

async function logs(since: number): Promise<Line[]> {
  const key = process.env.MBL_ADMIN_KEY
  if (!key) return []
  const url = process.env.MBL_SUPABASE_URL || 'https://dnjdqndllwjyccrrraap.supabase.co'
  const anon = process.env.MBL_SUPABASE_ANON_KEY || 'sb_publishable_eZgmQzMast5XlMink-hd4A_kBtdF-k6'
  const r = await fetch(`${url}/rest/v1/rpc/owner_overview`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
    body: JSON.stringify({ p_key: key }),
  })
  const j = await r.json().catch(() => null)
  return (j?.boats || [])
    .filter((b: any) => b?.createdAt && new Date(b.createdAt).getTime() >= since)
    .map((b: any) => ({
      at: b.createdAt,
      who: b.email || 'New owner',
      what: `Added a boat: ${[b.year, b.make, b.model].filter(Boolean).join(' ') || b.name || 'Boat'}`,
    }))
}

async function listings(since: number): Promise<Line[]> {
  const key = process.env.MBL_ADMIN_KEY
  if (!key) return []
  const url = process.env.MBL_SUPABASE_URL || 'https://dnjdqndllwjyccrrraap.supabase.co'
  const anon = process.env.MBL_SUPABASE_ANON_KEY || 'sb_publishable_eZgmQzMast5XlMink-hd4A_kBtdF-k6'
  const r = await fetch(`${url}/rest/v1/rpc/listing_overview`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
    body: JSON.stringify({ p_key: key }),
  })
  if (!r.ok) return [] // not set up yet
  const j = await r.json().catch(() => null)
  return (j?.listings || [])
    .filter((x: any) => x?.createdAt && new Date(x.createdAt).getTime() >= since)
    .map((x: any) => ({
      at: x.createdAt,
      who: x.email || 'Seller (no email yet)',
      what: `Started a listing${x.boat ? `: ${x.boat}` : ''}${x.plan ? ` · ${x.plan} plan` : ''}`,
    }))
}

function section(title: string, lines: Line[]) {
  if (!lines.length) return ''
  const rows = lines
    .map(
      (l) =>
        `<li style="margin:0 0 10px;"><b>${esc(l.who)}</b><br>${esc(l.what)}<br><span style="color:#94a3b8;font-size:12px;">${esc(time(l.at))}${
          l.link ? ` · <a href="${esc(l.link)}" style="color:#94a3b8;">open</a>` : ''
        }</span></li>`,
    )
    .join('')
  return `<h3 style="color:#08152e;font-size:15px;margin:18px 0 8px;">${esc(title)} (${lines.length})</h3><ul style="color:#334155;font-size:14px;line-height:1.5;padding-left:18px;margin:0;">${rows}</ul>`
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (process.env.ALERTS_OFF === 'true') return NextResponse.json({ ok: true, paused: true })

  const sinceMs = Date.now() - WINDOW_MS
  const since = new Date(sinceMs).toISOString()
  const safe = async (f: () => Promise<Line[]>) => {
    try {
      return await f()
    } catch (e) {
      console.error('new-customer alert source failed', e)
      return []
    }
  }
  const [bc, mbc, mbi, mbl, lst] = await Promise.all([
    safe(() => boatclosers(since)),
    safe(() => myBoatClosing(since)),
    safe(() => inspector(sinceMs)),
    safe(() => logs(sinceMs)),
    safe(() => listings(sinceMs)),
  ])
  const total = bc.length + mbc.length + mbi.length + mbl.length + lst.length
  if (!total) return NextResponse.json({ ok: true, sent: false, total: 0 })

  const html = emailLayout(
    `<p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 6px;"><b>${total} new ${total === 1 ? 'customer' : 'customers'} in the last hour.</b> A quick personal hello now goes a long way.</p>` +
      section('BoatClosers', bc) +
      section('My Boat Closing', mbc) +
      section('My Boat Inspector', mbi) +
      section('My Boat Logs', mbl) +
      section('My Boat Listing', lst) +
      `<p style="margin:22px 0 0;"><a href="${ADMIN}" style="background:#b8863a;color:#08152e;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:14px;font-weight:700;display:inline-block;">Open the owner dashboard</a></p>`,
  )
  const names = [bc.length && 'BoatClosers', mbc.length && 'My Boat Closing', mbi.length && 'My Boat Inspector', mbl.length && 'My Boat Logs', lst.length && 'My Boat Listing'].filter(Boolean).join(', ')
  const r = await sendEmail({ to: OWNER, subject: `New: ${total} started (${names})`, html, essential: true, context: 'owner-alert' })
  return NextResponse.json({ ok: true, sent: !!r?.success, total })
}
