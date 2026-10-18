"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { magicLink, passwordSignIn } from "./actions";
import { AuthScreen } from "@/components/auth-screen";
import { SignInWithApixis } from "@/components/SignInWithApixis";
function LoginInner() {
  const params = useSearchParams();
  const raw = params.get("next") || "/dashboard";
  const next =
    raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
  const [tab, setTab] = useState("magic");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    success?: boolean;
    message: string;
  } | null>(null);
  async function submit(form: FormData) {
    setBusy(true);
    setMessage(null);
    const result = await (tab === "magic"
      ? magicLink(form)
      : passwordSignIn(form));
    if (result) setMessage(result);
    setBusy(false);
  }
  return (
    <AuthScreen>
      <span className="eyebrow">WELCOME TO DEDUXIS</span>
      <h1>
        A fresh start.
        <br />
        All in order.
      </h1>
      <p>
        Sign in to organize your receipts. New here? Create your account with
        Sign in with Apixis. Email link and password are for existing accounts.
      </p>
      <SignInWithApixis />
      <div className="auth-tabs" role="tablist" aria-label="Sign-in method">
        <button
          role="tab"
          aria-selected={tab === "magic"}
          onClick={() => {
            setTab("magic");
            setMessage(null);
          }}
        >
          Email me a link
        </button>
        <button
          role="tab"
          aria-selected={tab === "password"}
          onClick={() => {
            setTab("password");
            setMessage(null);
          }}
        >
          Use a password
        </button>
      </div>
      <form action={submit}>
        <input type="hidden" name="next" value={next} />
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@yourbusiness.com"
            disabled={busy}
          />
        </div>
        {tab === "password" && (
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="Your password"
              disabled={busy}
            />
          </div>
        )}
        {message && (
          <div
            role={message.success ? "status" : "alert"}
            className={`notice ${message.success ? "success" : "error"}`}
          >
            {message.message}
          </div>
        )}
        <button disabled={busy} className="button primary full">
          {busy
            ? "One moment…"
            : tab === "magic"
              ? "Email me a sign-in link →"
              : "Sign in →"}
        </button>
      </form>
      <div className="auth-footer">
        Want a look around first?{" "}
        <Link className="text-link" style={{ margin: 0 }} href="/demo">
          Explore the demo
        </Link>
      </div>
    </AuthScreen>
  );
}
export default function Login() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
