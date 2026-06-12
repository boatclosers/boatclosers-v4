'use client'

// ═══════════════════════════════════════════════════════════════════════════
// BOATCLOSERS — VESSEL LOOKUP / TITLE-HISTORY RESOURCE
// src/components/VesselLookup.jsx
//
// A self-contained resource panel that shows a buyer how to verify a vessel's
// documentation and pull its title/lien history before money changes hands.
// Leads with the FREE official Coast Guard search and the OFFICIAL NVDC abstract;
// notes third-party paid services; includes a clear non-affiliation disclaimer.
//
// Drop-in: add this file, import it, render <VesselLookup /> wherever you want
// it (recommended: the Due Diligence step). No props required.
// ═══════════════════════════════════════════════════════════════════════════

const C = {
  navy:"#08152e", teal:"#0e6b7c", tealLight:"#e4f4f7", brass:"#b8863a",
  sand:"#f5f0e8", sandDark:"#ede6d8", white:"#ffffff", slate:"#3d5166",
  mist:"#d9d2c5", green:"#1a5c35", greenLight:"#e4f0ea",
};

const LINKS = [
  {
    rank: "Free · Official",
    color: C.green, bg: C.greenLight,
    icon: "🔎",
    title: "U.S. Coast Guard Vessel Search (CGMIX / PSIX)",
    desc: "The Coast Guard's free public database. Search by vessel name, HIN, or Official Number to confirm documentation status, dimensions, tonnage, and the current Certificate of Documentation. Owner names and addresses are not shown (removed from public access in 2018).",
    btn: "Open Coast Guard Search →",
    url: "https://cgmix.uscg.mil/psix/psixsearch.aspx",
  },
  {
    rank: "Official · Small Fee",
    color: C.teal, bg: C.tealLight,
    icon: "📜",
    title: "USCG Abstract of Title (Full Ownership + Liens)",
    desc: "For documented vessels, the National Vessel Documentation Center (NVDC) issues the official Abstract of Title — the managing owner, complete ownership chain, and every recorded lien or mortgage. This is the definitive lien check. Request it directly from the Coast Guard using form CG-7043; small fee, typically 2–3 business days.",
    btn: "Request from the NVDC →",
    url: "https://www.dco.uscg.mil/Our-Organization/Deputy-for-Operations-Policy-and-Capabilities-DCO-D/National-Vessel-Documentation-Center/",
  },
  {
    rank: "Third-Party · Paid",
    color: C.brass, bg: "#fff9ee",
    icon: "🏢",
    title: "Private Document-Prep Services (Optional)",
    desc: "Private companies will obtain the abstract for you for a service fee (around $75). They are not government agencies, and you can get the same official document directly from the Coast Guard, usually for less. One example is linked here for convenience only.",
    btn: "Example third-party service →",
    url: "https://unitedstatesvessel.us/abstract-of-title/",
  },
];

export default function VesselLookup() {
  return (
    <div style={{ background:C.white, border:`0.5px solid ${C.mist}`, borderRadius:8, padding:"1.25rem", marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
        <span style={{ fontSize:18 }}>⚓</span>
        <h3 style={{ fontSize:15, fontWeight:700, color:C.navy, fontFamily:"sans-serif", margin:0 }}>
          Verify the Vessel — Title History &amp; Lien Check
        </h3>
      </div>
      <p style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.65, margin:"0 0 14px" }}>
        Before money changes hands, confirm the boat is documented as the seller claims and carries no hidden liens.
        You can check this yourself — here's how, starting with the free official source.
      </p>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {LINKS.map((l) => (
          <div key={l.title} style={{ border:`1px solid ${C.mist}`, borderRadius:7, padding:"12px 14px", background:l.bg }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                  <span style={{ fontSize:15 }}>{l.icon}</span>
                  <span style={{ fontSize:9, fontFamily:"sans-serif", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:l.color, background:C.white, padding:"2px 8px", borderRadius:20, border:`1px solid ${l.color}` }}>{l.rank}</span>
                </div>
                <div style={{ fontSize:13, fontFamily:"sans-serif", fontWeight:700, color:C.navy, marginBottom:3 }}>{l.title}</div>
                <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>{l.desc}</div>
              </div>
            </div>
            <a href={l.url} target="_blank" rel="noopener noreferrer"
               style={{ display:"inline-block", marginTop:10, background:l.color, color:"#fff", borderRadius:5, padding:"7px 16px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, textDecoration:"none" }}>
              {l.btn}
            </a>
          </div>
        ))}
      </div>

      <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginTop:12, padding:"8px 12px", background:C.sandDark, borderRadius:6 }}>
        <strong>State-titled (non-documented) boats:</strong> run the HIN and request the title and lien record from
        your state's titling agency (DMV/DNR) — that's the equivalent of the Coast Guard abstract for boats that
        aren't federally documented.
      </div>

      <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, lineHeight:1.65, marginTop:12, padding:"10px 12px", border:`1px solid ${C.mist}`, borderRadius:6, background:C.white }}>
        <strong style={{ color:C.navy }}>Disclaimer:</strong> BoatClosers is not affiliated with, endorsed by, or
        connected to the U.S. Coast Guard, the National Vessel Documentation Center, CGMIX/PSIX, or any third-party
        service listed above. These links are provided for your convenience only. BoatClosers does not perform title
        searches, does not access these records on your behalf, and does not guarantee any vessel's title or lien
        status. Always verify through official government sources.
      </div>
    </div>
  );
}
