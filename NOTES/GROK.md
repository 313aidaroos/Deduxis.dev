Grok Bot (Developer Bot hub + product leads) notes. Every change Grok Bot makes to this product (code, env, database, deploys) gets a dated entry here so Claude, Hermes and Codex stay on the same page.

## 2026-10-04 summary

- **Grok:** added the verified-owner seat/receipt bypass.
- **Lead:** prepared the Socixis Social Feed preview; it was not merged.
- **Claude:** merged PR #24 (`79a55ef`) around 6:31 PM CT for the full-portfolio notes review; the later Claude-review PR #25 (`d7da814`) corrected 1,000-Ixis copy, removed religious Cixy-role lines, enabled tests, and repaired the notes header, with undo entries below.
- **Hermes:** no 2026-10-04 commit or merged PR identified in this repository.
- **Juno:** no 2026-10-04 commit or merged PR identified in this repository.

## Catch-up correction — 2026-10-04 (CT)

Claude activity was present; the earlier “no Claude activity” line was incorrect. Each item below has an undo pointer.

- **Claude-review/lead, 2026-10-04 6:55 PM CT — PR #25, merge `d7da814abcda2641cb6f2f7303e06f6b05836479`:** corrected 1,000-Ixis welcome copy, removed religious Cixy-role language, enabled the test script, and repaired the notes header; no Wallet/env/DB/Stripe change. Undo: `git revert d7da814abcda2641cb6f2f7303e06f6b05836479` (or close the preview PR if treated as not approved).
- **Claude, 2026-10-04 6:31 PM CT — PR #24, merge `79a55ef95e75ff46d7eb5fb411b8a6991f1e9156`:** notes: Claude full-portfolio review 2026-10-04 (NOTES/CLAUDE.md, AI_CHANGELOG); added `NOTES/CLAUDE.md` and `AI_CHANGELOG.md` (notes/docs only). Undo: `git revert 79a55ef95e75ff46d7eb5fb411b8a6991f1e9156`.

## 2026-09-27 (CT) — Developer Bot (hub)
- Wallet registration: added `deduxis` to `wallet_api_clients` in Supabase project `kzneeksminozmhnqaaun`, with `require_sso=false`.
- Callback URLs registered: https://deduxis.vercel.app/auth/apixis/callback.
- Vercel env: replaced `WALLET_API_KEY` with a per-product `apx_live_` key, added `APIXIS_CLIENT_ID=deduxis`, and left legacy `APIXIS_WALLET_API_KEY` present (name-only check); production was redeployed from the same product commit.
- Cleanup status: the attempted deletion of legacy `APIXIS_WALLET_API_KEY` variables was stopped at about 22:45 CT; no deletion was made here.
- Undo: restore `WALLET_API_KEY` to its legacy value and deactivate the `deduxis` client row.

