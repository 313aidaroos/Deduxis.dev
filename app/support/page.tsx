"use client";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { useState, useTransition, FormEvent } from "react";
import { submitSupport } from "./actions";

export default function SupportPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; id?: string; error?: string } | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    startTransition(async () => {
      const res = await submitSupport(formData);
      setResult(res);
      if (res.success) {
        form.reset();
      }
    });
  }

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ maxWidth: "640px", marginTop: "4rem", marginBottom: "4rem" }}>
        <h1 style={{ fontFamily: "Special Elite, monospace", marginBottom: "1.5rem" }}>
          Support
        </h1>
        <p style={{ marginBottom: "2rem", lineHeight: 1.6 }}>
          Need help with Deduxis? Send us a message and we&apos;ll get back to you soon.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Your email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              disabled={isPending}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontFamily: "Special Elite, monospace",
                fontSize: "1rem"
              }}
            />
          </div>

          <div>
            <label htmlFor="subject" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              disabled={isPending}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontFamily: "Special Elite, monospace",
                fontSize: "1rem"
              }}
            />
          </div>

          <div>
            <label htmlFor="message" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={8}
              required
              disabled={isPending}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontFamily: "Special Elite, monospace",
                fontSize: "1rem",
                resize: "vertical"
              }}
            />
          </div>

          {result && (
            <div
              style={{
                padding: "1rem",
                borderRadius: "4px",
                background: result.success ? "#d4edda" : "#f8d7da",
                color: result.success ? "#155724" : "#721c24",
                border: `1px solid ${result.success ? "#c3e6cb" : "#f5c6cb"}`
              }}
            >
              {result.success ? (
                <>
                  <strong>Message sent!</strong> Ticket ID: {result.id}. We&apos;ll respond soon.
                </>
              ) : (
                <>
                  <strong>Error:</strong> {result.error}
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="button"
            style={{
              padding: "0.875rem 1.5rem",
              background: isPending ? "#ccc" : "#000",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontFamily: "Special Elite, monospace",
              fontSize: "1rem",
              cursor: isPending ? "not-allowed" : "pointer",
              alignSelf: "flex-start"
            }}
          >
            {isPending ? "Sending..." : "Send message"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
