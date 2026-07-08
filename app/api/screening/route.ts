import { NextRequest, NextResponse } from "next/server";
import {
  hasRoboflowKey,
  clipCompare,
  softmaxPair,
  scoreAnemia,
  scoreJaundice,
  ANEMIA_PROMPTS,
  JAUNDICE_PROMPTS,
  ScreeningResult,
} from "@/lib/vision";
import { DEMO_VITALS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function fallbackResult(type: "anemia" | "jaundice"): ScreeningResult {
  const v = type === "anemia" ? DEMO_VITALS.anemia : DEMO_VITALS.jaundice;
  return {
    type,
    estimate: type === "anemia" ? DEMO_VITALS.anemia.hemoglobin : DEMO_VITALS.jaundice.bilirubin,
    severity: v.severity,
    level: v.level,
    confidence: v.confidence,
    finding: v.finding,
    recommendation: v.recommendation,
    method: "Offline demo mode",
    metrics: { index: 0, clipProbability: null },
    usedFallback: true,
  };
}

export async function POST(req: NextRequest) {
  let body: { image?: string; type?: string; colorIndex?: number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const type = body.type === "jaundice" ? "jaundice" : "anemia";
  // Accept both raw base64 and data-URL form.
  const base64 = (body.image ?? "").replace(/^data:image\/\w+;base64,/, "");
  if (!base64) {
    return NextResponse.json({ error: "image (base64) is required" }, { status: 400 });
  }

  const colorIndex =
    typeof body.colorIndex === "number" && Number.isFinite(body.colorIndex)
      ? body.colorIndex
      : null;

  // Roboflow CLIP zero-shot verification (when the key is configured).
  let clipProb: number | null = null;
  if (hasRoboflowKey()) {
    try {
      const prompts = type === "anemia" ? ANEMIA_PROMPTS : JAUNDICE_PROMPTS;
      const [positive, negative] = await clipCompare(base64, prompts);
      clipProb = softmaxPair(positive, negative);
    } catch (err) {
      console.error("Roboflow CLIP failed, continuing with color index only:", err);
    }
  }

  // No signal at all → demo fallback. Otherwise score with what we have.
  if (colorIndex === null && clipProb === null) {
    return NextResponse.json(fallbackResult(type));
  }

  const result =
    type === "anemia" ? scoreAnemia(colorIndex, clipProb) : scoreJaundice(colorIndex, clipProb);
  return NextResponse.json(result);
}
