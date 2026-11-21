// A clear, side-by-side card: what the free HIN check tells you vs what only a Boat Alert history report shows.
// Used on /hin-check, in My Boat Closing's HIN card and on guides. Link and copy live in lib/boatAlert.ts.
import {
  BOAT_ALERT_URL,
  BOAT_ALERT_PRICE,
  BOAT_ALERT_DISCLOSURE,
  HIN_CHECK_SHOWS,
  REPORT_SHOWS,
  REPORT_HOOK,
  REPORT_WHY,
} from '@/lib/boatAlert'

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

export default function HistoryReportCard({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const dark = theme === 'dark'
  const text = dark ? cream : navy
  const soft = dark ? 'rgba(245,241,232,0.75)' : '#4a5566'
  const panel = dark ? 'rgba(245,241,232,0.06)' : '#ffffff'
  const panelLine = dark ? 'rgba(245,241,232,0.18)' : '#e3dccd'

  return (
    <section
      style={{
        border: `2px solid ${gold}`,
        borderRadius: 8,
        padding: '22px 22px 20px',
        background: dark ? 'rgba(201,150,46,0.08)' : '#fbf6ea',
        color: text,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: dark ? gold : '#8a6516' }}>
        BEFORE YOU PAY: BOAT HISTORY REPORT
      </div>
      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 23, lineHeight: 1.25, margin: '6px 0 6px', color: text }}>
        The HIN check is free. A history report is a different thing.
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.55, color: soft }}>
        The HIN check tells you the number is real. Only a history report tells you what the boat has been through.{' '}
        <strong style={{ color: text }}>{REPORT_HOOK}</strong>
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: '1 1 220px', background: panel, border: `1px solid ${panelLine}`, borderRadius: 6, padding: '14px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Free HIN check</div>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', fontSize: 14.5, lineHeight: 1.6 }}>
            {HIN_CHECK_SHOWS.map((s) => (
              <li key={s}>✓ {s}</li>
            ))}
          </ul>
        </div>
        <div style={{ flex: '1 1 220px', background: panel, border: `1px solid ${gold}`, borderRadius: 6, padding: '14px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
            Boat Alert history report <span style={{ color: dark ? gold : '#8a6516' }}>· {BOAT_ALERT_PRICE}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', fontSize: 14.5, lineHeight: 1.6 }}>
            {REPORT_SHOWS.map((s) => (
              <li key={s}>✓ {s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Why Boat Alert</div>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14.5, lineHeight: 1.6, color: soft }}>
          {REPORT_WHY.map((s) => (
            <li key={s}>{s}</li>
          ))}
          <li>
            {BOAT_ALERT_PRICE} is less than a tank of fuel, on a boat you’re about to spend thousands on
          </li>
        </ul>
      </div>

      <a
        href={BOAT_ALERT_URL}
        target="_blank"
        rel="noopener sponsored"
        style={{
          display: 'block',
          textAlign: 'center',
          background: gold,
          color: navy,
          padding: '14px 18px',
          borderRadius: 5,
          fontWeight: 800,
          fontSize: 16,
          textDecoration: 'none',
        }}
      >
        Get the Boat Alert report · {BOAT_ALERT_PRICE} →
      </a>
      <div style={{ fontSize: 12, marginTop: 8, color: soft, textAlign: 'center' }}>
        A report can only show what’s been reported. {BOAT_ALERT_DISCLOSURE}
      </div>
    </section>
  )
}
