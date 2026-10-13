import React, { useState, useRef, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { APIProvider, Map as GoogleMap, useMap } from "@vis.gl/react-google-maps";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Compass,
  Search,
  X,
  MessageCircle,
  CheckCircle2,
  Car,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import {
  REAL_MASTERPLAN_MODEL,
  REAL_PERIMETER_LOCAL,
  REAL_CENTROID_UTM,
  REAL_UTM_VERTICES,
  ALDEA_THEMES,
  RealUrbanLot,
  MasterplanAmenity,
} from "../../lib/realUrbanMasterplanModel";
import { getAffineTransform } from "../../lib/affine";
import { XY } from "../../types/map";

const SVG_W = 800;
const SVG_H = 800;
const SCALE = 1.42;
const CX = 400;
const CY = 400;

function toCanvasSvg(x: number, y: number): { x: number; y: number } {
  return {
    x: Number((CX + x * SCALE).toFixed(2)),
    y: Number((CY - y * SCALE).toFixed(2)),
  };
}

// 4 Lat/Lng vertices for Google Maps Affine Overlay
const GOOGLE_TERRAIN_LAT_LNG = [
  { id: "A", lat: REAL_UTM_VERTICES.A.lat, lng: REAL_UTM_VERTICES.A.lng },
  { id: "B", lat: REAL_UTM_VERTICES.B.lat, lng: REAL_UTM_VERTICES.B.lng },
  { id: "C", lat: REAL_UTM_VERTICES.C.lat, lng: REAL_UTM_VERTICES.C.lng },
  { id: "D", lat: REAL_UTM_VERTICES.D.lat, lng: REAL_UTM_VERTICES.D.lng },
];

const TERRAIN_SVG_VERTICES: XY[] = [
  toCanvasSvg(-6.921, -253.797),  // A (Sur)
  toCanvasSvg(-218.318, -55.372), // B (Oeste)
  toCanvasSvg(2.017, 257.617),   // C (Norte)
  toCanvasSvg(223.223, 51.552),  // D (Este)
];

export type MasterplanBasemap = "architectural" | "satellite";

interface MapCanvasProps {
  selectedLot?: RealUrbanLot | null;
  onSelectLot?: (lot: RealUrbanLot | null) => void;
  basemap?: MasterplanBasemap;
  onBasemapChange?: (mode: MasterplanBasemap) => void;
}

export function MapCanvas({
  selectedLot: externalSelectedLot,
  onSelectLot: externalOnSelectLot,
  basemap,
  onBasemapChange,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalSelectedLot, setInternalSelectedLot] = useState<RealUrbanLot | null>(null);
  const [selectedAmenity, setSelectedAmenity] = useState<MasterplanAmenity | null>(null);

  const selectedLot = externalSelectedLot !== undefined ? externalSelectedLot : internalSelectedLot;
  const handleSelectLot = (lot: RealUrbanLot | null) => {
    if (externalOnSelectLot) externalOnSelectLot(lot);
    setInternalSelectedLot(lot);
  };

  const [activeAldea, setActiveAldea] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDomes, setShowDomes] = useState(true);
  const [showHud, setShowHud] = useState(true);
  const [mapType, setMapType] = useState<"satellite" | "hybrid">("satellite");
  const [internalBasemap, setInternalBasemap] = useState<MasterplanBasemap>("architectural");
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const effectiveBasemap = basemap ?? internalBasemap;
  const setBasemap = (mode: MasterplanBasemap) => {
    if (onBasemapChange) onBasemapChange(mode);
    setInternalBasemap(mode);
  };

  const { lots, parkingStalls, roads, amenities, stats } = REAL_MASTERPLAN_MODEL;

  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";

  // Polígono SVG del Límite A-B-C-D
  const perimeterPath = useMemo(() => {
    return (
      REAL_PERIMETER_LOCAL.map((v, i) => {
        const s = toCanvasSvg(v.x, v.y);
        return `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`;
      }).join(" ") + " Z"
    );
  }, []);

  // Laguna Cristalina Orgánica
  const lagoonPath = useMemo(() => {
    const pts = [
      { x: 0, y: 38 },
      { x: 22, y: 32 },
      { x: 38, y: 16 },
      { x: 36, y: -6 },
      { x: 20, y: -24 },
      { x: 0, y: -28 },
      { x: -20, y: -24 },
      { x: -36, y: -6 },
      { x: -38, y: 16 },
      { x: -22, y: 32 },
    ];
    return (
      pts.map((p, i) => {
        const s = toCanvasSvg(p.x, p.y);
        return `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`;
      }).join(" ") + " Z"
    );
  }, []);

  // Playa de Arena Blanca
  const beachPath = useMemo(() => {
    const pts = [
      { x: 0, y: 46 },
      { x: 28, y: 38 },
      { x: 46, y: 18 },
      { x: 44, y: -10 },
      { x: 26, y: -32 },
      { x: 0, y: -36 },
      { x: -26, y: -32 },
      { x: -44, y: -10 },
      { x: -46, y: 18 },
      { x: -28, y: 38 },
    ];
    return (
      pts.map((p, i) => {
        const s = toCanvasSvg(p.x, p.y);
        return `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`;
      }).join(" ") + " Z"
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-[#161310] font-sans border border-[#2D2620] select-none ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none"
          : "h-[740px] sm:h-[820px] rounded-3xl shadow-2xl"
      }`}
    >
      {/* ── TOP RIGHT: CONTROLES Y ROSA DE LOS VIENTOS ── */}
      <div className="pointer-events-auto absolute top-4 right-4 z-30 flex flex-wrap items-center gap-2">
        {/* Rosa de los Vientos */}
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#1F1B17]/95 px-3 py-2 shadow-xl backdrop-blur-xl">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#161310] text-[#C5A059] shadow">
            <Compass className="h-5 w-5 animate-pulse" />
            <span className="absolute -top-1 font-bold text-[8px] text-[#B85A3D]">N</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-white">Norte</span>
            <span className="text-[8px] text-white/60">UTM Zona 18S</span>
          </div>
        </div>

        {/* Toggle Domos */}
        <button
          type="button"
          onClick={() => setShowDomes(!showDomes)}
          className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold shadow-lg backdrop-blur-xl transition cursor-pointer ${
            showDomes
              ? "bg-[#4E7D5B] text-white border-[#4E7D5B]"
              : "bg-[#1F1B17]/90 text-white/70 border-white/10 hover:text-white"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="hidden sm:inline">Domos 3D</span>
        </button>

        <div className="flex rounded-2xl border border-white/10 bg-[#1F1B17]/95 p-1 shadow-lg backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setBasemap("architectural")}
            className={`rounded-xl px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
              effectiveBasemap === "architectural" ? "bg-white text-[#161310]" : "text-white/70 hover:text-white"
            }`}
          >
            Plano 2D
          </button>
          <button
            type="button"
            onClick={() => setBasemap("satellite")}
            className={`rounded-xl px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
              effectiveBasemap === "satellite" ? "bg-[#A84F36] text-white" : "text-white/70 hover:text-white"
            }`}
          >
            Satélite
          </button>
        </div>

        {/* Toggle HUD */}
        <button
          type="button"
          onClick={() => setShowHud(!showHud)}
          className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold shadow-lg backdrop-blur-xl transition cursor-pointer ${
            showHud
              ? "bg-[#C5A059] text-[#161310] border-[#C5A059]"
              : "bg-[#1F1B17]/90 text-white/70 border-white/10 hover:text-white"
          }`}
        >
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">HUD</span>
        </button>

        {effectiveBasemap === "architectural" && (
          <>
            <button
              type="button"
              onClick={() => setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.2, 4.5) }))}
              className="rounded-2xl border border-white/10 bg-[#1F1B17]/90 p-2 text-white/80 shadow-lg backdrop-blur-xl hover:text-white transition cursor-pointer"
              aria-label="Acercar"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale * 0.85, 0.55) }))}
              className="rounded-2xl border border-white/10 bg-[#1F1B17]/90 p-2 text-white/80 shadow-lg backdrop-blur-xl hover:text-white transition cursor-pointer"
              aria-label="Alejar"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Pantalla Completa */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="rounded-2xl border border-white/10 bg-[#1F1B17]/90 p-2 text-white/80 shadow-lg backdrop-blur-xl hover:text-white transition cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* ── TOP LEFT: BUSCADOR & SELECTOR DE 4 ALDEAS ── */}
      <div className="pointer-events-none absolute top-4 left-4 z-30 flex flex-col gap-2 max-w-[88vw] sm:max-w-md">
        {/* Buscador */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-[#1F1B17]/95 px-3.5 py-2 shadow-xl backdrop-blur-xl">
          <Search className="h-4 w-4 text-[#C5A059] shrink-0" />
          <input
            type="text"
            placeholder="Buscar lote (ej. A1-05, A2-12, A4-50)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              const found = lots.find((l) => l.id.toLowerCase() === e.target.value.trim().toLowerCase());
              if (found) {
                handleSelectLot(found);
                setSelectedAmenity(null);
              }
            }}
            className="w-full bg-transparent text-xs font-semibold text-white outline-none placeholder-white/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-white/60 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Selector de Aldeas */}
        <div className="pointer-events-auto flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-[#1F1B17]/90 p-1 shadow-xl backdrop-blur-xl text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveAldea("all")}
            className={`rounded-xl px-2.5 py-1 transition cursor-pointer ${
              activeAldea === "all" ? "bg-white text-[#161310]" : "text-white/70 hover:text-white"
            }`}
          >
            Todas ({stats.totalLots})
          </button>
          <button
            type="button"
            onClick={() => setActiveAldea(1)}
            className={`rounded-xl px-2.5 py-1 transition cursor-pointer flex items-center gap-1.5 ${
              activeAldea === 1 ? "bg-[#4E7D5B] text-white shadow" : "text-[#4E7D5B] hover:bg-[#4E7D5B]/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#4E7D5B]" />
            Aldea 1 ({stats.byAldea[1]})
          </button>
          <button
            type="button"
            onClick={() => setActiveAldea(2)}
            className={`rounded-xl px-2.5 py-1 transition cursor-pointer flex items-center gap-1.5 ${
              activeAldea === 2 ? "bg-[#C89D34] text-white shadow" : "text-[#C89D34] hover:bg-[#C89D34]/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#C89D34]" />
            Aldea 2 ({stats.byAldea[2]})
          </button>
          <button
            type="button"
            onClick={() => setActiveAldea(3)}
            className={`rounded-xl px-2.5 py-1 transition cursor-pointer flex items-center gap-1.5 ${
              activeAldea === 3 ? "bg-[#D35400] text-white shadow" : "text-[#D35400] hover:bg-[#D35400]/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#D35400]" />
            Aldea 3 ({stats.byAldea[3]})
          </button>
          <button
            type="button"
            onClick={() => setActiveAldea(4)}
            className={`rounded-xl px-2.5 py-1 transition cursor-pointer flex items-center gap-1.5 ${
              activeAldea === 4 ? "bg-[#8D7B68] text-white shadow" : "text-[#8D7B68] hover:bg-[#8D7B68]/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#8D7B68]" />
            Aldea 4 ({stats.byAldea[4]})
          </button>
        </div>
      </div>

      {/* ── CARD LATERAL: LOTE SELECCIONADO (CON RESERVA WHATSAPP) ── */}
      {selectedLot && (
        <div className="pointer-events-auto absolute top-20 right-4 z-40 w-84 rounded-3xl border border-white/20 bg-[#1F1B17]/98 p-5 shadow-2xl backdrop-blur-2xl animate-fade-in text-xs text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: selectedLot.themeColor }}
              >
                {selectedLot.id} · {selectedLot.manzana}
              </span>
              <h4 className="font-display text-base font-bold text-white mt-1.5">
                {selectedLot.tipo}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => handleSelectLot(null)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2 text-xs divide-y divide-white/5">
            <div className="flex justify-between pt-1">
              <span className="text-white/60">Aldea / Sector:</span>
              <span className="font-bold text-white">{selectedLot.aldeaName}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-white/60">Área Privada:</span>
              <span className="font-bold text-[#C5A059]">{selectedLot.areaM2.toFixed(2)} m²</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-white/60">Frente × Fondo:</span>
              <span className="font-bold text-white">
                {selectedLot.widthM} m × {selectedLot.depthM} m
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-white/60">Acceso Peatonal:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Directo a Calle y Oasis
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-white/60">Domos Compatibles:</span>
              <span className="font-bold text-amber-400">
                {selectedLot.compatibleDomes.map((d) => `Ø${d}m`).join(", ")}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-white/60">Cochera Plus Asignada:</span>
              <span className="font-bold text-white">
                {selectedLot.cocherasAsignadas} plaza(s) (Complejo Sur)
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-white/60">Precio Lista Fundador:</span>
              <span className="font-display font-black text-sm text-[#E07A5F]">
                ${selectedLot.precioUsd.toLocaleString()} USD
              </span>
            </div>
          </div>

          {/* Botón WhatsApp */}
          <a
            href={`https://wa.me/51999999999?text=Hola,%20deseo%20reservar%20el%20Lote%20${selectedLot.id}%20(${selectedLot.tipo},%20${selectedLot.areaM2}m2)%20en%20Moon%20Paracas.`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-2.5 font-bold text-white shadow-lg hover:bg-[#1EBE5D] transition cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Consultar Disponibilidad en WhatsApp</span>
          </a>
        </div>
      )}

      {/* ── CARD LATERAL: AMENIDAD SELECCIONADA ── */}
      {selectedAmenity && (
        <div className="pointer-events-auto absolute top-20 right-4 z-40 w-84 rounded-3xl border border-white/20 bg-[#1F1B17]/98 p-5 shadow-2xl backdrop-blur-2xl animate-fade-in text-xs text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: selectedAmenity.badgeColor }}
              >
                {selectedAmenity.badge}
              </span>
              <h4 className="font-display text-base font-bold text-white mt-1.5">
                {selectedAmenity.name}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedAmenity(null)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-white/80">{selectedAmenity.blurb}</p>

          <div className="mt-3 space-y-1.5 border-t border-white/10 pt-2.5">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-[#C5A059]">
              Equipamiento y Servicios:
            </span>
            <ul className="space-y-1 text-[11px] text-white">
              {selectedAmenity.highlights.map((item, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E07A5F]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── HUD INFERIOR IZQUIERDO ── */}
      {showHud && (
        <div className="pointer-events-auto absolute bottom-4 left-4 z-30 max-w-[92vw] sm:max-w-md rounded-3xl border border-white/20 bg-[#1F1B17]/95 p-4 shadow-2xl backdrop-blur-2xl text-xs text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-[#C5A059] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#C5A059]" />
              {effectiveBasemap === "satellite" ? "Masterplan Satélite" : "Plano técnico 2D"} · Terreno Real 11.26 ha
            </span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white">
              Polígono A-B-C-D
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mb-2.5 text-center">
            <div className="rounded-xl bg-white/5 p-1.5 border border-white/10">
              <span className="block text-[8px] text-white/60 uppercase font-bold">Lotes Totales</span>
              <span className="font-display text-sm font-bold text-white">{stats.totalLots} Lotes</span>
            </div>
            <div className="rounded-xl bg-white/5 p-1.5 border border-white/10">
              <span className="block text-[8px] text-white/60 uppercase font-bold">Área Vendible</span>
              <span className="font-display text-xs font-bold text-emerald-400">
                {stats.totalVendibleM2.toLocaleString()} m²
              </span>
            </div>
            <div className="rounded-xl bg-white/5 p-1.5 border border-white/10">
              <span className="block text-[8px] text-white/60 uppercase font-bold">Oasis & Vías</span>
              <span className="font-display text-xs font-bold text-[#00E5FF]">
                {(stats.totalAreaM2 - stats.totalVendibleM2).toLocaleString()} m²
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[8px] text-white/70 border-t border-white/10 pt-1.5">
            <span className="flex items-center gap-1 font-medium">
              <Car className="h-3 w-3 text-[#C5A059]" /> 192 Cocheras Sur + Apoyo Interno
            </span>
            <span className="text-emerald-400 font-bold">✓ 100% Salida Peatonal a Calles</span>
          </div>
        </div>
      )}

      {/* ── MAPA BASE: PLANO 2D (RENACER) O SATÉLITE GEORREFERENCIADO ── */}
      {effectiveBasemap === "satellite" && googleMapsKey ? (
        <APIProvider apiKey={googleMapsKey}>
          <GoogleMap
            defaultCenter={{ lat: REAL_CENTROID_UTM.lat, lng: REAL_CENTROID_UTM.lng }}
            defaultZoom={17}
            mapTypeId={mapType}
            disableDefaultUI={true}
            gestureHandling="greedy"
            className="h-full w-full"
          >
            <GoogleMapsVectorLayer
              perimeterPath={perimeterPath}
              beachPath={beachPath}
              lagoonPath={lagoonPath}
              lots={lots}
              parkingStalls={parkingStalls}
              amenities={amenities}
              activeAldea={activeAldea}
              searchQuery={searchQuery}
              selectedLot={selectedLot}
              showDomes={showDomes}
              onSelectLot={handleSelectLot}
              onSelectAmenity={setSelectedAmenity}
            />
          </GoogleMap>
        </APIProvider>
      ) : (
        <div
          className="relative h-full w-full flex items-center justify-center bg-[#1A1612] cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            setIsDragging(true);
            setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
          }}
          onMouseMove={(e) => {
            if (!isDragging) return;
            setTransform((prev) => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onWheel={(e) => {
            e.preventDefault();
            const factor = e.deltaY < 0 ? 1.12 : 0.89;
            setTransform((prev) => ({
              ...prev,
              scale: Math.min(Math.max(prev.scale * factor, 0.55), 4.5),
            }));
          }}
        >
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="h-full w-full max-h-full"
            style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: "center center" }}
          >
            <defs>
              <radialGradient id="fallback-lagoon" cx="45%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#84FFFF" />
                <stop offset="60%" stopColor="#00838F" />
              </radialGradient>
              <linearGradient id="fallback-beach" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFDF7" />
                <stop offset="100%" stopColor="#F0E5D0" />
              </linearGradient>
            </defs>

            {/* Terreno Base */}
            <path d={perimeterPath} fill="#26201A" stroke="#C5A059" strokeWidth="2.5" />

            {/* Lotes */}
            {lots.map((lot) => {
              const isSelected = selectedLot?.id === lot.id;
              const isMatch = (activeAldea === "all" || activeAldea === lot.aldea) &&
                (!searchQuery || lot.id.toLowerCase().includes(searchQuery.toLowerCase()));

              const pathData = lot.polygon.map((p, i) => {
                const s = toCanvasSvg(p.x, p.y);
                return `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`;
              }).join(" ") + " Z";

              return (
                <g key={`fb-${lot.id}`} onClick={() => handleSelectLot(lot)} className="cursor-pointer">
                  <path
                    d={pathData}
                    fill={lot.themeColor}
                    fillOpacity={isMatch ? (isSelected ? 0.95 : 0.85) : 0.2}
                    stroke={isSelected ? "#FFF" : "#161310"}
                    strokeWidth={isSelected ? 2.5 : 0.75}
                  />
                  {showDomes && isMatch && (
                    <circle
                      cx={toCanvasSvg(lot.centroid.x, lot.centroid.y).x}
                      cy={toCanvasSvg(lot.centroid.x, lot.centroid.y).y}
                      r={lot.areaM2 === 240 ? 4.5 : 3.2}
                      fill="#FFF"
                    />
                  )}
                </g>
              );
            })}

            {/* Oasis */}
            <path d={beachPath} fill="url(#fallback-beach)" stroke="#C5A059" strokeWidth="1.5" />
            <path d={lagoonPath} fill="url(#fallback-lagoon)" stroke="#FFF" strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── COMPONENTE DE OVERLAY VECTORIAL DE GOOGLE MAPS CON AFFINE TRANSFORM ──
function GoogleMapsVectorLayer({
  perimeterPath,
  beachPath,
  lagoonPath,
  lots,
  parkingStalls,
  amenities,
  activeAldea,
  searchQuery,
  selectedLot,
  showDomes,
  onSelectLot,
  onSelectAmenity,
}: {
  perimeterPath: string;
  beachPath: string;
  lagoonPath: string;
  lots: RealUrbanLot[];
  parkingStalls: any[];
  amenities: MasterplanAmenity[];
  activeAldea: number | "all";
  searchQuery: string;
  selectedLot: RealUrbanLot | null;
  showDomes: boolean;
  onSelectLot: (lot: RealUrbanLot | null) => void;
  onSelectAmenity: (amenity: MasterplanAmenity) => void;
}) {
  const map = useMap();
  const [containerDiv, setContainerDiv] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof google === "undefined" || !map) return;

    class VectorOverlayView extends google.maps.OverlayView {
      private div: HTMLDivElement | null = null;

      onAdd() {
        this.div = document.createElement("div");
        this.div.style.position = "absolute";
        this.div.style.top = "0";
        this.div.style.left = "0";
        this.div.style.width = `${SVG_W}px`;
        this.div.style.height = `${SVG_H}px`;
        this.div.style.transformOrigin = "0 0";
        this.div.style.pointerEvents = "none";

        const panes = this.getPanes()!;
        panes.overlayMouseTarget.appendChild(this.div);
        setContainerDiv(this.div);
      }

      draw() {
        if (!this.div) return;
        const projection = this.getProjection();
        if (!projection) return;

        const dst = GOOGLE_TERRAIN_LAT_LNG.map((ll) => {
          const pt = projection.fromLatLngToDivPixel(new google.maps.LatLng(ll.lat, ll.lng));
          return { x: pt?.x || 0, y: pt?.y || 0 };
        });

        const matrix = getAffineTransform(TERRAIN_SVG_VERTICES, dst);
        if (matrix) {
          const [a, b, c, d, tx, ty] = matrix;
          this.div.style.transform = `matrix(${a}, ${b}, ${c}, ${d}, ${tx}, ${ty})`;
        }
      }

      onRemove() {
        if (this.div && this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
        }
        this.div = null;
        setContainerDiv(null);
      }
    }

    const overlay = new VectorOverlayView();
    overlay.setMap(map);

    return () => {
      overlay.setMap(null);
    };
  }, [map]);

  if (!containerDiv) return null;

  return createPortal(
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="h-full w-full pointer-events-none"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Degradado Laguna Realista */}
        <radialGradient id="gmap-lagoon" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#84FFFF" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#00E5FF" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#00838F" stopOpacity="0.98" />
        </radialGradient>

        <linearGradient id="gmap-beach" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#F0E5D0" stopOpacity="0.95" />
        </linearGradient>

        <filter id="gmap-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* 1. LÍMITE PERIMETRAL LEGAL A-B-C-D (11.26 ha) */}
      <path
        d={perimeterPath}
        fill="none"
        stroke="#C5A059"
        strokeWidth="3.5"
        strokeDasharray="6 4"
      />

      {/* 2. RED VIAL Y RADIALES */}
      <g opacity="0.75">
        <line
          x1={toCanvasSvg(0, -245).x}
          y1={toCanvasSvg(0, -245).y}
          x2={toCanvasSvg(0, 245).x}
          y2={toCanvasSvg(0, 245).y}
          stroke="#E5D6C5"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <line
          x1={toCanvasSvg(-180, 0).x}
          y1={toCanvasSvg(-180, 0).y}
          x2={toCanvasSvg(180, 0).x}
          y2={toCanvasSvg(180, 0).y}
          stroke="#E5D6C5"
          strokeWidth="12"
          strokeLinecap="round"
        />
      </g>

      {/* 3. LOTES RESIDENCIALES REALES (384 LOTES) */}
      <g className="residential-lots">
        {lots.map((lot) => {
          const isSelected = selectedLot?.id === lot.id;
          const isMatch =
            (activeAldea === "all" || activeAldea === lot.aldea) &&
            (!searchQuery ||
              lot.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              lot.manzana.toLowerCase().includes(searchQuery.toLowerCase()));

          const pathData =
            lot.polygon
              .map((p, i) => {
                const s = toCanvasSvg(p.x, p.y);
                return `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`;
              })
              .join(" ") + " Z";

          const centerSvg = toCanvasSvg(lot.centroid.x, lot.centroid.y);

          return (
            <g
              key={`lot-${lot.id}`}
              onClick={() => onSelectLot(lot)}
              className="cursor-pointer group pointer-events-auto"
              opacity={isMatch ? 1.0 : 0.15}
            >
              <path
                d={pathData}
                fill={lot.themeColor}
                fillOpacity={isSelected ? 0.95 : 0.85}
                stroke={isSelected ? "#FFFFFF" : "#161310"}
                strokeWidth={isSelected ? 2.8 : 0.8}
                className="transition-all group-hover:brightness-120"
              />

              {showDomes && isMatch && (
                <g filter="url(#gmap-shadow)">
                  <circle
                    cx={centerSvg.x}
                    cy={centerSvg.y}
                    r={lot.areaM2 === 240 ? 4.8 : 3.4}
                    fill="#FFFFFF"
                    stroke="#161310"
                    strokeWidth="0.6"
                  />
                  <circle
                    cx={centerSvg.x}
                    cy={centerSvg.y}
                    r={lot.areaM2 === 240 ? 2.2 : 1.4}
                    fill="#C5A059"
                  />
                </g>
              )}
            </g>
          );
        })}
      </g>

      {/* 4. OASIS CENTRAL ORGÁNICO (~20,000 m²) */}
      <g className="oasis-central">
        <path d={beachPath} fill="url(#gmap-beach)" stroke="#C5A059" strokeWidth="2.0" />
        <path d={lagoonPath} fill="url(#gmap-lagoon)" stroke="#FFFFFF" strokeWidth="2.0" />

        {/* Amenidades Interactivas */}
        {amenities.map((am) => {
          const pt = toCanvasSvg(am.center.x, am.center.y);
          return (
            <g
              key={`am-${am.id}`}
              onClick={() => onSelectAmenity(am)}
              className="cursor-pointer group pointer-events-auto"
              transform={`translate(${pt.x}, ${pt.y})`}
            >
              <circle r="9" fill="#161310" stroke={am.badgeColor} strokeWidth="1.8" />
              <circle r="4" fill={am.badgeColor} />
            </g>
          );
        })}
      </g>

      {/* 5. 192 COCHERAS PLUS EN EL SUR */}
      <g className="arrival-complex pointer-events-none">
        {parkingStalls.map((stall) => {
          const pathData =
            stall.polygon
              .map((p: any, i: number) => {
                const s = toCanvasSvg(p.x, p.y);
                return `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`;
              })
              .join(" ") + " Z";
          return (
            <path
              key={`stall-${stall.id}`}
              d={pathData}
              fill="#37474F"
              stroke="#546E7A"
              strokeWidth="0.5"
            />
          );
        })}
      </g>

      {/* 6. VÉRTICES OFICIALES */}
      {REAL_PERIMETER_LOCAL.map((v, i) => {
        const s = toCanvasSvg(v.x, v.y);
        const labels = ["A (Sur)", "B (Oeste)", "C (Norte)", "D (Este)"];
        return (
          <g key={`v-${i}`} transform={`translate(${s.x}, ${s.y})`} className="pointer-events-none">
            <circle r="6" fill="#161310" stroke="#C5A059" strokeWidth="2" />
            <circle r="2.5" fill="#FFF" />
          </g>
        );
      })}
    </svg>,
    containerDiv
  );
}
