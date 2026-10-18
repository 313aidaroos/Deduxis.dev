"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { validateRecoverScan } from "@/lib/recover-intake";

export type ScanState =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function requestRecoverScan(
  _prev: ScanState,
  formData: FormData,
): Promise<ScanState> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      ok: false,
      error: "Sign-in is temporarily unavailable. Please try again shortly.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return {
      ok: false,
      error: "Sign in with Apixis to request a free scan.",
    };
  }

  const parsed = validateRecoverScan({
    organization: formData.get("organization"),
    industry: formData.get("industry"),
    documentKinds: formData.getAll("documentKinds"),
    vendors: formData.get("vendors"),
    annualSpend: formData.get("annualSpend"),
    notes: formData.get("notes"),
  });
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { data, error } = await supabase
    .from("recover_scan_requests")
    .insert({
      user_id: user.id,
      organization_name: parsed.value.organization,
      industry: parsed.value.industry,
      document_kinds: parsed.value.documentKinds.join(","),
      vendors: parsed.value.vendors || null,
      annual_spend: parsed.value.annualSpend || null,
      contact_email: user.email,
      notes: parsed.value.notes || null,
      status: "requested",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    const message = error?.message ?? "";
    const missing =
      error?.code === "42P01" ||
      (/recover_scan_requests/i.test(message) &&
        /does not exist|schema cache/i.test(message));
    if (missing) {
      return {
        ok: false,
        error:
          "The free-scan desk is not open on this database yet. Your details were not saved.",
      };
    }
    return {
      ok: false,
      error: "We could not save your scan request. Please try again.",
    };
  }

  return { ok: true, id: data.id };
}
