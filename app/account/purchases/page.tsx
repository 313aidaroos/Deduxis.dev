import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { ManageCard } from "@/components/manage-card";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Purchase receipts",
  description: "Card and Ixis receipts for Deduxis plans.",
};

export const dynamic = "force-dynamic";

type ReceiptRow = {
  id: string;
  receipt_number: string;
  summary: string;
  created_at: string;
  ledger_id: string;
};

type LedgerRow = {
  id: string;
  channel: string;
  status: string;
  amount_usd_cents: number | null;
  ixis_amount: number | null;
};

async function signedIn() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { email: null as string | null, receipts: [] as ReceiptRow[], ledger: [] as LedgerRow[], missing: false };
  }
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return { email: null, receipts: [], ledger: [], missing: false };
    }
    const [receiptsResult, ledgerResult] = await Promise.all([
      supabase
        .from("purchase_receipts")
        .select("id, receipt_number, summary, created_at, ledger_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("purchase_ledger")
        .select("id, channel, status, amount_usd_cents, ixis_amount")
        .eq("user_id", user.id),
    ]);
    const missing =
      receiptsResult.error?.code === "42P01" ||
      (/purchase_receipts/i.test(receiptsResult.error?.message ?? "") &&
        /does not exist|schema cache/i.test(receiptsResult.error?.message ?? ""));
    return {
      email: user.email,
      receipts: (receiptsResult.data ?? []) as ReceiptRow[],
      ledger: (ledgerResult.data ?? []) as LedgerRow[],
      missing,
    };
  } catch {
    return { email: null, receipts: [], ledger: [], missing: false };
  }
}

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const params = await searchParams;
  const returned = params.checkout === "return";
  const { email, receipts, ledger, missing } = await signedIn();
  const ledgerById = new Map(ledger.map((row) => [row.id, row]));

  return (
    <>
      <SiteHeader />
      <main id="main" className="pricing-page container">
        <div className="page-intro">
          <span className="eyebrow">RECEIPTS FOR YOUR PLAN</span>
          <h1>Purchases.</h1>
          <p>
            Every card payment and every Ixis payment gets a receipt and a
            ledger entry. Deduxis is in beta ahead of the January 1, 2027
            launch.
          </p>
        </div>
        <div className="content-card scan-card">
          {!email ? (
            <>
              <h2>Sign in to see purchase receipts.</h2>
              <p>
                New accounts use Sign in with Apixis. An email link is only
                for an account that already exists.
              </p>
              <div className="button-row">
                <Link className="button primary" href="/auth/apixis/start?next=/account/purchases">
                  Sign in with Apixis <span aria-hidden>↗</span>
                </Link>
                <Link className="button secondary" href="/login?next=/account/purchases">
                  Existing sign-in <span aria-hidden>→</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              {returned ? (
                <p className="notice" role="status">
                  If you just paid by card, the receipt shows up here after
                  Stripe confirms the payment. Refresh in a moment. This page
                  does not mark a payment as finished on its own.
                </p>
              ) : null}
              <p>Signed in as {email}.</p>
              <ManageCard />
              {missing ? (
                <p role="status">
                  Purchase receipts are not on this database yet. A confirmed
                  payment still needs the ledger migration before it can be
                  listed here.
                </p>
              ) : receipts.length === 0 ? (
                <p role="status">
                  No purchases yet. Monthly plans are on the pricing page.
                </p>
              ) : (
                <div className="purchase-list">
                  {receipts.map((receipt) => {
                    const entry = ledgerById.get(receipt.ledger_id);
                    return (
                      <article className="plan-card" key={receipt.id}>
                        <span className="badge mint">{receipt.receipt_number}</span>
                        <h2>{entry?.channel === "ixis" ? "Ixis" : "Card"}</h2>
                        <p>{receipt.summary}</p>
                        <p>
                          {entry?.status === "paid" ? "Paid" : entry?.status ?? "Recorded"}
                          {entry?.ixis_amount
                            ? ` · ${entry.ixis_amount.toLocaleString("en-US")} Ixis`
                            : ""}
                          {entry?.amount_usd_cents != null
                            ? ` · $${(entry.amount_usd_cents / 100).toFixed(2)}`
                            : ""}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}
              <p>
                <Link href="/pricing">Back to pricing</Link>
              </p>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
