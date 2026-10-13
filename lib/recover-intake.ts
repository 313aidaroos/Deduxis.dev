/** Free Recover scan request. Adapted from the Recovix intake (organization, industry, invoices, contracts, rate sheets). */

export const RECOVER_INDUSTRIES = [
  "Logistics",
  "Technology",
  "Telecom",
  "Ecommerce",
  "Manufacturing",
  "Construction",
  "Hospitality",
  "Retail",
  "Other",
] as const;

export const RECOVER_DOCUMENT_KINDS = [
  { id: "invoices", label: "Invoices and bills" },
  { id: "contracts", label: "Contracts" },
  { id: "rate_sheets", label: "Rate sheets and tariffs" },
  { id: "operational", label: "Operational records (shipments, seats, usage)" },
] as const;

export const ANNUAL_SPEND_BANDS = [
  "Under $250,000",
  "$250,000 to $1 million",
  "$1 million to $10 million",
  "Over $10 million",
] as const;

const KIND_IDS: readonly string[] = RECOVER_DOCUMENT_KINDS.map((kind) => kind.id);

export type RecoverScanValue = {
  organization: string;
  industry: (typeof RECOVER_INDUSTRIES)[number];
  documentKinds: string[];
  vendors: string;
  annualSpend: string;
  notes: string;
};

export type RecoverScanResult =
  | { ok: true; value: RecoverScanValue }
  | { ok: false; error: string };

export function validateRecoverScan(input: {
  organization?: unknown;
  industry?: unknown;
  documentKinds?: unknown;
  vendors?: unknown;
  annualSpend?: unknown;
  notes?: unknown;
}): RecoverScanResult {
  const organization = String(input.organization ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (organization.length < 2 || organization.length > 120) {
    return {
      ok: false,
      error: "Enter your organization name (2 to 120 characters).",
    };
  }

  const industry = String(input.industry ?? "");
  if (!(RECOVER_INDUSTRIES as readonly string[]).includes(industry)) {
    return { ok: false, error: "Choose an industry." };
  }

  const rawKinds = Array.isArray(input.documentKinds) ? input.documentKinds : [];
  const documentKinds = rawKinds
    .map((kind) => String(kind))
    .filter((kind) => KIND_IDS.includes(kind));
  if (documentKinds.length === 0) {
    return { ok: false, error: "Choose at least one kind of document." };
  }

  const vendors = String(input.vendors ?? "").trim();
  if (vendors.length > 500) {
    return { ok: false, error: "Vendor names need to be 500 characters or fewer." };
  }

  const annualSpend = String(input.annualSpend ?? "").trim();
  if (
    annualSpend &&
    !(ANNUAL_SPEND_BANDS as readonly string[]).includes(annualSpend)
  ) {
    return { ok: false, error: "Choose a spend range from the list." };
  }

  const notes = String(input.notes ?? "").trim();
  if (notes.length > 2000) {
    return { ok: false, error: "Notes need to be 2,000 characters or fewer." };
  }

  return {
    ok: true,
    value: {
      organization,
      industry: industry as RecoverScanValue["industry"],
      documentKinds,
      vendors,
      annualSpend,
      notes,
    },
  };
}
