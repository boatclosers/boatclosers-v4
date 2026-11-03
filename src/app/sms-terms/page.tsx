import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Text Message Terms | BoatClosers',
  description: 'Terms for BoatClosers deal notification text messages: what we send, how often, and how to opt out.',
  alternates: { canonical: 'https://www.boatclosers.com/sms-terms' },
}

export default function Page() {
  return (
    <LegalPage title="Text Message Terms" updated="November 3, 2026">
      <h2>Program</h2>
      <p>
        <b>BoatClosers Deal Notifications.</b> BoatClosers sends text messages about a specific boat, trailer, or motor sale you are part of: offers and responses, documents ready to view, and reminders before deadlines such as the 30-day
        Florida title deadline. We send no marketing texts.
      </p>

      <h2>How you opt in</h2>
      <p>
        You opt in yourself by choosing <b>Text</b> or <b>Both</b> and entering your mobile number under “How should we send you
        deal updates?” on BoatClosers. Texting is optional, you can choose Email instead, and it isn’t required to buy anything.
        We don’t text a number that someone else gives us. <a href="/sms-opt-in">See what the opt-in looks like</a>.
      </p>

      <h2>Frequency and cost</h2>
      <p>
        Message frequency varies with your deal, usually a few messages per sale. <b>Message and data rates may apply.</b>
      </p>

      <h2>Stop or get help</h2>
      <ul>
        <li>Reply <b>STOP</b> to any message to stop all texts. You’ll get one confirmation and nothing more.</li>
        <li>Reply <b>START</b> to receive texts again.</li>
        <li>Reply <b>HELP</b> for help, or email <a href="mailto:support@boatclosers.com">support@boatclosers.com</a>.</li>
      </ul>
      <p>Carriers are not liable for delayed or undelivered messages.</p>

      <h2>Privacy</h2>
      <p>
        We do not sell or share your mobile number or text consent with third parties or affiliates for marketing. See our{' '}
        <a href="/privacy">privacy policy</a>.
      </p>
    </LegalPage>
  )
}
