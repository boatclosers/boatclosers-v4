import BoatClosersApp from '@/components/BoatClosersApp'
import { organization, boatClosersApp, jsonLd } from '@/lib/structured-data'

// Rendered on the server too, so the homepage text (headline, sections,
// buttons) is in the HTML that Google and link previews read. Signed-in
// visitors still go straight to their deal once the app loads.
// The JSON-LD block is invisible: it tells search engines and AI answer
// engines what BoatClosers is, what it costs and who makes it.
export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organization, boatClosersApp) }}
      />
      <BoatClosersApp />
    </>
  )
}
