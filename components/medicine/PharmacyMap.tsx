"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PharmacyDTO } from "@/lib/types";
import { haversineKm } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const CENTER: [number, number] = [24.7471, 90.4203]; // Mymensingh

const tealIcon = L.divIcon({
  className: "",
  html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#14b8a6;border:2px solid #0f766e;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.5)"><span style="transform:rotate(45deg);font-size:12px">⚕</span></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -24],
});

export default function PharmacyMap({ pharmacies }: { pharmacies: PharmacyDTO[] }) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [maxKm, setMaxKm] = useState(20);
  const [deliveryOnly, setDeliveryOnly] = useState(false);

  const visible = useMemo(
    () =>
      pharmacies.filter((p) => {
        const d = haversineKm(CENTER[0], CENTER[1], p.lat, p.lng);
        return d <= maxKm && (!deliveryOnly || p.delivery);
      }),
    [pharmacies, maxKm, deliveryOnly]
  );

  return (
    <div>
      <div className="flex items-center gap-4 flex-wrap mb-3 text-sm">
        <label className="flex items-center gap-2 text-slate-300">
          Distance:
          <input
            type="range"
            min={1}
            max={20}
            value={maxKm}
            onChange={(e) => setMaxKm(Number(e.target.value))}
            className="accent-teal-500"
          />
          <span className="text-teal-300 font-semibold w-14">{maxKm} km</span>
        </label>
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={deliveryOnly}
            onChange={(e) => setDeliveryOnly(e.target.checked)}
            className="accent-teal-500"
          />
          Delivery available only
        </label>
        <span className="ml-auto text-xs text-slate-500">
          {visible.length} of {pharmacies.length} pharmacies shown
        </span>
      </div>

      <div className="h-[380px] rounded-xl overflow-hidden border border-edge">
        <MapContainer center={CENTER} zoom={13} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle
            center={CENTER}
            radius={maxKm * 1000}
            pathOptions={{ color: "#14b8a6", weight: 1, fillOpacity: 0.04 }}
          />
          {visible.map((p) => {
            const dist = haversineKm(CENTER[0], CENTER[1], p.lat, p.lng).toFixed(1);
            return (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={tealIcon}>
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <p style={{ fontWeight: 700 }}>
                      {p.name} <span style={{ fontWeight: 400, opacity: 0.7 }}>{p.nameBn}</span>
                    </p>
                    <p style={{ fontSize: 12, opacity: 0.8 }}>{p.address}</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>
                      📍 {dist} km · {p.open24h ? "🕐 Open 24h" : "8am–10pm"} ·{" "}
                      {p.delivery ? "🛵 Delivery" : "No delivery"}
                    </p>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: "#14b8a6",
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontSize: 12,
                          textDecoration: "none",
                        }}
                      >
                        Get Directions
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(p.phone);
                          pushToast({ title: `${p.name}: ${p.phone}`, message: "Number copied", variant: "info" });
                        }}
                        style={{
                          background: "#1c2838",
                          color: "#e2e8f0",
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontSize: 12,
                          border: "1px solid #1e3040",
                          cursor: "pointer",
                        }}
                      >
                        Call {p.phone.slice(-6)}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
