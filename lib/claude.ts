import Anthropic from "@anthropic-ai/sdk";

// claude-sonnet-4-20250514 retires 2026-06-15; claude-sonnet-4-6 is the
// current drop-in replacement. Override with CLAUDE_MODEL if needed.
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let _client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!hasApiKey()) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

/** Call Claude with a system prompt + user text, expecting a JSON reply. */
export async function askClaudeJSON<T>(
  system: string,
  userContent: Anthropic.MessageParam["content"],
  maxTokens = 4096
): Promise<T> {
  const client = getClient();
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userContent }],
  });
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return parseJSON<T>(text);
}

/** Strip markdown fences and parse the first JSON object found. */
export function parseJSON<T>(text: string): T {
  let cleaned = text.trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) cleaned = fence[1].trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) cleaned = cleaned.slice(start, end + 1);
  return JSON.parse(cleaned) as T;
}
