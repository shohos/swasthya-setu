import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const specialty = req.nextUrl.searchParams.get("specialty");
  const district = req.nextUrl.searchParams.get("district");
  const teleconsult = req.nextUrl.searchParams.get("teleconsult");
  const available = req.nextUrl.searchParams.get("available");

  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        ...(specialty && specialty !== "All" ? { specialty } : {}),
        ...(district && district !== "All" ? { district } : {}),
        ...(teleconsult === "true" ? { teleconsult: true } : {}),
        ...(available === "true" ? { available: true } : {}),
      },
      orderBy: { rating: "desc" },
    });
    return NextResponse.json({ doctors });
  } catch (err) {
    console.error("Doctor search failed:", err);
    return NextResponse.json({ doctors: [] });
  }
}
