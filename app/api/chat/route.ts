import { NextRequest, NextResponse } from "next/server";
import { getClient, hasApiKey, CLAUDE_MODEL } from "@/lib/claude";
import { CHAT_SYSTEM_PROMPT } from "@/lib/triage-prompts";
import { FALLBACK_CHAT_REPLY } from "@/lib/mock-responses";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const messages = (body.messages ?? []).filter(
    (m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
  );
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "messages must end with a user message" }, { status: 400 });
  }

  if (!hasApiKey()) {
    return new Response(FALLBACK_CHAT_REPLY, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Fallback": "true" },
    });
  }

  try {
    const client = getClient();
    const stream = client.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: CHAT_SYSTEM_PROMPT,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch {
          controller.enqueue(encoder.encode("\n" + FALLBACK_CHAT_REPLY));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Chat stream failed:", err);
    return new Response(FALLBACK_CHAT_REPLY, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Fallback": "true" },
    });
  }
}
