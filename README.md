# Deduxis — Receipt Intelligence

Capture receipts, extract line items, categorize deductions, export for tax time.

## Stack

- Next.js 15 + TypeScript + Tailwind
- Supabase (auth + storage + database)
- Anthropic Claude (Cixy chat + receipt extraction)
- Special Elite font (Apixis family standard)

## Local Setup

1. Clone and install:
```bash
git clone https://github.com/313aidaroos/Deduxis.git
cd Deduxis
npm install
```

2. Set up Supabase:
   - Create a project at https://supabase.com
   - Run `supabase/schema.sql` in the SQL Editor
   - Create a storage bucket named `receipts` with private access + RLS enabled

3. Set up environment:
```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials:
# - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from Supabase
# - ANTHROPIC_API_KEY from https://console.anthropic.com
```

4. Run dev server:
```bash
npm run dev
```

Visit http://localhost:3000

## Pricing

- **Receipt Intelligence seat**: 15,000 Ixis/month ($150)
  - Includes 200 receipts/month

## Features

- ✅ Magic link authentication (Supabase)
- ✅ Cixy chat: friendly, professional expense assistant with a neutral tone and "not a CPA" disclaimers
- ✅ Receipt upload and vision extraction (Anthropic Claude)
- ✅ Structured data: merchant, date, total, tax, line items, payment method (last 4 only)
- ✅ Schedule C business category suggestions
- ✅ Receipt storage (Supabase Storage + RLS, private + PII-safe)
- ✅ CSV export (standard + QuickBooks-compatible)
- ✅ Apixis Wallet integration (redeem seat with Ixis, 402 handling)
- 🚧 Category overrides and merchant memory (DB table exists, UI not wired)
- 🚧 Mileage tracking and per-diem logs

## Family

Part of the Apixis family. Powered by Ixis.
