// Boat Alert boat history reports (boat-alert.com), linked through their ClickBank affiliate program.
//
// To turn on commissions: put your ClickBank ID (your ClickBank account nickname) between the quotes below.
// While it's empty, links go straight to boat-alert.com and still work, they just don't earn anything.
export const CLICKBANK_ID = ''

export const BOAT_ALERT_URL = CLICKBANK_ID
  ? `https://hop.clickbank.net/?affiliate=${encodeURIComponent(CLICKBANK_ID)}&vendor=hindecoder`
  : 'https://www.boat-alert.com'

export const BOAT_ALERT_NAME = 'Boat Alert'

/** Boat Alert's price for one report, from boat-alert.com. Update it here if they change it. */
export const BOAT_ALERT_PRICE = '$29.99'

/** What a free HIN check can tell you (shown side by side with the report). */
export const HIN_CHECK_SHOWS = ['Whether the HIN is real and formatted right', 'Who built the boat, and the model year']

/** What only a history report shows, in Boat Alert's own terms (see boat-alert.com). */
export const REPORT_SHOWS = [
  'Reported theft',
  'Accidents and storm damage',
  'Salvage and insurance total losses',
  'Past auctions and branded titles',
]

/** The hook: why a clean title isn't enough. */
export const REPORT_HOOK =
  'Most states don’t issue salvage titles for boats. A boat that sank or was totaled in a hurricane can be fixed up and sold on a clean title, and the HIN check will look perfect.'

/** Why it's worth it, from Boat Alert's own claims (boat-alert.com) and their email to us. */
export const REPORT_WHY = [
  'Searches about 90 state, federal and private databases',
  'Includes the federal NMVTIS database used by 9,000+ insurers',
  'Covers the U.S. and Canada',
  'Comes with a PDF and a share link you can send the other side',
]

/** What the report checks, in Boat Alert's own terms (see boat-alert.com). */
export const BOAT_ALERT_WHAT = 'Runs the HIN against theft, accident, salvage and total-loss records, including the federal NMVTIS database.'

/** Shown next to every Boat Alert link. Required for affiliate links. */
export const BOAT_ALERT_DISCLOSURE = 'Independent service. We may earn a commission if you buy through this link.'
