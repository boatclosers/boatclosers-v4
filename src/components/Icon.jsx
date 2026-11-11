// Line icons matching the landing page (thin stroke, round caps), plus a helper
// that swaps the app's old emoji for these icons wherever text is rendered.
// The icon takes the surrounding text's size and color.
import React from "react";

const P = {
  bulb: <><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3z"/></>,
  compass: <><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
  clipboard: <><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/></>,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z"/>,
  alert: <><path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.01"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
  pen: <><path d="M3 21l3-1 11-11a2 2 0 0 0-3-3L3 17z"/><path d="M14 5l3 3"/></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>,
  checkCircle: <><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></>,
  square: <rect x="4" y="4" width="16" height="16" rx="3"/>,
  anchor: <><circle cx="12" cy="5" r="2"/><path d="M12 7v14M8 10h8M5 13a7 7 0 0 0 14 0"/></>,
  person: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  inbox: <><path d="M3 13h5l1 3h6l1-3h5"/><path d="M5 5h14l2 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/></>,
  doc: <><path d="M9 3h6l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M15 3v4h4M9 13h6M9 17h4"/></>,
  cash: <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
  shield: <><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/></>,
  bank: <><path d="M3 10h18M12 3l9 5H3z"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18"/></>,
  ban: <><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></>,
  send: <><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></>,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"/>,
  flag: <path d="M5 21V4h10l-1 4h6l-2 6H5"/>,
  scale: <><path d="M12 3v18M8 21h8M5 7h14"/><path d="M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/></>,
  boat: <><path d="M3 16l2 4h14l2-4z"/><path d="M12 3v13M12 4l6 9h-6"/></>,
  printer: <><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/></>,
  clip: <path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></>,
  oil: <><path d="M6 5h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M6 9h12M9 3h6"/></>,
  wrench: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>,
  chart: <path d="M3 3v18h18M7 15l4-4 3 3 5-6"/>,
  save: <><path d="M5 3h11l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M7 3v5h8M7 21v-7h10v7"/></>,
  box: <><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14-5L4 8"/><path d="M4 4v4h4M4 13a8 8 0 0 0 14 5l2-2M20 20v-4h-4"/></>,
  cart: <><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11L21 7H6"/></>,
  handshake: <><path d="M3 12l4-4 3 2 4-3 7 5"/><path d="M7 14l3 3 2-1 2 2 3-3"/></>,
};

export function Icon({ name, size = "1.05em", style }) {
  const p = P[name];
  if (!p) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
      style={{ display: "inline-block", verticalAlign: "-0.17em", flexShrink: 0, ...style }}>
      {p}
    </svg>
  );
}

// Emoji → icon name. Longest sequences first so "🧑‍💼" wins over "🧑".
const MAP = [
  ["🧑‍💼", "person"], ["💡", "bulb"], ["🧭", "compass"], ["🔒", "lock"], ["🔐", "lock"], ["👁", "eye"],
  ["📋", "clipboard"], ["⚡", "bolt"], ["⚠", "alert"], ["📩", "mail"], ["📧", "mail"], ["📨", "send"],
  ["📤", "send"], ["✍", "pen"], ["✏", "pen"], ["✋", "pen"], ["📝", "doc"], ["💳", "card"], ["🎉", "checkCircle"],
  ["✅", "checkCircle"], ["⬜", "square"], ["🤝", "handshake"], ["⚓", "anchor"], ["🧑", "person"], ["👤", "person"],
  ["💼", "person"], ["📭", "inbox"], ["📄", "doc"], ["📜", "doc"], ["💵", "cash"], ["💰", "cash"],
  ["📅", "calendar"], ["🛡", "shield"], ["🏦", "bank"], ["🏛", "bank"], ["🚫", "ban"], ["💬", "chat"],
  ["⚑", "flag"], ["⚖", "scale"], ["🛥", "boat"], ["⛵", "boat"], ["🖨", "printer"], ["📎", "clip"],
  ["🔍", "search"], ["🔎", "search"], ["🛢", "oil"], ["🔧", "wrench"], ["📈", "chart"], ["💾", "save"],
  ["📦", "box"], ["🔄", "refresh"], ["🛒", "cart"],
];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const RE = new RegExp("(" + MAP.map(([e]) => esc(e)).join("|") + ")️?", "gu");
const NAME = Object.fromEntries(MAP);

// Turn a string that may contain the old emoji into text + icons. Anything that
// isn't a string (already an element, a number) passes through unchanged.
export function emo(value) {
  if (typeof value !== "string" || !RE.test(value)) { RE.lastIndex = 0; return value; }
  RE.lastIndex = 0;
  const out = [];
  let last = 0, m, k = 0;
  while ((m = RE.exec(value))) {
    if (m.index > last) out.push(value.slice(last, m.index));
    out.push(<Icon key={"i" + k++} name={NAME[m[1]]} />);
    last = m.index + m[0].length;
    // a single space after an icon reads better as a small gap
  }
  if (last < value.length) out.push(value.slice(last));
  return out;
}
