import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { doctor: true },
      orderBy: { scheduledAt: "desc" },
    });
    return NextResponse.json({ appointments });
  } catch (err) {
    console.error("Appointments GET failed:", err);
    return NextResponse.json({ appointments: [] });
  }
}

export async function POST(req: NextRequest) {
  let body: {
    doctorId?: string;
    patientName?: string;
    patientPhone?: string;
    reason?: string;
    type?: string;
    scheduledAt?: string;
    paymentMethod?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.doctorId || !body.patientName || !body.scheduledAt) {
    return NextResponse.json(
      { error: "doctorId, patientName and scheduledAt are required" },
      { status: 400 }
    );
  }

  try {
    const doctor = await prisma.doctor.findUnique({ where: { id: body.doctorId } });
    if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: doctor.id,
        patientName: body.patientName,
        patientPhone: body.patientPhone || "+8801700000000",
        reason: body.reason || "General consultation",
        type: body.type === "IN_PERSON" ? "IN_PERSON" : "VIDEO",
        scheduledAt: new Date(body.scheduledAt),
        fee: doctor.fee,
        paymentMethod: body.paymentMethod || "bKash",
        paymentStatus: body.paymentMethod === "Cash on Arrival" ? "DUE" : "PAID",
      },
      include: { doctor: true },
    });
    return NextResponse.json({ appointment });
  } catch (err) {
    console.error("Appointments POST failed:", err);
    return NextResponse.json({ error: "Could not create appointment" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  let body: { id?: string; status?: string; scheduledAt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  try {
    const appointment = await prisma.appointment.update({
      where: { id: body.id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.scheduledAt ? { scheduledAt: new Date(body.scheduledAt) } : {}),
        ...(body.status === "CANCELLED" ? { paymentStatus: "REFUNDED" } : {}),
      },
      include: { doctor: true },
    });
    return NextResponse.json({ appointment });
  } catch (err) {
    console.error("Appointments PATCH failed:", err);
    return NextResponse.json({ error: "Could not update appointment" }, { status: 500 });
  }
}
