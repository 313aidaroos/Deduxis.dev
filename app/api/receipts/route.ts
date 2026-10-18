// Change note (Claude, Sep 2026): Sign-in required, rate limited, 200 receipts per seat month. See docs/LAUNCH_NOTES.md.
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { validatedReceipt, receiptImage } from "@/lib/receipt-validation";
import { guard } from "@/lib/guard";
import { receiptCap } from "@/lib/catalog";
import { quotaResponse, receiptsUsed, seatPeriodStart } from "@/lib/quota";

export async function POST(req: NextRequest) {
  try {
    const access = await guard({ seat: true, route: "receipts", max: 200 });
    if (!access.ok) return access.response;
    const user = access.user;
    const supabase = await createServerSupabaseClient();

    // Personal: 100 / month. Business: unlimited. Legacy seat: 200.
    const periodStart = seatPeriodStart(access.seat?.renews_at ?? null);
    const overCap = access.owner
      ? null
      : quotaResponse(
          await receiptsUsed(supabase, user.id, periodStart),
          periodStart,
          receiptCap(access.seat?.product_key),
        );
    if (overCap) return overCap;

    const {
      merchant,
      date,
      total,
      tax,
      payment_method,
      line_items,
      category,
      notes,
      image_data,
      extracted_data,
    } = await req.json();

    let fields, image;
    try {
      fields = validatedReceipt({
        merchant,
        date,
        total,
        tax,
        category,
        notes,
      });
      image = receiptImage(image_data);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid receipt" },
        { status: 400 },
      );
    }
    const fileName = `${user.id}/${crypto.randomUUID()}.${image.extension}`;
    const imageBuffer = image.bytes;
    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, imageBuffer, {
        contentType: image.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Insert receipt record
    const { data: receipt, error: insertError } = await supabase
      .from("receipts")
      .insert({
        user_id: user.id,
        ...fields,
        payment_method:
          typeof payment_method === "string"
            ? payment_method.slice(0, 100)
            : null,
        image_path: fileName,
        extracted_data: extracted_data || { line_items },
      })
      .select()
      .single();

    if (insertError) {
      // Clean up uploaded image on insert failure
      await supabase.storage.from("receipts").remove([fileName]);
      throw new Error(`Save failed: ${insertError.message}`);
    }

    // Save category override if user changed it
    if (category) {
      await supabase.from("category_overrides").upsert(
        {
          user_id: user.id,
          merchant,
          category,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,merchant" },
      );
    }

    return NextResponse.json({ success: true, receipt });
  } catch (error) {
    console.error("Save receipt error:", error);
    return NextResponse.json(
      { error: "Could not save your receipt. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const access = await guard({ route: "list-receipts", max: 300 });
    if (!access.ok) return access.response;
    const supabase = await createServerSupabaseClient();
    const user = access.user;
    const authError = null;

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: receipts, error } = await supabase
      .from("receipts")
      .select("*")
      .eq("user_id", user.id)
      .order("receipt_date", { ascending: false });

    if (error) throw error;

    const ownedPaths = receipts
      .filter((r) => r.image_path?.startsWith(`${user.id}/`))
      .map((r) => r.image_path);
    const { data: urls } = ownedPaths.length
      ? await supabase.storage
          .from("receipts")
          .createSignedUrls(ownedPaths, 3600)
      : { data: [] };
    const byPath = new Map((urls ?? []).map((u) => [u.path, u.signedUrl]));
    return NextResponse.json(
      {
        receipts: receipts.map((r) => ({
          ...r,
          image_url: byPath.get(r.image_path) ?? null,
        })),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Fetch receipts error:", error);
    return NextResponse.json(
      { error: "Could not load your receipts. Please try again." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const access = await guard({ route: "edit-receipt", max: 200 });
    if (!access.ok) return access.response;
    const body = await req.json();
    if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id))
      return NextResponse.json({ error: "Invalid receipt." }, { status: 400 });
    let fields;
    try {
      fields = validatedReceipt(body);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid receipt." },
        { status: 400 },
      );
    }
    const supabase = await createServerSupabaseClient();
    const { data: existing, error: readError } = await supabase
      .from("receipts")
      .select("extracted_data")
      .eq("id", body.id)
      .eq("user_id", access.user.id)
      .single();
    if (readError || !existing)
      return NextResponse.json(
        { error: "Receipt not found." },
        { status: 404 },
      );
    const { data: receipt, error } = await supabase
      .from("receipts")
      .update({
        ...fields,
        extracted_data: { ...existing.extracted_data, reviewed: true },
      })
      .eq("id", body.id)
      .eq("user_id", access.user.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(
      { receipt },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Receipt update failed", error);
    return NextResponse.json(
      { error: "Could not update this receipt. Please try again." },
      { status: 500 },
    );
  }
}
