// Boat Alert boat history reports (boat-alert.com), linked through their ClickBank affiliate program.
//
// To turn on commissions: put your ClickBank ID (your ClickBank account nickname) between the quotes below.
// While it's empty, links go straight to boat-alert.com and still work, they just don't earn anything.
export const CLICKBANK_ID = ''

export const BOAT_ALERT_URL = CLICKBANK_ID
  ? `https://hop.clickbank.net/?affiliate=${encodeURIComponent(CLICKBANK_ID)}&vendor=hindecoder`
  : 'https://www.boat-alert.com'

export const BOAT_ALERT_NAME = 'Boat Alert'

/** What the report checks, in Boat Alert's own terms (see boat-alert.com). */
export const BOAT_ALERT_WHAT = 'Runs the HIN against theft, accident, salvage and total-loss records, including the federal NMVTIS database.'

/** Shown next to every Boat Alert link. Required for affiliate links. */
export const BOAT_ALERT_DISCLOSURE = 'Independent service. We may earn a commission if you buy through this link.'
