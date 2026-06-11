import { NextRequest, NextResponse } from "next/server";
import { askClaudeJSON, hasApiKey } from "@/lib/claude";
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
  _fallback?: boolean;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;

export async function POST(req: NextRequest) {
  let result: PrescriptionResult;

  if (!hasApiKey()) {
    result = FALLBACK_PRESCRIPTION as PrescriptionResult;
  } else {
    try {
      const formData = await req.formData();
      const file = formData.get("image");
      if (!(file instanceof Blob)) {
        return NextResponse.json({ error: "image file is required" }, { status: 400 });
      }
      const mediaType = (ALLOWED_TYPES as readonly string[]).includes(file.type)
        ? (file.type as (typeof ALLOWED_TYPES)[number])
        : "image/jpeg";
      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

      result = await askClaudeJSON<PrescriptionResult>(
        PRESCRIPTION_SYSTEM_PROMPT,
        [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: "Extract all medicine information from this prescription. Output the JSON structure exactly as specified.",
          },
        ],
        4096
      );
    } catch (err) {
      console.error("Prescription Claude call failed, using fallback:", err);
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