## 2026-09-27 — Apixis ID + Wallet balance pill (Grok Bot)
- **What:** Merged Claude's PR #1 (Sign in with Apixis + shared Wallet) after merging current main into it (merge d7e4995) plus Grok commit 3dacdbc: `components/ApixisWalletChip.tsx` (shared single fetch of `/api/wallet/balance`, refetch on focus / visibilitychange / pageshow, "Sign in with Apixis" when unlinked), balance route returns `linked`.
- **Where:** chip in `components/site-header.tsx` (nav-actions, hidden when signed out), `components/workspace-shell.tsx` (topline), `app/pricing/page.tsx`; `<SignInWithApixis />` on `app/login/page.tsx`. Conflict in `app/api/redeem/route.ts` resolved by keeping main's version (no payment change).
- **Merge SHA:** 84dbc7f. Prod READY; `/api/wallet/balance` → 401 `{signIn:true}` without a session.
- **Undo:** `git revert -m 1 84dbc7f` (or revert PR #1 in GitHub).
- No Wallet code, env/keys, Stripe, checkout or payment links changed.

---

# Backfill 2026-09-27 → 2026-10-02 (CT)
_Backfill by Grok (Deduxis Lead) on 2026-10-02 per Awad's standing rule (every change gets a dated entry here). Written from `gh pr list`, `git log --first-parent main`, PR/issue events, Vercel deployment + env metadata (names/dates only, no values) and Supabase `list_migrations` (read-only). All times CT. "Who" = GitHub author/closer, mapped to the bot by branch prefix or AI_CHANGELOG where clear. PR #1 (merge 84dbc7f, landed on main Sep 28 00:00 CT) is already logged above and not repeated._

## 2026-09-27 13:53 (CT) — Cixy identity restore, direct to main (no PR)
- **What:** Restored Cixy's Muslim-identity lines (greeting, insha'Allah/alhamdulillah, halal-conscious guidance, scholar disclaimer) in the Cixy system prompt after PR #7.
- **Where:** commit 75cf721, `app/api/chat/route.ts`. Prod deploys dpl_FZQAwd4kuDgk1djPA5iTrvRr92bY / dpl_5UNrBcHAVVoECWbjfR1F1wZ4D216 (13:54), redeployed as dpl_GfXCqzotMAnSwfw3yBu2hJFCejE7 (22:39, hub redeploy).
- **Who:** commit author "Awad Alaidaroos" (313aidaroos); which agent made it: unknown. Note: later superseded by PR #14 (shared family Cixy core, "never open with salaam").
- **Undo:** `git revert 75cf721` (would conflict with #14; check first).

## 2026-09-27 22:15 (CT) — Vercel env `NEXT_PUBLIC_APP_URL` added (not in the hub entry above)
- **What:** `NEXT_PUBLIC_APP_URL` created (production + preview), Vercel comment "Magic-link redirect base (hub 9/27)".
- **Where:** Vercel project deduxis (prj_CO4h6XuIWCb80Xpx9K7pDzgYOBmN). Name/date only.
- **Who:** Vercel user 313aidaroos; comment points to Developer Bot (hub).
- **Undo:** delete the env var in Vercel and redeploy.

## 2026-09-27 23:19 / 2026-09-28 00:01 (CT) — notes commits
- **What:** 02ad168 "notes: record 2026-09-27 hub changes" and 96bb144 "notes: Grok balance pill entry" (the two entries above). Each triggered a prod deploy (dpl_3JHqRUfpVC34xKNhtxJXEhqzQd5q, dpl_CbBE67gsqXSBzAicBDqHCQQfsXb7).
- **Who:** 313aidaroos (Developer Bot / Grok, per the entries). **Undo:** n/a (notes only).

## 2026-09-28 04:08 (CT) — PR #8 merged: Require AI change notes (AI_CHANGELOG.md)
- **What:** Added `AI_CHANGELOG.md` and linked it from `AGENTS.md` and `CLAUDE.md`.
- **Where:** PR #8, branch `junoai/ai-changelog`, merge 388e007. Prod dpl_6TZk9f1T1E6MQXsumRs2ULJ23fFS (04:08), redeployed dpl_pqQUaAbs9W3gCYLp8TCPiTU6eei3 (Sep 29 23:17).
- **Who:** Juno (junoai/*); GitHub author 313aidaroos.
- **Undo:** `git revert 388e007`.

## 2026-09-28 04:46 (CT) — PR #9 opened: Add shared CI (Juno)
- **What:** Thin caller of `313aidaroos/github-actions` node-ci. Branch `junoai/ci` (d9f6ed9, 51ac929, 78051b5). Never merged; closed Oct 1 (see closures below).
- **Who:** Juno (junoai/*). **Undo:** n/a.

## 2026-09-29 20:34 (CT) — PR #10 opened: Footer "Other Ixis companies" links (Grok / Deduxis Lead)
- **What:** Adds an "Other Ixis companies" footer row; list in `lib/ixis-companies.ts`. Branch `deduxis/ixis-footer-links` (2258117, faf12e8, d3a6e07 trimmed to 11 sites, eab2ddb removed stray screenshots; last push 20:40).
- **State on 2026-10-02:** OPEN, CONFLICTING (mergeStateStatus DIRTY), no review; awaiting Awad. Not merged.
- **Undo:** n/a (not on main); close the PR if no longer wanted.

## 2026-09-29 20:53 (CT) — PR #11 opened: One Apixis ID = one Wallet = one world agent (Grok / Deduxis Lead)
- **What:** Provision world agent on first sign-in, "Log in with Apixis ID". Branch `grok/deduxis-one-account` (dc1035e, d0cd134, 111b062; last push 20:56). Marked "do not merge until Awad approves". Closed Oct 1 by Claude (see closures below).
- **Undo:** n/a (not on main).

## 2026-09-29 23:16 (CT) — Vercel env `APIXIS_WORLD_KEY`, `APIXIS_WORLD_API` added
- **What:** Both created for production, preview, development. Names/dates only.
- **Who:** Vercel user 313aidaroos; commit 7690539 says they were set by Hermes.
- **Undo:** delete both env vars in Vercel and redeploy (breaks world-agent provisioning from 7690539).

## 2026-09-29 23:27–23:30 (CT) — Direct-to-main (no PR): support form + world agent/welcome (Deduxis Lead)
- **What (f8d0fa9, 23:27):** `/support` email form via Resend to awad@apixis.dev with ticket ID; Support link in header/footer; adds `resend`. Files: `app/support/actions.ts`, `app/support/page.tsx`, `components/site-header.tsx`, `package.json`, `package-lock.json`.
- **What (7690539, 23:30):** Family rule: wallet link + own avatar agent in Apixis world + one-time welcome card. Copied world kit from Lyrixis: `lib/apixis-world.ts`, `lib/apixis-world-agent.ts`, `lib/apixis-world-provision.ts`; new `app/api/apixis/world-agent/route.ts`, `components/ApixisWorldWelcome.tsx`; wired in `components/workspace.tsx`.
- **Also:** AI_CHANGELOG commits 0f43dd1 (23:28) and b694ff4 (23:30) logging both.
- **Prod deploys:** dpl_344FEgEJVPB7fqMNE1sJ5dYicGU2 / dpl_FB829kYoLJm3QdHaD1idy7phaZfd (f8d0fa9), dpl_CF8gig7Heb8EagD2mUtYiyRxLmFY (0f43dd1), dpl_G3zMJaAjYqX6DmSNpQ2vDPpLQ9PN / dpl_9cotKB8NJZMH9g5mRmLgRBU65d3R (7690539), dpl_6XrUh74ahvWeFXLHkP8pegCtjAF2 (b694ff4), all READY.
- **Who:** GitHub author 313aidaroos; AI_CHANGELOG names "Deduxis Lead Bot (@deduxis)".
- **Undo:** `git revert b694ff4 7690539 0f43dd1 f8d0fa9` (later PRs #13/#17 touch the same files; expect conflicts).

## 2026-09-30 01:21 (CT) — PR #12 merged: harden shared login return destinations
- **What:** Canonical ApixisWallet local-redirect validator used at login start and callback; regression tests. Files: `lib/apixis-redirect.ts`, `lib/apixis-login.ts`, `lib/__tests__/apixis-redirect.test.mjs`, `AI_CHANGELOG.md`.
- **Where:** PR #12, branch `codex/tester-readiness`, merge 649f7d6. Prod dpl_FsmSCzJ8vjKMmCZAQpPvUYCS7QyH.
- **Who:** Codex (codex/*). **Undo:** `git revert 649f7d6`.

## 2026-09-30 02:33 (CT) — PR #13 merged: first sign-in fix, bill Apixis ID first, lint, kits re-synced
- **What:** `verifyOtp({ type: "email" })` in login + `app/auth/callback/route.ts`; `app/api/redeem/route.ts` bills Apixis ID `sub` first (email fallback); `lib/apixis-wallet.ts` to SDK v3.1; `lib/apixis-world*.ts` re-synced (1,000 starter Ixis); lint fixes in `components/ApixisWalletChip.tsx`, `app/support/page.tsx`.
- **Where:** PR #13, branch `claude/awesome-newton-3tygzi`, merge ed3341c. Prod dpl_FqFKpzDTpkxRnknNN9U9iyiBCTRR.
- **Who:** Claude (claude/*). **Undo:** `git revert ed3341c`.

## 2026-09-30 02:56 (CT) — PR #14 merged: Cixy shared family persona + graceful provider fallback
- **What:** Cixy prompt starts from shared core `lib/apixis-cixy.ts`; provider failures return `cixyUnavailableReply()` (503/429) instead of vendor errors. Files: `app/api/chat/route.ts`, `lib/apixis-cixy.ts`, `AI_CHANGELOG.md`.
- **Where:** PR #14, merge 0bc108d. Prod dpl_2kRwh7QJ34BFQ4Mj8WHUrqhrLnUb.
- **Who:** Claude (claude/*). **Undo:** `git revert 0bc108d`.

## 2026-09-30 03:23 (CT) — PR #15 merged: shared CI + typecheck script
- **What:** `.github/workflows/ci.yml` calls `313aidaroos/github-actions` node-ci on push/PR; `typecheck` script in `package.json`.
- **Where:** PR #15, merge 3960b39. Prod dpl_4ivQmF7pAgJUw1xdcZpDPgbagLKX.
- **Who:** Claude (claude/*). **Undo:** `git revert 3960b39`.

## 2026-10-01 20:26 (CT) — Supabase DB change: receipts foundation (live)
- **What:** Migration `20261002012655_receipts_foundation` applied to Supabase project uxgtppwqonbznuoyebbb: tables `public.receipts` and `public.category_overrides` with owner-only RLS policies, private storage bucket `receipts`, and `storage.objects` policies "receipts own read/insert/delete" (per-user folder).
- **Who:** Claude (per AI_CHANGELOG 2026-10-02 and the migration file header).
- **Undo (down):** `DROP POLICY "receipts own read" ON storage.objects; DROP POLICY "receipts own insert" ON storage.objects; DROP POLICY "receipts own delete" ON storage.objects;` empty and delete the `receipts` bucket (Storage dashboard/API); `DROP TABLE public.category_overrides; DROP TABLE public.receipts;` (destroys any receipt data, so back up first).

## 2026-10-01 20:29 (CT) — PR #16 merged: record the receipts migration in the repo
- **What:** Adds `supabase/migrations/20261002_receipts_foundation.sql` (record of the live change above) + AI_CHANGELOG. No app code.
- **Where:** PR #16, merge bcc0ae5. Prod dpl_6WPkQKFddTcVVUkkPHHCNcQpQD4p.
- **Who:** Claude (claude/*). **Undo:** `git revert bcc0ae5` (file only; does not undo the DB).

## 2026-10-01 20:44 (CT) — PR #17 merged: support form works without the email key
- **What:** `app/support/actions.ts` creates the Resend client only when `RESEND_API_KEY` exists (missing key used to break the page at module load).
- **Where:** PR #17, merge 49555a8. Prod dpl_41MACs9exsk13UxYSNedJdcEhf1p.
- **Who:** Claude (claude/*). **Undo:** `git revert 49555a8`.

## 2026-10-01 20:56 (CT) — PR #18 merged: `.env.example` lists every env var the code reads
- **What:** Missing names appended to `.env.example`, one note each. No code.
- **Where:** PR #18, merge a971f01. Prod dpl_J8NNP6imsea6BDQ6AK1y5wsUdps1.
- **Who:** Claude (claude/*). **Undo:** `git revert a971f01`.

## 2026-10-01 23:17–23:18 (CT) — PR closures in this repo: 2 (#9, #11)
- **#9** "Add shared CI" (`junoai/ci`, Juno) closed 23:17: "superseded, main already runs the shared family CI. The branch is kept."
- **#11** "One Apixis ID = one Wallet = one world agent" (`grok/deduxis-one-account`, Grok) closed 23:18: "superseded, main already has one Apixis ID, shared Wallet and world agent at sign-in (shared kits). The branch is kept."
- **Who:** closer GitHub login 313aidaroos; the closing comments are signed "Generated by Claude Code" → Claude.
- No other PRs in this repo were closed in this window (the ~51 cross-repo closures were in other repos). Branches were not deleted.
- **Undo:** reopen #9 / #11 in GitHub (`gh pr reopen 9` / `gh pr reopen 11`).

## 2026-10-02 02:22 (CT) — PR #19 merged: Apixis Companies page + nav link
- **What:** New `/companies` page (`app/companies/page.tsx`, `app/companies/companies.css`), nav link in `components/site-header.tsx`, images `public/companies/recovra.jpg`, `scenes-1..5.jpg`.
- **Where:** PR #19, branch `codex/companies-tab-20261002`, merge 997a3a7. Prod dpl_6RpZqgSGA5zEUwHm7v3cqXQnoJoj.
- **Who:** Codex (codex/*). **Undo:** `git revert 997a3a7` (after reverting #20 and #21).

## 2026-10-02 02:46 (CT) — PR #20 merged: refine Companies card animations
- **What:** Card motion + directory copy in `app/companies/page.tsx`, `app/companies/companies.css`.
- **Where:** PR #20, branch `codex/refine-companies-motion-20261002`, merge 568b891. Prod dpl_C1VGioxtuzzuMGp2H7Ubjvv5EmMK.
- **Who:** Codex (codex/*). **Undo:** `git revert 568b891`.

## 2026-10-02 03:18 (CT) — PR #21 merged: fix Recovra link (current prod)
- **What:** One-line link fix in `app/companies/page.tsx`.
- **Where:** PR #21, branch `codex/fix-recovra-company-link-20261002`, merge 3d39bd8. Prod dpl_JAaipdoMaUkDdZBYcGbxfrWqDGdX READY (latest production).
- **Who:** Codex (codex/*). **Undo:** `git revert 3d39bd8`, or promote/redeploy the previous prod deployment dpl_C1VGioxtuzzuMGp2H7Ubjvv5EmMK.

## Status at end of backfill (2026-10-02, CT)
- Repo FROZEN. Open PRs: #10 only (conflicting, awaiting Awad). Latest prod: dpl_JAaipdoMaUkDdZBYcGbxfrWqDGdX on 3d39bd8.
- Vercel env changes seen since the 2026-09-27 hub entry: `APIXIS_WORLD_KEY`, `APIXIS_WORLD_API` (Sep 29 23:16). `NEXT_PUBLIC_APP_URL` (Sep 27 22:15) logged above. No other env var has a created/updated date after Sep 27 22:35.
- Unknown: which agent made 75cf721 (Sep 27); Vercel metadata does not show deleted env vars, so env deletions (if any) can't be determined from it.

## 2026-10-04 (CT) — Grok Bot: Feed tab on Deduxis (PR open, NOT merged)
- Why: Awad asked for the Socixis Social family feed as a Feed tab on every Ixis site. Awad put feed changes on hold, so this PR is for preview review only; do not merge until Awad says so.
- What: new public `/feed` page in Deduxis's own shell (same header, footer, fonts, colors and buttons). For You is the unfiltered mixed feed from every Apixis company with source-site badges and AI labels; Following, Search · Trending and You tabs; video/photo/text posts, like, comment, follow, save, share, report, tips and boosts in Ixis. Signed-out visitors can browse; the 4th tab says "You" and shows a sign-in card (Apixis ID). Text-only posts use the site's body font, wrap long words and size to their content; media posts keep the full-height layout; feed modals sit above everything.
- Where: `app/feed/` (page with SiteHeader/SiteFooter, Deduxis skin, `feed.css` mapped to Deduxis tokens), `feed-client/` (shared client), `app/api/feed-session/route.ts`, "Feed" link in `components/site-header.tsx`, lint override scoped to `feed-client/**` in `eslint.config.mjs` (React Compiler rules; same as Renoxis).
- Backend: https://www.apixis.dev/api/feed. `/api/feed-session` calls POST /api/feed/session server-side with the existing `APIXIS_WORLD_KEY` + X-Apixis-Client/Sub/Email and returns the short-lived fdt_ token. No new env vars, no DB change, no SVGs.
- Who: Grok Bot (for Awad).
- Undo: close this PR, or `git revert <squash sha>` if it is ever merged.

## 2026-10-04 19:00 (CT) — Grok Bot: Feed phone tab fit (same PR, still NOT merged)
- What: at 375px the 4th "You" tab was pushed off-screen by "Search · Trending". Under 560px the tab now reads "Search", tabs are tighter, and if a wide site font still can't fit the tabs and "+ Post" on one row, Post drops to its own row instead of covering "You". Desktop is unchanged; the site's colors, fonts and buttons are untouched; no SVGs.
- Where: feed client `FeedView.tsx` (tab label) and the shared layout section of the site's feed CSS.
- Who: Grok Bot (for Awad). No merge, no production deploy.
- Undo: revert this commit on the PR branch.
## 2026-10-04 — Owner allowlist (Grok)
- What: lib/owners.ts adds isOwner(user, accessToken). An owner is a confirmed email that is alaidaroosawad@gmail.com, awad@apixis.dev or in ADMIN_EMAILS, AND an email-proving sign-in (magic link/OTP, Apixis ID/OAuth, recovery). A password-only session never counts, because neither owner has an account in uxgtppwqonbznuoyebbb yet. In guard({seat:true}) an owner skips the Receipt Intelligence seat check, and /api/receipts and /api/extract skip the 200-receipt cap for him. The rate limits still apply. These are product gates only: no entitlement, no Wallet call, no ledger entry. His real Wallet seat redemptions still work as normal.
- Not changed: Deduxis has no admin pages, and no new admin UI was built.
- Where: lib/owners.ts, lib/guard.ts, app/api/receipts/route.ts, app/api/extract/route.ts, tests/owners.test.mjs. ADMIN_EMAILS was added to the Vercel project deduxis.
- Who: Grok.
- Undo: revert this PR and remove ADMIN_EMAILS from Vercel.
## 2026-10-04 catch-up provenance (CT)

The entries below record the day's observed commits and merged PRs. Existing detailed entries above remain the change descriptions; this section supplies exact provenance and undo pointers.

### Commits
- `3a2df67` (2026-10-04T18:15:03-05:00, 313aidaroos; alaidaroosawad@gmail.com) — Owner allowlist: proven owner session skips seat gate and receipt cap (#22). Undo: undo via the merged PR below: git revert 3a2df67.
- `71624d3` (2026-10-04T18:16:17-05:00, 313aidaroos; 313aidaroos@users.noreply.github.com) — Feed tab: Socixis Social family feed at /feed (preview only, do not merge). Undo: no main change; close/delete the branch (or revert the branch commit before reuse).

### Merged PRs
- PR #22, merge `3a2df67`, `grok/owner-allowlist` → `main`, merged 2026-10-04 CT by 313aidaroos: Owner allowlist: proven owner session skips seat gate and receipt cap. Undo: `git revert 3a2df67`.

## 2026-10-04 (CT) — Claude-review audit by Deduxis Lead (Grok), asked by Awad via Developer Bot at 18:43 CT
Changes since `5ccb9d2` (2026-10-02 17:31 CT) that had no note yet:
- **Header fix (this PR):** the 18:24 catch-up commit `ab9c022` replaced this file's first line with a duplicated `## 2026-10-04 summary` heading. This PR puts the intro line back, removes the duplicate, and adds Claude's #24 to the summary. Undo: revert this PR.
- **Claude PR #24** (`claude/great-fermi-6brq7a` → merge `79a55ef`, 2026-10-04 18:31 CT, signed "Claude Code"). Adds `NOTES/CLAUDE.md` (Deduxis slice of the 24-repo review) and one AI_CHANGELOG entry. Notes only, with no code, env, DB or deploy change of its own. The push to main auto-deployed prod as `dpl_HeB3tN5VaSxzuFMqpMKGFNTV2vSy` (READY). Undo: `git revert 79a55ef`. Branch `claude/great-fermi-6brq7a` is still on origin.
- **Notes catch-up `ab9c022`** (2026-10-04 18:24 CT, 313aidaroos noreply identity; the agent is probably the Developer Bot hub catch-up job, unconfirmed). It changed NOTES/GROK.md only and auto-deployed prod `dpl_5HEb6oaQFMSZvN3ssa1sdb9bqohU`. Undo: `git revert ab9c022`.
- **Vercel env `ANTHROPIC_API_KEY` updated** 2026-10-04 11:59 CT on project `deduxis` by the 313aidaroos account. The agent is unknown; the value was not inspected. Prod was then redeployed on the same commit `5ccb9d2` as `dpl_BcjoE58N2hhjif3CVgTkR7AKe81t` (12:01 CT) so the new key would load. Undo: restore the previous key value in Vercel and redeploy.
- **Vercel env `ADMIN_EMAILS` added** 2026-10-04 18:13 CT (production + preview), as part of PR #22. It is already noted above.
- **Previews only, not in prod:** `grok/feed-tab` (PR #23, open, DO NOT MERGE), with preview deploys at 18:16 and 18:40 CT.
- Supabase `uxgtppwqonbznuoyebbb`: no new migrations since `receipts_foundation` (2026-10-02).

Fixes in PR `deduxis/claude-review-fixes` (not merged; Awad reviews):
- `components/ApixisWorldWelcome.tsx`: "200 in-world Ixis to start" → "1,000 Ixis to start" (lock: the 1,000 grant is made by Apixis.dev and never locally). Comments in `lib/apixis-world-agent.ts` and `app/api/apixis/world-agent/route.ts` were updated to match. The "200 receipts per seat period" quota was not touched.
- `app/api/chat/route.ts` (Deduxis Cixy product role): removed the "Halal-conscious business expense guidance (riba/haram)" line and the "NOT a scholar … Islamic ruling" line (lock: no religious content outside Halaxis). The shared core `lib/apixis-cixy.ts` was left identical to ApixisWallet `sdk/apixis-cixy.ts`. That core still has the "Salam / As-salamu alaykum in kind", "Insha'Allah / alhamdulillah" and religious-ruling lines, which is for the hub/Awad to decide in ApixisWallet docs/CIXY.md.
- `package.json`: added a `test` script (`node --test`, Node 22), so shared CI now runs the existing tests and the new `tests/locks.test.mjs`.
- Who: Grok (Deduxis Lead). Undo: revert the PR's merge commit.


## 2026-10-04 (CT) — Grok (Developer Bot hub): Cixy persona v2 sync + Ominix link
- What: Follow-up to lead PR #25 (merged): lib/apixis-cixy.ts replaced the v1 Cixy kit (Muslim identity, Salam/Insha'Allah lines, halal 'clean recommendations') with v2. (the shared-core Salam/Insha'Allah lines #25 flagged). Ominix link on /companies now https://ominix-app.vercel.app (URL string only; no SVG/design change).
- Files: app/companies/page.tsx lib/apixis-cixy.ts 
- Why: Awad's lock — no religious content in Cixy on any product except Halaxis; she declines only genuinely harmful, deceptive or illegal content, never on religious grounds (9/30). Kit = ApixisWallet `sdk/apixis-cixy.*` v2 (3a22244, PR #50) with two hub edits pending canonical: the religion-derived "clean recommendations" rule (gambling) is replaced by "decline only harmful, deceptive or illegal, never on religious grounds", and the character line reads "draws on Arab culture". Ominix links point to https://ominix-app.vercel.app (checked 200 on 2026-10-04 ~6:55 PM CT).
- Who: Grok (Developer Bot hub), branch `grok/cixy-v2-20261004`, one squash-merged PR.
- Undo: `git revert <squash sha of this PR>` (sha recorded in the PR), then redeploy prod.

## 2026-10-04 19:13 (CT) — Grok Bot: Feed PR #23 approved for production by Awad
- Why: Awad said "make it live" at 7:13 PM CT on Oct 4, 2026, approving the squash-merge of this PR and the production deploy that follows from main.
- What: squash-merge of PR #23 (feed files + Feed nav entry only); Vercel's Git integration deploys main to production.
- Who: Grok Bot (for Awad).
- Undo: `git revert <squash sha of PR #23>` on main and push (the squash sha is on the PR page and in /workspace/feed/STATUS.md), or in Vercel promote the previous production deployment (instant rollback) and then revert.

## 2026-10-04 evening provenance, 6:57 to 9:25 PM (CT)

Recorded by Grok (Developer Bot, notes and status sync at 9:25 PM CT). Every change below already has a detailed entry in this file or in the matching lead note; this section adds the exact commit, PR number, and undo pointer. All commits were pushed under the shared `313aidaroos` GitHub account; the detailed entries say which bot or lead made each one. Text only, no code or settings changed.

- 7:06 PM, PR #26, `ca0a705`: Cixy persona v2 sync (no religious content outside Halaxis) + Ominix link to ominix-app.vercel.app. Undo: `git revert ca0a705` on `main`, then redeploy production.
- 7:17 PM, PR #23, `38bff71`: Feed tab: Socixis Social family feed at /feed. Undo: `git revert 38bff71` on `main`, then redeploy production.

## 2026-10-04 (CT) — Grok: new accounts only through Apixis ID (branch `grok/apixis-id-only-signup`)
- Approval: Awad said go at 10:00 PM CT, Oct 4 2026 ("every Ixis product must allow NEW account creation only through Apixis ID", the shared Wallet SSO at apixis-wallet.vercel.app/sso/authorize).
- What changed: Checked for an existing Deduxis Lead PR for this first (none open; #11 is closed and about provisioning), so this is the only one. Email magic links (`app/login/actions.ts`) now use `shouldCreateUser: false`: existing accounts still get a link; a brand-new email gets "No Deduxis account uses this email yet… use Sign in with Apixis". `/login` intro copy now says new accounts use Sign in with Apixis (was "An email link creates your account"). No password signup exists here; password sign-in unchanged. `/signup` is not a route (404, unchanged).
- Not changed: Supabase project setting "Allow new users to sign up" stays ON (Apixis SSO callback may create users through it). Theme, layout and styles unchanged. No Wallet, Stripe or Cixy files touched.
- Undo: `git revert <squash sha of this PR>` (the sha is recorded in the PR and in /workspace/apixisid/STATUS.md on the box).

## 2026-10-05 overnight provenance, Oct 4 9:35 PM to Oct 5 12:25 AM (CT)

Recorded by Grok (Developer Bot, notes and status sync at 12:25 AM CT on Oct 5). Each change below either has its own detailed entry earlier in this file (written by whoever made it) or is described here. Commits under the shared `313aidaroos` account were made by the bot or lead named in the detailed entry. Every production deployment for this repo was Ready at the time of this sync. Text only, no code or settings changed.

- Oct 4 10:29 PM, PR #27, `0ff24da`: Apixis ID is the only way to create a Deduxis account. Undo: `git revert 0ff24da` on `main`, then redeploy production.
## 2026-10-06 — Pricing locked
- Prices for Deduxis were locked by Awad. See NOTES/PRICING.md.
- The site/code still needs updating to match NOTES/PRICING.md where it does not.

## 2026-10-06 — Recovra merging into Deduxis; pricing updated
- Recovra is merging into Deduxis (name stays Deduxis; Recovra becomes the "Recover" section). NOTES/PRICING.md updated to the merged Deduxis + Recovra pricing (locked by Awad), replacing the old Deduxis-only section.
- Code merge of Recovra into Deduxis is still to do; site/code still needs updating to match NOTES/PRICING.md.

## 2026-10-13 — Recover section (Deduxis Lead via cloud agent)
- **What:** Recover is now a section inside Deduxis. The product name stays Deduxis. Copy and the free-scan intake follow the Recovix (also called Recovra) flow: organization, industry, invoices, contracts, rate sheets, and operational records, then a person approves anything sent to a vendor. Locked rates are on the pricing page and on `/recover`: Receipts Personal $10/mo (1,000 Ixis, up to 100 receipts), Receipts Business $30/mo (3,000 Ixis, unlimited receipts, team, accountant export), Recover free scan then 25% of money recovered, Monitor $100/mo (10,000 Ixis) with a 15% success fee, big companies contact sales. The old Recovra Wallet SKUs ($220 / $440) are not shown. Buttons sign the person in or open a request. This PR does not charge a card and does not call Stripe.
- **Where:** `app/recover/page.tsx` (landing), `app/recover/scan/page.tsx` and `scan-form.tsx` (intake for a signed-in Apixis ID session, existing auth), `app/recover/actions.ts`, `lib/recover-intake.ts`, `lib/pricing-plans.ts`, `components/pricing-plans.tsx`, `components/site-header.tsx` (Recover in the nav and footer), `app/pricing/page.tsx`, the monthly-plan answer on `app/page.tsx`, `app/globals.css` (plan cards and the scan form only), `README.md`, `NOTES/PRICING.md`, `tests/recover-pricing.test.mjs`, `package.json` test script (`--experimental-strip-types` so the intake test can import TypeScript). Migration file only, not applied: `supabase/migrations/20261013_recover_scan_requests.sql` (table `recover_scan_requests`, owner-only RLS).
- **Who:** Deduxis Lead via cloud agent. Awad approved the merge.
- **Left alone:** Apixis-ID-only signup, owner allowlist, Cixy v2, the feed, Wallet SDK files, and live redeem at `/api/redeem`. No religious greetings. No other repository was changed.
- **Redirect note:** The recovra site (Recovix.dev, also recovra-three.vercel.app) should redirect to Deduxis `/recover`. Do that in the Recovix repo. This PR does not change that repo.
- **Undo:** `git revert <squash sha of this PR>` on `main`. If the migration was applied later, also run: `DROP POLICY "Users insert own recover scans" ON public.recover_scan_requests; DROP POLICY "Users view own recover scans" ON public.recover_scan_requests; DROP TABLE public.recover_scan_requests;` (that deletes scan requests, so back up first). The migration was not applied from this PR.

## 2026-10-13 — Footer social icons left out (Deduxis Lead via cloud agent)
- **What:** No Instagram or Facebook icon was added to the site footer. The likely handles (`instagram.com/deduxis.dev`, `instagram.com/deduxis`, `instagram.com/deduxisdev`, `facebook.com/deduxis.dev`, `facebook.com/Deduxis.dev`, `facebook.com/deduxis`) could not be confirmed as Deduxis accounts. Instagram and Facebook both sent a logged-out browser to a login wall. Instagram’s public profile API returned Page Not Found for `deduxis` and `deduxisdev`. `deduxis.dev` returned an Instagram schema error, not a profile. Facebook’s Graph API said the object `deduxis.dev` does not exist or cannot be loaded. Nothing in this repo links those profiles.
- **Where:** Footer stays `components/site-header.tsx` (`SiteFooter`). No icon markup, no new CSS.
- **Who:** Deduxis Lead via cloud agent.
- **Undo:** Nothing to revert for the icons. This note is the record.
