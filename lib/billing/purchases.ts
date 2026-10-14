import { PRODUCT } from "../catalog.ts";
import type { PurchaseDraft } from "./stripe-events.ts";

export class LedgerNotReady extends Error {
  constructor() {
    super("The purchase ledger is not on this database yet.");
    this.name = "LedgerNotReady";
  }
}

export class AlreadyRecorded extends Error {
  constructor() {
    super("This purchase is already recorded.");
    this.name = "AlreadyRecorded";
  }
}

export type LedgerInsert = {
  user_id: string;
  channel: "card" | "ixis";
  kind: PurchaseDraft["kind"];
  plan_key: string;
  product: typeof PRODUCT;
  amount_usd_cents: number | null;
  ixis_amount: number | null;
  status: "paid";
  idempotency_key: string;
  stripe_checkout_session_id: string | null;
  stripe_invoice_id: string | null;
  stripe_subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_customer_id: string | null;
  wallet_receipt_id: string | null;
  wallet_reservation_id: string | null;
  description: string;
};

export type StripeLinks = {
  stripe_checkout_session_id: string | null;
  stripe_invoice_id: string | null;
  stripe_subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_customer_id: string | null;
  wallet_receipt_id: string | null;
  wallet_reservation_id: string | null;
};

export type StoredLedger = { id: string } & StripeLinks;

export type PurchaseStore = {
  insertLedger(row: LedgerInsert): Promise<{ id: string } | { conflict: true }>;
  findLedger(idempotencyKey: string): Promise<StoredLedger | null>;
  insertReceipt(row: {
    ledger_id: string;
    user_id: string;
    receipt_number: string;
    summary: string;
  }): Promise<void>;
  fillLinks(id: string, links: StripeLinks): Promise<void>;
  deleteLedger(id: string): Promise<void>;
  setWalletReceipt(id: string, walletReceiptId: string): Promise<void>;
};

export function receiptNumberFor(ledgerId: string): string {
  const compact = ledgerId.replace(/-/g, "").toUpperCase();
  const tail = compact.slice(-12);
  if (!/^[0-9A-F]{12}$/.test(tail)) throw new Error("Receipt number needs a ledger id.");
  return `DX-${tail}`;
}

export function ledgerRow(draft: PurchaseDraft): LedgerInsert {
  if (draft.product !== PRODUCT) throw new Error("Purchase product must be deduxis.");
  if (!draft.userId) throw new Error("Purchase needs a user.");
  if (!draft.idempotencyKey || draft.idempotencyKey.length > 200) {
    throw new Error("Purchase needs an idempotency key.");
  }
  if (!draft.description.trim()) throw new Error("Purchase needs a description.");
  return {
    user_id: draft.userId,
    channel: draft.channel,
    kind: draft.kind,
    plan_key: draft.planKey,
    product: PRODUCT,
    amount_usd_cents: draft.amountUsdCents,
    ixis_amount: draft.ixisAmount,
    status: "paid",
    idempotency_key: draft.idempotencyKey,
    stripe_checkout_session_id: draft.stripeCheckoutSessionId,
    stripe_invoice_id: draft.stripeInvoiceId,
    stripe_subscription_id: draft.stripeSubscriptionId,
    stripe_payment_intent_id: draft.stripePaymentIntentId,
    stripe_charge_id: draft.stripeChargeId,
    stripe_customer_id: draft.stripeCustomerId,
    wallet_receipt_id: draft.walletReceiptId,
    wallet_reservation_id: draft.walletReservationId,
    description: draft.description,
  };
}

function linksOf(draft: PurchaseDraft): StripeLinks {
  return {
    stripe_checkout_session_id: draft.stripeCheckoutSessionId,
    stripe_invoice_id: draft.stripeInvoiceId,
    stripe_subscription_id: draft.stripeSubscriptionId,
    stripe_payment_intent_id: draft.stripePaymentIntentId,
    stripe_charge_id: draft.stripeChargeId,
    stripe_customer_id: draft.stripeCustomerId,
    wallet_receipt_id: draft.walletReceiptId,
    wallet_reservation_id: draft.walletReservationId,
  };
}

export async function ensurePurchase(
  store: PurchaseStore,
  draft: PurchaseDraft,
): Promise<{ ledgerId: string; receiptNumber: string; created: boolean }> {
  const inserted = await store.insertLedger(ledgerRow(draft));
  const created = "id" in inserted;
  const found = created ? null : await store.findLedger(draft.idempotencyKey);
  const ledgerId = created ? inserted.id : found?.id;
  if (!ledgerId) throw new Error("Could not record the purchase.");
  await store.fillLinks(ledgerId, linksOf(draft));
  const receiptNumber = receiptNumberFor(ledgerId);
  await store.insertReceipt({
    ledger_id: ledgerId,
    user_id: draft.userId,
    receipt_number: receiptNumber,
    summary: draft.description,
  });
  return { ledgerId, receiptNumber, created };
}

type MemoryRow = LedgerInsert & { id: string };

export function memoryStore(): PurchaseStore & { ledgers: MemoryRow[]; receipts: string[] } {
  const ledgers: MemoryRow[] = [];
  const receipts: string[] = [];
  return {
    ledgers,
    receipts,
    async insertLedger(row) {
      if (ledgers.some((entry) => entry.idempotency_key === row.idempotency_key)) {
        return { conflict: true };
      }
      const id = `00000000-0000-4000-8000-${String(ledgers.length + 1).padStart(12, "0")}`;
      ledgers.push({ ...row, id });
      return { id };
    },
    async findLedger(idempotencyKey) {
      const row = ledgers.find((entry) => entry.idempotency_key === idempotencyKey);
      if (!row) return null;
      return {
        id: row.id,
        stripe_checkout_session_id: row.stripe_checkout_session_id,
        stripe_invoice_id: row.stripe_invoice_id,
        stripe_subscription_id: row.stripe_subscription_id,
        stripe_payment_intent_id: row.stripe_payment_intent_id,
        stripe_charge_id: row.stripe_charge_id,
        stripe_customer_id: row.stripe_customer_id,
        wallet_receipt_id: row.wallet_receipt_id,
        wallet_reservation_id: row.wallet_reservation_id,
      };
    },
    async insertReceipt(row) {
      if (receipts.includes(row.ledger_id)) return;
      receipts.push(row.ledger_id);
    },
    async fillLinks(id, links) {
      const row = ledgers.find((entry) => entry.id === id);
      if (!row) return;
      for (const key of Object.keys(links) as (keyof StripeLinks)[]) {
        if (!row[key] && links[key]) row[key] = links[key];
      }
    },
    async deleteLedger(id) {
      const index = ledgers.findIndex((entry) => entry.id === id);
      if (index >= 0) ledgers.splice(index, 1);
      const receipt = receipts.indexOf(id);
      if (receipt >= 0) receipts.splice(receipt, 1);
    },
    async setWalletReceipt(id, walletReceiptId) {
      const row = ledgers.find((entry) => entry.id === id);
      if (row) row.wallet_receipt_id = walletReceiptId;
    },
  };
}
