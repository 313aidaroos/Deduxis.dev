"use client";

import { useState } from "react";

export function ManageCard() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function openPortal() {
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/billing/portal", { method: "POST" });
    const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setMessage(data.error || "Card management is not available. Nothing was charged.");
    setBusy(false);
  }

  return (
    <div className="plan-pay">
      <button className="button secondary" type="button" disabled={busy} onClick={openPortal}>
        {busy ? "One moment…" : "Manage card"}
      </button>
      {message ? (
        <p className="notice error" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
