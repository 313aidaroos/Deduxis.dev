"use client";
import { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { WorkspaceShell } from "@/components/workspace-shell";
type Message = { role: "user" | "assistant"; content: string };
function ChatInner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const next: Message[] = [
      ...messages,
      { role: "user", content: input.trim() },
    ];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          res.status === 401
            ? "Sign in to chat with Cixy."
            : res.status === 503
              ? "Cixy is unavailable right now. Please try again shortly."
              : data.error || "Could not send your message.",
        );
      setMessages([...next, { role: "assistant", content: data.message }]);
    } catch (e) {
      setInput(next[next.length - 1].content);
      setMessages(next.slice(0, -1));
      setError(
        e instanceof Error
          ? e.message
          : "Cixy is unavailable. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <WorkspaceShell>
      <div className="workspace-title">
        <div>
          <h1>A little help from Cixy.</h1>
          <p>Your companion for clearer expense records.</p>
        </div>
        <span className="badge lavender">Ask Cixy</span>
      </div>
      <div className="chat-layout">
        <div className="cixy-intro">
          <img className="cixy-avatar" src="/cixy/cixy-deduxis-avatar.webp" alt="Cixy" width={56} height={56} />
          <span className="eyebrow">HELLO, I’M CIXY</span>
          <h2>Let’s make sense of it.</h2>
          <p>
            Need help choosing a category, organizing your
            records, or preparing questions for your accountant? Start here.
          </p>
          <div className="suggestions">
            {[
              "How should I categorize office supplies?",
              "What should I keep with a receipt?",
              "Help me prepare for tax time.",
            ].map((q) => (
              <button key={q} onClick={() => setInput(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
        <div className="chat-messages" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              <strong>
                {m.role !== "user" && (
                  <img className="cixy-avatar-sm" src="/cixy/cixy-deduxis-avatar.webp" alt="" width={20} height={20} />
                )}
                {m.role === "user" ? "You" : "Cixy"}
              </strong>
              {m.content}
            </div>
          ))}
          {busy && (
            <div className="bubble" role="status">
              Cixy is thinking…
            </div>
          )}
          <div ref={end} />
        </div>
        {error && (
          <div role="alert" className="notice error">
            {error} <Link href="/login?next=/chat">Sign in →</Link>
          </div>
        )}
        <form className="chat-composer" onSubmit={send}>
          <label className="sr-only" htmlFor="chat-input">
            Your message to Cixy
          </label>
          <input
            id="chat-input"
            placeholder="What’s on your mind?"
            value={input}
            maxLength={4000}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <button className="button primary" disabled={busy || !input.trim()}>
            Send ↗
          </button>
        </form>
        <p className="chat-disclaimer">
          Cixy can make mistakes. Not a CPA. Confirm
          important decisions with qualified professionals.
        </p>
      </div>
    </WorkspaceShell>
  );
}
export default function Chat() {
  return (
    <Suspense>
      <ChatInner />
    </Suspense>
  );
}
