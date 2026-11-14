import type { Metadata } from 'next'
import Link from 'next/link'

// Texas boat bill of sale and title transfer guide.
// Facts checked November 14, 2026 against Texas Parks and Wildlife (TPWD) and
// the Texas Comptroller (links in SOURCES below). Re-check yearly: fees,
// deadlines and the tax cap can change with the legislature.

const URL = 'https://www.boatclosers.com/guides/texas-boat-bill-of-sale'
const TITLE = 'Texas Boat Bill of Sale and Title Transfer: A Private Sale Guide'
const DESC =
  'How to sell or buy a used boat privately in Texas: the PWD 143 and PWD 144 forms that act as the bill of sale, the 6.25% boat tax and its $18,750 cap, the 45 working day deadline, outboard motors and trailers.'
const CHECKED = 'November 14, 2026'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { type: 'article', url: URL, title: TITLE, description: DESC },
}

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

const TPWD_BUY_SELL = 'https://tpwd.texas.gov/fishboat/boat/owner/buying_and_selling/'
const TPWD_FORMS = 'https://tpwd.texas.gov/fishboat/boat/forms/'
const PWD_143 = 'https://tpwd.texas.gov/publications/pwdforms/media/pwd_143_a0900_vessel_boat_application.pdf'
const TPWD_FEES = 'https://tpwd.texas.gov/regulations/outdoor-annual/boating/fees'
const TPWD_TAX = 'https://tpwd.texas.gov/regulations/outdoor-annual/boating/title-registration-id-requirements/tax-and-bill-of-sale-requirements'
const COMPTROLLER = 'https://comptroller.texas.gov/taxes/boat/'
const TPWD_FAQ = 'https://tpwd.texas.gov/faq/fishboat/boat/registration_and_titles/'

// The key numbers, each with the official page it comes from.
const NUMBERS: { label: string; value: string; source: string; href: string }[] = [
  { label: 'Boat and outboard motor tax', value: '6.25% of the sales price', source: 'TPWD', href: TPWD_TAX },
  { label: 'Most tax owed on one boat or motor', value: '$18,750 (bought in Texas on or after Sept. 1, 2019)', source: 'TPWD fee chart', href: TPWD_FEES },
  { label: 'Local sales tax on the boat', value: 'None', source: 'Texas Comptroller', href: COMPTROLLER },
  { label: 'Buyer’s deadline to transfer', value: '45 working days from the date of purchase', source: 'TPWD', href: TPWD_BUY_SELL },
  { label: 'New Texas resident bringing a boat', value: '$15 new resident tax instead of 6.25%', source: 'TPWD', href: TPWD_TAX },
]

