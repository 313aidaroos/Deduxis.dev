# Claude notes (Deduxis)

Dated notes from Claude (Claude Code), same purpose as `NOTES/GROK.md`: what Claude checked or changed here, what it found, what is still open and who owns it. The one family status board is `ApixisWallet/docs/FAMILY_STATUS.md`.

## 2026-10-04 (UTC) — Claude: full-portfolio review (read-only; this note and the AI_CHANGELOG line are the only changes)

### Snapshot
- `main` @ `5ccb9d2` (notes backfill; code unchanged since 10-02). Vercel `deduxis` production READY on it.
- Supabase `uxgtppwqonbznuoyebbb`: `receipts` and `category_overrides` (both 0 rows) + the private `receipts` bucket (receipts_foundation, applied 10-02). Nothing else from `supabase/schema.sql` is live, and the app does not seem to need it.
- Open PR per the family board: #10 footer.

### Verified this session
- `npm run lint`, `typecheck`, `build`: all pass on Node 22.
- **No `test` script** — the two `*.test.ts` files are never run by the shared CI (`--if-present`).
- SDK: wallet, login, redirect, cixy, world provision identical to canonical. **`lib/apixis-world-agent.ts` is the OLD variant** (its comment still says "200 in-world Ixis once"); `apixis-world.ts` one revision behind like every site.
- Advisors: only the leaked-password WARN.

### Done (live)
Magic link + password + Apixis ID login, dashboard, receipts upload / list / CSV export, extraction (Claude), Cixy chat ("not a CPA"), pricing (`deduxis.receipts.monthly`, 15,000 Ixis), redeem via the Wallet (owner = Apixis `sub`), Wallet chip, world agent, support form (Resend), demo page, CI + lint fixes.

### Open — needs Awad
- PR #10 footer.
- README promises "Extra receipts metered via Apixis Wallet" — there is no per-receipt SKU in the Wallet catalog. Either approve a SKU/price or drop the claim.
- `SUPPORT_ROUTE_TO` / `EMAIL_FROM` values if not already set on Vercel.

### Open — Claude can do on your go
- **User-facing copy bug:** `components/ApixisWorldWelcome.tsx:59` "200 in-world Ixis to start" (D11 = 1,000). Also the comment in `app/api/apixis/world-agent/route.ts`; re-copy the world-agent kit from Apixis.dev.
- Add a `test` script so CI runs the existing tests.
- README: `cp .env.local.example` → the file is `.env.example`.
- `app/companies/page.tsx` links Ominix to `nexxis-tau.vercel.app` (retired host).
