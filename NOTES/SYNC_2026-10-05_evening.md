# Evening sync (2026-10-05, Deduxis Lead) — read-only

COMPANY: Deduxis | LIVE: https://deduxis.vercel.app | HEAD: 90b2804 (live matches: y) | % READY: 85%

NEW SINCE MY LAST REPORT (30h window, all 313aidaroos):
- Apixis ID only (0ff24da, PR #27) — magic link now serves existing accounts only
- Feed tab (38bff71, PR #23) — /feed returns 200, Socixis Social family feed
- Cixy v2 (ca0a705, PR #26) — no religious content outside Halaxis, Ominix link fixed
- 1,000 Ixis welcome copy (f1742af, PR #25) — fixed "200 Ixis" bug, test script added
- Owner allowlist (3a2df67, PR #22) — proven owner skips seat gate + 200 receipt cap
- Notes syncs (8daf89b, c2f18ed, ab9c022) — provenance + status

WHERE WE STAND:
- Customer can: sign in with Apixis ID only, buy 15k Ixis seat, upload/extract/export receipts (200/mo cap), chat Cixy (no religion), get world agent + 1,000 Ixis, see family Feed tab, support form, companies page
- Customer cannot: create email-only account (removed), buy per-receipt overage (no SKU exists)

WHAT I GOT WRONG THIS MORNING:
- "Muslim identity was correct" — WRONG, D16 + Cixy v2 removed it everywhere except Halaxis
- "200 Ixis was correct" — WRONG, D11 lock = 1,000 (fixed by PR #25)
- "Support form, Cixy test, mobile 390px were blockers" — WRONG, all shipped/verified live, FAMILY_STATUS line 34 says "Open: none recorded"

NEXT 3:
[ME] Re-copy lib/apixis-world.ts from Apixis.dev (add aidaroosholding per FAMILY_STATUS line 57)
[ME] Remove false "Extra receipts metered" claim from README (no SKU exists)
[AWAD-ONLY] Decide per-receipt overage SKU pricing or drop claim entirely; leaked-password toggle (OFF per FAMILY_STATUS line 51); footer PR #10 approval

NOTES:
- Deduxis line in FAMILY_STATUS (line 34): "Apixis-ID-only signup (PR #27). Open: none recorded."
- AI_CHANGELOG.md ends at 2026-10-04 Claude review (no 2026-10-05 entries yet)
- No new commits by Codex/Cursor/Grok in this repo — all by 313aidaroos / Awad
- Live check: HEAD 90b2804, production 200, /feed renders, /api/apixis/world-agent unauth = 401
