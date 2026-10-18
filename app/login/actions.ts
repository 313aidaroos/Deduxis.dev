"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value, options }) =>
          jar.set(name, value, options),
        );
      },
    },
  });
}

export async function passwordSignIn(form: FormData) {
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");
  const rawNext = String(form.get("next") ?? "/dashboard");
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";

  const supabase = await client();
  if (!supabase)
    return {
      success: false,
      message: "Sign-in is temporarily unavailable. Please try again shortly.",
    };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, message: error.message };
  redirect(next);
}

/** Magic link: the default way in. */
export async function magicLink(form: FormData) {
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const rawNext = String(form.get("next") ?? "/dashboard");
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";

  if (!email.includes("@")) return { message: "Enter your email." };

  const supabase = await client();
  if (!supabase)
    return {
      success: false,
      message: "Sign-in is temporarily unavailable. Please try again shortly.",
    };
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // 2026-10-04 (Grok): existing accounts only; new accounts use Apixis ID
      emailRedirectTo: `${base}/auth/callback?next=${encodeURIComponent(`/set-password?next=${encodeURIComponent(next)}`)}`,
    },
  });

  if (error) {
    // Unknown email: refused because shouldCreateUser is false. Point to Apixis ID.
    if (/signups? not allowed|otp_disabled|user not found/i.test(`${error.code ?? ""} ${error.message}`))
      return {
        success: false,
        message:
          "No Deduxis account uses this email yet. New here? Use Sign in with Apixis to create your account.",
      };
    return { success: false, message: error.message };
  }
  return {
    success: true,
    message: `Check ${email} — the sign-in link is on its way.`,
  };
}

/** Called from /set-password after a magic-link sign-in. */
export async function setPassword(form: FormData) {
  const password = String(form.get("password") ?? "");
  const rawNext = String(form.get("next") ?? "/dashboard");
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";

  if (password.length < 8)
    return { message: "Password must be at least 8 characters." };

  const supabase = await client();
  if (!supabase)
    return {
      success: false,
      message: "Sign-in is temporarily unavailable. Please try again shortly.",
    };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { message: "Your sign-in link expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({
    password,
    data: { password_set: true },
  });

  if (error) return { success: false, message: error.message };
  redirect(next);
}
