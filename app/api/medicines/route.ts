import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { askClaudeJSON, hasApiKey } from "@/lib/claude";
import { GENERIC_SUBSTITUTION_PROMPT } from "@/lib/triage-prompts";
import { FALLBACK_GENERIC_SUB } from "@/lib/mock-responses";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  try {
    const medicines = await prisma.medicine.findMany({
      where: q
        ? {
            OR: [
              { brandName: { contains: q } },
              { genericName: { contains: q } },
              { category: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { brandName: "asc" },
    });
    const pharmacies = await prisma.pharmacy.findMany();
    return NextResponse.json({ medicines, pharmacies });
  } catch (err) {
    console.error("Medicine search failed:", err);
    return NextResponse.json({ medicines: [], pharmacies: [] });
  }
}

// POST: AI explanation of generic substitution for a brand name
export async function POST(req: NextRequest) {
  let body: { brandName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const brandName = body.brandName?.trim();
  if (!brandName) return NextResponse.json({ error: "brandName is required" }, { status: 400 });

  let dbMatch = null;
  try {
    dbMatch = await prisma.medicine.findFirst({
      where: { brandName: { contains: brandName.split(" ")[0] } },
    });
  } catch {}

  interface GenericSub {
    brandName: string;
    genericName: string;
    explanation_en: string;
    explanation_bn: string;
    safetyNote_bn: string;
    _fallback?: boolean;
  }

  let aiResult: GenericSub;
  if (hasApiKey()) {
    try {
      aiResult = await askClaudeJSON<GenericSub>(
        GENERIC_SUBSTITUTION_PROMPT,
        `Brand name: ${brandName}${
          dbMatch
            ? `\nKnown generic: ${dbMatch.genericName} (${dbMatch.strength}), brand price ৳${dbMatch.priceBdt}, generic price ৳${dbMatch.genericPrice}, DGDA approved: ${dbMatch.dgdaApproved}`
            : ""
        }`,
        1024
      );
    } catch (err) {
      console.error("Generic substitution Claude call failed:", err);
      aiResult = { ...FALLBACK_GENERIC_SUB, brandName };
    }
  } else {
    aiResult = { ...FALLBACK_GENERIC_SUB, brandName };
  }

  return NextResponse.json({
    ...aiResult,
    db: dbMatch
      ? {
          brandName: dbMatch.brandName,
          genericName: dbMatch.genericName,
          strength: dbMatch.strength,
          brandPriceBdt: dbMatch.priceBdt,
          genericPriceBdt: dbMatch.genericPrice,
          savingsPercent: Math.round(
            ((dbMatch.priceBdt - dbMatch.genericPrice) / dbMatch.priceBdt) * 100
          ),
          dgdaApproved: dbMatch.dgdaApproved,
          manufacturer: dbMatch.manufacturer,
        }
      : null,
    usedFallback: Boolean(aiResult._fallback),
  });
}
