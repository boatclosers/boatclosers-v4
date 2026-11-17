'use client';

// "Get the app": saves this site to the phone's home screen so it opens like an app.
// - Chrome and Edge on Android and computers: one tap opens the browser's own install prompt.
// - iPhone and iPad: Apple doesn't let websites install themselves, so we show the two taps it takes.
// - Already installed (opened from the home screen): the button hides itself.
// Also registers /sw.js, which some browsers need before they offer to install.

import { useEffect, useState } from 'react';

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type Platform = 'ios' | 'android' | 'desktop';

let deferred: InstallEvent | null = null; // the browser fires this once, maybe before React mounts
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    window.dispatchEvent(new Event('app-installable'));
  });
}

function detect(): { platform: Platform; installed: boolean; safari: boolean } {
  const ua = navigator.userAgent;
  const ios = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const android = /android/i.test(ua);
  const installed =
    window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
  const safari = /safari/i.test(ua) && !/crios|fxios|edgios|chrome|android/i.test(ua);
  return { platform: ios ? 'ios' : android ? 'android' : 'desktop', installed, safari };
}

export type InstallTheme = { bg: string; fg: string; accent: string; accentFg: string; border: string; muted: string };

export default function InstallApp({
  name,
  theme,
  variant = 'button',
  label = 'Get the app',
  small = false,
}: {
  name: string;
  theme: InstallTheme;
  /** "button": a compact button for headers. "panel": a card with the steps showing. */
  variant?: 'button' | 'panel';
  label?: string;
  /** Matches a row of small nav buttons. */
  small?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const [info, setInfo] = useState<{ platform: Platform; installed: boolean; safari: boolean }>({ platform: 'desktop', installed: false, safari: false });
  const [canPrompt, setCanPrompt] = useState(false);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setInfo(detect());
    setCanPrompt(!!deferred);
    setReady(true);
    const onAvail = () => setCanPrompt(true);
    const onInstalled = () => {
      setDone(true);
      setCanPrompt(false);
    };
    window.addEventListener('app-installable', onAvail);
    window.addEventListener('appinstalled', onInstalled);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    return () => {
      window.removeEventListener('app-installable', onAvail);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!ready || info.installed) return null;

  async function install() {
    if (deferred) {
      const ev = deferred;
      deferred = null;
      setCanPrompt(false);
      await ev.prompt();
      const r = await ev.userChoice.catch(() => ({ outcome: 'dismissed' }));
      if (r.outcome === 'accepted') setDone(true);
      return;
    }
    setOpen(true);
  }

  const steps =
    info.platform === 'ios'
      ? [
          info.safari
            ? <>Tap the <b>Share</b> button <ShareIcon /> at the bottom of Safari.</>
            : <>Tap the <b>Share</b> button <ShareIcon /> (in Chrome it’s at the top, next to the address).</>,
          <>Scroll down and tap <b>Add to Home Screen</b>.</>,
          <>Tap <b>Add</b>. {name} is now on your home screen.</>,
        ]
      : info.platform === 'android'
        ? [
            <>Tap Chrome’s <b>⋮</b> menu at the top right.</>,
            <>Tap <b>Install app</b> or <b>Add to Home screen</b>.</>,
            <>Tap <b>Install</b>. {name} is now with your apps.</>,
          ]
        : [
            <>In Chrome or Edge, click the <b>install</b> icon at the right end of the address bar, or open the <b>⋮</b> menu and choose <b>Install</b>.</>,
            <>On your phone, open {typeof window !== 'undefined' ? window.location.host.replace(/^www\./, '') : 'this site'} and tap <b>Get the app</b> there.</>,
          ];

  const btn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: small ? 32 : 44,
    padding: small ? '0 11px' : '0 16px',
    borderRadius: small ? 7 : 10,
    border: 'none',
    background: theme.accent,
    color: theme.accentFg,
    fontWeight: 700,
    fontSize: small ? 12 : 15,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  const stepList = (
    <ol style={{ margin: '10px 0 0', paddingLeft: 20, color: theme.fg, fontSize: 15, lineHeight: 1.6 }}>
      {steps.map((s, i) => (
        <li key={i} style={{ marginBottom: 6 }}>{s}</li>
      ))}
    </ol>
  );

  if (done)
    return <span style={{ color: theme.muted, fontSize: 14 }}>Added. Open {name} from your home screen.</span>;

  if (variant === 'panel')
    return (
      <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20, color: theme.fg }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Put {name} on your phone</div>
        <p style={{ margin: '6px 0 0', color: theme.muted, fontSize: 15, lineHeight: 1.5 }}>
          It opens full screen like an app, with no app store and nothing to update.
        </p>
        {canPrompt ? (
          <button type="button" onClick={install} style={{ ...btn, marginTop: 14 }}>
            <PhoneIcon /> {label}
          </button>
        ) : (
          stepList
        )}
      </div>
    );

  return (
    <>
      <button type="button" onClick={install} style={btn} aria-haspopup="dialog">
        <PhoneIcon /> {label}
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Add ${name} to your home screen`}
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 12 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 440, background: theme.bg, color: theme.fg, borderRadius: 18, padding: 22, boxShadow: '0 20px 50px rgba(0,0,0,0.35)', marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 19 }}>Add {name} to your home screen</div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: 24, color: theme.muted, cursor: 'pointer' }}>
                ×
              </button>
            </div>
            <p style={{ margin: '6px 0 0', color: theme.muted, fontSize: 14, lineHeight: 1.5 }}>
              {info.platform === 'ios' ? 'Apple doesn’t let websites install themselves, so it takes two taps:' : 'It opens full screen like an app:'}
            </p>
            {stepList}
            <button type="button" onClick={() => setOpen(false)} style={{ ...btn, marginTop: 14, width: '100%', justifyContent: 'center' }}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ verticalAlign: '-2px' }}>
      <path d="M12 3v12M7 8l5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  );
}
