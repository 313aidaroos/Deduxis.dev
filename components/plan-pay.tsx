"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PlanPay({ plan }: { plan: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"card" | "ixis" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [buyUrl, setBuyUrl] = useState<string | null>(null);

  async function pay(channel: "card" | "ixis") {
    setBusy(channel);
    setMessage(null);
    setBuyUrl(null);
    const response = await fetch(channel === "card" ? "/api/checkout" : "/api/redeem", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan, idempotencyKey: crypto.randomUUID() }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      url?: string;
      error?: string;
      redirect?: string;
      success?: boolean;
      buyUrl?: string;
    };
    if (response.status === 401) {
      router.push(data.redirect || "/login?next=/pricing");
      return;
    }
    if (channel === "card" && data.url) {
      window.location.href = data.url;
      return;
    }
    if (channel === "ixis" && data.success) {
      router.push("/account/purchases");
      return;
    }
    setMessage(data.error || "Nothing was charged.");
    if (data.buyUrl) setBuyUrl(data.buyUrl);
    setBusy(null);
  }

  return (
    <div className="plan-pay">
      <button
        className="button primary"
        type="button"
        disabled={busy !== null}
        onClick={() => pay("card")}
      >
        {busy === "card" ? "One moment…" : "Pay by card"}
      </button>
      <button
        className="button secondary"
        type="button"
        disabled={busy !== null}
        onClick={() => pay("ixis")}
      >
        {busy === "ixis" ? "One moment…" : "Pay with Ixis"}
      </button>
      {message ? (
        <p className="notice error" role="alert">
          {message}{" "}
          {buyUrl ? (
            <a href={buyUrl}>Buy Ixis</a>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
