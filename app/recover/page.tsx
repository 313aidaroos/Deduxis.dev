import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { PricingPlans } from "@/components/pricing-plans";

export const metadata: Metadata = {
  title: "Recover",
  description:
    "Find overcharges and get the money back. A free scan, then 25% of money recovered.",
};

const steps: [string, string, string, string, string][] = [
  [
    "01",
    "Share",
    "Send invoices, contracts, and rate sheets for the vendors you want checked.",
    "lavender",
    "↥",
  ],
  [
    "02",
    "Compare",
    "Each charge is matched to the agreement and the activity behind it.",
    "peach",
    "⌕",
  ],
  [
    "03",
    "Prove",
    "A finding shows what was billed, what was expected, and where it came from.",
    "mint",
    "▤",
  ],
  [
    "04",
    "Recover",
    "We help get the money back. Nothing is billed unless money comes back.",
    "yellow",
    "↗",
  ],
];

export default function RecoverPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="hero container">
          <div className="hero-copy">
            <p className="eyebrow">Recover · a section of Deduxis</p>
            <h1>
              Find overcharges.
              <br />
              <em>Get the money back.</em>
            </h1>
            <p className="hero-description">
              Recover reads invoices, contracts, and the activity behind them.
              When a charge does not match what you agreed, you get the proof
              and a path to the refund. The scan is free.
            </p>
            <div className="button-row">
              <Link className="button primary" href="/recover/scan">
                Request a free scan <span aria-hidden>↗</span>
              </Link>
              <Link className="button secondary" href="#pricing">
                See pricing <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="hero-note">
              <span className="check-dot">✓</span> No recovery, no charge. 25%
              only when money comes back.
            </div>
          </div>
          <div className="hero-visual">
            <Image
              src="/images/receipt.webp"
              alt="A paper bill ready for an overcharge scan"
              fill
              preload
              sizes="(max-width: 760px) 100vw, 55vw"
            />
            <div className="floating-receipt">
              <div className="float-top">
                <span className="mini-file" aria-hidden>
                  ▤
                </span>
                <span className="badge mint">Example finding</span>
              </div>
              <strong>Lane rate</strong>
              <div className="float-amount">$1,240</div>
              <span className="badge peach">Over the agreement</span>
              <small>Illustrative example · not a live claim</small>
            </div>
            <div className="photo-caption">Proof first. Then the refund.</div>
          </div>
        </section>

        <section
          className="workflow container"
          id="how-it-works"
          aria-label="How Recover works"
        >
          {steps.map(([n, title, copy, color, icon]) => (
            <div key={n} className={`step ${color}`}>
              <div className="step-top">
                <span>{n}</span>
                <span className="step-symbol" aria-hidden>
                  {icon}
                </span>
              </div>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
          ))}
        </section>

        <section className="benefits container">
          <div>
            <span className="eyebrow">WHERE OVERCHARGES HIDE</span>
            <h2>
              One scan.
              <br />
              The bills that drift.
            </h2>
          </div>
          <article>
            <span className="badge mint">01 · The documents</span>
            <h3>Invoices, contracts, rate sheets.</h3>
            <p>
              Freight, parcel, cloud, software, telecom, manufacturing,
              construction, hospitality, and retail. The scan starts from the
              files you already have.
            </p>
          </article>
          <article>
            <span className="badge peach">02 · A person approves</span>
            <h3>Nothing goes to a vendor alone.</h3>
            <p>
              Findings stay with you until someone on your team approves a
              claim. A scan explains the gap. It does not send a demand on its
              own.
            </p>
          </article>
        </section>

        <section className="faq-section container" id="faq">
          <div>
            <p className="eyebrow">GOOD QUESTIONS</p>
            <h2>
              Before the
              <br />
              first scan.
            </h2>
            <Link className="text-link" href="/recover/scan">
              Request a free scan →
            </Link>
          </div>
          <div className="faq-list">
            {[
              [
                "What does the free scan cost?",
                "Nothing up front. Deduxis keeps 25% of money actually recovered. If nothing comes back, you pay nothing. Monitor subscribers pay 15% instead of 25%.",
              ],
              [
                "What can I send?",
                "Invoices and bills, contracts, rate sheets, and operational records such as shipments, seats, or usage. Name the vendors and we start from there.",
              ],
              [
                "Will a claim go out on its own?",
                "No. A person approves anything that is sent to a vendor. The scan shows billed versus expected, with the source of each number.",
              ],
              [
                "Is this tax or legal advice?",
                "Recover helps find overcharges and organize the proof. It does not file a lawsuit or decide a tax position. Confirm the next step with your own advisors.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden>＋</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          className="pricing-page container recover-pricing"
          id="pricing"
          aria-label="Pricing"
        >
          <div className="page-intro">
            <span className="eyebrow">CARD OR IXIS</span>
            <h2>Clear rates. A free first scan.</h2>
            <p>
              100 Ixis equals $1. Monthly plans renew each month. Big companies
              talk with sales.
            </p>
          </div>
          <PricingPlans />
          <p className="pricing-fineprint">
            Pay by card or with Ixis. Receipts Personal is $10 a month. Receipts
            Business is $30 a month. Recover is a free scan, then 25% of money
            recovered. Monitor is $100 a month, and Monitor subscribers pay a
            15% success fee. Monthly plans renew each month. The free scan does
            not charge a card.
          </p>
        </section>

        <section className="final-cta container">
          <span className="eyebrow">START WITH A FREE SCAN</span>
          <h2>
            See what you
            <br />
            were overcharged.
          </h2>
          <Link className="button light" href="/recover/scan">
            Request a free scan <span aria-hidden>↗</span>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
