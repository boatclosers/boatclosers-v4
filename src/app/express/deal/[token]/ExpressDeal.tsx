'use client'

// BoatClosers Express: the buyer's purchase page. It follows the same six steps
// as full BoatClosers (Vessel, Parties, Price, Check, Documents, Closing), in a
// simpler one-party form. Checking is free; the $29.99 unlocks the papers at the
// Documents step. Inspections are My Boat Inspector's job, not Express's.

import { useEffect, useRef, useState } from 'react'
import LienCheck from '@/components/LienCheck'
import {
  SELLER_QUESTIONS,
  PAYMENT_TIPS,
  PAYMENT_METHODS,
  HULLS,
  PROPULSION,
  FUELS,
  TITLED_OPTIONS,
  BRING_TO_HANDOFF,
  HANDOFF_CHECKS,
  NEW_OWNER,
  titleSigningGuide,
  whatToBring,
  salesTaxEstimate,
  addDays,
  handoffProblems,
  type Handoff,
  type ItemKey,
} from '@/lib/express/content'
import {
  navy,
  gold,
  cream,
  muted,
  line,
  boxStyle,
  eyebrow,
  h2,
  money,
  forItems,
  goldButton,
  outlineButton,
  Field,
  Select,
  Choice,
  LIEN_OPTIONS,
  Checklist,
  DocRow,
  SellerQuestions,
  FullSuggest,
  PhotosCard,
  ContactPrefs,
} from './parts'
import HinCard from './HinCard'
import ExpressGuided, { type Question } from './ExpressGuided'

const STEPS = [
  { title: 'Vessel', note: 'What you’re buying' },
  { title: 'Parties', note: 'You and the seller' },
  { title: 'Price', note: 'The agreed price' },
  { title: 'Check', note: 'Free checks before you pay' },
  { title: 'Documents', note: 'Your papers' },
  { title: 'Closing', note: 'Handoff and title' },
] as const

const ID_FIELD: Record<ItemKey, ['hin' | 'vin' | 'serial', string, string]> = {
  boat: ['hin', 'Hull ID (HIN)', '12 characters, on the back right of the hull'],
  trailer: ['vin', 'Trailer VIN', '17 characters, on the tongue'],
  motor: ['serial', 'Motor serial number', 'On the plate on the mounting bracket'],
}
const ITEM_LABEL: Record<ItemKey, string> = { boat: 'Boat', trailer: 'Trailer', motor: 'Motor' }

const MBI_PRICE = '$59.99'
const BUNDLE_PRICE = '$79.99'

type Basics = { buyerName: string; sellerName: string; price: string; descriptions: Partial<Record<ItemKey, string>> }

function sectionTitle(text: string) {
  return <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 6vw, 32px)', lineHeight: 1.2, margin: 0 }}>{text}</h1>
}

// ---------- the other products, offered once each where they fit ----------

function ProductCard({
  label,
  name,
  price,
  text,
  href,
  cta,
  external,
  highlight,
}: {
  label: string
  name: string
  price: string
  text: string
  href: string
  cta: string
  external?: boolean
  highlight?: boolean
}) {
  return (
    <div
      style={{
        flex: '1 1 240px',
        border: `1px solid ${highlight ? gold : line}`,
        background: highlight ? 'rgba(201,150,46,0.08)' : 'rgba(245,241,232,0.03)',
        borderRadius: 10,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={eyebrow}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 19, fontWeight: 700 }}>{name}</span>
        <span style={{ color: gold, fontWeight: 700, whiteSpace: 'nowrap' }}>{price}</span>
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.55, color: muted, flex: 1 }}>{text}</div>
      <a href={href} {...(external ? { target: '_blank', rel: 'noopener' } : {})} style={{ ...outlineButton, textAlign: 'center', textDecoration: 'none' }}>
        {cta}
      </a>
    </div>
  )
}

