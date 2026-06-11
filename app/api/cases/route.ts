import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

const LEVEL_ORDER: Record<string, number> = { RED: 0, YELLOW: 1, GREEN: 2 };

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const level = req.nextUrl.searchParams.get("level");
  try {
    const cases = await prisma.case.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(level ? { triageLevel: level } : {}),
      },
      include: { patient: true },
      orderBy: { createdAt: "desc" },
    });
    cases.sort(
      (a, b) =>
        (LEVEL_ORDER[a.triageLevel] ?? 3) - (LEVEL_ORDER[b.triageLevel] ?? 3) ||
        b.createdAt.getTime() - a.createdAt.getTime()
    );
    return NextResponse.json({ cases });
  } catch (err) {
    console.error("Failed to load cases:", err);
    return NextResponse.json({ cases: [], error: "db_unavailable" }, { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  let body: {
    id?: string;
    status?: string;
    doctorNotes?: string;
    prescription?: unknown;
    referralGenerated?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  try {
    const updated = await prisma.case.update({
      where: { id: body.id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.doctorNotes !== undefined ? { doctorNotes: body.doctorNotes } : {}),
        ...(body.prescription !== undefined
          ? { prescription: JSON.stringify(body.prescription) }
          : {}),
        ...(body.referralGenerated !== undefined
          ? { referralGenerated: body.referralGenerated }
          : {}),
      },
      include: { patient: true },
    });
    return NextResponse.json({ case: updated });
  } catch (err) {
    console.error("Failed to update case:", err);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}
