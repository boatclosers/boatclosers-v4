// Server-only: the paid BoatClosers Express inspection. Kept out of the client bundle on
// purpose: the deal API sends the full list only to paid deals, and a short
// preview to unpaid ones.

import type { InspectItem, ItemKey, InspectionProgress } from '@/lib/express/content'

export const INSPECTION_SECTIONS = ['Paperwork', 'Hull and deck', 'Engine', 'Boat systems', 'Sea trial', 'Motor', 'Trailer'] as const

export const INSPECTION: InspectItem[] = [
  // Paperwork
  { id: 'w-hin', section: 'Paperwork', only: 'boat', redFlag: true, label: 'HIN on the transom matches the title exactly', detail: 'Every character. A sanded, riveted-over, or stick-on HIN is a reason to walk away.' },
  { id: 'w-name', section: 'Paperwork', redFlag: true, label: 'The seller’s photo ID matches the name on the title', detail: 'If someone is selling “for a friend” or “for my uncle,” stop until the owner is there or has signed a power of attorney.' },
  { id: 'w-brand', section: 'Paperwork', only: 'boat', redFlag: true, label: 'Title isn’t branded salvage, rebuilt, or junk', detail: 'A branded title means an insurer once wrote the boat off. It lowers the value and can make insurance hard to get.' },
  { id: 'w-reg', section: 'Paperwork', only: 'boat', label: 'Registration numbers on the bow match the registration card', detail: 'Mismatched numbers can mean the paperwork belongs to a different boat.' },
  { id: 'w-records', section: 'Paperwork', label: 'Service records and receipts are available', detail: 'No records doesn’t mean a bad boat, but it means you’re trusting what you see today.' },

  // Hull and deck
  { id: 'w-hull', section: 'Hull and deck', only: 'boat', label: 'Hull and deck: no cracks, soft spots, or fresh patches', detail: 'Press on the deck, around the console, and near the transom. Soft or spongy spots can mean water in the core.' },
  { id: 'w-bottom', section: 'Hull and deck', only: 'boat', label: 'Bottom: no blisters, gouges, or impact damage', detail: 'Easiest with the boat on the trailer. Look along the keel, the chines, and the bow where it meets the trailer.' },
  { id: 'w-stress', section: 'Hull and deck', only: 'boat', label: 'No spider-web stress cracks in the gelcoat', detail: 'Look around cleats, rails, and the console base. A few are cosmetic. Many in one area can mean the structure flexes.' },
  { id: 'w-transom', section: 'Hull and deck', only: 'boat', redFlag: true, label: 'Transom is solid where the motor mounts', detail: 'Push and pull hard on the lower unit. The transom shouldn’t flex, crack, or move. A wet transom is one of the costliest repairs on a small boat.' },
  { id: 'w-hardware', section: 'Hull and deck', only: 'boat', label: 'Cleats, rails, and hinges are tight, with no rust stains or leaks around them', detail: 'Loose hardware lets water into the deck core.' },
  { id: 'w-throughhull', section: 'Hull and deck', only: 'boat', label: 'Drain plug, scuppers, and through-hull fittings are intact', detail: 'Cracked or corroded fittings below the waterline can sink a boat at the dock.' },

  // Engine (boat with an engine)
  { id: 'w-cold', section: 'Engine', only: 'boat', label: 'Engine starts cold and idles smoothly', detail: 'Ask the seller not to run it before you arrive. A warm engine can hide hard starting.' },
  { id: 'w-hours', section: 'Engine', only: 'boat', label: 'Engine hours match what you were told', detail: 'Write the hours in the box at the bottom. They go on your condition report.' },
  { id: 'w-telltale', section: 'Engine', only: 'boat', label: 'Strong water stream from the telltale or exhaust', detail: 'A weak stream can mean a worn water pump impeller or blocked cooling passages.' },
  { id: 'w-gearcase', section: 'Engine', only: 'boat', label: 'Lower unit oil looks clean, not milky', detail: 'Milky oil means water got into the gearcase. Ask to crack the drain screw, or have a mechanic check it.' },
  { id: 'w-oil', section: 'Engine', only: 'boat', label: 'No oil, fuel, or coolant leaks, and no strong fuel smell', detail: 'Check under the engine cover and in the bilge. A fuel smell is a safety issue as well as a repair.' },
  { id: 'w-belts', section: 'Engine', only: 'boat', label: 'Belts, hoses, and wiring look in good shape, not cracked or corroded' },
  { id: 'w-compression', section: 'Engine', only: 'boat', label: 'Ask for a compression test or a recent mechanic’s report', detail: 'Uneven compression across cylinders points to internal wear. A mechanic can do this for around $100 to $200.' },

  // Boat systems
  { id: 'w-bilge', section: 'Boat systems', only: 'boat', label: 'Bilge is dry and the pump works', detail: 'Oil, fuel, or standing water in the bilge is a warning sign. Flip the pump switch and listen.' },
  { id: 'w-battery', section: 'Boat systems', only: 'boat', label: 'Battery holds a charge and terminals are clean', detail: 'Look for a date sticker. Marine batteries usually last 3 to 5 years.' },
  { id: 'w-electric', section: 'Boat systems', only: 'boat', label: 'Navigation lights, horn, gauges, and electronics work' },
  { id: 'w-trim', section: 'Boat systems', only: 'boat', label: 'Power trim and tilt run all the way up and down' },
  { id: 'w-steering', section: 'Boat systems', only: 'boat', label: 'Steering turns smoothly from lock to lock', detail: 'Stiff or jerky steering can mean a worn cable or low hydraulic fluid.' },
  { id: 'w-safety', section: 'Boat systems', only: 'boat', label: 'Required safety gear is aboard', detail: 'Life jackets for everyone, a throwable device, a fire extinguisher, and signals as required for the boat’s size.' },

  // Sea trial
  { id: 'w-trial', section: 'Sea trial', only: 'boat', label: 'You ran it on the water', detail: 'If the seller won’t allow a sea trial, ask yourself why. Mark this “Problem” if you couldn’t do one.' },
  { id: 'w-wot', section: 'Sea trial', only: 'boat', label: 'Reaches full throttle without smoke, stalling, or alarms', detail: 'It should get up on plane without struggling.' },
  { id: 'w-shift', section: 'Sea trial', only: 'boat', label: 'Shifts cleanly into forward, neutral, and reverse' },
  { id: 'w-vibration', section: 'Sea trial', only: 'boat', label: 'No heavy vibration and no water coming aboard', detail: 'Check the bilge again after the run.' },
  { id: 'w-temp', section: 'Sea trial', only: 'boat', label: 'Doesn’t overheat after 15 minutes of running' },

  // Motor bought on its own
  { id: 'w-serial', section: 'Motor', only: 'motor', redFlag: true, label: 'Motor serial plate is present and matches what you were told', detail: 'It’s on the transom bracket. A missing or damaged plate is a red flag for a stolen motor.' },
  { id: 'w-mcold', section: 'Motor', only: 'motor', label: 'Motor starts cold and idles smoothly', detail: 'Ask the seller not to run it before you arrive.' },
  { id: 'w-mtelltale', section: 'Motor', only: 'motor', label: 'Strong water stream from the telltale', detail: 'Run it on a hose kit or in a test tank. A weak stream can mean a worn impeller.' },
  { id: 'w-mgearcase', section: 'Motor', only: 'motor', label: 'Lower unit oil looks clean, not milky', detail: 'Milky oil means water got into the gearcase, often a costly repair.' },
  { id: 'w-mcompression', section: 'Motor', only: 'motor', label: 'Compression is even across cylinders, or you have the hours and service records' },
  { id: 'w-prop', section: 'Motor', only: 'motor', label: 'Prop has no big dings and the shaft isn’t bent', detail: 'Spin the prop and watch the shaft. Any wobble means a bent shaft.' },
  { id: 'w-corrosion', section: 'Motor', only: 'motor', label: 'No heavy corrosion on the lower unit or around bolts', detail: 'Heavy white powder or pitting usually means saltwater use without flushing.' },

  // Trailer
  { id: 'w-tvin', section: 'Trailer', only: 'trailer', redFlag: true, label: 'Trailer VIN matches its title or registration', detail: 'Usually stamped on the tongue or a plate on the frame.' },
  { id: 'w-tires', section: 'Trailer', only: 'trailer', label: 'Tires have tread, no cracks, and aren’t too old', detail: 'The 4-digit date code on the sidewall shows week and year. Over 6 years old is due for replacement, whatever the tread.' },
  { id: 'w-bearings', section: 'Trailer', only: 'trailer', label: 'Wheel bearings aren’t loose or grinding', detail: 'Lift each wheel and rock it. It shouldn’t wobble. Feel the hubs after a short drive; very hot hubs mean trouble.' },
  { id: 'w-tlights', section: 'Trailer', only: 'trailer', label: 'Lights and brakes work when hooked up' },
  { id: 'w-frame', section: 'Trailer', only: 'trailer', label: 'Frame and axle are free of heavy rust or bends', detail: 'Check inside the frame rails, where salt water sits.' },
  { id: 'w-winch', section: 'Trailer', only: 'trailer', label: 'Winch, strap, bunks or rollers, and safety chains are in good shape' },
  { id: 'w-coupler', section: 'Trailer', only: 'trailer', label: 'Coupler latches tight on the ball and the jack works' },
]

