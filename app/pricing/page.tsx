import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { PricingPlans } from "@/components/pricing-plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Receipts Personal $10/mo, Receipts Business $30/mo, Recover free scan then 25%, Monitor $100/mo.",
};

export default function Pricing() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pricing-page container">
        <div className="page-intro">
          <span className="eyebrow">CARD OR IXIS</span>
          <h1>Receipts, Recover, and Monitor.</h1>
          <p>
            100 Ixis equals $1. Monthly plans renew each month. Big companies
            talk with sales.
          </p>
        </div>
        <PricingPlans />
        <p className="pricing-fineprint">
          Pay by card or with Ixis. Receipts Personal is $10 a month. Receipts
          Business is $30 a month. Recover is a free scan, then 25% of money
          recovered. Monitor is $100 a month, and Monitor subscribers pay a 15%
          success fee instead of 25%. Monthly plans renew each month. Enterprise
          is contact sales. Deduxis is in beta. The public launch is January 1, 2027.
          The free scan does not charge a card.{" "}
          <Link href="/account/purchases">Purchase receipts</Link> are saved with
          every card or Ixis payment.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
