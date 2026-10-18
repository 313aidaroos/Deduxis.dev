/**
 * Owner allowlist (Awad's rule, 2026-10-04 Grok). A signed-in owner skips the Deduxis seat
 * gate and 200-receipt cap. Product gates only: no entitlement, no
 * Wallet call, nothing on the Wallet ledger. His real Wallet purchases still work as normal.
 * ADMIN_EMAILS (comma-separated, Vercel env) adds to this fallback list. Case-insensitive.
 */
export const OWNER_ADMIN_EMAILS = ["alaidaroosawad@gmail.com", "awad@apixis.dev"] as const;

export function ownerEmails(env: string | undefined = process.env.ADMIN_EMAILS): Set<string> {
  const list = new Set<string>(OWNER_ADMIN_EMAILS);
  for (const raw of String(env ?? "").split(",")) {
    const email = raw.trim().toLowerCase();
    if (email.includes("@")) list.add(email);
  }
  return list;
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  const e = String(email ?? "").trim().toLowerCase();
  return Boolean(e) && ownerEmails().has(e);
}

// Neither owner email has an account here yet, and password sign-in exists, so a confirmed email
// alone is not enough: the session must also show an email-proving sign-in (magic link, Apixis ID).
const EMAIL_PROVING_AMR = new Set(["otp", "magiclink", "oauth", "sso/saml", "recovery", "invite", "email_change"]);

export function amrProvesEmail(accessToken: string | null | undefined): boolean {
  if (!accessToken) return false;
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split(".")[1] ?? "", "base64url").toString("utf8"));
    const amr: unknown[] = Array.isArray(payload?.amr) ? payload.amr : [];
    return amr.some((entry) => {
      const method = typeof entry === "string" ? entry : (entry as { method?: unknown } | null)?.method;
      return typeof method === "string" && EMAIL_PROVING_AMR.has(method);
    });
  } catch {
    return false;
  }
}

export function isOwner(
  user: { email?: string | null; email_confirmed_at?: string | null } | null | undefined,
  accessToken: string | null | undefined,
): boolean {
  return Boolean(user?.email_confirmed_at) && isOwnerEmail(user?.email) && amrProvesEmail(accessToken);
}

