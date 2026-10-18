"use server";
import { Resend } from "resend";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function submitSupport(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!email || !subject || !message) {
      return { success: false, error: "All fields are required" };
    }

    // Get user context if signed in
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userContext = user ? `\n\nUser: ${user.email} (${user.id})` : "\n\nUser: Not signed in";

    const ticketId = `dedux-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Email is optional until RESEND_API_KEY is set; never crash the page without it.
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: "Support email isn't set up yet. Please try again later." };
    }
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email to support
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "deduxis@apixis.dev",
      to: process.env.SUPPORT_ROUTE_TO || "awad@apixis.dev",
      subject: `[Deduxis Support] ${subject}`,
      text: `Ticket ID: ${ticketId}\nFrom: ${email}\n\n${message}${userContext}`,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: "Failed to send message. Please try again." };
    }

    return { success: true, id: ticketId };
  } catch (error) {
    console.error("Support form error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
