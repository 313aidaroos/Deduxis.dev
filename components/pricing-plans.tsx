import Link from "next/link";
import { PRICING_PLANS } from "@/lib/pricing-plans";
import { PlanPay } from "@/components/plan-pay";

export function PricingPlans() {
  return (
    <div className="plan-grid">
      {PRICING_PLANS.map((plan) => (
        <article
          className={plan.featured ? "plan-card featured" : "plan-card"}
          key={plan.name}
        >
          <span className={`badge ${plan.badge}`}>{plan.kicker}</span>
          <h2>{plan.name}</h2>
          <div className="price-number">
            {plan.price}
            {plan.priceSuffix ? <span>{plan.priceSuffix}</span> : null}
          </div>
          <p className="price-note">{plan.cadence}</p>
          <p>{plan.summary}</p>
          <ul>
            {plan.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          {plan.action === "subscribe" ? (
            <PlanPay plan={plan.id} />
          ) : (
            <Link className="button primary" href={plan.href}>
              {plan.cta} <span aria-hidden>↗</span>
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}
