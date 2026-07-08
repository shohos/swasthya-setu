import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON, hasGeminiKey } from "@/lib/gemini";
import { TRIAGE_SYSTEM_PROMPT } from "@/lib/triage-prompts";
import { getFallbackTriage, TriageResult } from "@/lib/mock-responses";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: { transcript?: string; channel?: string; rawAnswers?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const transcript = body.transcript?.trim();
  const channel = ["VOICE", "SMS", "APP"].includes(body.channel ?? "") ? body.channel! : "APP";
  if (!transcript) {
    return NextResponse.json({ error: "transcript is required" }, { status: 400 });
  }

  let result: TriageResult;
  if (hasGeminiKey()) {
    try {
      result = await askGeminiJSON<TriageResult>(
        TRIAGE_SYSTEM_PROMPT,
        `Patient intake via ${channel}.\n\nTranscript:\n${transcript}\n\nStructured answers:\n${JSON.stringify(
          body.rawAnswers ?? {},
          null,
          2
        )}`
      );
    } catch (err) {
      console.error("Triage Gemini call failed, using fallback:", err);
      result = getFallbackTriage(transcript);
    }
  } else {
    result = getFallbackTriage(transcript);
  }

  // Persist the case so it appears on the doctor dashboard.
  let caseId: string | null = null;
  try {
    let patient = await prisma.patient.findFirst({
      where: { name: { contains: result.patientInfo.name } },
    });
    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          name: result.patientInfo.name,
          nameBn: result.patientInfo.nameBn,
          age: result.patientInfo.age,
          sex: result.patientInfo.sex,
          phone: "+8801700000099",
          village: "Demo Village",
          upazila: "Mymensingh Sadar",
          district: "Mymensingh",
        },
      });
    }
    const created = await prisma.case.create({
      data: {
        patientId: patient.id,
        channel,
        chiefComplaint: result.clinicalData.chiefComplaint,
        symptoms: JSON.stringify(result.clinicalData.symptoms),
        duration: `${result.clinicalData.durationDays} days`,
        triageLevel: result.triageAssessment.level,
        aiSummaryEn: result.outputs.doctorSummaryEn,
        aiAdviceBn: result.outputs.patientSMSBn,
        dangerSigns: JSON.stringify(result.triageAssessment.dangerSigns),
        rawTranscript: transcript,
      },
    });
    caseId = created.id;
  } catch (err) {
    console.error("Failed to persist case (read-only DB on Vercel is OK for demo):", err);
  }

  return NextResponse.json({ ...result, caseId, usedFallback: Boolean(result._fallback) });
}
