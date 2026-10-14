# Deduxis launch readiness

_2026-10-14. Public launch **2027-01-01**. Marketing starts **2026-12-01**. The product is in beta. This file is the launch list. Older notes in `docs/LAUNCH_NOTES.md` stay as history._

Reviewed: `main` (includes merged PR #32, Recover, and merged PR #33, the Instagram footer). Open draft PR #31 is the Orbit handoff. This branch keeps the footer and does not merge or deploy anything.

## Done

- **Product.** Receipt upload, review, categories, private storage, CSV export, Cixy chat, demo, support form, companies page, family feed, world-agent welcome.
- **Recover (PR #32, on main).** `/recover` and a signed-in free scan at `/recover/scan`. Same Deduxis theme and logo. Scan requests wait on `supabase/migrations/20261013_recover_scan_requests.sql`, which is **not applied**.
- **Accounts.** New accounts only through Apixis ID (`/auth/apixis/start`). Magic links use `shouldCreateUser: false`. There is no password signup. Password sign-in and set-password stay available for an account that already exists.
- **Ixis.** One balance, in Apixis Wallet. Redeem uses the Apixis ID `sub` when the person signed in with Apixis. This site does not store an Ixis balance and does not sell Ixis.
- **Locked prices on the page.** Receipts Personal $10/mo (1,000 Ixis, 100 receipts). Receipts Business $30/mo (3,000 Ixis, unlimited receipts). Recover: free scan, then 25% of money recovered. Monitor $100/mo (10,000 Ixis) and a 15% success fee. Enterprise: contact sales. Monthly plans renew monthly.
- **Card checkout (this branch).** Stripe Checkout, subscription mode, one Price id per plan from the environment. Metadata `product=deduxis` on the session and the subscription. The webhook ignores any other product on the shared Apixis Dev LLC account. No `payment_method_types`. Stripe Tax is off.
- **Purchase records (this branch).** A paid card invoice and a successful Ixis redeem each write one `purchase_ledger` row and one `purchase_receipts` row. The same Stripe invoice cannot be written twice. Refunds, disputes, and early-fraud warnings update the ledger row when the charge id is known. `/account/purchases` lists them. The success page does not mark a card payment as finished; the webhook does.
- **Seats.** Personal caps receipts at 100 a month. Business is unlimited. The old Wallet key `deduxis.receipts.monthly` still opens a seat at the old 200 cap and is not sold. An active card subscription for Personal or Business counts as a seat. Monitor does not include the receipt seat.
- **Cixy.** The Deduxis role is appended through the shared kit `cixySystemPrompt` in `lib/apixis-cixy.ts`. No second brain, no religious greeting. If asked, she says the public launch is January 1, 2027 and marketing starts December 1, 2026, and that Recover is Deduxis (Recovra / Recovix folded in, same theme). She quotes only the locked prices.
- **Safety in this branch.** Checkout and Ixis redeem refuse to charge when the Stripe price, the Wallet key, or the purchase tables are missing. No email is sent by the new billing code. Secrets are env vars only and are not printed.

## Left — needs the owner

These cannot be finished from the repo alone. Nothing here was merged or deployed.

1. **Keys.** Confirm production and preview env vars, values not listed here: `STRIPE_SECRET_KEY` (restricted `rk_` key on the Apixis Dev LLC account, test mode until go-live), `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` (already required for Apixis ID), `WALLET_API_KEY`, `ANTHROPIC_API_KEY`, Supabase URL and anon key. Names are in `.env.example`.
2. **Stripe products.** On that one Apixis Dev LLC account, create a separate Product for each plan, with its own monthly Price:
   - Receipts Personal — $10/month → `STRIPE_PRICE_RECEIPTS_PERSONAL`
   - Receipts Business — $30/month → `STRIPE_PRICE_RECEIPTS_BUSINESS`
   - Monitor — $100/month → `STRIPE_PRICE_MONITOR`
   - Point the webhook at `https://deduxis.vercel.app/api/stripe/webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `charge.dispute.created`, and `radar.early_fraud_warning.created`.
   - Stripe Tax is not turned on. Turn it on only after a tax registration exists. Without a registration, Stripe collects no tax.
3. **Wallet catalog.** Add three monthly SKUs (100 Ixis = $1) and retire the old single seat from sale: `deduxis.receipts.personal.monthly` (1,000), `deduxis.receipts.business.monthly` (3,000), `deduxis.monitor.monthly` (10,000). Keep `deduxis.receipts.monthly` only so current seats still open. Retire `recovra.intel.monthly` and `recovra.intel.growth`.
4. **Production database.** Apply, in order, on Supabase `uxgtppwqonbznuoyebbb`:
   - `supabase/migrations/20261013_recover_scan_requests.sql`
   - `supabase/migrations/20261014_purchase_ledger.sql`
   Do not apply them from a pull request. Card and Ixis checkout stay closed until the purchase tables exist.
5. **Production smoke test**, after the four items above, on the beta site: Apixis ID sign-in, one test-mode card subscription, one Ixis redeem, a receipt on `/account/purchases`, a Wallet receipt, and a receipt upload under the Personal cap. Then a live-mode switch only when you mean to charge real cards.
6. **Success fees.** The 25% Recover fee and the 15% Monitor fee are calculated in `successFeeCents`. They are not collected. Collecting one needs a confirmed recovered amount from the ops side, then a one-time charge. There is no button that lets a customer type an amount.
7. **Recovix redirect.** The recovra / recovix site should redirect to Deduxis `/recover`. That change is in the other repo.
8. **Instagram footer (PR #33, merged).** The footer links to `https://www.instagram.com/deduxis.dev/`. This branch keeps that link. Facebook stays off until that Page exists.
9. **Draft PR #31.** Orbit capability notes only (`runtimeConnected: false`). Not required for the January 1 customer launch.

## Left — product, not a launch blocker for billing

- Category overrides: the table exists, the screen does not.
- Mileage and per-diem logs.
- AI Receptionist: family note says not to build it in this repo until the Contraxis pilot is reviewed.
- Leaked-password protection in the Supabase dashboard (owner toggle).
- Customer emails from Stripe (receipts, dunning) are dashboard settings. This repo does not send mail.

## Undo

Revert this branch's commits, or leave the draft PR closed. If the purchase migration was applied later, drop `purchase_receipts`, `purchase_ledger`, and `billing_subscriptions` only after a backup. That deletes purchase history.
