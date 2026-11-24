# CLAUDE.md: BoatClosers + My Boat Closing

BoatClosers ($249 flat fee): a guided closing platform for private boat sales. Deal room with offers and counters, deposit and escrow (Escrow.com; optional Sea Yachts licensed escrow behind a preview switch), due diligence, 56 documents, e-signing, closing. Not a brokerage, never holds money.
My Boat Closing ($29.99, myboatclosing.com, lives under /express in this app): simple buyer-run closings for smaller deals (usually under $50k, deposit under $1k). Free HIN check, state bill of sale, title signing help, ink signatures only, all 50 states.

Stack: Next.js 15, React, TypeScript/JS, Supabase, Stripe, Resend email, Vercel crons (vercel.json).

Key places:
- `src/components/BoatClosersApp.jsx` the main app (very large: edit surgically, search first)
- `src/app/api/deals/route.ts` deal saves and every deal notification email
- `src/app/express/` and `src/lib/express/` My Boat Closing; `src/middleware.ts` maps myboatclosing.com to /express
- `src/app/api/cron/*` scheduled jobs (reminders, nudges, hourly new-customer owner alert)
- `src/app/admin` + `src/app/api/admin` owner dashboard for the whole suite (reads My Boat Inspector and My Boat Logs with MBI_ADMIN_KEY / MBL_ADMIN_KEY)
- `src/lib/sendEmail.ts` all email; `src/lib/handoff.ts` boats coming from My Boat Inspector
- Guides: `src/lib/topic-guides.ts`, `src/lib/state-guides.ts`, pages under `src/app/guides/`; FAQ `src/lib/faqs.ts`; `src/app/llms.txt`
- Deals hold roles server-side (initiator_role / invite_role); never guess a role from form fields.

Check before a PR: `npm install && npx tsc --noEmit && npm run build`. Locally the build compiles, then stops at "supabaseKey is required" (no live keys here). That's expected; the compile and type-check must pass.

## Who you're working for

Garry Chupurdy, solo founder and licensed Florida yacht broker. He's a beginner with code: he reviews pull requests on GitHub in the browser and merges them himself. Write every PR description and report in plain English: what changed, why, and how to test it on the live preview. No jargon.

## The suite (separate apps, separate codebases, connected by links)

| App | Repo | Live |
|---|---|---|
| BoatClosers ($249 flat-fee closing platform) + My Boat Closing ($29.99 simple closings, served from this same app under /express) | boatclosers/boatclosers-v4 | boatclosers.com, myboatclosing.com |
| My Boat Inspector (guided inspection, live voice inspector) | boatclosers/MyBoatInspector | myboatinspector.com |
| My Boat Logs ($39.99/yr ownership log) | boatclosers/MyBoatLogs | myboatlogs.com |
| My Boat Listing (listing builder) | boatclosers/myboatlisting | myboatlisting.com |

Apps hand a boat to each other with `?fromInspector=` links (see lib/handoff.ts where present). Sea Yachts (Garry's brokerage) is a different business: never mix it in.

## Hard rules

- Never push straight to `main` and never force-push. Always work on a branch and open a pull request.
- Claude may merge its own pull request into `main` only when Garry has asked in that session for the change to go live (for example "you do it", "merge it", "put it live"), and only after the type-check and build pass. Otherwise leave the pull request for Garry to merge.
- After merging, check that the Vercel production deploy finished without errors, and tell Garry in plain words what went live and how to undo it (the "Revert" button on the merged pull request).
- One problem per pull request. Small, focused changes. Don't refactor or restyle things you weren't asked to touch.
- Don't change prices, payments/Stripe, refunds, legal/terms text, or emails that go to customers unless the task is exactly that. If a fix seems to need it, stop and explain instead.
- Don't redesign landing pages. Small additions (a link, a section) only when asked.
- Database changes go in a new migration file in the PR. Never run writes or schema changes against the live database.
- Never put secrets or keys in code or in PR text.
- Facts shown to customers (prices, what's included, limits) must come from the code, not memory. Don't advertise features that aren't built.
- Never send messages to customers, post anything publicly, or spend money.
- Before opening a PR: install, type-check and build (see below). Say in the PR what you checked and what you couldn't (e.g. no live keys locally).
- Product names: "My Boat Closing" (never "BC Express" or "BoatClosers Express"), "My Boat Inspector", "My Boat Logs", "My Boat Listing", "BoatClosers".
