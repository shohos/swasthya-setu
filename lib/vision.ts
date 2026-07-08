// Roboflow-powered vision layer (free tier — infer.roboflow.com hosted models).
// - CLIP zero-shot verification for anemia/jaundice eye screening
// - DocTR OCR for prescription reading
// Color indices (redness/yellowness) are computed on-device by the client
// (canvas pixel sampling) and sent alongside the image — no cloud call needed
// for the numeric estimate itself.

const ROBOFLOW_INFER = "https://infer.roboflow.com";

export function hasRoboflowKey(): boolean {
  return Boolean(process.env.ROBOFLOW_API_KEY);
}

function roboflowKey(): string {
  return process.env.ROBOFLOW_API_KEY || "";
}

/**
 * Zero-shot image-vs-text comparison via Roboflow's hosted CLIP model.
 * Returns one cosine-similarity score per prompt.
 */
export async function clipCompare(base64: string, prompts: string[]): Promise<number[]> {
  const res = await fetch(`${ROBOFLOW_INFER}/clip/compare?api_key=${roboflowKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: { type: "base64", value: base64 },
      prompt: prompts,
      subject_type: "image",
      prompt_type: "text",
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Roboflow CLIP ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const sim = data?.similarity;
  if (!Array.isArray(sim) || sim.length !== prompts.length) {
    throw new Error("Unexpected Roboflow CLIP response shape");
  }
  return sim.map(Number);
}

/** Softmax over a similarity pair → probability that prompt[0] wins. */
export function softmaxPair(a: number, b: number, sharpness = 25): number {
  const ea = Math.exp(a * sharpness);
  const eb = Math.exp(b * sharpness);
  return ea / (ea + eb);
}

/**
 * OCR via Roboflow's hosted DocTR model. Returns the extracted text.
 * (DocTR is strongest on printed/Latin text; Gemini downstream is prompted
 * to tolerate OCR noise on handwritten Bangla.)
 */
export async function ocrImage(base64: string): Promise<string> {
  const res = await fetch(`${ROBOFLOW_INFER}/doctr/ocr?api_key=${roboflowKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: { type: "base64", value: base64 } }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Roboflow OCR ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  return typeof data?.result === "string" ? data.result : "";
}

// ---------- screening scoring ----------

export const ANEMIA_PROMPTS = [
  "a pale whitish inner lower eyelid conjunctiva of an anemic person",
  "a deep red healthy inner lower eyelid conjunctiva",
];

export const JAUNDICE_PROMPTS = [
  "an eye with a yellow jaundiced sclera",
  "an eye with a white healthy sclera",
];

export interface ScreeningResult {
  type: "anemia" | "jaundice";
  estimate: string;
  severity: string;
  level: "RED" | "YELLOW" | "GREEN";
  confidence: number;
  finding: string;
  recommendation: string;
  method: string;
  metrics: { index: number; clipProbability: number | null };
  usedFallback: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function methodLabel(clipProb: number | null): string {
  return clipProb !== null
    ? "Live Roboflow CLIP zero-shot + on-device color analysis"
    : "On-device color analysis (add ROBOFLOW_API_KEY for CLIP verification)";
}

function confidenceOf(clipProb: number | null): number {
  if (clipProb === null) return 68;
  return Math.round(clamp(52 + 40 * Math.max(clipProb, 1 - clipProb), 60, 92));
}

/**
 * Anemia: conjunctival redness index = mean(R − (G+B)/2) over the image.
 * Pale conjunctiva (low redness) correlates with low hemoglobin.
 * `clipProb` = CLIP's probability that the image matches the anemic prompt.
 */
export function scoreAnemia(index: number | null, clipProb: number | null): ScreeningResult {
  // If the client couldn't compute color stats, derive a pseudo-index from CLIP.
  const redness = index ?? (clipProb !== null ? (1 - clipProb) * 70 : 40);

  const hb = clamp(6 + (redness / 60) * 8, 5.5, 14.5);
  const level: ScreeningResult["level"] = hb < 8 ? "RED" : hb < 11 ? "YELLOW" : "GREEN";
  const severity =
    hb < 8
      ? "Severe Anemia Suspected"
      : hb < 10
        ? "Moderate Anemia Detected"
        : hb < 11
          ? "Mild Anemia Possible"
          : "No Significant Pallor Detected";

  const clipNote =
    clipProb !== null
      ? ` CLIP zero-shot check rates pallor likelihood at ${Math.round(clipProb * 100)}%.`
      : "";

  return {
    type: "anemia",
    estimate: `${hb.toFixed(1)} g/dL`,
    severity,
    level,
    confidence: confidenceOf(clipProb),
    finding:
      (level === "GREEN"
        ? `Conjunctival redness index ${redness.toFixed(1)} is within the expected range — no marked pallor.`
        : `Reduced conjunctival redness (index ${redness.toFixed(1)}) suggests pallor consistent with low hemoglobin.`) +
      clipNote,
    recommendation:
      level === "RED"
        ? "Urgent clinical blood test (CBC) required. Refer to upazila health complex today."
        : level === "YELLOW"
          ? "Clinical blood test required. Refer to upazila health complex within 48 hours."
          : "No urgent action. Repeat screening if symptoms (fatigue, dizziness) persist.",
    method: methodLabel(clipProb),
    metrics: {
      index: Number(redness.toFixed(1)),
      clipProbability: clipProb !== null ? Number(clipProb.toFixed(2)) : null,
    },
    usedFallback: false,
  };
}

/**
 * Jaundice: scleral yellowness index = mean((R+G)/2 − B) over the image.
 * Yellow sclera correlates with elevated bilirubin (visible above ~3 mg/dL).
 * `clipProb` = CLIP's probability that the image matches the jaundiced prompt.
 */
export function scoreJaundice(index: number | null, clipProb: number | null): ScreeningResult {
  const yellowness = index ?? (clipProb !== null ? clipProb * 90 : 30);

  const bili = clamp(0.6 + (yellowness / 70) * 6, 0.4, 12);
  const level: ScreeningResult["level"] = bili >= 6 ? "RED" : bili >= 2.5 ? "YELLOW" : "GREEN";
  const severity =
    bili >= 6
      ? "Significant Icterus Detected"
      : bili >= 3
        ? "Mild-Moderate Icterus Detected"
        : bili >= 2.5
          ? "Borderline Icterus Possible"
          : "No Significant Scleral Yellowing";

  const clipNote =
    clipProb !== null
      ? ` CLIP zero-shot check rates icterus likelihood at ${Math.round(clipProb * 100)}%.`
      : "";

  return {
    type: "jaundice",
    estimate: `${bili.toFixed(1)} mg/dL`,
    severity,
    level,
    confidence: confidenceOf(clipProb),
    finding:
      (level === "GREEN"
        ? `Scleral yellowness index ${yellowness.toFixed(1)} is within the expected range — no marked yellow shift.`
        : `Elevated scleral yellowness (index ${yellowness.toFixed(1)}) is consistent with raised bilirubin.`) +
      clipNote,
    recommendation:
      level === "RED"
        ? "Urgent liver function test (LFT) required. Refer to district hospital today."
        : level === "YELLOW"
          ? "Liver function test (LFT) required. Refer to upazila health complex within 48 hours."
          : "No urgent action. Repeat screening if yellowing of eyes/skin is noticed.",
    method: methodLabel(clipProb),
    metrics: {
      index: Number(yellowness.toFixed(1)),
      clipProbability: clipProb !== null ? Number(clipProb.toFixed(2)) : null,
    },
    usedFallback: false,
  };
}
