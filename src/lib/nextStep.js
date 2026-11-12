// What should this person do next? Worked out from the deal itself (no AI).
// Plain module: used by the Deal Assistant bar in the app and by the AI connector on the server.
const usd = (n) => "$" + Math.round(Number(n) || 0).toLocaleString("en-US");
const digits = (v) => Number(String(v ?? "").replace(/[^0-9.]/g, "")) || 0;
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());

export function nextStepFor(step, d) {
  if (!d) return null;
  const role = d.role === "seller" ? "seller" : "buyer";
  const other = role === "buyer" ? "seller" : "buyer";
  const v = d.vessel || {}, p = d.parties || {}, n = d.negotiate || {}, dd = d.ddData || {};
  const me = p[role] || {};
  const offers = Array.isArray(n.offers) ? n.offers.filter(Boolean) : [];
  const last = offers[offers.length - 1];
  if (n.dealFinalized) return { text: "This deal is finalized. Everything is saved as a permanent record you can view, print or email.", tone: "done" };

  if (step === "vessel") {
    if (role === "seller" && !d.amInitiator) return { text: "Check the details the buyer entered for your boat and fix anything that's wrong. The documents depend on it." };
    const miss = [!v.year && "year", !v.make && "make", !v.model && "model", !digits(v.askingPrice) && "asking price"].filter(Boolean);
    if (miss.length) return { text: `Add the ${miss.join(", ").replace(/, ([^,]*)$/, " and $1")} to continue.` };
    if (!v.hin) return { text: role === "buyer" ? "Add the HIN if you have it. If not, move on: the seller can add it when they join." : "Add the HIN. It goes on the bill of sale and title paperwork." };
    return { text: "The boat details look good. Next: who's buying and who's selling.", tone: "ok" };
  }
  if (step === "parties") {
    if (!me.name || !validEmail(me.email)) return { text: "Add your full legal name and email to continue." };
    if (!d.partyBJoined) return { text: `Invite the ${other} so they can join and respond. They join free.` };
    return { text: `The ${other} has joined. Next: ${role === "buyer" ? "build your offer" : "the Deal Room"}.`, tone: "ok" };
  }
  if (step === "negotiate") {
    if (!last) return role === "buyer"
      ? { text: "Build your offer below: price, deposit and what it depends on. It's free to send." }
      : { text: "Waiting on the buyer's offer. We'll email you the moment it lands." };
    const from = last.from || last.by;
    const amt = last.amount ? usd(last.amount) : "an offer";
    if (last.status === "accepted" || last.status === "agreed" || d.dealPaid) {
      if (!d.dealPaid) return d.amInitiator ? { text: `${amt} is agreed. Pay the $249 to unlock the purchase agreement and signing.` } : { text: `${amt} is agreed. Waiting on the other side to unlock signing.` };
      return { text: "Price agreed and signed. Next: due diligence, the survey and sea trial window.", tone: "ok" };
    }
    if (last.status === "declined" || last.status === "withdrawn") return { text: "The last offer is off the table. Send a new one or message the other side." };
    if (last.expiresAt && Date.now() > last.expiresAt) return { text: `The ${amt} offer expired. ${from === role ? "Send it again or revise it." : "Ask them to resend, or make your own."}` };
    if (from === role) return { text: `Waiting on the ${other} to respond to your ${amt}. We'll let you know.` };
    return { text: `The ${other} sent ${amt}. Your move: accept, counter, or ask a question.`, tone: "action" };
  }
  if (step === "diligence") {
    if (dd.outcome === "accepted" || dd.outcome === "accept") return { text: "Inspection done and accepted. Next: sign the documents.", tone: "ok" };
    if (dd.outcome === "rejected" || dd.outcome === "reject") return { text: "The boat was rejected in due diligence. The Rejection Notice records why and the deposit goes back." };
    const start = n.ddStartDate || (last && last.ddStart);
    const days = Number(n.dueDiligenceDays || (last && last.ddDays) || 0);
    if (start && days) {
      const end = new Date(start); end.setDate(end.getDate() + days);
      const left = Math.ceil((end.getTime() - Date.now()) / 86400000);
      if (left < 0) return { text: "The inspection window has ended. Record your decision so the deal can move on.", tone: "action" };
      const todo = !dd.survey ? "book the survey" : !dd.seatrial ? "schedule the sea trial" : "record your decision";
      return { text: `${left} day${left === 1 ? "" : "s"} left to inspect. Next: ${role === "buyer" ? todo : "make the boat available for the survey and sea trial"}.`, tone: left <= 2 ? "action" : undefined };
    }
    return { text: role === "buyer" ? "Book the survey and sea trial, then record your decision before the window closes." : "Make the boat available for the buyer's survey and sea trial." };
  }
  if (step === "documents") return { text: "Sign the documents marked for you. Each one opens with a short summary first." };
  if (step === "closing") return { text: role === "buyer" ? "Send the balance, take the boat, file the title, then finalize." : "Confirm the money arrived, hand over the boat and keys, sign the title, then finalize." };
  return null;
}