function CompareProducts({ token, paid }: { token: string; paid: boolean }) {
  const rows: [string, string, string, string, string][] = [
    ['', 'Express', 'My Boat Inspector', 'BoatClosers', 'My Boat Logs'],
    ['Price', '$29.99', MBI_PRICE, paid ? '$219.01 after credit' : '$249', '$39.99/yr'],
    ['Free HIN and lien check', '✓', '', '✓', ''],
    ['Bill of sale and Florida forms', '✓', '', '✓', ''],
    ['Title application and reminders', '✓', '', '✓', ''],
    ['Guided inspection, sea trial and report', '', '✓', '', ''],
    ['Offers and negotiation', '', '', '✓', ''],
    ['Deposit held by a neutral party', '', '', '✓', ''],
    ['Survey and sea trial conditions', '', '', '✓', ''],
    ['Seller joins and signs online', '', '', '✓', ''],
    ['Maintenance log and records', '', '', '', '✓'],
  ]
  return (
    <details style={{ ...boxStyle, gap: 12 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 700, color: gold, listStyle: 'none' }}>Compare all four products ▾</summary>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 520, fontSize: 13.5 }}>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderTop: i ? `1px solid ${line}` : 'none' }}>
                {r.map((c, j) => (
                  <td
                    key={j}
                    style={{
                      padding: '8px 6px',
                      textAlign: j ? 'center' : 'left',
                      fontWeight: i === 0 || j === 0 ? 700 : 500,
                      color: i === 0 ? gold : j === 1 && i ? cream : c === '✓' ? cream : muted,
                      background: j === 1 ? 'rgba(201,150,46,0.08)' : 'transparent',
                    }}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a href={`/?fromExpress=${token}`} style={{ color: gold, fontSize: 14 }}>
        Need what BoatClosers does? Move this purchase over. Everything you entered comes with you.
      </a>
    </details>
  )
}

// ---------- main ----------

export default function ExpressDeal({ token }: { token: string }) {
  const [deal, setDeal] = useState<any>(null)
  const [contact, setContact] = useState<any>(null)
  const [error, setError] = useState('')
  const [step, setStep] = useState<number | null>(null)
  const [guided, setGuided] = useState(true)
  const [paying, setPaying] = useState<'' | 'solo' | 'bundle'>('')
  const [payError, setPayError] = useState('')
  const [justPaid, setJustPaid] = useState(false)
  const [saveState, setSaveState] = useState<'' | 'saving' | 'saved' | 'error'>('')
  const [basics, setBasics] = useState<Basics | null>(null)
  const [h, setH] = useState<Handoff>({})
  const [ids, setIds] = useState<Partial<Record<ItemKey, string>>>({})
  const pending = useRef<{ handoff?: Partial<Handoff>; basics?: Partial<Basics>; ids?: Partial<Record<ItemKey, string>> }>({})
  const saveTimer = useRef<any>(null)
  const checkTimer = useRef<any>(null)
  const pendingChecks = useRef<Record<string, boolean>>({})
  const answerTimer = useRef<any>(null)
  const pendingAnswers = useRef<Record<string, string>>({})

  // ---------- load ----------
  useEffect(() => {
    try {
      setGuided(localStorage.getItem('bcx_guided') !== '0')
    } catch {}
    const back = new URLSearchParams(window.location.search).get('paid') === '1'
    setJustPaid(back)
    let tries = 0
    async function load() {
      try {
        const res = await fetch(`/api/express/deal?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Link not valid.')
        const dl = d.deal
        setDeal(dl)
        setContact(d.contact || null)
        setBasics({
          buyerName: dl.buyer_name || '',
          sellerName: dl.seller_name || '',
          price: String(Math.round((dl.price_cents || 0) / 100)),
          descriptions: Object.fromEntries(Object.entries(dl.items || {}).map(([k, v]: any) => [k, v.description || ''])),
        })
        setIds(Object.fromEntries(Object.entries(dl.items || {}).map(([k, v]: any) => [k, v[ID_FIELD[k as ItemKey][0]] || ''])))
        const hand: Handoff = dl.progress?.handoff || {}
        setH({ saleDate: hand.saleDate || new Date().toISOString().slice(0, 10), ...hand })
        setStep((s) => {
          if (s !== null) return s
          if (dl.status === 'paid') return back ? 4 : handoffProblems(hand, hasOf(dl)).length ? 4 : 5
          return 0
        })
        if (dl.status === 'unpaid' && back && tries < 4) {
          tries++
          setTimeout(load, 2000)
        }
      } catch (e: any) {
        setError(e?.message || 'Could not load your purchase.')
      }
    }
    load()
  }, [token])

  function hasOf(d: any): Record<ItemKey, boolean> {
    return { boat: !!d?.items?.boat, trailer: !!d?.items?.trailer, motor: !!d?.items?.motor }
  }

  // ---------- saving: one quiet autosave for everything the buyer types ----------
  function queueSave(patch: { handoff?: Partial<Handoff>; basics?: Partial<Basics>; ids?: Partial<Record<ItemKey, string>> }) {
    const p = pending.current
    pending.current = {
      handoff: patch.handoff ? { ...(p.handoff || {}), ...patch.handoff } : p.handoff,
      basics: patch.basics ? { ...(p.basics || {}), ...patch.basics, descriptions: { ...(p.basics?.descriptions || {}), ...(patch.basics.descriptions || {}) } } : p.basics,
      ids: patch.ids ? { ...(p.ids || {}), ...patch.ids } : p.ids,
    }
    setSaveState('saving')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(flush, 900)
  }

  async function flush() {
    const p = pending.current
    pending.current = {}
    const post = (body: any) =>
      fetch('/api/express/deal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, ...body }) }).then(async (r) => ({
        ok: r.ok,
        d: await r.json().catch(() => ({})),
      }))
    try {
      let ok = true
      if (p.basics) {
        const b: any = {}
        if (p.basics.buyerName !== undefined && p.basics.buyerName.trim()) b.buyerName = p.basics.buyerName
        if (p.basics.sellerName !== undefined && p.basics.sellerName.trim()) b.sellerName = p.basics.sellerName
        if (p.basics.price !== undefined && Number(p.basics.price) > 0) b.price = p.basics.price
        if (p.basics.descriptions && Object.keys(p.basics.descriptions).length) b.descriptions = p.basics.descriptions
        if (Object.keys(b).length) {
          const r = await post({ action: 'basics', ...b })
          ok = ok && r.ok
          if (r.ok && r.d.deal) setDeal((cur: any) => ({ ...cur, ...r.d.deal, progress: cur.progress }))
        }
      }
      if (p.ids && Object.keys(p.ids).length) {
        const r = await post({ action: 'ids', ids: p.ids })
        ok = ok && r.ok
        if (r.ok && r.d.items) setDeal((cur: any) => ({ ...cur, items: r.d.items }))
      }
      if (p.handoff && Object.keys(p.handoff).length) {
        const r = await post({ action: 'handoff', handoff: p.handoff })
        ok = ok && r.ok
        if (r.ok && r.d.progress) setDeal((cur: any) => ({ ...cur, progress: r.d.progress }))
      }
      setSaveState(ok ? 'saved' : 'error')
    } catch {
      setSaveState('error')
    }
  }

  const setHand = (patch: Partial<Handoff>) => {
    setH((cur) => ({ ...cur, ...patch }))
    queueSave({ handoff: patch })
  }
  const setBasic = (patch: Partial<Basics>) => {
    setBasics((cur) => (cur ? { ...cur, ...patch, descriptions: { ...cur.descriptions, ...(patch.descriptions || {}) } } : cur))
    queueSave({ basics: patch })
  }
  const setId = (k: ItemKey, v: string) => {
    const clean = v.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20)
    setIds((cur) => ({ ...cur, [k]: clean }))
    queueSave({ ids: { [k]: clean } })
  }

  function toggle(id: string, v: boolean) {
    setDeal((d: any) => ({ ...d, progress: { ...(d.progress || {}), checks: { ...(d.progress?.checks || {}), [id]: v } } }))
    pendingChecks.current[id] = v
    clearTimeout(checkTimer.current)
    checkTimer.current = setTimeout(async () => {
      const checks = pendingChecks.current
      pendingChecks.current = {}
      try {
        const res = await fetch('/api/express/deal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action: 'checks', checks }) })
        if (!res.ok) setSaveState('error')
      } catch {
        setSaveState('error')
      }
    }, 600)
  }

  function answer(id: string, text: string) {
    setDeal((d: any) => ({ ...d, progress: { ...(d.progress || {}), answers: { ...(d.progress?.answers || {}), [id]: text } } }))
    pendingAnswers.current[id] = text
    clearTimeout(answerTimer.current)
    answerTimer.current = setTimeout(async () => {
      const answers = pendingAnswers.current
      pendingAnswers.current = {}
      try {
        await fetch('/api/express/deal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action: 'answers', answers }) })
      } catch {}
    }, 900)
  }

  async function pay(bundle: boolean) {
    setPaying(bundle ? 'bundle' : 'solo')
    setPayError('')
    try {
      await flush()
      const res = await fetch('/api/express/deal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action: 'pay', bundle }) })
      const d = await res.json()
      if (d.alreadyPaid) return window.location.reload()
      if (!res.ok || !d.url) throw new Error(d.error || 'Could not open checkout.')
      window.location.href = d.url
    } catch (e: any) {
      setPayError(e?.message || 'Could not open checkout.')
      setPaying('')
    }
  }

  function go(n: number) {
    clearTimeout(saveTimer.current)
    flush()
    setStep(n)
    window.scrollTo(0, 0)
  }
  function setMode(on: boolean) {
    setGuided(on)
    try {
      localStorage.setItem('bcx_guided', on ? '1' : '0')
    } catch {}
  }

  if (error && !deal) {
    return (
      <div style={boxStyle}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, margin: 0 }}>This link isn&apos;t working</h1>
        <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>
          Check that you opened the full link from your BoatClosers Express email. If it still won&apos;t open, email support@boatclosers.com.
        </p>
      </div>
    )
  }
  if (!deal || step === null || !basics) return <p style={{ color: muted }}>Loading your purchase...</p>

  const paid = deal.status === 'paid'
  const has = hasOf(deal)
  const keys = (['boat', 'trailer', 'motor'] as ItemKey[]).filter((k) => has[k])
  const checks: Record<string, boolean> = deal.progress?.checks || {}
  const firstName = String(basics.buyerName || deal.buyer_name).split(' ')[0]
  const savedHand: Handoff = deal.progress?.handoff || {}
  const problems = handoffProblems(savedHand, has)
  const ready = paid && problems.length === 0 && savedHand.lien !== 'open'
  const moveHref = `/?fromExpress=${token}`
  const sellerSent = Array.isArray(deal.progress?.sellerEmailed) && deal.progress.sellerEmailed.length > 0
  const priceDollars = Number(basics.price) || 0
  // Which step fixes which missing detail, so "Still needed" can link straight to it.
  const fixStep = (msg: string) =>
    /length|propulsion|titled/i.test(msg) ? 0 : /address|county|second owner/i.test(msg) ? 1 : /date|paying/i.test(msg) ? 2 : /lien/i.test(msg) ? 3 : 0

  const nextButton = (label: string, to: number) => (
    <button type="button" onClick={() => go(to)} style={{ ...goldButton, width: '100%', fontSize: 16, padding: '15px 20px' }}>
      {label}
    </button>
  )

  // ---------- guided questions for the three data steps ----------
  const vesselQs = (): Question[] => {
    const qs: Question[] = []
    for (const k of keys) {
      qs.push({
        id: `desc-${k}`,
        kind: 'text',
        title: k === 'boat' ? 'What boat are you buying?' : k === 'trailer' ? 'What trailer comes with it?' : 'What motor are you buying?',
        help: k === 'boat' ? 'Year, make and model, like the listing.' : k === 'trailer' ? 'Year and make.' : 'Make, horsepower and year.',
        placeholder: k === 'boat' ? '2015 Carolina Skiff 17' : k === 'trailer' ? '2015 Magic Tilt' : 'Yamaha 90 HP 2016',
        value: basics.descriptions[k] || '',
        onChange: (v) => setBasic({ descriptions: { [k]: v } }),
        required: true,
        error: 'Add this to continue.',
      })
      const [, label, hint] = ID_FIELD[k]
      qs.push({
        id: `id-${k}`,
        kind: 'text',
        mono: true,
        title: `Do you have the ${label}?`,
        help: `${hint}. It goes on the bill of sale${k === 'boat' ? ', and we’ll check it against the Coast Guard for free.' : '.'}`,
        value: ids[k] || '',
        onChange: (v) => setId(k, v),
        skipLabel: 'Skip, I’ll add it at the boat',
      })
    }
    if (has.boat) {
      qs.push({
        id: 'len',
        kind: 'text',
        inputMode: 'decimal',
        title: 'How long is the boat, in feet?',
        help: 'Florida requires it on the bill of sale.',
        placeholder: '17',
        value: h.lengthFt || '',
        onChange: (v) => setHand({ lengthFt: v.replace(/[^0-9.' ]/g, '') }),
        required: true,
        error: 'Add the length to continue.',
      })
      qs.push({
        id: 'prop',
        kind: 'choice',
        title: 'How is it powered?',
        options: PROPULSION.map((p) => [p, p] as [string, string]),
        value: h.propulsion,
        onChange: (v) => setHand({ propulsion: v }),
        required: true,
      })
      qs.push({ id: 'hull', kind: 'choice', title: 'What is the hull made of?', options: HULLS.map((p) => [p, p] as [string, string]), value: h.hull, onChange: (v) => setHand({ hull: v }) })
      qs.push({ id: 'fuel', kind: 'choice', title: 'What fuel does it use?', options: FUELS.map((p) => [p, p] as [string, string]), value: h.fuel, onChange: (v) => setHand({ fuel: v }) })
    }
    qs.push({
      id: 'titled',
      kind: 'choice',
      title: has.boat ? 'How is the boat titled?' : 'How is it titled or registered?',
      help: 'Look at the seller’s paperwork or ask them.',
      why: 'It decides which papers you need and where the title goes. A documented boat transfers through the Coast Guard instead of the county.',
      options: TITLED_OPTIONS.map((o) => [o.key, o.label, o.hint] as [string, string, string]),
      value: h.titledHow,
      onChange: (v) => setHand({ titledHow: v as any }),
      required: true,
    })
    if (h.titledHow === 'florida')
      qs.push({ id: 'tnum', kind: 'text', title: 'What is the Florida title number?', help: 'On the front of the title. Optional.', value: h.titleNumber || '', onChange: (v) => setHand({ titleNumber: v }), skipLabel: 'Skip' })
    if (h.titledHow === 'documented')
      qs.push({ id: 'onum', kind: 'text', title: 'What is the Coast Guard official number?', help: 'On the Certificate of Documentation.', value: h.officialNumber || '', onChange: (v) => setHand({ officialNumber: v }), skipLabel: 'Skip' })
    qs.push({
      id: 'review-vessel',
      kind: 'review',
      title: 'Here’s what you’re buying',
      rows: [
        ...keys.flatMap((k) => [
          [ITEM_LABEL[k], basics.descriptions[k] || '', `desc-${k}`] as [string, string, string],
          [ID_FIELD[k][1], ids[k] || 'Add it at the boat', `id-${k}`] as [string, string, string],
        ]),
        ...(has.boat ? ([['Length', h.lengthFt ? `${h.lengthFt} ft` : '', 'len'], ['Power', h.propulsion || '', 'prop']] as [string, string, string][]) : []),
        ['Titled', TITLED_OPTIONS.find((o) => o.key === h.titledHow)?.label || '', 'titled'],
      ],
      finishLabel: 'Continue to the people',
      onFinish: () => go(1),
    })
    return qs
  }

  const partyQs = (): Question[] => {
    const qs: Question[] = [
      { id: 'bname', kind: 'text', title: 'What is your full legal name?', help: 'Exactly as it will go on the title.', value: basics.buyerName, onChange: (v) => setBasic({ buyerName: v }), required: true },
      { id: 'baddr', kind: 'text', title: 'What is your address?', help: 'Street, city, state and ZIP.', value: h.buyerAddress || '', onChange: (v) => setHand({ buyerAddress: v }), required: true },
      { id: 'county', kind: 'text', title: 'Which Florida county are you buying in?', placeholder: 'Palm Beach', value: h.county || '', onChange: (v) => setHand({ county: v }), required: true, chips: ['Palm Beach', 'Broward', 'Miami-Dade', 'Martin', 'Lee', 'Hillsborough'] },
      { id: 'sname', kind: 'text', title: 'What is the seller’s full name?', help: 'As it appears on the title.', value: basics.sellerName, onChange: (v) => setBasic({ sellerName: v }), required: true },
      {
        id: 'two',
        kind: 'choice',
        title: 'How many owners are on the title?',
        why: 'When two owners are listed, both usually have to sign. It’s one of the most common reasons a title gets rejected.',
        options: [
          ['one', 'One owner'],
          ['two', 'Two owners'],
        ],
        value: h.twoSellers ? 'two' : savedHand.titledHow || h.secondSeller !== undefined ? 'one' : undefined,
        onChange: (v) => setHand({ twoSellers: v === 'two' }),
        required: true,
      },
    ]
    if (h.twoSellers) qs.push({ id: 's2', kind: 'text', title: 'What is the second owner’s full name?', value: h.secondSeller || '', onChange: (v) => setHand({ secondSeller: v }), required: true })
    qs.push(
      { id: 'saddr', kind: 'text', title: 'What is the seller’s address?', value: h.sellerAddress || '', onChange: (v) => setHand({ sellerAddress: v }), required: true },
      {
        id: 'semail',
        kind: 'text',
        inputMode: 'email',
        title: 'What is the seller’s email?',
        help: 'So we can send them their copy and their notice of sale. They don’t need an account.',
        value: h.sellerEmail || '',
        onChange: (v) => setHand({ sellerEmail: v.trim() }),
        skipLabel: 'Skip, I’ll give them a printed copy',
      },
      {
        id: 'review-parties',
        kind: 'review',
        title: 'The people on the papers',
        rows: [
          ['You', basics.buyerName, 'bname'],
          ['Your address', h.buyerAddress || '', 'baddr'],
          ['County', h.county || '', 'county'],
          ['Seller', [basics.sellerName, h.twoSellers && h.secondSeller].filter(Boolean).join(' and '), 'sname'],
          ['Seller’s address', h.sellerAddress || '', 'saddr'],
          ['Seller’s email', h.sellerEmail || 'Not added', 'semail'],
        ],
        finishLabel: 'Continue to the price',
        onFinish: () => go(2),
      }
    )
    return qs
  }

  const priceQs = (): Question[] => [
    {
      id: 'price',
      kind: 'money',
      title: 'What price did you agree on?',
      help: keys.length > 1 ? 'One total for everything in the sale.' : 'The final price, after any haggling.',
      value: basics.price,
      onChange: (v) => setBasic({ price: v }),
      required: true,
      valid: () => Number(basics.price) > 0,
      error: 'Add the agreed price.',
    },
    { id: 'date', kind: 'date', title: 'When is the sale?', help: 'The day you pay and sign. Your 30-day title deadline starts here.', value: h.saleDate || '', onChange: (v) => setHand({ saleDate: v }), required: true },
    {
      id: 'pay',
      kind: 'choice',
      title: 'How are you paying?',
      options: PAYMENT_METHODS.map((p) => [p, p] as [string, string]),
      value: h.paymentMethod,
      onChange: (v) => setHand({ paymentMethod: v }),
      required: true,
    },
    {
      id: 'inv',
      kind: 'textarea',
      title: 'What else comes with it?',
      help: 'Electronics, covers, safety gear, spare parts. It goes on the bill of sale, so there’s no argument later.',
      placeholder: 'Garmin fishfinder, bimini top, 4 life jackets, spare prop, 2 keys',
      value: h.inventory || '',
      onChange: (v) => setHand({ inventory: v }),
    },
    {
      id: 'review-price',
      kind: 'review',
      title: 'The deal',
      rows: [
        ['Agreed price', priceDollars ? money(priceDollars * 100) : '', 'price'],
        ['Date of sale', h.saleDate || '', 'date'],
        ['Paying by', h.paymentMethod || '', 'pay'],
        ['Included', h.inventory || 'Nothing extra', 'inv'],
      ],
      note: 'Still haggling? Express is for a price you’ve already agreed. BoatClosers runs offers and counteroffers.',
      finishLabel: 'Continue to the free checks',
      onFinish: () => go(3),
    },
  ]

  // ---------- full-form versions of the same three steps ----------
  const vesselForm = (
    <div style={boxStyle}>
      {keys.map((k) => (
        <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 6 }}>
          <div style={eyebrow}>{ITEM_LABEL[k].toUpperCase()}</div>
          <Field id={`d-${k}`} label={k === 'boat' ? 'Year, make and model' : k === 'trailer' ? 'Year and make' : 'Make, horsepower and year'} value={basics.descriptions[k] || ''} onChange={(v) => setBasic({ descriptions: { [k]: v } })} />
          <Field id={`i-${k}`} label={ID_FIELD[k][1]} hint={ID_FIELD[k][2]} value={ids[k] || ''} onChange={(v) => setId(k, v)} />
        </div>
      ))}
      {has.boat && (
        <>
          <Field id="len" label="Length in feet" hint="required on a Florida bill of sale" value={h.lengthFt || ''} onChange={(v) => setHand({ lengthFt: v.replace(/[^0-9.' ]/g, '') })} />
          <Select id="prop" label="Propulsion" hint="required" value={h.propulsion || ''} options={PROPULSION} onChange={(v) => setHand({ propulsion: v })} />
          <Select id="hull" label="Hull material" value={h.hull || ''} options={HULLS} onChange={(v) => setHand({ hull: v })} />
          <Select id="fuel" label="Fuel" value={h.fuel || ''} options={FUELS} onChange={(v) => setHand({ fuel: v })} />
        </>
      )}
      <Choice label={has.boat ? 'How is the boat titled?' : 'How is it titled or registered?'} value={h.titledHow} options={TITLED_OPTIONS} onChange={(v) => setHand({ titledHow: v })} />
      {h.titledHow === 'florida' && <Field id="tnum" label="Florida title number" hint="optional" value={h.titleNumber || ''} onChange={(v) => setHand({ titleNumber: v })} />}
      {h.titledHow && h.titledHow !== 'documented' && has.boat && (
        <Field id="reg" label="Registration number" hint="optional, the FL 1234 AB on the bow" value={h.registrationNumber || ''} onChange={(v) => setHand({ registrationNumber: v })} />
      )}
      {h.titledHow === 'documented' && <Field id="onum" label="Coast Guard official number" value={h.officialNumber || ''} onChange={(v) => setHand({ officialNumber: v })} />}
    </div>
  )

  const partiesForm = (
    <div style={boxStyle}>
      <div style={eyebrow}>YOU</div>
      <Field id="bn" label="Your full legal name" value={basics.buyerName} onChange={(v) => setBasic({ buyerName: v })} />
      <Field id="ba" label="Your address" hint="street, city, state, ZIP" value={h.buyerAddress || ''} onChange={(v) => setHand({ buyerAddress: v })} />
      <Field id="co" label="Florida county where you’re buying" value={h.county || ''} onChange={(v) => setHand({ county: v })} />
      <div style={{ ...eyebrow, marginTop: 8 }}>THE SELLER</div>
      <Field id="sn" label="Seller’s full name, as on the title" value={basics.sellerName} onChange={(v) => setBasic({ sellerName: v })} />
      <label style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', fontSize: 15 }}>
        <input type="checkbox" checked={!!h.twoSellers} onChange={(e) => setHand({ twoSellers: e.target.checked })} style={{ width: 20, height: 20, accentColor: gold }} />
        There are two owners on the title
      </label>
      {h.twoSellers && <Field id="s2" label="Second owner’s full name" value={h.secondSeller || ''} onChange={(v) => setHand({ secondSeller: v })} />}
      <Field id="sa" label="Seller’s address" value={h.sellerAddress || ''} onChange={(v) => setHand({ sellerAddress: v })} />
      <Field id="se" label="Seller’s email" hint="optional, to send their copy" type="email" value={h.sellerEmail || ''} onChange={(v) => setHand({ sellerEmail: v.trim() })} />
    </div>
  )

  const priceForm = (
    <div style={boxStyle}>
      <Field id="pr" label="Agreed price, in dollars" value={basics.price ? Number(basics.price).toLocaleString('en-US') : ''} onChange={(v) => setBasic({ price: v.replace(/[^0-9]/g, '') })} />
      <Field id="dt" label="Date of sale" type="date" value={h.saleDate || ''} onChange={(v) => setHand({ saleDate: v })} />
      <Select id="pm" label="How you’re paying" value={h.paymentMethod || ''} options={PAYMENT_METHODS} onChange={(v) => setHand({ paymentMethod: v })} />
      <Field id="iv" label="What else comes with it" hint="optional, goes on the bill of sale" textarea value={h.inventory || ''} onChange={(v) => setHand({ inventory: v })} />
    </div>
  )

  const modeSwitch = (
    <div role="group" aria-label="How to fill this in" style={{ display: 'flex', gap: 4, background: 'rgba(245,241,232,0.08)', borderRadius: 10, padding: 4, alignSelf: 'flex-start' }}>
      {[
        [true, 'One question at a time'],
        [false, 'Full form'],
      ].map(([on, label]) => (
        <button
          key={String(on)}
          type="button"
          aria-pressed={guided === on}
          onClick={() => setMode(on as boolean)}
          style={{
            border: 0,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer',
            background: guided === on ? cream : 'transparent',
            color: guided === on ? navy : cream,
          }}
        >
          {label as string}
        </button>
      ))}
    </div>
  )

  // ---------- the $29.99 offer ----------
  const docList = [
    has.boat && 'Florida vessel bill of sale that doubles as your 30-day temporary registration',
    has.trailer && 'Trailer bill of sale',
    has.motor && !has.boat && 'Outboard motor bill of sale',
    (has.boat || has.trailer) && 'Florida form HSMV 82050 filled in, with the seller’s notice of sale',
    'A payment receipt for the seller to sign',
    'A title signing guide for how your boat is titled',
    has.boat && 'Your Florida title application (HSMV 82040 VS), pre-filled',
    'What to bring to the tax collector, with a cost estimate',
    'Email reminders before your 30-day title deadline, plus a calendar reminder',
    'Handoff checklist and photos, saved as a dated record',
    'The seller’s copy emailed to them, with their notice of sale',
    'One closing packet with every paper, kept here for good',
  ].filter(Boolean) as string[]

  const paywall = (
    <div style={{ ...boxStyle, border: `1.5px solid ${gold}`, background: 'rgba(201,150,46,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 22 }}>Your paperwork</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: gold, fontWeight: 700 }}>$29.99</span>
      </div>
      <p style={{ margin: 0, color: muted, fontSize: 14.5, lineHeight: 1.6 }}>One price for everything in this sale. You’ve already entered the details, so your papers fill in the moment you unlock.</p>
      <ul style={{ margin: 0, paddingLeft: 20, color: cream, fontSize: 15, lineHeight: 1.7 }}>
        {docList.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <button type="button" onClick={() => pay(false)} disabled={!!paying} style={{ ...goldButton, fontSize: 16, padding: '15px 20px', opacity: paying ? 0.6 : 1 }}>
        {paying === 'solo' ? 'Opening secure checkout...' : 'Unlock my paperwork · $29.99'}
      </button>
      <div style={{ borderTop: `1px solid ${line}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontWeight: 700 }}>
          Haven’t looked the boat over yet? <span style={{ color: gold }}>Add My Boat Inspector · {BUNDLE_PRICE} total</span>
        </div>
        <div style={{ color: muted, fontSize: 14, lineHeight: 1.55 }}>
          A guided walkthrough of the boat and a sea trial, with a written report, before you hand over money. {MBI_PRICE} on its own. You get a code by email to use at myboatinspector.com. It doesn’t replace a professional marine survey.
        </div>
        <button type="button" onClick={() => pay(true)} disabled={!!paying} style={{ ...outlineButton, opacity: paying ? 0.6 : 1 }}>
          {paying === 'bundle' ? 'Opening secure checkout...' : `Unlock paperwork + My Boat Inspector · ${BUNDLE_PRICE}`}
        </button>
      </div>
      {payError && (
        <p role="alert" style={{ margin: 0, color: gold }}>
          {payError}
        </p>
      )}
      <p style={{ margin: 0, color: muted, fontSize: 13 }}>Need more than paperwork later? Move to BoatClosers and your $29.99 comes off the $249.</p>
    </div>
  )

  const mbiCode: string | undefined = deal.progress?.mbiCode
  const due = savedHand.saleDate ? addDays(savedHand.saleDate, 30) : null
  const icsHref = due
    ? 'data:text/calendar;charset=utf-8,' +
      encodeURIComponent(
        [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//BoatClosers//Express//EN',
          'BEGIN:VEVENT',
          `UID:express-${token.slice(0, 12)}@boatclosers.com`,
          `DTSTART;VALUE=DATE:${new Date(due.getTime() - 5 * 86400000).toISOString().slice(0, 10).replace(/-/g, '')}`,
          `SUMMARY:Title and register ${(basics.descriptions.boat || basics.descriptions.trailer || basics.descriptions.motor || 'your purchase').replace(/[,;]/g, ' ')}`,
          `DESCRIPTION:Florida deadline is ${due.toDateString()}. Your papers: https://www.boatclosers.com/express/deal/${token}`,
          'BEGIN:VALARM',
          'TRIGGER:-PT9H',
          'ACTION:DISPLAY',
          'DESCRIPTION:Title deadline coming up',
          'END:VALARM',
          'END:VEVENT',
          'END:VCALENDAR',
        ].join('\r\n')
      )
    : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header: who, what it costs, and how far along */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ color: gold, fontWeight: 700, fontSize: 14 }}>{paid ? 'Paperwork unlocked' : `Welcome aboard, ${firstName}`}</span>
          <span style={{ fontSize: 12.5, color: muted, border: `1px solid ${line}`, borderRadius: 999, padding: '4px 12px' }}>
            {paid ? 'Paid · $29.99' : 'Free to check · $29.99 for your paperwork'}
          </span>
        </div>
        {justPaid && paid && (
          <div style={{ ...boxStyle, padding: '12px 16px', border: `1px solid ${gold}` }}>
            Payment received. Your papers are ready{problems.length ? ' as soon as the last details are in' : ''}.{mbiCode ? ' Your My Boat Inspector code is below.' : ''}
          </div>
        )}
      </div>

      <nav aria-label="Purchase steps" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, margin: '0 -4px' }}>
        {STEPS.map((s, i) => {
          const on = step === i
          const tag = i === 4 ? (paid ? 'Unlocked' : '$29.99') : i === 5 ? (paid ? '' : 'Included') : 'Free'
          return (
            <button
              key={s.title}
              type="button"
              aria-current={on ? 'step' : undefined}
              onClick={() => go(i)}
              style={{
                flex: '1 0 auto',
                minWidth: 92,
                textAlign: 'left',
                border: `1.5px solid ${on ? gold : 'rgba(245,241,232,0.18)'}`,
                background: on ? 'rgba(201,150,46,0.14)' : 'transparent',
                color: cream,
                borderRadius: 10,
                padding: '8px 10px',
                cursor: 'pointer',
                margin: '0 2px',
              }}
            >
              <div style={{ fontSize: 11, color: on ? gold : muted, fontWeight: 700 }}>{i + 1}</div>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{s.title}</div>
              {tag && <div style={{ fontSize: 10.5, letterSpacing: 0.8, fontWeight: 700, color: i === 4 && !paid ? gold : muted, textTransform: 'uppercase' }}>{tag}</div>}
            </button>
          )
        })}
      </nav>

      {saveState === 'error' && (
        <p role="alert" style={{ margin: 0, color: gold, fontSize: 14 }}>
          Your last change didn’t save. Check your connection; it will try again when you keep going.
        </p>
      )}

      {/* ---------- 1 Vessel ---------- */}
      {step === 0 && (
        <>
          {modeSwitch}
          {guided ? (
            <ExpressGuided label="Step 1 · The vessel" questions={vesselQs()} onShowForm={() => setMode(false)} />
          ) : (
            <>
              {sectionTitle('What you’re buying')}
              {vesselForm}
              {nextButton('Continue to the people', 1)}
            </>
          )}
          {has.boat && deal.items?.boat?.hin && <HinCard token={token} boat={deal.items.boat} onSaved={(items) => setDeal({ ...deal, items })} />}
        </>
      )}

      {/* ---------- 2 Parties ---------- */}
      {step === 1 && (
        <>
          {modeSwitch}
          {guided ? (
            <ExpressGuided label="Step 2 · The people" questions={partyQs()} onShowForm={() => setMode(false)} />
          ) : (
            <>
              {sectionTitle('You and the seller')}
              {partiesForm}
              {nextButton('Continue to the price', 2)}
            </>
          )}
          <p style={{ margin: 0, color: muted, fontSize: 13.5, lineHeight: 1.6 }}>The seller never needs an account. They sign the papers in person at the handoff.</p>
        </>
      )}

      {/* ---------- 3 Price ---------- */}
      {step === 2 && (
        <>
          {modeSwitch}
          {guided ? (
            <ExpressGuided label="Step 3 · The price" questions={priceQs()} onShowForm={() => setMode(false)} />
          ) : (
            <>
              {sectionTitle('The agreed price')}
              {priceForm}
              {nextButton('Continue to the free checks', 3)}
            </>
          )}
        </>
      )}

      {/* ---------- 4 Check (free) ---------- */}
      {step === 3 && (
        <>
          {sectionTitle('Check it before you pay')}
          <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>All free. Two minutes here can save you a wasted trip or a boat you can’t title.</p>
          {has.boat && <HinCard token={token} boat={deal.items.boat} onSaved={(items) => setDeal({ ...deal, items })} />}
          <div style={boxStyle}>
            <LienCheck sellerName={deal.seller_name} inExpress saved={checks} onToggle={toggle} />
            <Choice label="What did you find on the title?" value={h.lien} options={LIEN_OPTIONS} onChange={(v) => setHand({ lien: v })} />
            {h.lien === 'open' && (
              <p style={{ margin: 0, color: gold, lineHeight: 1.6, fontSize: 15 }}>
                Don’t hand over money yet. Until the lender releases the lien, it has a claim on the boat even after you pay. The seller pays it off first, you pay the lender directly with a payoff letter, or{' '}
                <a href={moveHref} style={{ color: gold }}>
                  move to BoatClosers
                </a>{' '}
                so a neutral party holds the money until the lien clears.
              </p>
            )}
          </div>
          <SellerQuestions
            token={token}
            onSent={(progress) => setDeal((d: any) => ({ ...d, progress }))}
            deal={deal}
            items={forItems(SELLER_QUESTIONS, has)}
            checks={checks}
            answers={deal.progress?.answers || {}}
            onToggle={toggle}
            onAnswer={answer}
          />
          <ProductCard
            label="LOOK IT OVER PROPERLY"
            name="My Boat Inspector"
            price={MBI_PRICE}
            text="A guided walkthrough of the hull, engines, systems and a sea trial, with a written report to negotiate with or decide on a survey. Its own product, separate from Express. It doesn’t replace a professional marine survey."
            href="https://myboatinspector.com"
            cta="See My Boat Inspector"
            external
          />
          <FullSuggest deal={deal} checks={checks} onToggle={toggle} moveHref={moveHref} />
          <div style={boxStyle}>
            <div style={eyebrow}>PAYING SAFELY</div>
            <h2 style={h2}>How not to get scammed</h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: cream, fontSize: 15, lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PAYMENT_TIPS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          {nextButton(paid ? 'Continue to your papers' : 'Continue to your paperwork', 4)}
        </>
      )}

      {/* ---------- 5 Documents ($29.99) ---------- */}
      {step === 4 && (
        <>
          {sectionTitle(paid ? 'Your papers' : 'Unlock your paperwork')}
          {!paid && paywall}
          {paid && problems.length > 0 && (
            <div style={{ ...boxStyle, border: `1px solid ${gold}` }}>
              <div style={eyebrow}>A FEW DETAILS LEFT</div>
              <h2 style={h2}>Your papers fill in as soon as these are done</h2>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {problems.map((p) => (
                  <li key={p} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>{p}</span>
                    <button type="button" onClick={() => go(fixStep(p))} style={{ ...outlineButton, padding: '7px 12px', fontSize: 13 }}>
                      Fix in {STEPS[fixStep(p)].title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {paid && savedHand.lien === 'open' && problems.length === 0 && (
            <div style={{ ...boxStyle, border: `1px solid ${gold}` }}>
              <h2 style={h2}>There’s an open lien on the title</h2>
              <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>Your papers unlock once you have the signed lien release. Change your answer in the Check step when you do.</p>
            </div>
          )}
          {ready && (
            <>
              <div style={boxStyle}>
                <div style={eyebrow}>SIGN THESE AT THE HANDOFF</div>
                <DocRow token={token} doc="closing-packet" name="Everything in one file" note="Every paper in the order you’ll use them. Easiest to print." primary />
                {(
                  [
                    has.boat && ['vessel-bill-of-sale', 'Vessel bill of sale', 'Both of you sign. Keep it aboard: it’s your temporary registration for 30 days.'],
                    has.motor && !has.boat && ['motor-bill-of-sale', 'Motor bill of sale', 'Both of you sign.'],
                    has.trailer && ['trailer-bill-of-sale', 'Trailer bill of sale', 'Both of you sign. The trailer is titled separately.'],
                    has.boat && ['hsmv-82050-boat', 'Florida form HSMV 82050, boat', 'The state’s own bill of sale. Page 2 is the seller’s notice of sale.'],
                    has.trailer && ['hsmv-82050-trailer', 'Florida form HSMV 82050, trailer', 'Page 2 is the seller’s notice of sale.'],
                    ['payment-receipt', 'Payment receipt', 'The seller signs this when you pay.'],
                    ['closing-summary', 'Closing summary', 'One page with every number from the sale.'],
                  ].filter(Boolean) as [string, string, string][]
                ).map(([k, n, note]) => (
                  <DocRow key={k} token={token} doc={k} name={n} note={note} />
                ))}
                {savedHand.titledHow === 'other-no-title' && (
                  <p style={{ margin: 0, color: gold, fontSize: 14, lineHeight: 1.6 }}>The boat comes from a state that doesn’t title boats, so the seller signs the bill of sale in front of a notary. The notary section is on the last page.</p>
                )}
                {savedHand.titledHow === 'documented' && (
                  <p style={{ margin: 0, color: gold, fontSize: 14, lineHeight: 1.6 }}>
                    Documented boat: the seller also signs the Coast Guard bill of sale,{' '}
                    <a href="https://www.dco.uscg.mil/nvdc/" target="_blank" rel="noopener noreferrer" style={{ color: gold }}>
                      form CG-1340
                    </a>
                    .
                  </p>
                )}
              </div>
              <Checklist label="TITLE SIGNING GUIDE" title="Check each of these before you hand over payment" items={titleSigningGuide(savedHand)} checks={checks} onToggle={toggle} />
              {nextButton('Continue to the handoff and title', 5)}
            </>
          )}
          {mbiCode && (
            <div style={{ ...boxStyle, border: `1px solid ${gold}` }}>
              <div style={eyebrow}>YOUR MY BOAT INSPECTOR CODE</div>
              <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 24, letterSpacing: 2, color: cream }}>{mbiCode}</div>
              <p style={{ margin: 0, color: muted, fontSize: 14, lineHeight: 1.6 }}>
                {deal.progress?.mbiCodeUsed ? 'Used. Your walkthrough is unlocked at myboatinspector.com.' : 'Enter it when you unlock your walkthrough. Works once.'}
              </p>
              <a href="https://myboatinspector.com" target="_blank" rel="noopener" style={{ ...outlineButton, textAlign: 'center', textDecoration: 'none' }}>
                Open My Boat Inspector
              </a>
            </div>
          )}
        </>
      )}

      {/* ---------- 6 Closing ---------- */}
      {step === 5 && (
        <>
          {sectionTitle('The handoff and your title')}
          <Checklist label="BRING TO THE HANDOFF" title="Have these with you when you meet the seller" items={forItems(BRING_TO_HANDOFF, has)} checks={checks} onToggle={toggle} />
          {paid ? (
            <>
              <Checklist label="AT THE HANDOFF" title="Make sure all of this changes hands" items={forItems(HANDOFF_CHECKS, has)} checks={checks} onToggle={toggle} />
              <PhotosCard token={token} photos={deal.progress?.photos || []} has={has} onSaved={(progress) => setDeal((d: any) => ({ ...d, progress: { ...(d.progress || {}), photos: progress.photos } }))} />
              <div style={boxStyle}>
                <DocRow token={token} doc="handoff-record" name="Handoff record" note="Your ticks above and your dated photos, in one file. Keep it with the bill of sale." />
              </div>
              {ready && <SellerCopy token={token} deal={deal} saved={savedHand} onSaved={(progress) => setDeal({ ...deal, progress })} />}
              {ready ? (
                <>
                  <div style={{ ...boxStyle, border: `1px solid ${gold}`, background: 'rgba(201,150,46,0.08)' }}>
                    <div style={eyebrow}>YOUR DEADLINE</div>
                    <h2 style={{ ...h2, fontSize: 24 }}>Title and register by {due ? due.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '30 days after the sale'}</h2>
                    <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>
                      Any Florida county tax collector can do it. After 30 days Florida charges a late penalty, and your bill of sale stops working as temporary registration. We’ll email you before it’s due.
                    </p>
                    {icsHref && (
                      <a href={icsHref} download="title-deadline.ics" style={{ ...outlineButton, textAlign: 'center', textDecoration: 'none' }}>
                        Add a reminder to my calendar
                      </a>
                    )}
                  </div>
                  <TitleSection token={token} deal={deal} h={savedHand} has={has} />
                </>
              ) : (
                <div style={boxStyle}>
                  <h2 style={h2}>Your title papers come next</h2>
                  <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>Finish the details in the Documents step and your title application, deadline and cost estimate appear here.</p>
                  <button type="button" onClick={() => go(4)} style={{ ...outlineButton, alignSelf: 'flex-start' }}>
                    Go to Documents
                  </button>
                </div>
              )}
              <Checklist label="NEW OWNER CHECKLIST" title="Get on the water the right way" items={forItems(NEW_OWNER, has)} checks={checks} onToggle={toggle} />
              <ProductCard
                label="AFTER IT’S YOURS"
                name="My Boat Logs"
                price="$39.99/yr"
                text="Keep this boat’s maintenance, receipts, documents and reminders in one place, and hand a full history to the next buyer when you sell. Free for 14 days."
                href="https://myboatlogs.com"
                cta="Start a 14-day free trial"
                external
              />
            </>
          ) : (
            <>
              <div style={boxStyle}>
                <div style={eyebrow}>INCLUDED WITH YOUR PAPERWORK</div>
                <h2 style={h2}>Handoff checklist, seller’s copy, and your title</h2>
                <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>
                  After you unlock: a checklist and dated photos of the handoff, the seller’s copy emailed to them, your pre-filled title application, what to bring to the tax collector, a cost estimate, and reminders before your 30-day deadline.
                </p>
                <button type="button" onClick={() => go(4)} style={{ ...goldButton, alignSelf: 'flex-start' }}>
                  Unlock my paperwork · $29.99
                </button>
              </div>
            </>
          )}
          {contact && <ContactPrefs token={token} contact={contact} onSaved={setContact} />}
        </>
      )}

      <CompareProducts token={token} paid={paid} />

      <div style={{ ...boxStyle, gap: 6 }}>
        <div style={eyebrow}>YOUR PURCHASE</div>
        {keys.map((k) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 15 }}>
            <span style={{ color: muted }}>{ITEM_LABEL[k]}</span>
            <span style={{ fontWeight: 600, textAlign: 'right' }}>{basics.descriptions[k]}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
          <span style={{ color: muted }}>Agreed price</span>
          <span style={{ fontWeight: 700 }}>{priceDollars ? money(priceDollars * 100) : '—'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
          <span style={{ color: muted }}>Seller</span>
          <span style={{ fontWeight: 600 }}>{basics.sellerName}</span>
        </div>
        {sellerSent && <p style={{ margin: '4px 0 0', color: muted, fontSize: 13 }}>The seller has their papers, so these details are locked.</p>}
      </div>
    </div>
  )
}

// ---------- closing pieces ----------

function SellerCopy({ token, deal, saved, onSaved }: { token: string; deal: any; saved: Handoff; onSaved: (p: any) => void }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const sentCount = Array.isArray(deal.progress?.sellerEmailed) ? deal.progress.sellerEmailed.length : 0
  const smsBody = encodeURIComponent(
    `Hi ${String(deal.seller_name).split(' ')[0]}, thanks again. One thing for you: within 30 days, fill out the notice of sale on the back of the title or form HSMV 82050 and file it with the tax collector, so the boat's out of your name.`
  )
  async function send() {
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/api/express/deal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action: 'email-seller' }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Could not send.')
      onSaved(d.progress)
      setMsg(`Sent to ${saved.sellerEmail}.`)
    } catch (e: any) {
      setMsg(e?.message || 'Could not send.')
    }
    setBusy(false)
  }
  return (
    <div style={boxStyle}>
      <div style={eyebrow}>THE SELLER’S COPY</div>
      <h2 style={h2}>Send the seller their papers</h2>
      <p style={{ margin: 0, color: muted, fontSize: 14, lineHeight: 1.6 }}>Their copies plus their notice of sale on the state form, filled in, so all they do is sign and file it. No account needed.</p>
      {saved.sellerEmail ? (
        <button type="button" onClick={send} disabled={busy || sentCount >= 3} style={{ ...goldButton, opacity: busy || sentCount >= 3 ? 0.6 : 1 }}>
          {busy ? 'Sending...' : sentCount ? 'Send again' : 'Email the seller their papers'}
        </button>
      ) : (
        <p style={{ margin: 0, fontSize: 14 }}>Add the seller’s email in the Parties step to send it.</p>
      )}
      {msg && <p style={{ margin: 0, color: gold, fontSize: 14 }}>{msg}</p>}
      <a href={`sms:?&body=${smsBody}`} style={{ color: muted, fontSize: 13 }}>
        Or text the reminder from your own phone
      </a>
    </div>
  )
}

function TitleSection({ token, deal, h, has }: { token: string; deal: any; h: Handoff; has: Record<ItemKey, boolean> }) {
  const tax = salesTaxEstimate(deal.price_cents)
  const bring = whatToBring(h, has)
  return (
    <>
      <div style={boxStyle}>
        <div style={eyebrow}>AT THE TAX COLLECTOR</div>
        <h2 style={h2}>Take all of this with you</h2>
        <ul style={{ margin: 0, paddingLeft: 20, color: cream, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bring.map((b) => (
            <li key={b.label}>
              {b.href ? (
                <a href={b.href} target="_blank" rel="noopener noreferrer" style={{ color: cream }}>
                  {b.label}
                </a>
              ) : (
                b.label
              )}
              {b.detail && <div style={{ color: muted, fontSize: 14 }}>{b.detail}</div>}
            </li>
          ))}
        </ul>
        {has.boat && h.titledHow !== 'documented' && (
          <DocRow
            token={token}
            doc="hsmv-82040-vs"
            name="Title application, HSMV 82040 VS"
            note="Florida’s official form, pre-filled. Add your driver license number, date of birth and county, then sign."
            primary
          />
        )}
        <DocRow token={token} doc="title-worksheet" name="Title worksheet" note="Every value from your sale, plus this list to check off at the counter." />
      </div>
      <div style={boxStyle}>
        <div style={eyebrow}>WHAT IT WILL COST</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
          <span>Florida sales tax (6%)</span>
          <b>about {money(Math.round(tax.state * 100))}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
          <span>County surtax, first $5,000 only</span>
          <b>up to {money(Math.round(tax.surtaxMax * 100))}</b>
        </div>
        <p style={{ margin: 0, color: muted, fontSize: 13, lineHeight: 1.5 }}>Plus title and registration fees. In a private sale you pay the sales tax when you title the boat. The tax collector works out the exact amount.</p>
      </div>
    </>
  )
}
