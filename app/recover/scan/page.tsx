import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { ScanForm } from "./scan-form";

export const metadata: Metadata = {
  title: "Free scan",
  description:
    "Request a free Recover scan. Signed-in Apixis ID accounts only.",
};

export const dynamic = "force-dynamic";

async function signedInEmail(): Promise<string | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email ?? null;
  } catch {
    return null;
  }
}

export default async function RecoverScanPage() {
  const email = await signedInEmail();

  return (
    <>
      <SiteHeader />
      <main id="main" className="pricing-page container">
        <div className="page-intro">
          <span className="eyebrow">FREE SCAN</span>
          <h1>Tell us where to look.</h1>
          <p>
            Share the organization, the industry, and the bills you want
            checked. We compare them with the agreement and the activity behind
            the charge.
          </p>
        </div>
        <div className="content-card scan-card">
          {email ? (
            <ScanForm email={email} />
          ) : (
            <>
              <h2>Sign in to request a scan.</h2>
              <p>
                Free scans are for signed-in Apixis ID accounts. One Apixis
                account covers Deduxis and the rest of the family.
              </p>
              <div className="button-row">
                <Link
                  className="button primary"
                  href="/auth/apixis/start?next=/recover/scan"
                >
                  Sign in with Apixis <span aria-hidden>↗</span>
                </Link>
                <Link
                  className="button secondary"
                  href="/login?next=/recover/scan"
                >
                  Existing sign-in <span aria-hidden>→</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
