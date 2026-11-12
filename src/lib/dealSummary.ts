// A plain-words summary of a deal, for the Deal Assistant and the AI connector.
// No emails, phone numbers or addresses are included.

export const STEP_LABEL: Record<string, string> = {
  vessel: 'Step 1, Vessel details', parties: 'Step 2, Buyer and seller', negotiate: 'Step 3, Deal Room (offers and terms)',
  diligence: 'Step 4, Due diligence', documents: 'Step 5, Documents and signing', closing: 'Step 6, Closing',
}
export const ESCROW_LABEL: Record<string, string> = {
  escrow_com: 'Escrow.com', sea_yachts: 'Sea Yachts LLC (licensed Florida yacht brokerage, owned by the BoatClosers founder)', attorney: 'an attorney or title company',
  brokerage: 'a licensed broker trust account', direct: 'straight to the seller', custom: 'a custom arrangement', none: 'no deposit',
}

export function trim(s: any, n: number) { return String(s ?? '').slice(0, n) }
export function money(n: any) { const x = Number(String(n ?? '').replace(/[^0-9.]/g, '')); return x ? '$' + Math.round(x).toLocaleString('en-US') : '' }

export function dealContext(deal: any, live: any, role: string, step: string) {
  const v = { ...(deal?.vessel || {}), ...(live?.vessel || {}) }
  const n = { ...(deal?.negotiate || {}), ...(live?.negotiate || {}) }
  const dd = deal?.dd_data || {}
  const docs = deal?.docs_data || {}
  const p = deal?.parties || {}
  const other = role === 'buyer' ? 'seller' : 'buyer'
  const lines: string[] = []
  lines.push(`The person asking is the ${role.toUpperCase()}.${live?.amInitiator === false ? ' They were invited to this deal by the other side.' : ' They started this deal.'}`)
  lines.push(`They are on: ${STEP_LABEL[step] || step}.`)
  const boat = [v.year, v.make, v.model].filter(Boolean).join(' ')
  lines.push(`Boat: ${boat || 'not entered yet'}${v.loa ? `, ${v.loa} ft` : ''}${v.engineMake ? `, ${v.engineCount || 1}x ${v.engineMake} ${v.engineModel || ''}`.trimEnd() : ''}${v.engineHours ? `, ${v.engineHours} engine hours` : ''}.`)
  lines.push(`Asking price: ${money(v.askingPrice) || 'not entered'}. HIN: ${v.hin ? 'entered' : 'not entered'}. Title: ${v.isDocumented === 'yes' ? 'Coast Guard documented' : v.isDocumented === 'no' ? 'state titled' : 'not sure yet'}. Listed with a broker: ${v.brokerListed || 'not answered'}. Trailer: ${v.trailerIncluded === 'yes' ? 'included' : 'no'}. Location: ${trim(v.location, 60) || 'not entered'}.`)
  const myName = trim(p?.[role]?.name, 60), otherName = trim(p?.[other]?.name, 60)
  lines.push(`Names: ${role} ${myName || '(not entered)'}; ${other} ${otherName || '(not entered)'}. The ${other} has ${live?.partyBJoined || deal?.party_b_user_id ? 'joined' : 'NOT joined yet'}.`)
  const offers = Array.isArray(n.offers) ? n.offers.filter(Boolean).slice(-6) : []
  if (offers.length) {
    lines.push('Offer history (oldest to newest):')
    for (const o of offers) {
      const parts = [
        `${o.from || o.by || '?'} offered ${money(o.amount) || '?'}`,
        o.escrowPct ? `deposit ${o.escrowPct}%${o.deposit ? ` (${money(o.deposit)})` : ''} held by ${ESCROW_LABEL[o.escrowPath] || o.escrowPath || 'not chosen'}` : 'no deposit',
        o.cashWaived ? 'no contingencies (as-is)' : (Array.isArray(o.contingencies) && o.contingencies.length ? 'contingent on ' + o.contingencies.join(', ') : ''),
        o.ddDays ? `${o.ddDays}-day inspection` : '', o.closingDate ? `closing ${o.closingDate}` : '',
        `status ${o.status || 'pending'}`,
        o.expiresAt ? (Date.now() > Number(o.expiresAt) ? 'EXPIRED' : `expires ${new Date(Number(o.expiresAt)).toISOString().slice(0, 16).replace('T', ' ')} UTC`) : '',
      ].filter(Boolean)
      lines.push('- ' + parts.join('; '))
    }
  } else {
    lines.push('No offers sent yet.')
    if (n.currentOffer) lines.push(`Offer being drafted: ${money(n.currentOffer)}${n.escrowPct && n.escrowPct !== '0' ? `, ${n.escrowPct}% deposit via ${ESCROW_LABEL[n.escrowPath] || 'not chosen'}` : ''}.`)
  }
  if (n.agreedPrice) lines.push(`Agreed price: ${money(n.agreedPrice)}.`)
  lines.push(`$249 paid / signing unlocked: ${n.paid || n.dealLocked || live?.dealPaid ? 'yes' : 'no'}.`)
  if (n.sellerHasLien) lines.push(`Loan on the boat: ${n.sellerHasLien}.`)
  if (n.ddStartDate || n.dueDiligenceDays) lines.push(`Due diligence: starts ${n.ddStartDate || 'not set'}, ${n.dueDiligenceDays || '?'} days.`)
  const ddDone = ['survey', 'seatrial', 'title', 'insurance', 'engines', 'electronics'].filter((k) => dd[k])
  if (ddDone.length || dd.outcome) lines.push(`Due diligence checklist done: ${ddDone.join(', ') || 'nothing yet'}. Decision: ${dd.outcome || 'not made'}.`)
  const signed = docs?.signedDocs ? Object.keys(docs.signedDocs).length : 0
  if (signed) lines.push(`Documents signed so far: ${signed}.`)
  if (n.dealFinalized) lines.push('The deal is FINALIZED (sealed, read-only).')
  lines.push(`Today is ${new Date().toISOString().slice(0, 10)}.`)
  return lines.join('\n')
}

