import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Text Message Terms | BoatClosers',
  description: 'Terms for BoatClosers deal notification text messages: what we send, how often, and how to opt out.',
  alternates: { canonical: 'https://www.boatclosers.com/sms-terms' },
}

export default function Page() {
  return (
    <LegalPage title="Text Message Terms" updated="October 16, 2026">
      <h2>Program</h2>
      <p>
        <b>BoatClosers Deal Notifications.</b> BoatClosers sends text messages about a specific boat, trailer, or motor sale:
        invitations to a deal, offers and responses, documents ready to view, reminders before deadlines such as the 30-day
        Florida title deadline, and messages a buyer or seller asks us to deliver to the other party in their sale.
      </p>

      <h2>How you opt in</h2>
      <p>
        You opt in by choosing <b>Text</b> or <b>Both</b> and entering your mobile number on BoatClosers, for example under
        “How should we send you deal updates?” or “How we reach you.” A party to your sale may also ask us to send you a
        message about that sale; that first message identifies BoatClosers and the sender, and you can reply STOP to receive
        no more.
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
