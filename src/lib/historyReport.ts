// Boat History Report (boathistoryreport.com): the boat history report we recommend across the suite.
// A plain, followed link. We are not paid for it. All wording comes from boathistoryreport.com; update it here.

export const HISTORY_REPORT_NAME = 'Boat History Report'
export const HISTORY_REPORT_URL = 'https://www.boathistoryreport.com'

/** What a free HIN check can tell you (shown side by side with the report). */
export const HIN_CHECK_SHOWS = ['Whether the HIN is real and formatted right', 'Who built the boat, and the model year']

/** What the report checks for, from boathistoryreport.com. */
export const REPORT_SHOWS = [
  'Accidents, fire and hurricane damage',
  'Theft',
  'Sinking, submerged and run aground',
  'Total losses',
  'Title and registration history',
]

/** The hook: why a clean title isn't enough. */
export const REPORT_HOOK =
  'Most states don’t issue salvage titles for boats. A boat that sank or was totaled in a hurricane can be fixed up and sold on a clean title, and the HIN check will look perfect.'

/** Why Boat History Report, from their own site. */
export const REPORT_WHY = [
  'The only boat history service that partners with the National Insurance Crime Bureau (NICB), per Boat History Report',
  'Searches by HIN, state registration number or Coast Guard documentation number',
  'Also checks recalls and warranties',
  'Every report includes a 1-year BoatUS membership',
  '100% satisfaction guaranteed',
]

/** One line for short spots (guides, help pages, llms.txt). */
export const REPORT_WHAT =
  'Runs a boat’s HIN, state registration or Coast Guard number for accidents, hurricane and fire damage, theft, sinking, total losses, and title and registration history.'

/** Shown next to every link. */
export const REPORT_DISCLOSURE = 'Independent service. We recommend it because it’s good; we aren’t paid for it.'

/** Their logo. Leave empty until Boat History Report sends the file and OKs using it;
 *  then drop it in /public/partners/ and put the path here, e.g. '/partners/boat-history-report.png'. */
export const HISTORY_REPORT_LOGO = ''
