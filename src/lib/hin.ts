// Boat Hull Identification Number (HIN) decoder.
// Modern format (boats built after August 1, 1984), per 33 CFR 181.25:
//   1-3   Manufacturer Identification Code (MIC)
//   4-8   Serial number
//   9     Month of production (A = Jan ... L = Dec)
//   10    Last digit of the year of production
//   11-12 Model year
// Shared by the free /hin-check page and BC Express.

export type HinStatus = 'valid' | 'older' | 'problem'

export type HinResult = {
  input: string
  hin: string
  countryCode: string | null
  status: HinStatus
  mic: string | null
  serial: string | null
  productionMonth: string | null
  productionYear: number | null
  modelYear: number | null
  stateAssigned: boolean
  problems: string[]
  notes: string[]
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function fullModelYear(twoDigits: number): number {
  const nextYear = (new Date().getFullYear() + 1) % 100
  return twoDigits <= nextYear ? 2000 + twoDigits : 1900 + twoDigits
}

export function decodeHin(input: string, expectedYear?: number): HinResult {
  let hin = (input || '').toUpperCase().replace(/[\s-]/g, '')
  let countryCode: string | null = null

  const result: HinResult = {
    input,
    hin,
    countryCode: null,
    status: 'problem',
    mic: null,
    serial: null,
    productionMonth: null,
    productionYear: null,
    modelYear: null,
    stateAssigned: false,
    problems: [],
    notes: [],
  }

  // Optional 2-letter country code in front, e.g. US-ABC12345D515
  if (hin.length === 14 && /^[A-Z]{2}/.test(hin)) {
    countryCode = hin.slice(0, 2)
    hin = hin.slice(2)
    result.hin = hin
    result.countryCode = countryCode
  }

  if (!hin) {
    result.problems.push('Enter the 12-character HIN from the transom or the title.')
    return result
  }

  if (/[^A-Z0-9]/.test(hin)) {
    result.problems.push('A HIN uses only letters and numbers.')
    return result
  }

  if (hin.length !== 12) {
    result.problems.push(
      `A HIN has 12 characters. This one has ${hin.length}. Check for a missed or extra character.`
    )
    return result
  }

  result.mic = hin.slice(0, 3)
  result.serial = hin.slice(3, 8)
  const tail = hin.slice(8)

  if (result.mic.endsWith('Z')) {
    result.stateAssigned = true
    result.notes.push(
      'A builder code ending in Z usually means the HIN was assigned by a state or the Coast Guard, not the factory. Common for homemade boats or boats that lost their original HIN. Ask the seller why.'
    )
  }

  if (/[IOQ]/.test(result.serial)) {
    result.problems.push(
      'The serial section has the letter I, O, or Q, which are not used in HINs. It may be a 1 or 0. Compare with the hull.'
    )
  }

  // Modern format: letter A-L, digit, two digits
  const modern = /^([A-L])(\d)(\d{2})$/.exec(tail)

  if (!modern) {
    if (/^[A-Z]\d{3}$/.test(tail)) {
      result.problems.push(
        `The 9th character is "${tail[0]}". In a modern HIN it must be a month letter from A to L.`
      )
    } else if (/[IOQ]/.test(tail)) {
      result.problems.push(
        'The date section has the letter I, O, or Q. It may be a 1 or 0. Compare with the hull.'
      )
    } else {
      result.status = result.problems.length ? 'problem' : 'older'
      result.notes.push(
        'This does not match the format used since August 1984. It may be an older boat with an earlier HIN format. The builder code and serial still apply, but the dates cannot be decoded automatically.'
      )
    }
    return result
  }

  const monthIndex = modern[1].charCodeAt(0) - 65
  const prodDigit = Number(modern[2])
  const modelYear = fullModelYear(Number(modern[3]))

  result.productionMonth = MONTHS[monthIndex]
  result.modelYear = modelYear

  if (modelYear % 10 === prodDigit) {
    result.productionYear = modelYear
  } else if ((modelYear - 1 + 10) % 10 === prodDigit) {
    result.productionYear = modelYear - 1
  } else {
    result.notes.push(
      `The production year digit (${prodDigit}) does not line up with model year ${modelYear}. Usually a boat is built in its model year or the year before. Worth asking the seller about.`
    )
  }

  if (modelYear < 1985) {
    result.notes.push(
      `Model year ${modelYear} is earlier than this HIN format. Double-check the last two characters.`
    )
  }

  if (expectedYear && expectedYear !== modelYear) {
    result.problems.push(
      `The HIN says model year ${modelYear}, but you entered ${expectedYear}. Check the title and listing.`
    )
  }

  result.status = result.problems.length ? 'problem' : 'valid'
  return result
}
