# AI Change Log

## Rules for AI models, bots, and agents

If you are an AI (Claude, ChatGPT, Grok, Gemini, Copilot, Cursor, JunoAI, or any other model, bot, or agent) and you add, modify, or delete anything in this repository, you **must** append a dated entry to this file describing what you changed and why — one entry per work session, no exceptions. This log is how the repository owner tracks what every AI did. Human commits do not need entries.

Entry format:

## YYYY-MM-DD — <your name/model>
- Changed: <files or area>
- Why: <reason>

---

## 2026-09-28 — JunoAI
- Changed: created this file
- Why: owner's standing rule — every AI that touches this repo must log its changes here

## 2026-09-30 — Deduxis Lead Bot (@deduxis)
- Changed: app/support/page.tsx, app/support/actions.ts, components/site-header.tsx (Support link), package.json (resend)
- Why: Overnight walk requirement "Submit the support form". Created /support with email form → Resend → awad@apixis.dev with ticket ID.

## 2026-09-30 — Deduxis Lead Bot (@deduxis)
- Changed: lib/apixis-world*.ts (3 files), app/api/apixis/world-agent/route.ts, components/ApixisWorldWelcome.tsx, components/workspace.tsx
- Why: Awad family rule 2026-09-30 "every single repo should work that way, they create an account they get a wallet and a avatar agent". New accounts now get own avatar agent in Apixis world (200 starter Ixis), one-time welcome card on dashboard linking to www.apixis.dev/enter?from=deduxis. Provision server-side on first signed-in load, idempotent.


## 2026-09-30 — Codex — Tester readiness: shared-login redirects

- Copied the canonical ApixisWallet local-redirect validator and used it at login start and callback. Preserved this app’s existing Supabase adapter and routes.
- Added regression cases for external URLs, backslashes, encoded separators/control characters and normal return destinations. No design changes.

## 2026-09-30 — Claude (branch claude/awesome-newton-3tygzi)
- Changed: `lib/apixis-login.ts` re-copied from `ApixisWallet/sdk/apixis-login-next.ts` — `verifyOtp({ type: "email" })` (D16: new addresses get a `signup` token that `magiclink` rejects). `lib/apixis-wallet.ts` → SDK v3.1 (adds `marketplaceOrder`/`marketplaceSettle`). `lib/apixis-world*.ts` re-synced with Apixis.dev (15 clients incl. ominix, wattixis; 1,000 starter Ixis, D11).
- Changed: `app/auth/callback/route.ts` verifies `token_hash` as type `email` (first sign-in for a new address failed before).
- Changed: `app/api/redeem/route.ts` bills the Apixis ID `sub` first (`apixisOwner`), verified email only as fallback.
- Changed: `components/ApixisWalletChip.tsx` reads the current path with `useSyncExternalStore` (lint error `react-hooks/set-state-in-effect` made CI red); `app/support/page.tsx` escaped two apostrophes (lint errors).
- Why: family backend pass per Awad's 2026-09-30 decisions (ApixisWallet/AGENTS.md §0c D11–D16; live board: ApixisWallet/docs/FAMILY_STATUS.md). One SDK, one login kit, one world kit — copied from canonical, never patched by hand.

## 2026-09-30 (night pass) — Claude
- Changed: Cixy prompt now starts with the shared family core from `lib/apixis-cixy` (copied from `ApixisWallet/sdk/apixis-cixy`); only the product role stays site-specific. Greeting policy is the family rule (match the person, never open with salaam). Provider failures (no key, out of credit, 429, 5xx) answer `cixyUnavailableReply()` — a calm sentence with HTTP 503/429, never the vendor error.
- Why: Awad's overnight instruction — all backend and security done, one Cixy persona everywhere (ApixisWallet/docs/CIXY.md, sdk/apixis-cixy.*), agents on the same page (ApixisWallet/docs/FAMILY_STATUS.md).

## 2026-10-01 (early) — Claude
- Changed: `.github/workflows/ci.yml` — this repo had no CI on `main` (the shared-CI PR was never merged); it now calls `313aidaroos/github-actions/node-ci` on push/PR. `typecheck` script added where missing so CI type-checks (verified 0 errors, build green).
- Why: overnight second pass — every repo must prove itself on every push.

## 2026-10-02 — Claude (Claude Code)
- Changed: applied `supabase/migrations/20261002_receipts_foundation.sql` live (Supabase uxgtppwqonbznuoyebbb): `receipts`, `category_overrides` (owner-only RLS) and a private `receipts` storage bucket with per-user folder policies.
- Why: the live project had none of them, so receipt upload, list and export would fail for every user. No code changed.
- Changed (same day): `app/support/actions.ts` builds the Resend client only when `RESEND_API_KEY` exists. Before, a missing key threw when the module loaded and broke the support page.

## 2026-10-02 — Claude (Claude Code)
- Changed: `.env.example` now lists every env var the code reads (missing names appended with a one-line note each).
- Why: so the owner can add keys in Vercel from one complete list. No code changed.

## 2026-10-04 — Claude (Claude Code, full-portfolio review)
- Changed: `NOTES/CLAUDE.md` — this repo's slice of the 24-repo review (what is live, what is open, who owns each item, drift found). No code, env, database or deploy changes.
- Why: Awad asked for every repo to be read twice with a done / to-do / owner status, and for the notes in each repo to be updated. Notes only; Awad approved the merge on 2026-10-04.

## 2026-10-04 — Grok (Deduxis Lead, Claude-review fixes)
- Changed: world welcome card now says 1,000 starter Ixis instead of 200, and the Deduxis Cixy role no longer has the halal/Islamic-ruling lines. Also added a `test` script plus `tests/locks.test.mjs`, and fixed the NOTES/GROK.md header.
- Why: Awad's locks (1,000 Ixis grant made by Apixis.dev; no religious content outside Halaxis). Copy and prompt only: no restyle, no Wallet/env/DB change.

## 2026-10-06 — Claude (family lead): AI Receptionist notes (D18)
- Changed: AI Receptionist section in the family notes (see `docs/AI_RECEPTIONIST.md` in ApixisWallet); notes only, no code.
- Why: Awad approved an AI Receptionist add-on at $100/month for every customer-facing family site and asked every bot and agent to follow one plan.

## 2026-10-13 — Deduxis Lead via cloud agent
- Changed: Recover section at `/recover` and a signed-in free-scan intake at `/recover/scan`, Recover in the nav and footer, and the locked pricing card (Receipts Personal $10, Receipts Business $30, Recover 25% of money recovered, Monitor $100 with a 15% fee, contact sales). Migration file `supabase/migrations/20261013_recover_scan_requests.sql` is in the repo and was not applied. No Stripe charge was added.
- Why: Awad approved merging Recovra (Recovix) into Deduxis as the Recover section. The recovra site should redirect to Deduxis `/recover`; that other repo was not changed.
