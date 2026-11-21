// A slim heads-up: the free HIN check can't show a boat's past; a Boat History Report can.
// Kept small on purpose: it's a warning, not an ad. Link and wording live in lib/historyReport.ts.
import { HISTORY_REPORT_NAME, HISTORY_REPORT_URL } from '@/lib/historyReport'

const gold = '#c9962e'
const cream = '#f5f1e8'
const navy = '#0f1b2d'

export default function HistoryReportCard({
  theme = 'dark',
  audience = 'buyer',
}: {
  theme?: 'dark' | 'light'
  audience?: 'buyer' | 'seller'
}) {
  const dark = theme === 'dark'
  const text = dark ? cream : navy
  const soft = dark ? 'rgba(245,241,232,0.75)' : '#4a5566'
  const linkColor = dark ? gold : '#8a6516'
  return (
    <div
      style={{
        borderLeft: `3px solid ${gold}`,
        background: dark ? 'rgba(201,150,46,0.07)' : '#fbf6ea',
        borderRadius: 4,
        padding: '10px 14px',
        fontSize: 14.5,
        lineHeight: 1.55,
        color: soft,
      }}
    >
      <strong style={{ color: text }}>Heads up:</strong>{' '}
      {audience === 'seller'
        ? 'buyers will check the boat’s past (accidents, storm damage, theft, total losses), since most states don’t brand boat salvage titles. A clean report answers that up front.'
        : 'a HIN check can’t show accidents, storm damage, theft or total losses, and most states don’t brand boat salvage titles.'}{' '}
      <a href={HISTORY_REPORT_URL} target="_blank" rel="noopener" style={{ color: linkColor, fontWeight: 700 }}>
        Run a {HISTORY_REPORT_NAME} →
      </a>{' '}
      <span style={{ fontSize: 12, opacity: 0.8 }}>(Not affiliated.)</span>
    </div>
  )
}
