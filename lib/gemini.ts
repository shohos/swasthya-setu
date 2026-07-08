// Google Gemini API wrapper (free tier — generativelanguage.googleapis.com).
// Powers all LLM features: chatbot (streaming), clinical triage, prescription
// structuring, and generic-substitution explanations (JSON mode).

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Parses JSON from an LLM response, tolerating markdown fences and prose. */
export function parseJSON<T>(text: string): T {
  const cleaned = text
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/```\s*$/m, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Grab the outermost JSON object if the model added prose around it.
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new Error("No JSON object found in Gemini response");
  }
}

/**
 * Non-streaming Gemini call in JSON mode. Returns the parsed object.
 * Used for triage, prescription structuring and generic substitution.
 */
export async function askGeminiJSON<T>(
  system: string,
  userText: string,
  maxOutputTokens = 4096
): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: {
        maxOutputTokens,
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini API ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = extractGeminiText(data);
  if (!text) throw new Error("Empty Gemini response");
  return parseJSON<T>(text);
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Opens a streaming generateContent request against the Gemini REST API.
 * Returns the raw fetch Response whose body is an SSE stream
 * (`data: {...}` lines with incremental candidates).
 */
export async function streamGemini(system: string, messages: ChatMessage[]): Promise<Response> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: 1024, temperature: 0.6 },
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini API ${res.status}: ${detail.slice(0, 200)}`);
  }
  return res;
}

/** Extracts the text chunk from one parsed SSE JSON payload. */
export function extractGeminiText(payload: unknown): string {
  try {
    const parts = (payload as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
      ?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return "";
    return parts.map((p) => p.text ?? "").join("");
  } catch {
    return "";
  }
}
