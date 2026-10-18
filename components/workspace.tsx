"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { WorkspaceShell } from "./workspace-shell";
import { ReceiptForm } from "./receipt-form";
import { ReceiptUpload } from "./receipt-upload";
import { ApixisWorldWelcome } from "./ApixisWorldWelcome";
import {
  Receipt,
  sampleReceipts,
  money,
  dateLabel,
  categoryColor,
  csvFor,
  downloadCSV,
} from "@/lib/receipts";
const DEMO_KEY = "deduxis-demo-v1";
export default function Workspace({ demo = false }: { demo?: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const requested = params.get("view") || "receipts";
  const view = [
    "overview",
    "receipts",
    "categories",
    "exports",
    "settings",
  ].includes(requested)
    ? requested
    : "receipts";
  const base = demo ? "/demo" : "/dashboard";
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selected, setSelected] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [upload, setUpload] = useState(false);
  const [exporting, setExporting] = useState(false);
  const load = useCallback(async () => {
    try {
      let rows: Receipt[];
      if (demo) {
        await Promise.resolve();
        let saved = null;
        try {
          saved = sessionStorage.getItem(DEMO_KEY);
        } catch {}
        rows = saved ? JSON.parse(saved) : sampleReceipts();
      } else {
        const res = await fetch("/api/receipts");
        if (res.status === 401) {
          router.replace("/login?next=/dashboard");
          return;
        }
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Your receipts could not be loaded.");
        rows = data.receipts.map((r: Receipt) => ({
          ...r,
          total_amount: Number(r.total_amount),
          tax_amount: r.tax_amount === null ? null : Number(r.tax_amount),
        }));
      }
      setReceipts(rows);
      setSelected(rows[0] ?? null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load your receipts.",
      );
    } finally {
      setLoading(false);
    }
  }, [demo, router]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const categoryFilter = params.get("category") || category;
  const filtered = receipts.filter(
    (r) =>
      r.merchant.toLowerCase().includes(query.toLowerCase()) &&
      (categoryFilter === "all" || r.category === categoryFilter) &&
      (period === "all" ||
        r.receipt_date.startsWith(
          new Date().toLocaleDateString("en-CA").slice(0, 7),
        )) &&
      (status === "all" ||
        (status === "reviewed") === !!r.extracted_data?.reviewed),
  );
  const visibleSelected = selected && filtered.some(r => r.id === selected.id) ? selected : null;
  const total = receipts.reduce((sum, r) => sum + r.total_amount, 0);
  const needsReview = receipts.filter(
    (r) => !r.extracted_data?.reviewed,
  ).length;
  const groups = Array.from(new Set(receipts.map((r) => r.category))).map(
    (name) => ({
      name,
      receipts: receipts.filter((r) => r.category === name),
      amount: receipts
        .filter((r) => r.category === name)
        .reduce((s, r) => s + r.total_amount, 0),
    }),
  );
  function remember(rows: Receipt[]) {
    setReceipts(rows);
    if (demo) {
      try {
        sessionStorage.setItem(DEMO_KEY, JSON.stringify(rows));
      } catch {
        setNotice(
          "Your changes are visible here, but this browser could not keep them after a refresh.",
        );
      }
    }
  }
  async function save(r: Receipt) {
    let updated = r;
    if (!demo) {
      const res = await fetch("/api/receipts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save changes.");
      updated = { ...data.receipt, image_url: r.image_url };
    }
    remember(receipts.map((old) => (old.id === r.id ? updated : old)));
    setSelected(updated);
    setNotice(
      demo
        ? "Sample receipt updated in this tab."
        : "Receipt updated. Everything is in order.",
    );
  }
  async function exportReceipts(format: string) {
    setExporting(true);
    setError("");
    try {
      if (demo)
        downloadCSV(csvFor(filtered, format), `deduxis-demo-${format}.csv`);
      else {
        const q = new URLSearchParams({
          format,
          q: query,
          category: categoryFilter,
          period,
          status,
        });
        const res = await fetch(`/api/export?${q}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Export unavailable.");
        }
        downloadCSV(await res.text(), `deduxis-${format}.csv`);
      }
      setNotice("Your export has been downloaded.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Export failed. Please try again.",
      );
    } finally {
      setExporting(false);
    }
  }
  async function signOut() {
    try {
      const { createClient } = await import("@/lib/supabase");
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not sign out. Please try again.");
    }
  }
  const title = {
    overview: "A little more clarity.",
    receipts: "Your receipts",
    categories: "Everything in its place.",
    exports: "Ready to go.",
    settings: "Make yourself at home.",
  }[view];
  const stats = (
    <div className="stat-grid">
      <div className="stat lavender">
        <span>Total in your records</span>
        <strong>{money(total)}</strong>
        <small>All saved receipts · USD</small>
      </div>
      <div className="stat mint">
        <span>Receipts</span>
        <strong>{receipts.length}</strong>
        <small>One organized place</small>
      </div>
      <div className="stat peach">
        <span>Needs review</span>
        <strong>{needsReview}</strong>
        <small>A quick check goes a long way</small>
      </div>
    </div>
  );
  const filters = (
    <div className="toolbar">
      <label>
        <span className="sr-only">Search receipts</span>
        <input
          placeholder="Search merchant or receipt…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <select
        aria-label="Date range"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
      >
        <option value="all">All dates</option>
        <option value="month">This month</option>
      </select>
      <select
        aria-label="Receipt category"
        value={categoryFilter}
        onChange={(e) => {
          setCategory(e.target.value);
          if (params.has("category")) router.replace(`${base}?view=${view}`);
        }}
      >
        <option value="all">All categories</option>
        {groups.map((g) => (
          <option key={g.name}>{g.name}</option>
        ))}
      </select>
      <select
        aria-label="Review status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="all">All statuses</option>
        <option value="needs-review">Needs review</option>
        <option value="reviewed">Reviewed</option>
      </select>
    </div>
  );
  return (
    <WorkspaceShell demo={demo}>
      {!demo && <ApixisWorldWelcome />}
      <div className="workspace-title">
        <div>
          <h1>{title}</h1>
          <p>
            {
              {
                overview: "A clear view of where your business expenses go.",
                receipts: "Review, organize, and keep moving.",
                categories: "Find your receipts by the work they support.",
                exports: "Your records, ready for your next step.",
                settings: "Your account and workspace preferences.",
              }[view]
            }
          </p>
        </div>
        <div className="button-row">
          <button className="button primary" onClick={() => setUpload(true)}>
            ＋ Upload receipt
          </button>
          <Link className="button secondary" href={`${base}?view=exports`}>
            Export ↗
          </Link>
        </div>
      </div>
      {error && (
        <div role="alert" className="notice error">
          {error}{" "}
          <button className="link-button" onClick={load}>
            Try again
          </button>{" "}
          · <Link href="/login">Sign in</Link>
        </div>
      )}
      {notice && (
        <div role="status" className="notice success notice-row">
          <span>{notice}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}
      {loading ? (
        <div className="empty-state" role="status">
          Gathering your receipts…
        </div>
      ) : (
        <>
          {["overview", "receipts"].includes(view) && stats}
          {view === "overview" && (
            <>
              <div className="overview-banner">
                <div>
                  <h2>
                    {needsReview
                      ? `${needsReview} receipts could use a quick look.`
                      : "You’re all caught up."}
                  </h2>
                  <p>
                    Keep the details accurate today. Make tomorrow a little
                    easier.
                  </p>
                </div>
                <Link href={`${base}?view=receipts`} className="button primary">
                  Review receipts →
                </Link>
              </div>
              <div className="content-card">
                <h2>Where it all goes</h2>
                <p>
                  Your saved expenses by category. These are totals, not
                  calculated tax deductions.
                </p>
                <div className="category-bars">
                  {groups.map((g) => (
                    <Link
                      key={g.name}
                      href={`${base}?view=receipts&category=${encodeURIComponent(g.name)}`}
                    >
                      <div className="bar-top">
                        <span>{g.name}</span>
                        <strong>{money(g.amount)}</strong>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${total ? (g.amount / total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
                {!groups.length && (
                  <p>Upload your first receipt to see your expense overview.</p>
                )}
              </div>
            </>
          )}
          {view === "receipts" && (
            <div className="receipts-layout">
              <section aria-label="Receipt list">
                {filters}
                {filtered.length ? (
                  <>
                    <div className="table-wrap">
                      <table className="receipt-table">
                        <thead>
                          <tr>
                            <th>Merchant</th>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((r) => (
                            <tr
                              key={r.id}
                              className={
                                selected?.id === r.id ? "selected" : ""
                              }
                            >
                              <td>
                                <button
                                  className="merchant-button"
                                  onClick={() => setSelected(r)}
                                  aria-label={`Review ${r.merchant}`}
                                  aria-pressed={selected?.id === r.id}
                                >
                                  {r.image_url ? (
                                    <Image
                                      className="receipt-thumb"
                                      src={r.image_url}
                                      alt=""
                                      width={27}
                                      height={35}
                                      unoptimized
                                    />
                                  ) : (
                                    <span className="mini-file" aria-hidden>
                                      ▤
                                    </span>
                                  )}
                                  {r.merchant}
                                </button>
                              </td>
                              <td className="muted">
                                {dateLabel(r.receipt_date)}
                              </td>
                              <td>
                                <span
                                  className={`badge ${categoryColor(r.category)}`}
                                >
                                  {r.category}
                                </span>
                              </td>
                              <td>
                                <strong>{money(r.total_amount)}</strong>
                              </td>
                              <td>
                                <span
                                  className={`status ${r.extracted_data?.reviewed ? "reviewed" : ""}`}
                                >
                                  {r.extracted_data?.reviewed
                                    ? "Reviewed"
                                    : "Needs review"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="table-foot">
                      <span>
                        {filtered.length} of {receipts.length} receipts
                      </span>
                      <span>Amounts in USD</span>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <span className="step-symbol" aria-hidden>
                      ▤
                    </span>
                    <h2>
                      {receipts.length
                        ? "No receipts found."
                        : "Your first receipt starts here."}
                    </h2>
                    <p>
                      {receipts.length
                        ? "Try a different search or clear your filters."
                        : "Upload a receipt and turn a little piece of paper into an organized record."}
                    </p>
                    {receipts.length ? (
                      <button
                        className="button secondary"
                        onClick={() => {
                          setQuery("");
                          setCategory("all");
                          setPeriod("all");
                          setStatus("all");
                          router.replace(`${base}?view=receipts`);
                        }}
                      >
                        Clear filters
                      </button>
                    ) : (
                      <button
                        className="button primary"
                        onClick={() => setUpload(true)}
                      >
                        Upload your first receipt
                      </button>
                    )}
                  </div>
                )}
              </section>
              {visibleSelected ? (
                <ReceiptForm
                  key={visibleSelected.id}
                  receipt={visibleSelected}
                  onSave={save}
                  onClose={() => setSelected(null)}
                />
              ) : (
                <div className="content-card">
                  <h2>A closer look.</h2>
                  <p>
                    Select a receipt to review its image, details, and category.
                  </p>
                </div>
              )}
            </div>
          )}
          {view === "categories" && (
            <div className="category-grid">
              {groups.map((g) => (
                <Link
                  className={`category-card ${categoryColor(g.name)}`}
                  key={g.name}
                  href={`${base}?view=receipts&category=${encodeURIComponent(g.name)}`}
                >
                  <span className="section-heading">
                    <span className="mini-file" aria-hidden>
                      ▤
                    </span>
                    <span>↗</span>
                  </span>
                  <h2>{g.name}</h2>
                  <p>{g.receipts.length} receipts</p>
                  <strong>{money(g.amount)}</strong>
                  <p>View receipts →</p>
                </Link>
              ))}
              {!groups.length && (
                <div className="empty-state">
                  <h2>Room for every expense.</h2>
                  <p>Your categories will appear after you save a receipt.</p>
                </div>
              )}
            </div>
          )}
          {view === "exports" && (
            <>
              {filters}
              <p className="export-count">
                {filtered.length} receipts selected by your filters. Exports
                include only these records.
              </p>
              <div className="export-grid">
                {[
                  [
                    "csv",
                    "Standard CSV",
                    "A complete record",
                    "Merchant, date, category, totals, tax, payment method, and your notes.",
                  ],
                  [
                    "quickbooks",
                    "Accounting CSV",
                    "Ready for your accountant",
                    "A simplified Date, Vendor, Account, Amount, and Memo layout. Map the columns in your accounting tool before importing.",
                  ],
                ].map(([format, name, label, copy], i) => (
                  <div className="content-card export-card" key={format}>
                    <span className={`badge ${i ? "mint" : "lavender"}`}>
                      {label}
                    </span>
                    <h2>{name}</h2>
                    <p>{copy}</p>
                    <button
                      disabled={exporting || !filtered.length}
                      onClick={() => exportReceipts(format)}
                      className={`button ${i ? "secondary" : "primary"}`}
                    >
                      {exporting ? "Preparing…" : `Download ${name}`}{" "}
                      <span aria-hidden>↧</span>
                    </button>
                  </div>
                ))}
              </div>
              <p className="form-help">
                Keep your originals. Confirm categories and tax treatment with
                your accountant.
              </p>
            </>
          )}
          {view === "settings" && (
            <div className="settings-stack">
              <section className="content-card">
                <span className="badge lavender">Your account</span>
                <h2 style={{ marginTop: 15 }}>
                  {demo ? "Make it your own." : "Your workspace."}
                </h2>
                <p>
                  {demo
                    ? "You’re exploring with sample receipts. Create an account to save and organize your own."
                    : "Manage how you sign in to your receipt workspace."}
                </p>
                <div className="setting-row">
                  {demo ? (
                    <Link href="/login" className="button primary">
                      Create your account →
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/set-password?next=/dashboard%3Fview%3Dsettings"
                        className="button secondary"
                      >
                        Update password
                      </Link>
                      <button onClick={signOut} className="button ghost">
                        Sign out
                      </button>
                    </>
                  )}
                </div>
              </section>
              <section className="content-card">
                <h2>Wallet & plan</h2>
                <p>
                  Receipt Intelligence includes 200 receipts per seat period.
                  Manage your seat through Apixis Wallet.
                </p>
                <Link href="/pricing" className="text-link">
                  View plan and redeem a seat →
                </Link>
              </section>
              {demo && (
                <section className="content-card">
                  <h2>A fresh start.</h2>
                  <p>Restore the sample receipts to explore again.</p>
                  <button
                    className="button secondary full"
                    onClick={() => {
                      const rows = sampleReceipts();
                      remember(rows);
                      setSelected(rows[0]);
                      setNotice("Demo workspace reset.");
                    }}
                  >
                    Reset sample data
                  </button>
                </section>
              )}
            </div>
          )}
        </>
      )}
      {upload && (
        <ReceiptUpload
          demo={demo}
          onClose={() => setUpload(false)}
          onSaved={(r) => {
            remember([r, ...receipts]);
            setSelected(r);
            setNotice(
              demo ? "Sample receipt added to this tab." : "Receipt saved.",
            );
            router.push(`${base}?view=receipts`);
          }}
        />
      )}
    </WorkspaceShell>
  );
}
