'use client'

// My Boat Closing (formerly My Boat Closing): the buyer's purchase page. It follows the same six steps
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
  newOwnerFor,
  titledOptions,
  titleSigningGuide,
  whatToBring,
  salesTaxEstimate,
  addDays,
  handoffProblems,
  DEPOSIT_METHODS,
  DEPOSIT_IF_OUT,
  depositMissing,
  DEPOSIT_SECURE_DOLLARS,
  BIG_PRICE_CENTS,
  MBI_URL,
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
  goldText,
} from './parts'
import HinCard from './HinCard'
import DocViewer from './DocViewer'
import ExpressHelper, { type Next } from './ExpressHelper'
import ExpressGuided, { type Question } from './ExpressGuided'
import { WalkAround, TitleCheckCard, DepositCard, PrintHelp } from './ExtraCards'
import { STATE_NAMES, stateInfo, STATES_CHECKED } from '@/lib/express/states'

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
  return <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(26px, 6vw, 32px)', lineHeight: 1.2, margin: 0 }}>{text}</h1>
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
        background: highlight ? 'rgba(201,150,46,0.08)' : 'rgba(19,35,58,0.041)',
        borderRadius: 10,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={eyebrow}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 19, fontWeight: 700 }}>{name}</span>
        <span style={{ color: goldText, fontWeight: 700, whiteSpace: 'nowrap' }}>{price}</span>
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
    ['', 'My Boat Closing', 'My Boat Inspector', 'BoatClosers', 'My Boat Logs'],
    ['Price', '$29.99', MBI_PRICE, paid ? '$219.01 after credit' : '$249', '$39.99/yr'],
    ['Free HIN and lien check', '✓', '', '✓', ''],
    ['Bill of sale and Florida forms', '✓', '', '✓', ''],
    ['Title application and reminders', '✓', '', '✓', ''],
    ['Guided inspection, sea trial and report', '', '✓', '', ''],
    ['Offers and negotiation', '', '', '✓', ''],
    ['Deposit receipt', '✓', '', '✓', ''],
    ['Deposit held by a neutral party', '', '', '✓', ''],
    ['Survey and sea trial conditions', '', '', '✓', ''],
    ['Seller joins and signs online', '', '', '✓', ''],
    ['Maintenance log and records', '', '', '', '✓'],
  ]
  return (
    <details style={{ ...boxStyle, gap: 12 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 700, color: goldText, listStyle: 'none' }}>Compare all four products ▾</summary>
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
                      color: i === 0 ? goldText : j === 1 && i ? cream : c === '✓' ? cream : muted,
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
      <a href={`/?fromExpress=${token}`} style={{ color: goldText, fontSize: 14 }}>
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
  const [previewOpen, setPreviewOpen] = useState(false)
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
          if (dl.status === 'paid') return back ? 4 : handoffProblems(hand, hasOf(dl), dl.state || 'FL').length ? 4 : 5
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
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, margin: 0 }}>This link isn&apos;t working</h1>
        <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>
          Check that you opened the full link from your My Boat Closing email. If it still won&apos;t open, email support@boatclosers.com.
        </p>
      </div>
    )
  }
  if (!deal || step === null || !basics) return <p style={{ color: muted }}>Loading your purchase...</p>

  const paid = deal.status === 'paid'
  const stateCode: string = deal.state || 'FL'
  const fl = stateCode === 'FL'
  const st = stateInfo(stateCode)
  const stateName = STATE_NAMES[stateCode] || 'Florida'
  const titled = titledOptions(stateName, fl ? true : st?.titles ?? true)
  const has = hasOf(deal)
  const keys = (['boat', 'trailer', 'motor'] as ItemKey[]).filter((k) => has[k])
  const checks: Record<string, boolean> = deal.progress?.checks || {}
  const firstName = String(basics.buyerName || deal.buyer_name).split(' ')[0]
  const savedHand: Handoff = deal.progress?.handoff || {}
  const problems = handoffProblems(savedHand, has, stateCode)
  const ready = paid && problems.length === 0 && savedHand.lien !== 'open'
  const moveHref = `/?fromExpress=${token}`
  const sellerSent = Array.isArray(deal.progress?.sellerEmailed) && deal.progress.sellerEmailed.length > 0
  const priceDollars = Number(basics.price) || 0
  // Which step fixes which missing detail, so "Still needed" can link straight to it.
  const mbiCodeEarly: string | undefined = deal.progress?.mbiCode
  const fixStep = (msg: string) =>
    /length|propulsion|titled/i.test(msg) ? 0 : /address|county|second owner/i.test(msg) ? 1 : /date|paying/i.test(msg) ? 2 : /lien/i.test(msg) ? 3 : 0

  // ---------- the helper: the one next thing to do, worked out from the purchase ----------
  const nextUp = (): Next | null => {
    const sh = savedHand
    const dOn = sh.deposit === 'given' || sh.deposit === 'planned'
    const walkItemsDone = Object.values(deal.progress?.walk?.items || {}).filter((x: any) => x?.s)
    const flagged = walkItemsDone.filter((x: any) => x.s === 'flag').length
    const today = new Date().toISOString().slice(0, 10)
    const flaggedTip = flagged
      ? { text: `You flagged ${flagged} thing${flagged > 1 ? 's' : ''} on the walk-around. Want to dive deeper before you pay?`, href: MBI_URL, label: 'Use My Boat Inspector' }
      : undefined
    const deeperTip = mbiCodeEarly ? undefined : flaggedTip || { text: 'Want to dive deeper than a quick look? A guided walkthrough, sea trial and written report.', href: MBI_URL, label: 'My Boat Inspector' }
    const secureTip =
      Number(deal.price_cents) > BIG_PRICE_CENTS
        ? { text: 'Over $50,000, use BoatClosers: a signed agreement and a neutral party holding the money.', href: moveHref, label: 'Move to BoatClosers' }
        : dOn && Number(sh.depositAmount) > DEPOSIT_SECURE_DOLLARS
          ? { text: 'Over $1,000, have a neutral party hold the deposit.', href: moveHref, label: 'BoatClosers secures it' }
          : undefined
    const tipMbi = secureTip || deeperTip
    if (keys.some((k) => !String(basics.descriptions[k] || '').trim()) || !sh.titledHow) return { text: 'Tell us what you’re buying. About a minute.', to: 0, cta: 'Go to the boat' }
    if (!String(basics.sellerName || '').trim() || !sh.buyerAddress || !sh.sellerAddress) return { text: 'Add you and the seller, the way the names go on the title.', to: 1, cta: 'Go to the people' }
    if (!(Number(deal.price_cents) > 0)) return { text: 'Add the price you agreed on.', to: 2, cta: 'Go to the price' }
    if (dOn && sh.depositIfBuyerOut === 'inspection' && !mbiCodeEarly && !depositMissing(sh).length && !paid && !walkItemsDone.length)
      return { text: `Your deposit depends on an inspection. Get it done before ${sh.closeBy || 'your close-by date'}.`, to: 3, cta: 'Go to the checks', tip: { text: 'A dated, written report is the cleanest proof if the boat doesn’t check out.', href: MBI_URL, label: 'Inspect with My Boat Inspector' } }
    if (!sh.deposit) return { text: 'Handing over a deposit? Tell us first and get a free receipt you both sign.', to: 2, cta: 'Go to the price' }
    if (dOn && depositMissing(sh).length) return { text: `Finish your free deposit receipt: add ${depositMissing(sh)[0]}.`, to: 2, cta: 'Finish it', tip: secureTip }
    if (!sh.paymentMethod) return { text: 'Pick how you’ll pay the seller.', to: 2, cta: 'Go to the price', tip: secureTip }
    if (!paid) {
      if (!walkItemsDone.length) return { text: 'At the boat? Do the free walk-around: a dozen quick checks, saved with your notes.', to: 3, cta: 'Start the checks', tip: tipMbi }
      if (!sh.lien) return { text: 'Check the title for a lender’s name before you pay. It’s free.', to: 3, cta: 'Check for a lien', tip: tipMbi }
      return { text: 'Your bill of sale is filled in. Unlock your paperwork for $29.99 and print it.', to: 4, cta: 'See my papers', tip: tipMbi }
    }
    if (problems.length) return { text: problems[0], to: fixStep(problems[0]), cta: `Fix in ${STEPS[fixStep(problems[0])].title}` }
    if (sh.lien === 'open') return { text: 'Get the signed lien release before you pay. Then change your lien answer.', to: 3, cta: 'Update the lien' }
    if (!deal.progress?.titleCheck) return { text: 'Photograph the seller’s title before you hand over the money. It takes a minute.', to: 3, cta: 'Check the title', tip: tipMbi }
    if (!sh.saleDate || sh.saleDate >= today)
      return { text: 'Print two copies of your papers before you meet. Both of you sign them at the handoff.', to: 4, cta: 'Print my papers', tip: { text: 'No printer? UPS Store, FedEx Office or Staples print from your phone in minutes.', href: 'https://www.google.com/maps/search/print+shop+near+me', label: 'Find one near me' } }
    return {
      text: `Title and register it${due ? ` by ${due.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : ''}.`,
      to: 5,
      cta: 'See what to bring',
      tip: { text: 'Keep the maintenance, receipts and reminders in one place.', href: 'https://myboatlogs.com', label: 'Try My Boat Logs free for 14 days' },
    }
  }

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
        help: fl ? 'Florida requires it on the bill of sale.' : 'It goes on the bill of sale.',
        placeholder: '17',
        value: h.lengthFt || '',
        onChange: (v) => setHand({ lengthFt: v.replace(/[^0-9.' ]/g, '') }),
        required: fl,
        skipLabel: fl ? undefined : 'Skip',
        error: 'Add the length to continue.',
      })
      qs.push({
        id: 'prop',
        kind: 'choice',
        title: 'How is it powered?',
        options: PROPULSION.map((p) => [p, p] as [string, string]),
        value: h.propulsion,
        onChange: (v) => setHand({ propulsion: v }),
        required: fl,
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
      options: titled.map((o) => [o.key, o.label, o.hint] as [string, string, string]),
      value: h.titledHow,
      onChange: (v) => setHand({ titledHow: v as any }),
      required: true,
    })
    if (h.titledHow === 'florida')
      qs.push({ id: 'tnum', kind: 'text', title: `What is the ${stateName} title number?`, help: 'On the front of the title. Optional.', value: h.titleNumber || '', onChange: (v) => setHand({ titleNumber: v }), skipLabel: 'Skip' })
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
        ['Titled', titled.find((o) => o.key === h.titledHow)?.label || '', 'titled'],
      ],
      note: 'Want to dive deeper on the boat itself? My Boat Inspector walks you through the hull, engine, systems and a sea trial, with a written report. myboatinspector.com',
      finishLabel: 'Continue to the people',
      onFinish: () => go(1),
    })
    return qs
  }

  const partyQs = (): Question[] => {
    const qs: Question[] = [
      { id: 'bname', kind: 'text', title: 'What is your full legal name?', help: 'Exactly as it will go on the title.', value: basics.buyerName, onChange: (v) => setBasic({ buyerName: v }), required: true },
      { id: 'baddr', kind: 'text', title: 'What is your address?', help: 'Street, city, state and ZIP.', value: h.buyerAddress || '', onChange: (v) => setHand({ buyerAddress: v }), required: true },
      fl
        ? { id: 'county', kind: 'text', title: 'Which Florida county are you buying in?', placeholder: 'Palm Beach', value: h.county || '', onChange: (v) => setHand({ county: v }), required: true, chips: ['Palm Beach', 'Broward', 'Miami-Dade', 'Martin', 'Lee', 'Hillsborough'] }
        : { id: 'county', kind: 'text', title: `Which ${stateName} county is the sale in?`, help: 'It goes on the bill of sale. Optional.', value: h.county || '', onChange: (v) => setHand({ county: v }), skipLabel: 'Skip' },
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

  const depOn = h.deposit === 'given' || h.deposit === 'planned'
  const depBig = depOn && Number(h.depositAmount) > DEPOSIT_SECURE_DOLLARS
  const bigPrice = priceDollars * 100 > BIG_PRICE_CENTS
  const depWarn = depBig ? (
    <div style={{ fontSize: 14, lineHeight: 1.5, color: '#8a6224', background: '#fbf3e4', borderRadius: 10, padding: '10px 12px' }}>
      Over $1,000, we recommend a neutral party hold the deposit instead of the seller. <a href={moveHref} style={{ color: '#8a6224', fontWeight: 600 }}>BoatClosers does that</a>, with a signed agreement on when it’s returned. Everything you’ve entered moves over, and any $29.99 you paid comes off.
    </div>
  ) : undefined
  const bigNote = bigPrice ? (
    <div style={{ ...boxStyle, border: `1px solid ${gold}`, background: 'rgba(201,150,46,0.08)', gap: 8 }}>
      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 19 }}>Over $50,000? Use BoatClosers for this one</div>
      <p style={{ margin: 0, color: muted, fontSize: 14.5, lineHeight: 1.6 }}>
        At {money(priceDollars * 100)}, you want a signed purchase agreement, a neutral party holding the money, and the right to walk away if the survey finds problems. My Boat Closing is built for smaller, simpler sales. BoatClosers is $249, and everything you’ve entered moves over.
      </p>
      <a href={moveHref} style={{ ...goldButton, alignSelf: 'flex-start', textDecoration: 'none' }}>
        Move this purchase to BoatClosers
      </a>
    </div>
  ) : null
  const depositQs = (): Question[] =>
    !depOn
      ? []
      : [
          {
            id: 'damt',
            kind: 'money',
            title: 'How much is the deposit?',
            help: 'A few hundred dollars is common on smaller boats. It comes off the price at the handoff.',
            value: h.depositAmount || '',
            onChange: (v) => setHand({ depositAmount: v }),
            required: true,
            valid: () => Number(h.depositAmount) > 0 && (!priceDollars || Number(h.depositAmount) < priceDollars),
            error: 'Add the deposit, less than the price.',
            extra: depWarn,
          },
          {
            id: 'dmeth',
            kind: 'choice',
            title: h.deposit === 'given' ? 'How did you pay it?' : 'How will you pay it?',
            options: DEPOSIT_METHODS.map((m) => [m, m] as [string, string]),
            value: h.depositMethod,
            onChange: (v) => setHand({ depositMethod: v }),
            required: true,
          },
          {
            id: 'ddate',
            kind: 'date',
            title: h.deposit === 'given' ? 'When did you pay it?' : 'When will you pay it?',
            value: h.depositDate || '',
            onChange: (v) => setHand({ depositDate: v }),
            required: true,
          },
          {
            id: 'closeby',
            kind: 'date',
            title: 'When will you pay the rest and take the boat?',
            help: 'The seller holds the boat for you until this day. It’s your sale date too.',
            value: h.closeBy || '',
            onChange: (v) => setHand({ closeBy: v, saleDate: v }),
            required: true,
          },
          {
            id: 'dout',
            kind: 'choice',
            title: 'If you change your mind, what happens to the deposit?',
            why: 'If the seller backs out, or the title, lien or HIN doesn’t check out, you get the whole deposit back no matter what you pick here. This is only for when you decide not to buy.',
            options: DEPOSIT_IF_OUT.map(([k, l, sub]) => [k, l, sub] as [string, string, string]),
            value: h.depositIfBuyerOut,
            onChange: (v) => setHand({ depositIfBuyerOut: v as any }),
            required: true,
          },
        ]

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
    {
      id: 'dep',
      kind: 'choice',
      title: 'Did you put down a deposit to hold the boat?',
      help: 'Zelle, cash, a check: any money before the sale. We’ll make a free deposit receipt you both sign.',
      why: 'A deposit on a handshake is where most arguments start. A one-page receipt says how much, when the sale happens, and who gets the money back if it doesn’t.',
      options: [
        ['given', 'Yes, I already paid one'],
        ['planned', 'I’m about to'],
        ['none', 'No deposit'],
      ],
      value: h.deposit,
      onChange: (v) => setHand({ deposit: v as any }),
      required: true,
    },
    ...depositQs(),
    ...(depOn
      ? []
      : ([{ id: 'date', kind: 'date', title: 'When is the sale?', help: 'The day you pay and sign. Your 30-day title deadline starts here.', value: h.saleDate || '', onChange: (v: string) => setHand({ saleDate: v }), required: true }] as Question[])),
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
        ...(depOn
          ? ([
              ['Deposit', h.depositAmount ? `${money(Number(h.depositAmount) * 100)} by ${h.depositMethod || '…'}` : '', 'damt'],
              ['Close by', h.closeBy || '', 'closeby'],
              ['If you back out', DEPOSIT_IF_OUT.find(([k]) => k === h.depositIfBuyerOut)?.[1] || '', 'dout'],
            ] as [string, string, string][])
          : ([
              ['Deposit', h.deposit === 'none' ? 'None' : '', 'dep'],
              ['Date of sale', h.saleDate || '', 'date'],
            ] as [string, string, string][])),
        ['Paying by', h.paymentMethod || '', 'pay'],
        ['Included', h.inventory || 'Nothing extra', 'inv'],
      ],
      note: bigPrice
        ? 'Over $50,000, we recommend BoatClosers: a signed purchase agreement, a neutral party holding the money, and survey conditions.'
        : depBig
          ? 'Over $1,000, we recommend a neutral party hold the deposit. BoatClosers does that.'
          : 'Still haggling? My Boat Closing is for a price you’ve already agreed. BoatClosers runs offers and counteroffers.',
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
          <Field id="len" label="Length in feet" hint={fl ? 'required on a Florida bill of sale' : 'optional'} value={h.lengthFt || ''} onChange={(v) => setHand({ lengthFt: v.replace(/[^0-9.' ]/g, '') })} />
          <Select id="prop" label="Propulsion" hint={fl ? 'required' : 'optional'} value={h.propulsion || ''} options={PROPULSION} onChange={(v) => setHand({ propulsion: v })} />
          <Select id="hull" label="Hull material" value={h.hull || ''} options={HULLS} onChange={(v) => setHand({ hull: v })} />
          <Select id="fuel" label="Fuel" value={h.fuel || ''} options={FUELS} onChange={(v) => setHand({ fuel: v })} />
        </>
      )}
      <Choice label={has.boat ? 'How is the boat titled?' : 'How is it titled or registered?'} value={h.titledHow} options={titled} onChange={(v) => setHand({ titledHow: v })} />
      {h.titledHow === 'florida' && <Field id="tnum" label={`${stateName} title number`} hint="optional" value={h.titleNumber || ''} onChange={(v) => setHand({ titleNumber: v })} />}
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
      <Field id="co" label={fl ? 'Florida county where you’re buying' : `County of sale (optional)`} value={h.county || ''} onChange={(v) => setHand({ county: v })} />
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
      <Select
        id="dp"
        label="Deposit to hold the boat"
        value={h.deposit === 'given' ? 'Yes, I already paid one' : h.deposit === 'planned' ? 'I’m about to' : h.deposit === 'none' ? 'No deposit' : ''}
        options={['Yes, I already paid one', 'I’m about to', 'No deposit']}
        onChange={(v) => setHand({ deposit: v.startsWith('Yes') ? 'given' : v.startsWith('I’m') ? 'planned' : 'none' })}
      />
      {depOn && (
        <>
          <Field id="da" label="Deposit amount, in dollars" value={h.depositAmount ? Number(h.depositAmount).toLocaleString('en-US') : ''} onChange={(v) => setHand({ depositAmount: v.replace(/[^0-9]/g, '') })} />
          {depWarn}
          <Select id="dm" label="Paid by" value={h.depositMethod || ''} options={DEPOSIT_METHODS} onChange={(v) => setHand({ depositMethod: v })} />
          <Field id="dd" label="Deposit date" type="date" value={h.depositDate || ''} onChange={(v) => setHand({ depositDate: v })} />
          <Field id="cb" label="Pay the rest and take the boat by" hint="also your sale date" type="date" value={h.closeBy || ''} onChange={(v) => setHand({ closeBy: v, saleDate: v })} />
          <Select
            id="do"
            label="If you change your mind"
            value={DEPOSIT_IF_OUT.find(([k]) => k === h.depositIfBuyerOut)?.[1] || ''}
            options={DEPOSIT_IF_OUT.map(([, l]) => l)}
            onChange={(v) => setHand({ depositIfBuyerOut: DEPOSIT_IF_OUT.find(([, l]) => l === v)?.[0] })}
          />
        </>
      )}
      {!depOn && <Field id="dt" label="Date of sale" type="date" value={h.saleDate || ''} onChange={(v) => setHand({ saleDate: v })} />}
      <Select id="pm" label="How you’re paying" value={h.paymentMethod || ''} options={PAYMENT_METHODS} onChange={(v) => setHand({ paymentMethod: v })} />
      <Field id="iv" label="What else comes with it" hint="optional, goes on the bill of sale" textarea value={h.inventory || ''} onChange={(v) => setHand({ inventory: v })} />
    </div>
  )

  const modeSwitch = (
    <div role="group" aria-label="How to fill this in" style={{ display: 'flex', gap: 4, background: 'rgba(19,35,58,0.076)', borderRadius: 10, padding: 4, alignSelf: 'flex-start' }}>
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
            background: guided === on ? '#ffffff' : 'transparent',
            boxShadow: guided === on ? '0 1px 2px rgba(19,35,58,0.12)' : 'none',
            color: navy,
          }}
        >
          {label as string}
        </button>
      ))}
    </div>
  )

  // ---------- the $29.99 offer ----------
  const docList = (
    fl
      ? [
          has.boat && 'Florida vessel bill of sale that doubles as your 30-day temporary registration',
          has.trailer && 'Trailer bill of sale',
          has.motor && !has.boat && 'Outboard motor bill of sale',
          (has.boat || has.trailer) && 'Florida form HSMV 82050 filled in, with the seller’s notice of sale',
          has.boat && 'Your Florida title application (HSMV 82040 VS), pre-filled',
          'What to bring to the tax collector, with a cost estimate',
          'Email reminders before your 30-day title deadline, plus a calendar reminder',
        ]
      : [
          st?.billOfSale ? `${stateName}’s official bill of sale (${st.billOfSale.name.replace(/^.*?(form [A-Z0-9-]+).*$/i, '$1')}), with every value printed for you to copy` : 'A bill of sale for the sale, with a notary section',
          st?.billOfSale ? 'A terms sheet that adds the as-is terms and what’s included' : null,
          has.trailer && 'Trailer bill of sale',
          `Your ${stateName} guide: who titles boats, where to go, and what to bring`,
        ]
  ).concat([
    'Title photo pre-check: catch the wrong name, an unreleased lien or a mismatched HIN before you pay',
    'A payment receipt for the seller to sign, with any deposit credited',
    'A title signing guide for how the boat is titled',
    has.boat ? 'Vessel history: builder, recalls and Coast Guard records from the HIN' : '',
    'Walk-around record, handoff checklist and dated photos',
    'The seller’s copy emailed to them',
    'Your Boat File: every paper plus a starter boat log, in one download',
  ]).filter(Boolean) as string[]

  const paywall = (
    <div style={{ ...boxStyle, border: `1.5px solid ${gold}`, background: 'rgba(201,150,46,0.07)' }}>
      <button
        type="button"
        onClick={() => {
          flush()
          setPreviewOpen(true)
        }}
        aria-label="See your bill of sale, filled in"
        style={{ display: 'flex', gap: 14, alignItems: 'center', textAlign: 'left', width: '100%', border: 0, borderRadius: 10, padding: 0, background: 'transparent', cursor: 'pointer', color: cream }}
      >
        <span
          aria-hidden="true"
          style={{ position: 'relative', flexShrink: 0, width: 96, height: 124, background: '#fffdf9', borderRadius: 4, boxShadow: '0 6px 16px rgba(0,0,0,0.35)', padding: '10px 9px', overflow: 'hidden', color: '#13233a', fontFamily: "'Fraunces', Georgia, serif" }}
        >
          <span style={{ display: 'block', fontSize: 8.5, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>Bill of Sale</span>
          <span style={{ display: 'block', fontSize: 6.5, lineHeight: 1.5, fontFamily: 'Inter, system-ui, sans-serif' }}>
            Seller: {(basics.sellerName || '').split(' ')[0] || '—'}
            <br />
            Buyer: {firstName || '—'}
            <br />
            {priceDollars ? money(priceDollars * 100) : ''}
          </span>
          {[0, 1, 2, 3, 4].map((n) => (
            <span key={n} style={{ display: 'block', height: 3, borderRadius: 2, background: '#dfe4e8', margin: '5px 0', width: `${90 - n * 9}%` }} />
          ))}
          <span style={{ position: 'absolute', left: -14, right: -14, top: 52, transform: 'rotate(-28deg)', textAlign: 'center', fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(184,134,58,0.75)', fontFamily: 'Inter, system-ui, sans-serif' }}>
            PREVIEW
          </span>
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 19 }}>Your bill of sale is already filled in</span>
          <span style={{ fontSize: 14, color: muted, lineHeight: 1.5 }}>Your names, the boat and the price, from what you entered. Have a look before you pay.</span>
          <span style={{ ...outlineButton, alignSelf: 'flex-start', padding: '8px 14px', fontSize: 14 }}>See it filled in</span>
        </span>
      </button>
      {previewOpen && (
        <DocViewer
          token={token}
          doc={has.boat ? 'vessel-bill-of-sale' : has.motor ? 'motor-bill-of-sale' : 'trailer-bill-of-sale'}
          title="Your bill of sale (preview)"
          onClose={() => setPreviewOpen(false)}
          preview={{
            label: paying === 'solo' ? 'Opening checkout…' : 'Unlock · $29.99',
            onUnlock: () => pay(false),
          }}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22 }}>Your paperwork</span>
        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, color: goldText, fontWeight: 700 }}>$29.99</span>
      </div>
      <p style={{ margin: 0, color: muted, fontSize: 14.5, lineHeight: 1.6 }}>One price for everything in this sale. You’ve already entered the details, so your papers fill in the moment you unlock.</p>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: muted }}>
        You’ll print them and sign in ink: at home, on the seller’s printer, or at any UPS Store, FedEx Office or Staples in a few minutes. We show you how.
      </p>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: cream, borderLeft: `3px solid ${gold}`, paddingLeft: 12 }}>
        A handshake makes the deal; paper keeps it. Your signed, dated papers answer questions later: at the tag office, with your insurance, and when you sell the boat.
      </p>
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
          Haven’t looked the boat over yet? <span style={{ color: goldText }}>Add My Boat Inspector · {BUNDLE_PRICE} total</span>
        </div>
        <div style={{ color: muted, fontSize: 14, lineHeight: 1.55 }}>
          A guided walkthrough of the boat and a sea trial, with a written report, before you hand over money. {MBI_PRICE} on its own. You get a code by email to use at myboatinspector.com. It doesn’t replace a professional marine survey.
        </div>
        <button type="button" onClick={() => pay(true)} disabled={!!paying} style={{ ...outlineButton, opacity: paying ? 0.6 : 1 }}>
          {paying === 'bundle' ? 'Opening secure checkout...' : `Unlock paperwork + My Boat Inspector · ${BUNDLE_PRICE}`}
        </button>
      </div>
      {payError && (
        <p role="alert" style={{ margin: 0, color: goldText }}>
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
          <span style={{ color: goldText, fontWeight: 700, fontSize: 14 }}>{paid ? 'Paperwork unlocked' : `Welcome aboard, ${firstName}`}</span>
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
                border: `1.5px solid ${on ? gold : 'rgba(19,35,58,0.146)'}`,
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

      <ExpressHelper token={token} step={step} next={nextUp()} onGo={go} />

      {saveState === 'error' && (
        <p role="alert" style={{ margin: 0, color: goldText, fontSize: 14 }}>
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
          {depOn && <DepositCard token={token} missing={depositMissing(h)} saving={saveState === 'saving'} inspection={h.depositIfBuyerOut === 'inspection'} secureHref={depBig ? moveHref : undefined} />}
          {bigNote}
        </>
      )}

      {/* ---------- 4 Check (free) ---------- */}
      {step === 3 && (
        <>
          {sectionTitle('Check it before you pay')}
          <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>All free. Two minutes here can save you a wasted trip or a boat you can’t title.</p>
          {has.boat && <HinCard token={token} boat={deal.items.boat} onSaved={(items) => setDeal({ ...deal, items })} />}
          <WalkAround token={token} has={has} walk={deal.progress?.walk} paid={paid} onSaved={(walk) => setDeal((d: any) => ({ ...d, progress: { ...(d.progress || {}), walk } }))} />
          <TitleCheckCard
            token={token}
            paid={paid}
            result={deal.progress?.titleCheck}
            used={Number(deal.progress?.titleChecks || 0)}
            onDone={(titleCheck, used) => setDeal((d: any) => ({ ...d, progress: { ...(d.progress || {}), titleCheck, titleChecks: used } }))}
            onUnlock={() => go(4)}
          />
          <div style={boxStyle}>
            <LienCheck sellerName={deal.seller_name} inExpress saved={checks} onToggle={toggle} />
            <Choice label="What did you find on the title?" value={h.lien} options={LIEN_OPTIONS} onChange={(v) => setHand({ lien: v })} />
            {h.lien === 'open' && (
              <p style={{ margin: 0, color: goldText, lineHeight: 1.6, fontSize: 15 }}>
                Don’t hand over money yet. Until the lender releases the lien, it has a claim on the boat even after you pay. The seller pays it off first, you pay the lender directly with a payoff letter, or{' '}
                <a href={moveHref} style={{ color: goldText }}>
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
            text="A guided walkthrough of the hull, engines, systems and a sea trial, with a written report to negotiate with or decide on a survey. Its own product, separate from My Boat Closing. It doesn’t replace a professional marine survey."
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
          {!paid && bigNote}
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
                <PrintHelp token={token} doc="closing-packet" />
                <DocRow token={token} doc="boat-file" name="Your Boat File" note="Every paper, your checks and a starter boat log, in one download." primary />
                <DocRow token={token} doc="closing-packet" name="Just the papers to sign" note="In the order you’ll use them. Easiest to print." />
                {depOn && depositMissing(savedHand).length === 0 && <DocRow token={token} doc="deposit-receipt" name="Deposit receipt" note="Already signed? It’s credited on your payment receipt." />}
                {!fl && st?.billOfSale && (
                  <div style={{ border: `1px solid ${gold}`, borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontWeight: 700 }}>{stateName}’s official bill of sale</div>
                    <div style={{ color: muted, fontSize: 14, lineHeight: 1.5 }}>
                      {st.billOfSale.name}. Print it and sign it with the seller. Every value to copy onto it is in your {stateName} guide below.{st.billOfSale.note ? ` ${st.billOfSale.note}` : ''}
                    </div>
                    <a href={st.billOfSale.url} target="_blank" rel="noopener noreferrer" style={{ ...outlineButton, textAlign: 'center', textDecoration: 'none' }}>
                      Open the official form
                    </a>
                  </div>
                )}
                {(
                  [
                    has.boat && ['vessel-bill-of-sale', !fl && st?.billOfSale ? 'Terms and inventory sheet' : 'Vessel bill of sale', fl ? 'Both of you sign. Keep it aboard: it’s your temporary registration for 30 days.' : st?.billOfSale ? 'Sign it with the official form. It adds the as-is terms and what’s included.' : 'Both of you sign. The seller signs in front of a notary.'],
                    has.motor && !has.boat && ['motor-bill-of-sale', 'Motor bill of sale', 'Both of you sign.'],
                    has.trailer && ['trailer-bill-of-sale', 'Trailer bill of sale', 'Both of you sign. The trailer is titled separately.'],
                    fl && has.boat && ['hsmv-82050-boat', 'Florida form HSMV 82050, boat', 'The state’s own bill of sale. Page 2 is the seller’s notice of sale.'],
                    fl && has.trailer && ['hsmv-82050-trailer', 'Florida form HSMV 82050, trailer', 'Page 2 is the seller’s notice of sale.'],
                    !fl && ['state-guide', `Your ${stateName} guide`, 'Who titles boats, where to go, and the values to copy onto the official form.'],
                    ['payment-receipt', 'Payment receipt', 'The seller signs this when you pay.'],
                    ['closing-summary', 'Closing summary', 'One page with every number from the sale.'],
                  ].filter(Boolean) as [string, string, string][]
                ).map(([k, n, note]) => (
                  <DocRow key={k} token={token} doc={k} name={n} note={note} />
                ))}
                {savedHand.titledHow === 'other-no-title' && (
                  <p style={{ margin: 0, color: goldText, fontSize: 14, lineHeight: 1.6 }}>The boat comes from a state that doesn’t title boats, so the seller signs the bill of sale in front of a notary. The notary section is on the last page.</p>
                )}
                {savedHand.titledHow === 'documented' && (
                  <p style={{ margin: 0, color: goldText, fontSize: 14, lineHeight: 1.6 }}>
                    Documented boat: the seller also signs the Coast Guard bill of sale,{' '}
                    <a href="https://www.dco.uscg.mil/nvdc/" target="_blank" rel="noopener noreferrer" style={{ color: goldText }}>
                      form CG-1340
                    </a>
                    .
                  </p>
                )}
              </div>
              <Checklist label="TITLE SIGNING GUIDE" title="Check each of these before you hand over payment" items={titleSigningGuide(savedHand, stateCode)} checks={checks} onToggle={toggle} />
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
              {ready && !fl && st ? (
                <div style={{ ...boxStyle, border: `1px solid ${gold}`, background: 'rgba(201,150,46,0.08)' }}>
                  <div style={eyebrow}>TITLE AND REGISTER IN {stateName.toUpperCase()}</div>
                  <h2 style={h2}>{st.titles ? `${stateName} titles boats` : `${stateName} registers boats but doesn’t title them`}</h2>
                  {st.note && <p style={{ margin: 0, color: cream }}>{st.note}</p>}
                  {st.notaryNote && <p style={{ margin: 0, color: goldText }}>{st.notaryNote}</p>}
                  <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>
                    {st.titleOffice ? `${st.titleOffice.name} handles titles and registration.` : `Start with ${st.agency}; if another office handles titles, their site says so.`} Most states set a deadline after a sale and collect sales or use tax when you
                    register, so check both early.
                  </p>
                  <a href={st.titleOffice?.url || st.url} target="_blank" rel="noopener noreferrer" style={{ ...outlineButton, textAlign: 'center', textDecoration: 'none' }}>
                    {st.titleOffice ? `Go to ${st.titleOffice.name}` : `Go to ${st.agency}`}
                  </a>
                  <DocRow token={token} doc="state-guide" name={`Your ${stateName} guide`} note={`Checked ${STATES_CHECKED}, with links to the official sources.`} />
                </div>
              ) : ready ? (
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
              {ready && (
                <div style={boxStyle}>
                  <DocRow token={token} doc="boat-file" name="Your Boat File" note="Every paper, your checks, the vessel history and a starter boat log, in one download. Keep it for when you sell." primary />
                </div>
              )}
              <Checklist label="NEW OWNER CHECKLIST" title="Get on the water the right way" items={forItems(newOwnerFor(stateCode), has)} checks={checks} onToggle={toggle} />
              <ProductCard
                label="AFTER IT’S YOURS"
                name="My Boat Logs"
                price="$39.99/yr"
                text="Your Boat File starts the log. My Boat Logs keeps it going: maintenance, receipts, documents and reminders, and a full history to hand the next buyer when you sell. Free for 14 days."
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
      {msg && <p style={{ margin: 0, color: goldText, fontSize: 14 }}>{msg}</p>}
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
