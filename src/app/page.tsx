import BoatClosersApp from '@/components/BoatClosersApp'

// Rendered on the server too, so the homepage text (headline, sections,
// buttons) is in the HTML that Google and link previews read. Signed-in
// visitors still go straight to their deal once the app loads.
export default function Page() {
  return <BoatClosersApp />
}
