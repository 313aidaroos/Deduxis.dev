"use client";
// One-time "Your agent is ready. Enter the Apixis world" card on Deduxis dashboard.
// The agent is created server-side by GET /api/apixis/world-agent on the first signed-in load.
// Styled natively for Deduxis (Special Elite font, existing card/button patterns).
import { useEffect, useState } from "react";

type View = { ok: boolean; status: "ready" | "invite"; agentName: string | null; showWelcome: boolean; enterUrl: string };

function markSeen(action: "enter" | "dismiss") {
  try {
    void fetch("/api/apixis/world-agent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function ApixisWorldWelcome() {
  const [view, setView] = useState<View | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/apixis/world-agent", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((v) => { if (!cancelled && v?.ok) setView(v); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  if (!view?.showWelcome) return null;
  const ready = view.status === "ready";
  return (
    <div
      style={{
        border: "2px solid #333",
        borderRadius: "8px",
        padding: "2rem",
        marginBottom: "2rem",
        background: "linear-gradient(135deg, #f5f3ff 0%, #fef3c7 100%)",
        fontFamily: "Special Elite, monospace",
      }}
    >
      <p style={{ fontSize: "0.875rem", textTransform: "uppercase", marginBottom: "0.75rem", color: "#666" }}>
        ✦ Apixis world
      </p>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "bold" }}>
        {ready ? "Your agent is ready. Enter the Apixis world." : "Your own agent is waiting in the Apixis world."}
      </h2>
      <p style={{ marginBottom: "1.5rem", lineHeight: 1.6, color: "#444" }}>
        {ready
          ? "Your Deduxis account came with your own agent in the Apixis world. It starts in the default Apixis body — make its hair, outfit and colors yours once you're inside."
          : "Every Deduxis account gets its own agent in the Apixis world. Sign in with Apixis ID and it's created for you, in the default Apixis body you can make your own."}
      </p>
      <ul style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        <li style={{ padding: "0.5rem 1rem", background: "#000", color: "#fff", borderRadius: "4px" }}>
          ✦ {ready && view.agentName ? view.agentName : "Your agent"}
        </li>
        <li style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", background: "#fff", borderRadius: "4px" }}>
          1,000 Ixis to start
        </li>
        <li style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", background: "#fff", borderRadius: "4px" }}>
          Sign in with Apixis ID
        </li>
      </ul>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <a
          href={view.enterUrl}
          onClick={() => markSeen("enter")}
          className="button"
          style={{
            padding: "0.875rem 1.5rem",
            background: "#000",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px",
            display: "inline-block",
            fontFamily: "Special Elite, monospace",
          }}
        >
          Enter the Apixis world <span aria-hidden>↗</span>
        </a>
        <button
          type="button"
          onClick={() => { markSeen("dismiss"); setView({ ...view, showWelcome: false }); }}
          style={{
            padding: "0.875rem 1.5rem",
            background: "#fff",
            color: "#000",
            border: "2px solid #000",
            borderRadius: "4px",
            fontFamily: "Special Elite, monospace",
            cursor: "pointer",
          }}
        >
          Not now
        </button>
      </div>
      <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#666" }}>
        You can come back to Deduxis anytime.
      </p>
    </div>
  );
}
