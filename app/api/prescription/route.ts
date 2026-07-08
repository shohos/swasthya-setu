import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON, hasGeminiKey } from "@/lib/gemini";
import { ocrImage, hasRoboflowKey } from "@/lib/vision";
import { PRESCRIPTION_SYSTEM_PROMPT } from "@/lib/triage-prompts";
import { FALLBACK_PRESCRIPTION } from "@/lib/mock-responses";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ExtractedMedicine {
  brandName: string;
  genericName: string;
  genericNameBn: string;
  purpose_en: string;
  purpose_bn: string;
  dose_bn: string;
  frequency_bn: string;
  duration_bn: string;
  warnings_bn: string[];
  mustTakeWithFood: boolean;
}

interface PrescriptionResult {
  doctorName: string | null;
  patientName: string | null;
  date: string | null;
  medicines: ExtractedMedicine[];
  overallNotes_en: string;
  safetyFlags: string[];
  expiryWarning: boolean;
  readabilityScore: number;
  ocrText?: string;
  _fallback?: boolean;
}

export async function POST(req: NextRequest) {
  let result: PrescriptionResult;

  // Two-stage pipeline: Roboflow DocTR OCR extracts the raw text,
  // then Gemini structures it into the medicine JSON.
  if (!hasRoboflowKey() || !hasGeminiKey()) {
    result = FALLBACK_PRESCRIPTION as PrescriptionResult;
  } else {
    try {
      const formData = await req.formData();
      const file = formData.get("image");
      if (!(file instanceof Blob)) {
        return NextResponse.json({ error: "image file is required" }, { status: 400 });
      }
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "file must be an image" }, { status: 400 });
      }
      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

      // Stage 1 — OCR (Roboflow hosted DocTR model)
      const ocrText = await ocrImage(base64);
      if (!ocrText.trim()) throw new Error("OCR returned no text");

      // Stage 2 — structuring (Gemini, JSON mode)
      result = await askGeminiJSON<PrescriptionResult>(
        PRESCRIPTION_SYSTEM_PROMPT,
        `Below is the raw OCR text extracted from a photographed prescription (mixed Bengali/English, may contain OCR noise). Interpret it and output the JSON structure exactly as specified.\n\n--- OCR TEXT START ---\n${ocrText}\n--- OCR TEXT END ---`,
        4096
      );
      result.ocrText = ocrText;
    } catch (err) {
      console.error("Prescription Roboflow+Gemini pipeline failed, using fallback:", err);
      result = FALLBACK_PRESCRIPTION as PrescriptionResult;
    }
  }

  // Enrich each extracted medicine with a generic alternative from the database.
  let enriched = result.medicines;
  try {
    const allMeds = await prisma.medicine.findMany();
    enriched = result.medicines.map((m) => {
      const dbMatch = allMeds.find(
        (db) =>
          db.genericName.toLowerCase() === (m.genericName || "").toLowerCase() ||
          db.brandName.toLowerCase().startsWith((m.brandName || "").toLowerCase().split(" ")[0])
      );
      if (!dbMatch) return m;
      const savings = dbMatch.priceBdt > 0
        ? Math.round(((dbMatch.priceBdt - dbMatch.genericPrice) / dbMatch.priceBdt) * 100)
        : 0;
      return {
        ...m,
        genericAlternative: {
          genericName: dbMatch.genericName,
          brandPriceBdt: dbMatch.priceBdt,
          genericPriceBdt: dbMatch.genericPrice,
          savingsPercent: savings,
          dgdaApproved: dbMatch.dgdaApproved,
          inStock: dbMatch.inStock,
        },
      };
    });
  } catch (err) {
    console.error("Medicine DB enrichment failed:", err);
  }

  return NextResponse.json({
    ...result,
    medicines: enriched,
    usedFallback: Boolean(result._fallback),
  });
}
