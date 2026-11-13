# CLAUDE.md — BoatClosers v4 + My Boat Closing

Read this first. It holds the context that isn't obvious from the code.
**This repo is public**, so keep secrets, keys, private business terms and opinions about competitors out of this file.

## Who you're working with
- Owner: Garry, solo founder, licensed Florida yacht broker. Deep boat-deal and maritime expertise, **beginner at coding**.
- Explain things plainly. Do one feature per session, with no side quests.
- When Garry edits by hand he uses the GitHub web editor and pastes **whole files** (no partial snippets). Give complete files if he's pasting.
- Test changes before saying they work. He tests new features himself before customers see them.

## What this repo is
Two products share this one Next.js codebase:

1. **BoatClosers** (boatclosers.com): a flat-fee **$249** guided closing platform for private boat sales, run without a broker. It's an online closing tool, **not a brokerage**. Messaging leads with closing the deal (paperwork, escrow, title transfer). No anti-broker angle and no fear-based copy.
2. **My Boat Closing** (myboatclosing.com, formerly "BoatClosers Express", lives under `/express`): a **$29.99** lite, buyer-only tier for small, simple deals (roughly under $50k, no escrow or due diligence). The seller never needs an account. The main hook is the free HIN check, then getting prepared (bill of sale). Papers are always **printed and signed in ink**, never signed on a phone. The light theme uses blue and gold hints, not dark navy. Avoid "kit" as a main word.

Recommend full BoatClosers for any deposit over $1,000 or any purchase over $50k.

## Part of a suite (separate repos, linked by handoffs only)
- `boatclosers/MyBoatInspector`: myboatinspector.com, an AI pre-purchase walkthrough. Can hand an offer into a BoatClosers deal room (`/api/deals/from-express`, `/api/partner/mbi-code`).
- `boatclosers/MyBoatLogs`: myboatlogs.com, an ownership log ($39.99/yr). The BoatClosers admin shows a read-only overview of it (`MBL_*` env vars).
- `boatclosers/sea-yachts`: Garry's separate brokerage site.

Keep the products separate with no overlapping features, but cross-sell the others along the way.

## Stack
Next.js 14 App Router · TypeScript/React · Supabase · Vercel · Stripe · Escrow.com (production API) · Resend email · Twilio SMS · Claude API (Virtual Broker assistant) · pdf-lib (filled state forms).
Supabase project ref: `xoihnmkgncuocxiknvgs`. Querying Supabase is the most reliable way to diagnose problems.
Env var names are in the code (`process.env.*`). Values live in Vercel. Never commit them.
Cron jobs are in `vercel.json` (deposit reminders, invite reminders, Express reminders, offer expiry).

## Map of the code
- `src/app/page.tsx`: homepage (decluttered Nov 2026; keep Garry's name off it)
- `src/app/api/deals/*`: deal room API (create, invite, join, open, escrow, docs, conflict)
- `src/lib/deals.ts`, `dealAuth.ts`: deal logic and who can do what
- `src/data/documents.js`: the 56 classified documents (signer + completion fields)
- `src/app/express/*`, `src/lib/express/*`: My Boat Closing (`states.ts` holds the 50-state info; `hsmv82050.ts` and `hsmv82040vs.ts` are Florida forms)
- `src/app/api/assistant`: the in-app "Virtual Broker" (renamed from Deal Assistant)
- `src/lib/seaYachts.js`: Sea Yachts escrow option. **OFF and on hold. Don't switch it on.**
- `src/app/admin`: owner dashboard
- `src/app/guides/*`: SEO articles (sitemap and robots are in `src/app`)

## Rules that must not break
- Roles come from the server (`initiator_role` / `invite_role`), never from form fields.
- The buyer always writes the offer terms. A seller who starts a deal only sets the asking price as an anchor, and sees buyer terms read-only (counter price or flag a conflict).
- Pay-then-sign: the paywall fires only when the full deal is accepted. Order: pay → sign → Deal Locked.
- Deal locks once the purchase agreement is signed. If price reopens during due diligence, the app makes a PA addendum. Due diligence choices are buyer-only (Accept As-Is / Reject / Propose New Price).
- The invited second party lands straight in the deal without signing in. Their account attaches at signing. Don't drop the login wall sitewide (it hurts SEO).
- Never store driver's license images.
- Each party's data persists without overwriting the other's.
- Use each state's **official** bill of sale where one exists. Use ours only where a state has none. Florida stays as built.

## In progress / next
- An optional one-question-at-a-time guided mode alongside the full form (voice answers too). It must be removable and tested by Garry first.
- Make My Boat Closing worth $29.99: add a lite inspection summary and a small log, all in one download.
- 50-state support for both products, with landing pages updated to match.
- Owner dashboard across all products, with free unlock for Garry's own test deals (not counted as revenue).
- A Supabase RLS/security pass.
- Marketing waits until the suite is finished.
