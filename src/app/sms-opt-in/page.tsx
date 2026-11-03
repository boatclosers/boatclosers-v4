import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'How Text Opt-In Works | BoatClosers',
  description: 'What the optional BoatClosers text message opt-in looks like and how consent is collected.',
  alternates: { canonical: 'https://www.boatclosers.com/sms-opt-in' },
  robots: { index: false, follow: true },
}

const option = (label: string, on: boolean) => (
  <span
    style={{
      background: on ? '#0f1b2d' : '#fff',
      color: on ? '#fff' : '#0f1b2d',
      border: '1px solid #0f1b2d',
      borderRadius: 5,
      padding: '6px 14px',
      fontSize: 13,
      fontWeight: 700,
    }}
  >
    {label}
  </span>
)

export default function Page() {
  return (
    <LegalPage title="How Text Opt-In Works" updated="November 3, 2026">
      <p>
        BoatClosers users choose how they hear about their own sale. Email is the default. Texting is optional and isn’t
        required to buy anything. This is a sample of the form, shown with Text selected.
      </p>

      <div role="img" aria-label="Sample of the opt-in form with Text selected" style={{ background: '#fff', color: '#0f1b2d', borderRadius: 8, padding: 16, margin: '20px 0' }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>How should we send you deal updates?</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {option('Email', false)}
          {option('Text', true)}
          {option('Both', false)}
        </div>
        <div style={{ border: '1px solid #cbd5e1', borderRadius: 5, padding: '7px 10px', fontSize: 14, color: '#64748b', marginBottom: 10 }}>Your mobile number</div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: '#475569' }}>
          By choosing Text you agree to get deal texts from BoatClosers about offers, signatures, and deadlines. Msg frequency
          varies. Msg &amp; data rates may apply. Reply STOP to stop, HELP for help.{' '}
          <a href="/sms-terms" style={{ color: '#0f6b75' }}>Terms</a> · <a href="/privacy" style={{ color: '#0f6b75' }}>Privacy</a>
        </div>
      </div>

      <h2>How it works</h2>
      <ol>
        <li>A user opens their own deal on BoatClosers or BoatClosers Express.</li>
        <li>They select Text or Both and enter their own mobile number. On Express, the wording refers to texts about their purchase, like deadline reminders.</li>
        <li>Their choice is saved, and they then get texts about their own sale.</li>
      </ol>
      <p>
        We don’t text numbers entered by another person, such as the other party to a sale. We don’t sell or share mobile
        numbers or text consent with third parties or affiliates for marketing.
      </p>
      <h2>Opting out</h2>
      <p>
        Reply STOP to any text, or use the <a href="/unsubscribe">unsubscribe page</a>. Reply HELP for help, or email{' '}
        <a href="mailto:support@boatclosers.com">support@boatclosers.com</a>.
      </p>
    </LegalPage>
  )
}
