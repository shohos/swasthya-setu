import { NextRequest, NextResponse } from "next/server";
import { hasGeminiKey, streamGemini, extractGeminiText } from "@/lib/gemini";
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

  if (!hasGeminiKey()) {
    return new Response(FALLBACK_CHAT_REPLY, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Fallback": "true" },
    });
  }

  try {
    const upstream = await streamGemini(CHAT_SYSTEM_PROMPT, messages);
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Re-stream Gemini's SSE payloads as plain text chunks for the widget.
    const readable = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const json = trimmed.slice(5).trim();
              if (!json || json === "[DONE]") continue;
              try {
                const text = extractGeminiText(JSON.parse(json));
                if (text) controller.enqueue(encoder.encode(text));
              } catch {}
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
    console.error("Gemini chat failed:", err);
    return new Response(FALLBACK_CHAT_REPLY, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Fallback": "true" },
    });
  }
}
