"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import MedicineSearch from "@/components/medicine/MedicineSearch";
import GenericSubstitution from "@/components/medicine/GenericSubstitution";
import { PharmacyDTO } from "@/lib/types";
import { Pill, MapPin } from "lucide-react";

const PharmacyMap = dynamic(() => import("@/components/medicine/PharmacyMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] card-surface flex items-center justify-center text-slate-500 text-sm">
      Loading map…
    </div>
  ),
});

export default function MedicinePage() {
  const [pharmacies, setPharmacies] = useState<PharmacyDTO[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/medicines")
      .then((r) => r.json())
      .then((d) => setPharmacies(d.pharmacies ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="p-2.5 rounded-xl bg-amber-600/15 border border-amber-800">
          <Pill className="w-6 h-6 text-amber-400" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Medicine Finder &amp; Pharmacy Locator</h1>
          <p className="text-sm text-slate-400">
            Search 20+ common medicines, compare generic prices, order delivery, find pharmacies.
          </p>
        </div>
      </div>

      <MedicineSearch
        onFindNearby={() => mapRef.current?.scrollIntoView({ behavior: "smooth" })}
      />

      <GenericSubstitution />

      <div ref={mapRef} className="panel p-5">
        <h3 className="font-bold text-slate-100 flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-teal-400" /> Nearby Pharmacies — Mymensingh District
        </h3>
        <PharmacyMap pharmacies={pharmacies} />
      </div>
    </div>
  );
}
