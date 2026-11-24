'use client'

const gold = '#c9962e'
const navy = '#0f1b2d'

export default function PrintButton() {
  return (
    <button
      type="button"
      className="no-print"
      onClick={() => {
        try {
          window.gtag?.('event', 'checklist_printed')
        } catch {}
        window.print()
      }}
      style={{
        background: gold,
        color: navy,
        border: 'none',
        padding: '14px 32px',
        borderRadius: 4,
        fontWeight: 700,
        fontSize: 16,
        cursor: 'pointer',
      }}
    >
      Print or save as PDF
    </button>
  )
}