const IDS = new Set(INSPECTION.map((i) => i.id))
export function isInspectionId(id: string) {
  return IDS.has(id)
}

export function inspectionFor(has: Record<ItemKey, boolean>): InspectItem[] {
  // Engine, systems, and sea-trial items assume the boat has an engine; a motor
  // bought separately gets its own section. When the motor is listed as its own
  // item, its section replaces the overlapping engine checks.
  const overlap = new Set(['w-cold', 'w-telltale', 'w-gearcase', 'w-compression'])
  return INSPECTION.filter((i) => (!i.only || has[i.only]) && !(has.motor && overlap.has(i.id)))
}

// What an unpaid buyer sees: the size of the inspection and a few sample items.
export function inspectionPreview(has: Record<ItemKey, boolean>) {
  const list = inspectionFor(has)
  const sections = Array.from(new Set(list.map((i) => i.section)))
  return {
    count: list.length,
    redFlags: list.filter((i) => i.redFlag).length,
    sections,
    sample: list.filter((i) => !i.redFlag).slice(1, 4).map((i) => i.label),
  }
}

export function cleanInspection(prev: InspectionProgress | undefined, body: any): InspectionProgress {
  const out: InspectionProgress = { items: { ...(prev?.items || {}) }, hours: prev?.hours, notes: prev?.notes }
  const incoming = body?.items && typeof body.items === 'object' ? body.items : {}
  for (const [id, v] of Object.entries<any>(incoming)) {
    if (!isInspectionId(id)) continue
    if (v === null) {
      delete out.items[id]
      continue
    }
    const s = ['ok', 'issue', 'skip'].includes(v?.s) ? v.s : undefined
    const note = typeof v?.note === 'string' ? v.note.slice(0, 400) : undefined
    if (!s && !note) {
      delete out.items[id]
      continue
    }
    out.items[id] = { ...(s ? { s } : {}), ...(note ? { note } : {}) }
  }
  if (typeof body?.hours === 'string') out.hours = body.hours.replace(/[^0-9.,]/g, '').slice(0, 10) || undefined
  if (typeof body?.notes === 'string') out.notes = body.notes.slice(0, 1500) || undefined
  return out
}
