// State guide for My Boat Closing outside Florida.
//
// Sources, checked November 12, 2026:
// - Which states title boats: Wisconsin DNR, "Title states and territories"
//   https://dnr.wisconsin.gov/permits/registrations/boat/BoatTitleStates.html
// - Each state's boating agency and website: NASBLA state boating contacts
//   https://www.nasbla.org/about-nasbla/boating-contacts
// The agency listed is the state's boating agency. In some states titles are
// issued by another office (the DMV, a county office); the agency's site says so.
// Florida is fully built in (forms filled in), so it is handled separately.

export const STATES_CHECKED = 'November 12, 2026'

export type StateInfo = {
  code: string
  name: string
  titles: boolean // false = registration only, no boat titles
  note?: string
  agency: string
  url: string
  // Where boats are titled or registered, when it's a different office than the boating agency.
  titleOffice?: { name: string; url: string }
}

export const STATES: StateInfo[] = [
  { code: 'AL', name: 'Alabama', titles: false, agency: 'Alabama Law Enforcement Agency, Marine Patrol', url: 'https://www.alea.gov/dps/marine-patrol' },
  { code: 'AK', name: 'Alaska', titles: true, agency: 'Alaska Office of Boating Safety', url: 'http://www.alaskaboatingsafety.org' },
  { code: 'AZ', name: 'Arizona', titles: false, agency: 'Arizona Game and Fish Department', url: 'https://www.azgfd.com/' },
  { code: 'AR', name: 'Arkansas', titles: true, agency: 'Arkansas Game and Fish Commission', url: 'https://www.agfc.com' },
  { code: 'CA', name: 'California', titles: true, agency: 'California Division of Boating and Waterways', url: 'https://dbw.parks.ca.gov/', titleOffice: { name: 'California DMV', url: 'https://www.dmv.ca.gov' } },
  { code: 'CO', name: 'Colorado', titles: false, agency: 'Colorado Parks and Wildlife', url: 'https://cpw.state.co.us/thingstodo/Pages/boat.aspx' },
  { code: 'CT', name: 'Connecticut', titles: true, agency: 'Connecticut Department of Energy and Environmental Protection', url: 'https://portal.ct.gov/deep/boating/boating-and-paddling' },
  { code: 'DE', name: 'Delaware', titles: false, agency: 'Delaware DNREC, Fish and Wildlife', url: 'https://dnrec.delaware.gov/fish-wildlife/boating/safety/' },
  { code: 'DC', name: 'District of Columbia', titles: true, agency: 'DC Metropolitan Police, Harbor Patrol', url: 'http://mpdc.dc.gov/harborpatrol' },
  { code: 'GA', name: 'Georgia', titles: true, agency: 'Georgia DNR, Law Enforcement Division', url: 'https://gadnr.org/boating' },
  { code: 'HI', name: 'Hawaii', titles: true, agency: 'Hawaii DLNR, Division of Boating and Ocean Recreation', url: 'https://dlnr.hawaii.gov/dobor/' },
  { code: 'ID', name: 'Idaho', titles: true, agency: 'Idaho Department of Parks and Recreation', url: 'http://www.parksandrecreation.idaho.gov/activities/boating' },
  { code: 'IL', name: 'Illinois', titles: true, agency: 'Illinois DNR', url: 'https://dnr.illinois.gov/boating.html' },
  { code: 'IN', name: 'Indiana', titles: true, agency: 'Indiana DNR, Law Enforcement', url: 'https://www.in.gov/dnr/law-enforcement/' },
  { code: 'IA', name: 'Iowa', titles: true, agency: 'Iowa DNR', url: 'https://www.iowadnr.gov/things-do/boating' },
  { code: 'KS', name: 'Kansas', titles: false, agency: 'Kansas Department of Wildlife and Parks', url: 'https://www.ksoutdoors.gov/outdoor-activities/boating-in-kansas' },
  { code: 'KY', name: 'Kentucky', titles: true, agency: 'Kentucky Fish and Wildlife', url: 'https://fw.ky.gov/Boat/Pages/default.aspx' },
  { code: 'LA', name: 'Louisiana', titles: true, agency: 'Louisiana Department of Wildlife and Fisheries', url: 'https://www.wlf.louisiana.gov/go-boating' },
  { code: 'ME', name: 'Maine', titles: false, agency: 'Maine Department of Inland Fisheries and Wildlife', url: 'https://www.maine.gov/ifw/fishing-boating/boating/index.html' },
  { code: 'MD', name: 'Maryland', titles: true, agency: 'Maryland DNR', url: 'https://dnr.maryland.gov/nrp/Pages/BoatingSafety/home.aspx' },
  { code: 'MA', name: 'Massachusetts', titles: true, agency: 'Massachusetts Environmental Police', url: 'https://www.mass.gov/orgs/massachusetts-environmental-police' },
  { code: 'MI', name: 'Michigan', titles: true, agency: 'Michigan DNR', url: 'https://www.michigan.gov/dnr/things-to-do/boating' },
  { code: 'MN', name: 'Minnesota', titles: true, agency: 'Minnesota DNR', url: 'http://www.dnr.state.mn.us/boating/index.html' },
  { code: 'MS', name: 'Mississippi', titles: true, note: 'Titling a boat is optional in Mississippi.', agency: 'Mississippi Department of Wildlife, Fisheries and Parks', url: 'https://www.mdwfp.com/' },
  { code: 'MO', name: 'Missouri', titles: true, agency: 'Missouri State Highway Patrol, Water Patrol', url: 'http://www.mshp.dps.mo.gov/MSHPWeb/WaterPatrol/index.html' },
  { code: 'MT', name: 'Montana', titles: true, agency: 'Montana Fish, Wildlife and Parks', url: 'https://fwp.mt.gov/activities/boating' },
  { code: 'NE', name: 'Nebraska', titles: true, agency: 'Nebraska Game and Parks Commission', url: 'http://outdoornebraska.gov/boating/' },
  { code: 'NV', name: 'Nevada', titles: true, agency: 'Nevada Department of Wildlife', url: 'http://www.ndow.org/boat' },
  { code: 'NH', name: 'New Hampshire', titles: false, agency: 'New Hampshire State Police, Marine Patrol', url: 'https://www.nhsp.dos.nh.gov/our-services/field-operations-bureau/marine-patrol' },
  { code: 'NJ', name: 'New Jersey', titles: true, agency: 'New Jersey State Police, Marine Services', url: 'https://njsp.njoag.gov/marine-services/' },
  { code: 'NM', name: 'New Mexico', titles: true, agency: 'New Mexico State Parks', url: 'https://www.emnrd.nm.gov/spd/activities/boating-2/' },
  { code: 'NY', name: 'New York', titles: true, agency: 'New York State Parks, Marine Services', url: 'https://parks.ny.gov/activities/boating', titleOffice: { name: 'New York DMV', url: 'https://dmv.ny.gov' } },
  { code: 'NC', name: 'North Carolina', titles: true, agency: 'North Carolina Wildlife Resources Commission', url: 'https://www.ncwildlife.gov/boating' },
  { code: 'ND', name: 'North Dakota', titles: false, agency: 'North Dakota Game and Fish Department', url: 'https://gf.nd.gov/education/boating' },
  { code: 'OH', name: 'Ohio', titles: true, agency: 'Ohio DNR, Parks and Watercraft', url: 'https://ohiodnr.gov/go-and-do/outdoor/boating-paddling' },
  { code: 'OK', name: 'Oklahoma', titles: true, agency: 'Oklahoma Highway Patrol', url: 'https://oklahoma.gov/dps/programs-services/boated.html' },
  { code: 'OR', name: 'Oregon', titles: true, agency: 'Oregon State Marine Board', url: 'https://www.oregon.gov/osmb/pages/index.aspx' },
  { code: 'PA', name: 'Pennsylvania', titles: true, agency: 'Pennsylvania Fish and Boat Commission', url: 'https://www.pa.gov/agencies/fishandboat/boating' },
  { code: 'RI', name: 'Rhode Island', titles: true, agency: 'Rhode Island Department of Environmental Management', url: 'http://www.dem.ri.gov' },
  { code: 'SC', name: 'South Carolina', titles: true, agency: 'South Carolina DNR', url: 'https://www.dnr.sc.gov/boating.html' },
  { code: 'SD', name: 'South Dakota', titles: true, agency: 'South Dakota Game, Fish and Parks', url: 'https://gfp.sd.gov/boating/' },
  { code: 'TN', name: 'Tennessee', titles: false, agency: 'Tennessee Wildlife Resources Agency', url: 'https://www.tn.gov/content/tn/twra/boating/boating-education.html' },
  { code: 'TX', name: 'Texas', titles: true, agency: 'Texas Parks and Wildlife Department', url: 'https://tpwd.texas.gov/fishboat/boat/' },
  { code: 'UT', name: 'Utah', titles: true, agency: 'Utah Division of Outdoor Recreation', url: 'https://recreation.utah.gov/boating/' },
  { code: 'VT', name: 'Vermont', titles: true, agency: 'Vermont State Police, Marine Division', url: 'https://dps.vermont.gov/' },
  { code: 'VA', name: 'Virginia', titles: true, agency: 'Virginia Department of Wildlife Resources', url: 'https://dwr.virginia.gov/boating/' },
  { code: 'WA', name: 'Washington', titles: true, agency: 'Washington State Parks, Boating Programs', url: 'https://parks.wa.gov/find-activity/activity-search/boating' },
  { code: 'WV', name: 'West Virginia', titles: true, agency: 'West Virginia Division of Natural Resources', url: 'https://wvdnr.gov/' },
  { code: 'WI', name: 'Wisconsin', titles: true, agency: 'Wisconsin DNR', url: 'http://dnr.wi.gov/topic/boat/' },
  { code: 'WY', name: 'Wyoming', titles: true, agency: 'Wyoming Game and Fish Department', url: 'https://wgfd.wyo.gov/fishing-boating/boating-watercraft' },
]

export const STATE_NAMES: Record<string, string> = Object.fromEntries([['FL', 'Florida'], ...STATES.map((s) => [s.code, s.name])])

export const ALL_STATE_CODES = Object.keys(STATE_NAMES).sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]))

export function stateInfo(code?: string | null): StateInfo | null {
  return STATES.find((s) => s.code === code) || null
}

export const isFlorida = (code?: string | null) => !code || code === 'FL'
