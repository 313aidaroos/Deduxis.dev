/** Locked rates (Awad, 2026-10-06). Checkout lives in PlanPay; this list is the copy. */
export type PricingPlan = {
  id: "receipts_personal" | "receipts_business" | "recover" | "monitor" | "enterprise";
  name: string;
  kicker: string;
  badge: "lavender" | "peach" | "mint" | "yellow";
  price: string;
  priceSuffix: string;
  cadence: string;
  summary: string;
  points: string[];
  href: string;
  cta: string;
  /** subscribe = card or Ixis. scan and contact do not charge here. */
  action: "subscribe" | "scan" | "contact";
  featured?: boolean;
};

export const IXIS_PER_DOLLAR = 100;

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "receipts_personal",
    name: "Receipts Personal",
    kicker: "Receipts",
    badge: "lavender",
    price: "$10",
    priceSuffix: "/mo",
    cadence: "1,000 Ixis · card or Ixis",
    summary: "A calm place for a smaller set of business receipts.",
    points: [
      "Up to 100 receipts a month",
      "Review, categorize, and export",
      "The photo stays with the details",
    ],
    href: "/login?next=/pricing",
    cta: "Sign in",
    action: "subscribe",
  },
  {
    id: "receipts_business",
    name: "Receipts Business",
    kicker: "Receipts",
    badge: "peach",
    price: "$30",
    priceSuffix: "/mo",
    cadence: "3,000 Ixis · card or Ixis",
    summary: "For a team that hands clean records to an accountant.",
    points: [
      "Unlimited receipts",
      "Team access",
      "Accountant export",
    ],
    href: "/login?next=/pricing",
    cta: "Sign in",
    action: "subscribe",
    featured: true,
  },
  {
    id: "recover",
    name: "Recover",
    kicker: "Free scan",
    badge: "mint",
    price: "25%",
    priceSuffix: "",
    cadence: "of money recovered",
    summary: "Find overcharges and get the money back.",
    points: [
      "The scan is free",
      "No recovery, no charge",
      "25% of money that comes back",
    ],
    href: "/recover/scan",
    cta: "Request a free scan",
    action: "scan",
  },
  {
    id: "monitor",
    name: "Monitor",
    kicker: "Every new bill",
    badge: "yellow",
    price: "$100",
    priceSuffix: "/mo",
    cadence: "10,000 Ixis · card or Ixis",
    summary: "Watches every new bill for overcharges.",
    points: [
      "Continuous watch on new bills",
      "15% success fee instead of 25%",
      "The fee applies only when money comes back",
    ],
    href: "/login?next=/pricing",
    cta: "Sign in",
    action: "subscribe",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    kicker: "Contact sales",
    badge: "lavender",
    price: "Custom",
    priceSuffix: "",
    cadence: "Scoped to your spend",
    summary: "Larger organizations with many vendors and sites.",
    points: [
      "A scope built around your spend",
      "Card or Ixis",
      "Talk with the Deduxis team",
    ],
    href: "/support",
    cta: "Contact sales",
    action: "contact",
  },
];
