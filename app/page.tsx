import Link from "next/link";
import Image from "next/image";
import { SiteHeader, SiteFooter } from "@/components/site-header";
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="hero container">
          <div className="hero-copy">
            <p className="eyebrow">
              A little less paperwork. A lot more clarity.
            </p>
            <h1>
              Every receipt.
              <br />
              <em>
                Everything
                <br className="desktop-break" /> in order.
              </em>
            </h1>
            <p className="hero-description">
              Turn everyday receipts into organized records you can review,
              categorize, and export. More time for the business you love.
            </p>
            <div className="button-row">
              <Link className="button primary" href="/login">
                Get started <span aria-hidden>↗</span>
              </Link>
              <Link className="button secondary" href="/demo">
                Explore the workspace <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="hero-note">
              <span className="check-dot">✓</span> Your receipts. Your records.
              One organized place.
            </div>
          </div>
          <div className="hero-visual">
            <Image
              src="/images/receipt-desk.webp"
              alt="A business owner photographing a receipt at a colorful, sunlit desk"
              fill
              preload
              sizes="(max-width: 760px) 100vw, 55vw"
            />
            <div className="floating-receipt">
              <div className="float-top">
                <span className="mini-file" aria-hidden>
                  ▤
                </span>
                <span className="badge mint">Ready to review</span>
              </div>
              <strong>Paper & Co.</strong>
              <div className="float-amount">$48.60</div>
              <span className="badge lavender">Office supplies</span>
              <small>Example receipt</small>
            </div>
            <div className="photo-caption">
              Small moments. Beautifully organized.
            </div>
          </div>
        </section>
        <section
          className="workflow container"
          id="how-it-works"
          aria-label="How it works"
        >
          {[
            [
              "01",
              "Upload",
              "Snap a photo or choose a receipt image.",
              "lavender",
              "↥",
            ],
            ["02", "Review", "Check the details. Make it yours.", "peach", "⌕"],
            ["03", "Organize", "Give every expense a place.", "mint", "▤"],
            [
              "04",
              "Export",
              "Take clean records to your accountant.",
              "yellow",
              "↗",
            ],
          ].map(([n, title, copy, color, icon]) => (
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
        <section className="feature-section container" id="features">
          <div className="feature-photo">
            <Image
              src="/images/receipt.webp"
              alt="A paper receipt ready to organize"
              fill
              sizes="(max-width: 760px) 90vw, 25vw"
            />
            <span className="photo-label">The small details add up.</span>
          </div>
          <div className="feature-copy">
            <p className="eyebrow">LESS CLUTTER. MORE CONFIDENCE.</p>
            <h2>
              A clear view of your
              <br />
              business expenses.
            </h2>
            <p>
              From daily coffee to office supplies, keep your receipts together.
              Find what you need, check every detail, and head into tax time a
              little lighter.
            </p>
            <Link href="/demo" className="text-link">
              Find your flow <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="mini-workspace">
            <div className="section-heading">
              <strong>Recent receipts</strong>
              <span className="badge lavender">Example</span>
            </div>
            {[
              ["Paper & Co.", "Office supplies", "$48.60", "lavender"],
              ["Corner Cafe", "Meals", "$23.40", "peach"],
              ["City Parking", "Travel", "$16.00", "mint"],
            ].map(([name, cat, amount, color]) => (
              <div className="mini-row" key={name}>
                <span className="mini-file" aria-hidden>
                  ▤
                </span>
                <div>
                  <strong>{name}</strong>
                  <span className={`badge ${color}`}>{cat}</span>
                </div>
                <b>{amount}</b>
              </div>
            ))}
            <div className="mini-foot">
              A place for every receipt. A little more peace of mind.
            </div>
          </div>
        </section>
        <section className="benefits container">
          <div>
            <span className="eyebrow">BUILT FOR YOUR EVERYDAY</span>
            <h2>
              A better rhythm
              <br />
              for your receipts.
            </h2>
          </div>
          <article>
            <span className="badge mint">01 · Keep the original</span>
            <h3>The picture and the details.</h3>
            <p>
              Review the receipt image alongside the extracted information. You
              always have the final say.
            </p>
          </article>
          <article>
            <span className="badge peach">02 · Ready to hand over</span>
            <h3>Your records, ready to go.</h3>
            <p>
              Download a CSV with your categories and notes. Share it with your
              accountant or map it into your accounting tool.
            </p>
          </article>
        </section>
        <section className="faq-section container" id="faq">
          <div>
            <p className="eyebrow">GOOD QUESTIONS</p>
            <h2>
              A little clarity
              <br />
              before you begin.
            </h2>
            <Link className="text-link" href="/chat">
              Ask Cixy →
            </Link>
          </div>
          <div className="faq-list">
            {[
              [
                "What can I upload?",
                "Upload JPG, PNG, or WebP receipt images, up to 3 MB each. For a PDF or HEIC receipt, first export it as one of these supported image formats.",
              ],
              [
                "Can I correct the extracted details?",
                "Yes. Review and edit the merchant, date, amount, category, and notes before saving. You can also reopen saved receipts and update them.",
              ],
              [
                "Is Deduxis a tax adviser?",
                "Deduxis helps organize records and suggests categories. It does not determine deductibility or file taxes. Confirm filing decisions with a qualified tax professional.",
              ],
              [
                "How does the monthly plan work?",
                "Receipts Personal is $10 a month (up to 100 receipts). Receipts Business is $30 a month. Recover starts with a free scan, then 25% of money recovered. Monitor is $100 a month, and those subscribers pay 15%. See pricing.",
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
        <section className="final-cta container">
          <span className="eyebrow">MAKE ROOM FOR WHAT MATTERS</span>
          <h2>
            Your next chapter.
            <br />A little more organized.
          </h2>
          <Link className="button light" href="/login">
            Let’s get started <span aria-hidden>↗</span>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