const FAQ = [
  {
    q: 'Does Texas have an official boat bill of sale form?',
    a: 'Not a separate one. In Texas the seller completes and signs the tax affidavit section of the Vessel/Boat Application, form PWD 143, and form PWD 144 for an outboard motor. That signed section meets the bill of sale requirement. A handwritten receipt or sales invoice with the date, sales price, a description of the boat and motor, the buyer’s name and the seller’s signature is also accepted.',
  },
  {
    q: 'Do I have to title the outboard motor separately in Texas?',
    a: 'Yes. Texas titles outboard motors separately from the boat, on form PWD 144. All motorboats and all outboard motors must be titled in Texas.',
  },
  {
    q: 'How much sales tax do I pay on a used boat in Texas?',
    a: '6.25% of the sales price, paid by the buyer when titling the boat with TPWD or a participating county tax office. The tax is capped at $18,750 per boat or motor bought in Texas on or after September 1, 2019, and no local sales tax applies to the boat or outboard motor.',
  },
  {
    q: 'How long do I have to transfer a boat title in Texas?',
    a: 'The buyer must file the transfer within 45 working days of the purchase date. After that, tax penalties and interest apply.',
  },
  {
    q: 'Is the trailer handled the same way?',
    a: 'No. A boat trailer is titled through your county tax assessor-collector office and taxed as a motor vehicle, not under the boat tax. List the trailer price separately from the boat and motor on the bill of sale.',
  },
  {
    q: 'What does the seller need to do after the sale?',
    a: 'Ideally the seller goes with the buyer to a TPWD law enforcement office or participating county tax office to transfer everything at once. If the seller does not go, the seller should file a Vessel/Boat or Outboard Motor Ownership Transfer Notification with TPWD, which can be done online. That records the date the boat left the seller’s ownership.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: TITLE,
      description: DESC,
      url: URL,
      dateModified: '2026-11-14',
      about: ['Texas boat bill of sale', 'Texas boat title transfer', 'PWD 143', 'PWD 144', 'Texas boat sales tax'],
      publisher: { '@type': 'Organization', name: 'BoatClosers', url: 'https://www.boatclosers.com' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
}

const h2 = { fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 } as const
const link = { color: gold } as const

export default function Page() {
  return (
    <div style={{ background: navy, minHeight: '100vh', color: cream }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '24px 20px',
          borderBottom: `2px dashed ${gold}`,
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ color: gold, fontFamily: 'Georgia, serif', fontSize: 26, letterSpacing: 2, fontWeight: 700 }}>
            BOATCLOSERS
          </div>
          <div style={{ color: cream, fontSize: 10, letterSpacing: 3, opacity: 0.75 }}>PRIVATE VESSEL TRANSACTIONS</div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/guides" style={{ color: cream, textDecoration: 'none', fontSize: 15, opacity: 0.85 }}>
            Guides
          </Link>
          <Link
            href="/"
            style={{
              background: gold,
              color: navy,
              padding: '12px 26px',
              borderRadius: 4,
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: 15,
            }}
          >
            Get Started
          </Link>
        </div>
      </header>

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 80px', fontSize: 18, lineHeight: 1.75 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 44, lineHeight: 1.15, marginBottom: 20 }}>
          Texas Boat Bill of Sale <span style={{ color: gold }}>and Title Transfer</span>
        </h1>

        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 12 }}>
          Texas does things a little differently. There is no separate state bill of sale form, the outboard motor
          gets its own title, and the trailer goes to a different office entirely. Here is how a private boat sale
          closes in Texas, step by step.
        </p>
        <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 44 }}>
          Checked against Texas Parks and Wildlife and Texas Comptroller sources on {CHECKED}.
        </p>

        <h2 style={{ ...h2, marginTop: 44 }}>The short answer</h2>
        <p>
          In Texas, the seller fills in and signs the tax affidavit section of the{' '}
          <a href={PWD_143} style={link}>Vessel/Boat Application, form PWD 143</a>, plus{' '}
          <a href={TPWD_FORMS} style={link}>form PWD 144</a> for an outboard motor. That signed section is what
          Texas accepts as the bill of sale. The buyer then takes it, the signed-over title and payment for the tax
          to a Texas Parks and Wildlife (TPWD) law enforcement office or a participating county tax office within
          45 working days.
        </p>

        <h2 style={h2}>Texas by the numbers</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
            <tbody>
              {NUMBERS.map((n) => (
                <tr key={n.label} style={{ borderBottom: '1px solid rgba(201,150,46,0.3)' }}>
                  <td style={{ padding: '12px 12px 12px 0', opacity: 0.85 }}>{n.label}</td>
                  <td style={{ padding: 12, fontWeight: 600 }}>{n.value}</td>
                  <td style={{ padding: '12px 0 12px 12px', fontSize: 14 }}>
                    <a href={n.href} style={link}>{n.source}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 15, opacity: 0.7 }}>
          Title and registration fees are set by TPWD. Check the current amounts on the{' '}
          <a href={TPWD_FEES} style={link}>TPWD fee chart</a> before you go.
        </p>

        <h2 style={h2}>What counts as the bill of sale in Texas</h2>
        <p>
          TPWD requires a bill of sale or invoice for every change of ownership. It accepts either of these:
        </p>
        <ul>
          <li>
            <strong>The seller-signed tax affidavit on PWD 143 and PWD 144</strong>, with the sales price, the date of
            sale and any trade-in filled in. This is the cleanest option because it goes straight into the buyer’s
            application.
          </li>
          <li>
            <strong>A handwritten receipt or sales invoice</strong> that shows the date of sale, the sales price, a
            description of the boat and motor, the buyer’s name and the seller’s signature.
          </li>
        </ul>
        <p>
          Either way, <strong>list the trailer’s price separately</strong> from the boat and motor. The trailer is
          taxed under a different law, and a single lump-sum price causes problems at the counter. Our general guide
          covers{' '}
          <Link href="/guides/boat-bill-of-sale" style={link}>
            what any boat bill of sale should include
          </Link>
          , like the HIN, as-is wording and a free-and-clear statement.
        </p>

        <h2 style={h2}>The seller’s steps</h2>
        <ol>
          <li>Sign the Texas title over to the buyer.</li>
          <li>Complete and sign the tax affidavit section of PWD 143 (boat) and PWD 144 (outboard motor).</li>
          <li>Give the buyer a separate bill of sale for the trailer, if one is included.</li>
          <li>
            If there is an unpaid loan on the boat, the lienholder is involved in the transfer. Get the payoff and
            lien release handled before you hand over the boat.
          </li>
          <li>
            Go with the buyer to a TPWD office or participating county tax office if you can. If you can’t, file an{' '}
            <a href={TPWD_BUY_SELL} style={link}>Ownership Transfer Notification</a> with TPWD (it can be done online).
            That records the date the boat stopped being yours.
          </li>
        </ol>

        <h2 style={h2}>The buyer’s steps</h2>
        <ol>
          <li>Check the HIN on the hull matches the title and the PWD 143 before you pay.</li>
          <li>Collect the signed title, the signed PWD 143 and PWD 144, and the trailer bill of sale.</li>
          <li>
            File the transfer at a TPWD law enforcement office or participating county tax assessor-collector office
            within <strong>45 working days</strong> of the purchase. After that, tax penalties and interest apply.
          </li>
          <li>
            Pay the 6.25% boat and motor tax when you title. The total is capped at $18,750 per boat or motor, and no
            local tax is added.
          </li>
          <li>Title and register the trailer separately at your county tax office.</li>
        </ol>

        <h2 style={h2}>Outboard motors, trailers and other special cases</h2>
        <p>
          <strong>Outboard motors.</strong> Texas titles outboards on their own, on PWD 144, and{' '}
          <a href={TPWD_FAQ} style={link}>all gas and diesel outboards are subject to the outboard motor tax</a>{' '}
          regardless of horsepower. Electric outboards are exempt from the outboard motor tax.
        </p>
        <p>
          <strong>Trailers.</strong> Boat trailers are{' '}
          <a href={COMPTROLLER} style={link}>taxed as motor vehicles</a> and titled through the county tax office, not
          TPWD.
        </p>
        <p>
          <strong>Paddle craft.</strong> Canoes, kayaks and boats propelled only by a paddle or pole are not subject
          to the boat tax; regular limited sales and use tax applies instead.
        </p>
        <p>
          <strong>Bought out of state.</strong> A Texas resident who buys a boat in another state and brings it home
          owes Texas use tax at 6.25%, with credit for sales tax legally paid to the other state. A new resident
          moving to Texas with a boat already titled or registered in their name pays a $15 new resident tax
          instead.
        </p>

        <h2 style={h2}>Don’t write a lower price to save tax</h2>
        <p>
          The tax is based on the real sales price. Understating it shifts the risk to the buyer, who signs the
          application, and it weakens the paperwork if the sale is ever disputed. Write the real number.
        </p>

        <h2 style={h2}>Common questions</h2>
        {FAQ.map((f) => (
          <div key={f.q} style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 21, marginBottom: 6 }}>{f.q}</h3>
            <p style={{ marginTop: 0 }}>{f.a}</p>
          </div>
        ))}

        <div
          style={{
            marginTop: 60,
            padding: 36,
            border: `1px solid ${gold}`,
            borderRadius: 6,
            background: 'rgba(201,150,46,0.07)',
          }}
        >
          <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 24, marginTop: 0 }}>
            Close your Texas boat sale the right way
          </h3>
          <p>
            <strong>Simple deal, price already agreed?</strong> My Boat Closing checks the HIN free, then walks you
            through the Texas paperwork step by step, with every value printed to copy onto PWD 143. $29.99.
          </p>
          <p style={{ marginBottom: 26 }}>
            <strong>Bigger deal, a deposit, a survey or a loan to pay off?</strong> BoatClosers runs the whole sale in
            one deal room: offers, escrow, due diligence and closing documents. Flat $249.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a
              href="https://myboatclosing.com"
              style={{
                display: 'inline-block',
                background: gold,
                color: navy,
                padding: '14px 28px',
                borderRadius: 4,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Check the HIN free
            </a>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                border: `1px solid ${gold}`,
                color: gold,
                padding: '14px 28px',
                borderRadius: 4,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Start a full deal
            </Link>
          </div>
        </div>

        <p style={{ fontSize: 13, opacity: 0.55, marginTop: 40 }}>
          This guide is general information, not legal or tax advice. Rules and fees change; confirm with{' '}
          <a href={TPWD_BUY_SELL} style={link}>Texas Parks and Wildlife</a> or your county tax office before closing.
        </p>
      </article>

      <footer
        style={{
          borderTop: `2px dashed ${gold}`,
          padding: '28px 32px',
          textAlign: 'center',
          fontSize: 13,
          opacity: 0.6,
        }}
      >
        © {new Date().getFullYear()} BoatClosers · Private Vessel Transactions
      </footer>
    </div>
  )
}
