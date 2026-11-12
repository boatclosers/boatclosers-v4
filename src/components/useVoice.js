'use client'
// Voice answers, shared by guided mode and the Deal Assistant.
import { useState, useEffect, useRef } from "react";

// ── Voice answers (Chrome, Edge, Safari). The mic button only appears where the
// browser supports it, so nobody taps a button that can't work.
export function useVoice() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState("");
  const recRef = useRef(null);
  useEffect(() => {
    try { setSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition)); } catch (e) {}
    return () => { try { recRef.current && recRef.current.abort(); } catch (e) {} };
  }, []);
  const start = (onText) => {
    let SR = null;
    try { SR = window.SpeechRecognition || window.webkitSpeechRecognition; } catch (e) {}
    if (!SR) return;
    try {
      const r = new SR();
      recRef.current = r;
      r.lang = "en-US"; r.interimResults = false; r.maxAlternatives = 1;
      r.onresult = (e) => {
        const t = e?.results?.[0]?.[0]?.transcript || "";
        if (t) onText(t.trim());
      };
      r.onerror = (e) => {
        setListening(false);
        setNote(e?.error === "not-allowed" ? "Microphone is blocked. Allow it in your browser, or type your answer." : "Didn't catch that. Try again or type it.");
      };
      r.onend = () => setListening(false);
      setNote(""); setListening(true);
      r.start();
    } catch (e) { setListening(false); }
  };
  const stop = () => { try { recRef.current && recRef.current.stop(); } catch (e) {} setListening(false); };
  return { supported, listening, note, start, stop, clear: () => setNote("") };
}

// Spoken numbers come back as "eighty five thousand" or "85,000". Handle both.
export function spokenToNumber(t) {
  const plain = String(t).replace(/[,$]/g, "");
  const m = plain.match(/\d+(\.\d+)?/);
  const small = { zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20, thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90 };
  const words = plain.toLowerCase().replace(/-/g, " ").split(/\s+/);
  let total = 0, cur = 0, used = false;
  for (const w of words) {
    if (/^\d+(\.\d+)?$/.test(w)) { cur += Number(w); used = true; }
    else if (small[w] != null) { cur += small[w]; used = true; }
    else if (w === "hundred") { cur = (cur || 1) * 100; used = true; }
    else if (w === "thousand" || w === "k") { total += (cur || 1) * 1000; cur = 0; used = true; }
    else if (w === "million") { total += (cur || 1) * 1000000; cur = 0; used = true; }
  }
  if (used) return String(Math.round(total + cur));
  return m ? m[0] : "";
}

