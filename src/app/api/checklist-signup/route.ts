import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/sendEmail'

// Email signup on /boat-deal-checklist.
// Saves the address to the existing mailing list table (express_waitlist,
// source = 'checklist_page') and emails the checklist link ONCE per address:
// the table allows each email only once, so a repeat signup is saved as a
// success but sends nothing. That stops anyone using this form to flood
// someone else's inbox.

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const BASE = 'https://www.boatclosers.com'

function checklistEmail() {
  const link = (href: string, text: string) =>
    `<a href="${href}" style="color:#08152e;font-weight:700;">${text}</a>`
  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color:#1e293b;">
    <div style="text-align:center; margin-bottom: 24px;">
      <span style="font-size: 18px; font-weight: 700; color:#08152e; letter-spacing: 1px;">BOATCLOSERS</span>
    </div>
    <p style="font-size:16px;line-height:1.6;">Here's your private boat sale checklist. It covers both sides of the deal, in order: the HIN, the title, liens, the survey, a written offer, the deposit and the paperwork.</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${BASE}/boat-deal-checklist" style="background:#c9962e;color:#0f1b2d;padding:14px 28px;border-radius:4px;font-weight:700;text-decoration:none;display:inline-block;">Open the checklist</a>
    </p>
    <p style="font-size:15px;line-height:1.6;">Tap "Print or save as PDF" on that page to keep a copy on your phone.</p>
    <p style="font-size:15px;line-height:1.6;">In the middle of a deal? Buyers: ${link(`${BASE}/found-the-boat`, 'Found the boat?')} Sellers: ${link(`${BASE}/have-a-buyer`, 'Have a buyer?')}</p>
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
      BoatClosers · Private Vessel Transactions<br/>
      You asked for this checklist on boatclosers.com.
    </div>
  </div>`
}

export async function POST(request: Request) {
  let body: { email?: string; website?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Spam trap: real people never fill the hidden "website" field.
  if (body.website) {
    return NextResponse.json({ ok: true })
  }

  const email = (body.email || '').trim().toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { error } = await supabase.from('express_waitlist').insert({ email, source: 'checklist_page' })

  // 23505 = this email is already on the list: success, but no second email.
  if (error) {
    if (error.code === '23505') return NextResponse.json({ ok: true })
    console.error('checklist-signup insert failed:', error)
    return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 500 })
  }

  const sent = await sendEmail({
    to: email,
    subject: 'Your private boat sale checklist',
    html: checklistEmail(),
    smsText: `Your BoatClosers checklist: ${BASE}/boat-deal-checklist`,
    context: 'checklist_signup',
  })
  if (!sent.success) console.error('checklist-signup email not sent:', sent.error)

  return NextResponse.json({ ok: true })
}
