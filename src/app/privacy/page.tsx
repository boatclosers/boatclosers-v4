import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy | BoatClosers',
  description: 'How BoatClosers collects, uses, and protects your information, including phone numbers used for text messages.',
  alternates: { canonical: 'https://www.boatclosers.com/privacy' },
}

// The same counsel-reviewed policy shown in the app footer (LEGAL.privacy in
// BoatClosersApp.jsx), as a public page so it has a link. The "Text messages and
// phone numbers" section is new (Oct 2026) and needs counsel review; keep the two
// copies in sync when either changes.
export default function Page() {
  return (
    <LegalPage title="Privacy Policy" updated="October 16, 2026">
      <h2>Overview</h2>
      <p>{"This policy explains what information BoatClosers collects, how we use it, and the choices you have."}</p>
      <h2>Information we collect</h2>
      <p>{"Account information you give us: your name, email, and password. Deal information you enter: vessel details, the parties' contact information, prices, offers, messages, and dates. Files you upload, such as survey reports or deposit proof."}</p>
      <h2>How we use your information</h2>
      <p>{"To provide and operate the service: create and route your documents, let both parties collaborate on the same deal, send transactional emails (invites, offer and signature notifications), and provide support."}</p>
      <h2>How we share your information</h2>
      <p>{"With the other party to your deal — sharing a deal between a buyer and seller is the whole point of the platform. With service providers that run the platform on our behalf (for example, our hosting and database provider, our email-delivery provider, and, when enabled, our payment processor), under their own terms. And if required by law. We do not sell your personal information."}</p>
      <h2>Text messages and phone numbers</h2>
      <p>{"If you give us a mobile number and choose to get texts, we use it only to send messages about the sale it is connected to: invitations, offers, documents, and deadline reminders. A party to your sale may also ask us to send you a message about that sale."}</p>
      <p>{"We do not sell, rent, or share mobile phone numbers or text message opt-in data and consent with third parties or affiliates for marketing or promotional purposes. Text message opt-in data and consent are shared only with the text message provider that delivers our messages (Twilio)."}</p>
      <p>{"Reply STOP to any text to stop, or HELP for help. Message frequency varies. Message and data rates may apply. See our Text Message Terms at boatclosers.com/sms-terms."}</p>
      <h2>Where your data is stored and security</h2>
      <p>{"Your data is stored with our hosting and database provider. We use reasonable technical and organizational safeguards to protect it, but no method of storage or transmission is perfectly secure."}</p>
      <h2>Data retention and your choices</h2>
      <p>{"We keep deal data to provide the service and maintain records. You can request access to, correction of, or deletion of your account data by emailing us — though some records may be retained where the law requires it."}</p>
      <h2>Children</h2>
      <p>{"BoatClosers is for adults 18 and older and is not directed to children. We do not knowingly collect information from anyone under 18."}</p>
      <h2>Cookies and local storage</h2>
      <p>{"We use essential cookies and browser storage to keep you signed in and to run the app. [If you add analytics or marketing tools later, disclose them here.]"}</p>
      <h2>Changes to this policy</h2>
      <p>{"We may update this policy from time to time. The “last updated” date at the top shows the current version."}</p>
      <h2>Contact</h2>
      <p>{"Questions about your privacy or data: support@boatclosers.com."}</p>
    </LegalPage>
  )
}
