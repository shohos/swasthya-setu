"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppointmentDTO } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cn, timeAgo } from "@/lib/utils";
import BanglaText from "@/components/shared/BanglaText";
import VideoCallModal from "@/components/doctors/VideoCallModal";
import {
  CalendarDays,
  Video,
  MapPin,
  ChevronDown,
  Phone,
  Radio,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Stethoscope,
} from "lucide-react";

type Bucket = "ongoing" | "upcoming" | "past";

function bucketOf(a: AppointmentDTO): Bucket {
  const start = new Date(a.scheduledAt).getTime();
  const end = start + a.durationMin * 60 * 1000;
  const now = Date.now();
  if (a.status === "CANCELLED" || a.status === "COMPLETED") return "past";
  if (now >= start && now <= end) return "ongoing";
  if (now < start) return "upcoming";
  return "past";
}

function fmtDateTime(iso: string, lang: string) {
  const d = new Date(iso);
  return d.toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AppointmentsPage() {
  const { t, lang } = useT();
  const pushToast = useAppStore((s) => s.pushToast);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Bucket>("upcoming");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [inCall, setInCall] = useState<AppointmentDTO | null>(null);
  const bn = lang === "bn";

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data.appointments ?? []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const buckets: Record<Bucket, AppointmentDTO[]> = { ongoing: [], upcoming: [], past: [] };
  for (const a of appointments) buckets[bucketOf(a)].push(a);
  buckets.upcoming.sort((x, y) => +new Date(x.scheduledAt) - +new Date(y.scheduledAt));
  buckets.past.sort((x, y) => +new Date(y.scheduledAt) - +new Date(x.scheduledAt));

  // Auto-select the busiest sensible tab on first load
  useEffect(() => {
    if (!loading && buckets.ongoing.length > 0) setTab("ongoing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function cancel(a: AppointmentDTO) {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, status: "CANCELLED" }),
      });
      const data = await res.json();
      if (data.appointment) {
        setAppointments((list) => list.map((x) => (x.id === a.id ? data.appointment : x)));
      }
    } catch {}
    pushToast({
      title: bn ? "অ্যাপয়েন্টমেন্ট বাতিল হয়েছে" : "Appointment cancelled",
      message: bn
        ? "রিফান্ড ৩ কার্যদিবসের মধ্যে ফেরত যাবে"
        : "Refund will be processed within 3 working days",
      variant: "info",
    });
  }

  const TABS: { id: Bucket; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "ongoing", label: t("appt.ongoing"), icon: Radio },
    { id: "upcoming", label: t("appt.upcoming"), icon: Clock },
    { id: "past", label: t("appt.past"), icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="p-2.5 rounded-xl bg-purple-600/15 border border-purple-800">
          <CalendarDays className="w-6 h-6 text-purple-400" />
        </span>
        <div>
          <h1 className={cn("text-2xl font-bold text-slate-100", bn && "font-bangla")}>
            {t("appt.title")}
          </h1>
          <p className={cn("text-sm text-slate-400", bn && "font-bangla")}>{t("appt.subtitle")}</p>
        </div>
        <Link href="/doctors" className="btn-primary text-sm ml-auto flex items-center gap-1.5">
          <Stethoscope className="w-4 h-4" />
          {bn ? "নতুন অ্যাপয়েন্টমেন্ট" : "Book New"}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm border flex items-center gap-2 transition-colors",
              bn && "font-bangla",
              tab === id
                ? "bg-purple-600/20 border-purple-600 text-purple-200"
                : "bg-card border-edge text-slate-400 hover:text-slate-200"
            )}
          >
            <Icon className={cn("w-4 h-4", id === "ongoing" && buckets.ongoing.length > 0 && "text-teal-400 animate-pulse")} />
            {label}
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-ink border border-edge">
              {buckets[id].length}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div className={cn("panel p-8 text-center text-slate-500", bn && "font-bangla")}>
          {t("common.loading")}
        </div>
      )}

      {!loading && buckets[tab].length === 0 && (
        <div className={cn("panel p-10 text-center text-slate-500 text-sm", bn && "font-bangla")}>
          {t("appt.none")}
        </div>
      )}

      <div className="space-y-3">
        {buckets[tab].map((a) => {
          const bucket = bucketOf(a);
          const isOpen = expanded === a.id;
          const cancelled = a.status === "CANCELLED";
          const rx: { medicine: string; frequency: string; duration: string }[] = (() => {
            try {
              return a.prescription ? JSON.parse(a.prescription) : [];
            } catch {
              return [];
            }
          })();

          return (
            <div
              key={a.id}
              className={cn(
                "panel p-4 border-l-4 transition-colors",
                bucket === "ongoing"
                  ? "border-l-teal-500"
                  : cancelled
                    ? "border-l-red-800 opacity-75"
                    : bucket === "upcoming"
                      ? "border-l-purple-600"
                      : "border-l-slate-600"
              )}
            >
              <div className="flex items-start gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-100">{a.doctor?.name}</p>
                    <BanglaText className="text-xs text-slate-500">{a.doctor?.nameBn}</BanglaText>
                    {bucket === "ongoing" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-300 bg-teal-600/15 border border-teal-700 rounded-full px-2 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                        LIVE NOW
                      </span>
                    )}
                    {cancelled && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-300 bg-red-900/25 border border-red-800 rounded-full px-2 py-0.5">
                        <XCircle className="w-3 h-3" /> CANCELLED
                      </span>
                    )}
                    {a.status === "COMPLETED" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-300 bg-green-900/25 border border-green-800 rounded-full px-2 py-0.5">
                        <CheckCircle2 className="w-3 h-3" /> COMPLETED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-purple-300 mt-0.5">
                    {a.doctor?.specialty} · {a.doctor?.facility}
                  </p>
                  <p className="text-sm text-slate-300 mt-1.5">{a.reason}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" /> {fmtDateTime(a.scheduledAt, lang)}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold",
                        a.type === "VIDEO"
                          ? "bg-blue-900/25 border-blue-800 text-blue-300"
                          : "bg-amber-900/25 border-amber-800 text-amber-300"
                      )}
                    >
                      {a.type === "VIDEO" ? (
                        <>
                          <Video className="w-3 h-3" /> Video
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3" /> In-person
                        </>
                      )}
                    </span>
                    <span className="text-teal-300 font-semibold">৳{a.fee}</span>
                    <span>
                      {a.paymentMethod} ·{" "}
                      <span
                        className={cn(
                          a.paymentStatus === "PAID" && "text-green-400",
                          a.paymentStatus === "DUE" && "text-amber-400",
                          a.paymentStatus === "REFUNDED" && "text-slate-500"
                        )}
                      >
                        {a.paymentStatus}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {bucket === "ongoing" && a.type === "VIDEO" && !cancelled && (
                    <button
                      onClick={() => setInCall(a)}
                      className={cn("btn-primary text-xs flex items-center gap-1.5 animate-pulse", bn && "font-bangla")}
                    >
                      <Video className="w-3.5 h-3.5" /> {t("appt.joinCall")}
                    </button>
                  )}
                  {bucket === "upcoming" && !cancelled && (
                    <>
                      {a.type === "VIDEO" && (
                        <button
                          onClick={() => setInCall(a)}
                          className={cn("btn-secondary text-xs flex items-center gap-1.5", bn && "font-bangla")}
                        >
                          <Video className="w-3.5 h-3.5" /> {t("appt.joinCall")}
                        </button>
                      )}
                      <button
                        onClick={() => cancel(a)}
                        className={cn(
                          "text-xs text-slate-500 hover:text-red-400 flex items-center gap-1",
                          bn && "font-bangla"
                        )}
                      >
                        <XCircle className="w-3.5 h-3.5" /> {t("appt.cancel")}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setExpanded(isOpen ? null : a.id)}
                    className={cn(
                      "text-xs text-slate-400 hover:text-purple-300 flex items-center gap-1",
                      bn && "font-bangla"
                    )}
                  >
                    <ChevronDown
                      className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")}
                    />
                    {t("appt.details")}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div className="mt-4 pt-4 border-t border-edge grid sm:grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-2 text-sm">
                    <Detail label={bn ? "রোগী" : "Patient"} value={a.patientName} />
                    <Detail label={bn ? "ফোন" : "Phone"} value={a.patientPhone} mono />
                    <Detail
                      label={bn ? "ডাক্তারের ফোন" : "Doctor's phone"}
                      value={a.doctor?.phone ?? "—"}
                      mono
                    />
                    <Detail
                      label={bn ? "সময়কাল" : "Duration"}
                      value={`${a.durationMin} min`}
                    />
                    <Detail
                      label={bn ? "বুক করা হয়েছে" : "Booked"}
                      value={timeAgo(a.createdAt)}
                    />
                    {a.doctor?.phone && bucket !== "past" && (
                      <a
                        href={`tel:${a.doctor.phone}`}
                        className="btn-secondary text-xs inline-flex items-center gap-1.5 mt-1"
                      >
                        <Phone className="w-3.5 h-3.5" /> {bn ? "ডাক্তারকে কল করুন" : "Call doctor"}
                      </a>
                    )}
                  </div>

                  <div className="space-y-3">
                    {a.notes && (
                      <div>
                        <p
                          className={cn(
                            "text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1",
                            bn && "font-bangla"
                          )}
                        >
                          {t("appt.notes")}
                        </p>
                        <p className="text-sm text-slate-300 card-surface p-2.5">{a.notes}</p>
                      </div>
                    )}
                    {rx.length > 0 && (
                      <div>
                        <p
                          className={cn(
                            "text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1",
                            bn && "font-bangla"
                          )}
                        >
                          {t("appt.prescription")}
                        </p>
                        <div className="card-surface p-2.5 space-y-1">
                          {rx.map((r, i) => (
                            <p key={i} className="text-sm text-slate-300 flex items-start gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                              {r.medicine} — {r.frequency}, {r.duration}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {!a.notes && rx.length === 0 && (
                      <p className="text-xs text-slate-600 italic">
                        {bn
                          ? "এখনো কোনো নোট বা প্রেসক্রিপশন নেই।"
                          : "No notes or prescription yet."}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {inCall && (
        <VideoCallModal
          doctorName={inCall.doctor?.name ?? "Doctor"}
          patientName={inCall.patientName}
          onClose={() => setInCall(null)}
        />
      )}
    </div>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={cn("text-slate-200 text-right", mono && "font-mono text-xs")}>{value}</span>
    </div>
  );
}
