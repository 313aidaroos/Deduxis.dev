// Change note (Claude, Sep 2026): Sign-in required, rate limited. See docs/LAUNCH_NOTES.md.
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { guard } from "@/lib/guard";
import { cixyUnavailableReply } from "@/lib/apixis-cixy";
import { DEDUXIS_CIXY_SYSTEM } from "@/lib/deduxis-cixy";

export async function POST(req: NextRequest) {
  const access = await guard({ route: "chat", max: 40 });
  if (!access.ok) return access.response;
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Cixy is not available right now." },
        { status: 503 },
      );
    }

    const { messages } = await req.json();

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: DEDUXIS_CIXY_SYSTEM,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const assistantMessage =
      response.content[0].type === "text"
        ? response.content[0].text
        : "I encountered an error processing your request.";

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    // Out of credit, rate limited or down: a calm sentence, never the vendor's error text.
    const status = typeof (error as { status?: unknown })?.status === "number" ? (error as { status: number }).status : null;
    console.error("Chat API error:", status, error instanceof Error ? error.message : String(error));
    const fallback = cixyUnavailableReply(status);
    return NextResponse.json({ error: fallback.reply, message: fallback.reply, code: "cixy_unavailable" }, { status: fallback.status });
  }
}
