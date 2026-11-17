// "Carry your boat over" between the suite's apps.
// Another app in the suite (My Boat Inspector "mbi" or My Boat Listing "mbl") sends the boat's details in the link as
// ?fromInspector=<base64url JSON>. It's only a prefill: the customer sees and can change
// every field before anything is sent, so nothing here is trusted beyond length and format.

export type Handoff = {
  src: 'mbi' | 'mbl'
  bid: string // the boat's id in the sending app, so the same boat isn't moved twice
  role: 'buy' | 'sell'
  hin: string
  year: string
  make: string
  model: string
  length: string
  engine: string
  hours: string
  price: string
  trailer: boolean | null
  report: string // report link, only ever sent when a seller chose to share it
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max) : '')

export function decodeHandoff(raw: string | null | undefined): Handoff | null {
  if (!raw || raw.length > 3000 || !/^[A-Za-z0-9_-]+$/.test(raw)) return null
  try {
    const b64 = raw.replace(/-/g, '+').replace(/_/g, '/')
    const json =
      typeof window === 'undefined'
        ? Buffer.from(b64, 'base64').toString('utf8')
        : decodeURIComponent(escape(atob(b64)))
    const d = JSON.parse(json)
    if (d?.v !== 1 || (d?.src !== 'mbi' && d?.src !== 'mbl')) return null
    const report = str(d.report, 200)
    return {
      src: d.src === 'mbl' ? 'mbl' : 'mbi',
      bid: str(d.bid, 64),
      role: d.role === 'sell' ? 'sell' : 'buy',
      hin: str(d.hin, 20).toUpperCase().replace(/[^A-Z0-9]/g, ''),
      year: /^(19|20)\d{2}$/.test(str(d.year, 4)) ? str(d.year, 4) : '',
      make: str(d.make, 60),
      model: str(d.model, 80),
      length: str(d.length, 10).replace(/[^0-9.]/g, ''),
      engine: str(d.engine, 120),
      hours: str(d.hours, 10).replace(/[^0-9.]/g, ''),
      price: str(d.price, 20).replace(/[^0-9.]/g, ''),
      trailer: d.trailer === true ? true : d.trailer === false ? false : null,
      report: /^https:\/\/(www\.)?myboatinspector\.com\/r\/[A-Za-z0-9_-]+$/.test(report) ? report : '',
    }
  } catch {
    return null
  }
}

/** "2015 Carolina Skiff 17" for the boat line in My Boat Closing. */
export function handoffBoatLine(h: Handoff) {
  return [h.year, h.make, h.model].filter(Boolean).join(' ')
}

/** "My Boat Inspector" or "My Boat Listing", for messages. */
export function handoffAppName(h: Handoff) {
  return h.src === 'mbl' ? 'My Boat Listing' : 'My Boat Inspector'
}
