import React, { useState, useRef, useMemo } from "react";
import {
  Compass,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Info,
  Grid,
  X,
  Car,
  Palmtree,
  Waves,
  MessageCircle,
  Shield,
  Layers,
  Sparkles,
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import {
  REAL_MASTERPLAN_MODEL,
  REAL_PERIMETER_LOCAL,
  REAL_UTM_VERTICES,
  REAL_CENTROID_UTM,
  TOTAL_AREA_M2,
  TOTAL_AREA_HA,
  PERIMETER_LENGTH_M,
  ALDEA_THEMES,
  SVG_CONFIG,
  toSvg,
  RealUrbanLot,
  MasterplanAmenity,
} from "../../lib/realUrbanMasterplanModel";

export const RealMasterplanCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ scale: 1.0, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modo de Renderizado: "architectural" (Ilustrado de Lujo) | "satellite" (Google Maps)
  const [renderMode, setRenderMode] = useState<"architectural" | "satellite">("architectural");

  // Estados de Selección
  const [selectedLot, setSelectedLot] = useState<RealUrbanLot | null>(null);
  const [selectedAmenity, setSelectedAmenity] = useState<MasterplanAmenity | null>(null);

  // Filtros y Búsqueda
  const [activeAldeaFilter, setActiveAldeaFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGrid, setShowGrid] = useState(true);
  const [showHud, setShowHud] = useState(true);
  const [showDomes, setShowDomes] = useState(true);
  const [showLegalData, setShowLegalData] = useState(false);

  const { lots, parkingStalls, roads, amenities, stats } = REAL_MASTERPLAN_MODEL;

  // Zoom Handler
  const handleZoom = (factor: number) => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale * factor, 0.5), 4.5),
    }));
  };

  const handleReset = () => {
    setTransform({ scale: 1.0, x: 0, y: 0 });
    setSelectedLot(null);
    setSelectedAmenity(null);
    setActiveAldeaFilter("all");
    setSearchQuery("");
  };

  // Pan / Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    handleZoom(factor);
  };

  // Búsqueda de Lote
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) return;
    const found = lots.find(
      (l) =>
        l.id.toLowerCase() === query.trim().toLowerCase() ||
        l.manzana.toLowerCase() === query.trim().toLowerCase()
    );
    if (found) {
      setSelectedLot(found);
      setSelectedAmenity(null);
      const targetSvg = found.svgCentroid;
      setTransform({
        scale: 2.2,
        x: SVG_CONFIG.centerX - targetSvg.svgX * 2.2,
        y: SVG_CONFIG.centerY - targetSvg.svgY * 2.2,
      });
    }
  };

  // Polígono SVG del Perímetro Real A-B-C-D
  const realPerimeterSvgPath = useMemo(() => {
    return (
      REAL_PERIMETER_LOCAL.map((v, i) => {
        const s = toSvg(v.x, v.y);
        return `${i === 0 ? "M" : "L"} ${s.svgX} ${s.svgY}`;
      }).join(" ") + " Z"
    );
  }, []);

  // Polígono SVG de la Laguna Cristalina Orgánica
  const organicLagoonSvgPath = useMemo(() => {
    // Curva suave natural alrededor del centro (0, 10)
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
        const s = toSvg(p.x, p.y);
        return `${i === 0 ? "M" : "L"} ${s.svgX} ${s.svgY}`;
      }).join(" ") + " Z"
    );
  }, []);

  // Playa de Arena Blanca alrededor de la Laguna
  const sandBeachSvgPath = useMemo(() => {
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
        const s = toSvg(p.x, p.y);
        return `${i === 0 ? "M" : "L"} ${s.svgX} ${s.svgY}`;
      }).join(" ") + " Z"
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-[#161310] select-none font-sans border border-[#2D2620] ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none"
          : "h-[740px] sm:h-[820px] rounded-3xl shadow-2xl"
      }`}
    >
      {/* ── TOP RIGHT: MODO DE VISTA (ILUSTRADO / SATÉLITE) + CONTROLES ── */}
      <div className="pointer-events-auto absolute top-4 right-4 z-30 flex flex-wrap items-center gap-2">
        {/* Selector de Modo Arquitectónico vs Satelital */}
        <div className="flex rounded-2xl bg-[#1F1B17]/90 p-1 border border-white/10 backdrop-blur-xl shadow-lg">
          <button
            type="button"
            onClick={() => setRenderMode("architectural")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              renderMode === "architectural"
                ? "bg-[#B85A3D] text-white shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Plano Ilustrado HD</span>
          </button>
          <button
            type="button"
            onClick={() => setRenderMode("satellite")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              renderMode === "satellite"
                ? "bg-[#00838F] text-white shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Satélite Real</span>
          </button>
        </div>

        {/* Rosa de los Vientos / North Indicator */}
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#1F1B17]/90 px-3 py-2 shadow-lg backdrop-blur-xl">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#161310] text-[#C5A059] shadow">
            <Compass className="h-5 w-5 animate-pulse" />
            <span className="absolute -top-1 font-bold text-[8px] text-[#B85A3D]">N</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-white">Norte</span>
            <span className="text-[8px] text-white/60">UTM Zona 18S</span>
          </div>
        </div>

        {/* Toggle Domos 3D */}
        <button
          type="button"
          onClick={() => setShowDomes(!showDomes)}
          className={`flex items-center gap-1 rounded-2xl border px-3 py-2 text-xs font-bold shadow-lg backdrop-blur-xl transition cursor-pointer ${
            showDomes
              ? "bg-[#4E7D5B] text-white border-[#4E7D5B]"
              : "bg-[#1F1B17]/90 text-white/70 border-white/10 hover:text-white"
          }`}
          title="Alternar Proyección 3D de Domos Geodésicos"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="hidden sm:inline">Domos</span>
        </button>

        {/* Toggle HUD Técnico */}
        <button
          type="button"
          onClick={() => setShowHud(!showHud)}
          className={`flex items-center gap-1 rounded-2xl border px-3 py-2 text-xs font-bold shadow-lg backdrop-blur-xl transition cursor-pointer ${
            showHud
              ? "bg-[#C5A059] text-[#161310] border-[#C5A059]"
              : "bg-[#1F1B17]/90 text-white/70 border-white/10 hover:text-white"
          }`}
          title="Ficha Técnica y Balance de Masas (55% / 45%)"
        >
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">HUD</span>
        </button>

        {/* Pantalla Completa */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="rounded-2xl border border-white/10 bg-[#1F1B17]/90 p-2 text-white/80 shadow-lg backdrop-blur-xl hover:text-white transition cursor-pointer"
          title="Pantalla Completa"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* ── TOP LEFT: BUSCADOR DE LOTE & SELECTOR DE 4 ALDEAS ── */}
      <div className="pointer-events-none absolute top-4 left-4 z-30 flex flex-col gap-2 max-w-[88vw] sm:max-w-md">
        {/* Barra de Búsqueda de Lotes */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-[#1F1B17]/95 px-3.5 py-2 shadow-xl backdrop-blur-xl">
          <Search className="h-4 w-4 text-[#C5A059] shrink-0" />
          <input
            type="text"
            placeholder="Buscar lote (ej. A1-05, A2-12, A4-50)..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-white outline-none placeholder-white/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              className="text-white/60 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filtros por Aldeas (4 Superbloques) */}
        <div className="pointer-events-auto flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-[#1F1B17]/90 p-1 shadow-xl backdrop-blur-xl text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveAldeaFilter("all")}
            className={`rounded-xl px-2.5 py-1 transition cursor-pointer ${
              activeAldeaFilter === "all"
                ? "bg-white text-[#161310]"
                : "text-white/70 hover:text-white"
            }`}
          >
            Todas (384)
          </button>
          <button
            type="button"
            onClick={() => setActiveAldeaFilter(1)}
            className={`rounded-xl px-2.5 py-1 transition cursor-pointer flex items-center gap-1.5 ${
              activeAldeaFilter === 1
                ? "bg-[#4E7D5B] text-white shadow"
                : "text-[#4E7D5B] hover:bg-[#4E7D5B]/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#4E7D5B]" />
            Aldea 1 (96)
          </button>
          <button
            type="button"
            onClick={() => setActiveAldeaFilter(2)}
            className={`rounded-xl px-2.5 py-1 transition cursor-pointer flex items-center gap-1.5 ${
              activeAldeaFilter === 2
                ? "bg-[#C89D34] text-white shadow"
                : "text-[#C89D34] hover:bg-[#C89D34]/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#C89D34]" />
            Aldea 2 (96)
          </button>
          <button
            type="button"
            onClick={() => setActiveAldeaFilter(3)}
            className={`rounded-xl px-2.5 py-1 transition cursor-pointer flex items-center gap-1.5 ${
              activeAldeaFilter === 3
                ? "bg-[#D35400] text-white shadow"
                : "text-[#D35400] hover:bg-[#D35400]/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#D35400]" />
            Aldea 3 (96)
          </button>
          <button
            type="button"
            onClick={() => setActiveAldeaFilter(4)}
            className={`rounded-xl px-2.5 py-1 transition cursor-pointer flex items-center gap-1.5 ${
              activeAldeaFilter === 4
                ? "bg-[#8D7B68] text-white shadow"
                : "text-[#8D7B68] hover:bg-[#8D7B68]/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#8D7B68]" />
            Aldea 4 (96)
          </button>
        </div>
      </div>

      {/* ── BOTONES DE ZOOM FLOTANTES (BOTTOM RIGHT) ── */}
      <div className="pointer-events-auto absolute bottom-4 right-4 z-30 flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-[#1F1B17]/95 p-1 shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={() => handleZoom(1.25)}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white hover:bg-white/10 transition cursor-pointer"
          title="Acercar (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(0.8)}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white hover:bg-white/10 transition cursor-pointer"
          title="Alejar (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white hover:bg-white/10 transition cursor-pointer border-t border-white/10"
          title="Restablecer Vista Centrada"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* ── MODAL 1: CARD COMERCIAL DE LOTE SELECCIONADO (CON RESERVA WHATSAPP) ── */}
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
              onClick={() => setSelectedLot(null)}
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
                <CheckCircle2 className="h-3.5 w-3.5" /> Directo a Alameda y Oasis
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

      {/* ── MODAL 2: CARD DE AMENIDAD DEL OASIS O ACCESO SUR ── */}
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

          <p className="mt-3 text-xs leading-relaxed text-white/80">
            {selectedAmenity.blurb}
          </p>

          <div className="mt-3 space-y-1.5 border-t border-white/10 pt-2.5">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-[#C5A059]">
              Detalles y Equipamiento:
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

      {/* ── TECHNICAL HUD CARD (BOTTOM LEFT) ── */}
      {showHud && (
        <div className="pointer-events-auto absolute bottom-4 left-4 z-30 max-w-[92vw] sm:max-w-md rounded-3xl border border-white/20 bg-[#1F1B17]/95 p-4 shadow-2xl backdrop-blur-2xl text-xs text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-[#C5A059] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#C5A059]" />
              Masterplan Oficial · Terreno Real 11.26 ha
            </span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white">
              Polígono A-B-C-D
            </span>
          </div>

          {/* Balance de Masas (55% / 45%) */}
          <div className="grid grid-cols-3 gap-1.5 mb-2.5 text-center">
            <div className="rounded-xl bg-white/5 p-1.5 border border-white/10">
              <span className="block text-[8px] text-white/60 uppercase font-bold">Lotes Totales</span>
              <span className="font-display text-sm font-bold text-white">384 Lotes</span>
            </div>
            <div className="rounded-xl bg-white/5 p-1.5 border border-white/10">
              <span className="block text-[8px] text-white/60 uppercase font-bold">Área Vendible (55%)</span>
              <span className="font-display text-xs font-bold text-emerald-400">
                {stats.totalVendibleM2.toLocaleString()} m²
              </span>
            </div>
            <div className="rounded-xl bg-white/5 p-1.5 border border-white/10">
              <span className="block text-[8px] text-white/60 uppercase font-bold">Oasis & Vías (45%)</span>
              <span className="font-display text-xs font-bold text-[#00E5FF]">
                {(stats.totalAreaM2 - stats.totalVendibleM2).toLocaleString()} m²
              </span>
            </div>
          </div>

          {/* Desglose de 4 Aldeas */}
          <div className="grid grid-cols-4 gap-1 mb-2 text-center text-[10px]">
            <div className="rounded-lg bg-[#4E7D5B]/30 p-1 border border-[#4E7D5B]/50">
              <span className="block text-[8px] text-[#A5D6A7] font-bold">Aldea 1 (O)</span>
              <span className="font-bold text-white">96</span>
            </div>
            <div className="rounded-lg bg-[#C89D34]/30 p-1 border border-[#C89D34]/50">
              <span className="block text-[8px] text-[#FFE082] font-bold">Aldea 2 (N)</span>
              <span className="font-bold text-white">96</span>
            </div>
            <div className="rounded-lg bg-[#D35400]/30 p-1 border border-[#D35400]/50">
              <span className="block text-[8px] text-[#FFAB91] font-bold">Aldea 3 (E)</span>
              <span className="font-bold text-white">96</span>
            </div>
            <div className="rounded-lg bg-[#8D7B68]/30 p-1 border border-[#8D7B68]/50">
              <span className="block text-[8px] text-[#D7CCC8] font-bold">Aldea 4 (S)</span>
              <span className="font-bold text-white">96</span>
            </div>
          </div>

          {/* Cocheras Plus y Acceso */}
          <div className="flex items-center justify-between text-[8px] text-white/70 border-t border-white/10 pt-1.5">
            <span className="flex items-center gap-1 font-medium">
              <Car className="h-3 w-3 text-[#C5A059]" /> 192 Cocheras Sur + Apoyo Interno en Esquinas
            </span>
            <span className="text-emerald-400 font-bold">
              ✓ 100% Salida Peatonal a Calles
            </span>
          </div>
        </div>
      )}

      {/* ── SVG CANVAS INTERACTIVO (TERRENO REAL + MASTERPLAN ILUSTRADO HD) ── */}
      <div
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="relative h-full w-full origin-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          <svg
            viewBox={`0 0 ${SVG_CONFIG.width} ${SVG_CONFIG.height}`}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Degradado de Arena Desértica Realista */}
              <radialGradient id="desert-sand-grad" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#F5EFEB" stopOpacity="1" />
                <stop offset="60%" stopColor="#EADBCC" stopOpacity="1" />
                <stop offset="100%" stopColor="#D4C2AB" stopOpacity="1" />
              </radialGradient>

              {/* Degradado de Agua Cristalina de la Laguna */}
              <radialGradient id="lagoon-water-grad" cx="45%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#84FFFF" stopOpacity="0.98" />
                <stop offset="45%" stopColor="#00E5FF" stopOpacity="0.95" />
                <stop offset="85%" stopColor="#00838F" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#004D40" stopOpacity="1" />
              </radialGradient>

              {/* Degradado de Playa de Arena Blanca */}
              <linearGradient id="sand-beach-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#F0E5D0" stopOpacity="0.98" />
              </linearGradient>

              {/* Sombra Suave para Domos y Edificaciones */}
              <filter id="dome-shadow-3d" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1.5" dy="3" stdDeviation="2.5" floodColor="#161310" floodOpacity="0.35" />
              </filter>

              {/* Sombra de Manzanas */}
              <filter id="block-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#3E2723" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* 1. Fondo Global del Desierto */}
            {renderMode === "architectural" ? (
              <rect width={SVG_CONFIG.width} height={SVG_CONFIG.height} fill="#EBDDCB" />
            ) : (
              <rect width={SVG_CONFIG.width} height={SVG_CONFIG.height} fill="#8D7A68" />
            )}

            {/* 2. Malla Métrica de 50 metros */}
            {showGrid && (
              <g opacity="0.18">
                {[-250, -200, -150, -100, -50, 0, 50, 100, 150, 200, 250].map((m) => {
                  const p1 = toSvg(m, -300);
                  const p2 = toSvg(m, 300);
                  const h1 = toSvg(-300, m);
                  const h2 = toSvg(300, m);
                  return (
                    <React.Fragment key={`grid-${m}`}>
                      <line
                        x1={p1.svgX}
                        y1={p1.svgY}
                        x2={p2.svgX}
                        y2={p2.svgY}
                        stroke={m === 0 ? "#B85A3D" : "#8D7B68"}
                        strokeWidth={m === 0 ? "1.5" : "0.6"}
                        strokeDasharray={m === 0 ? "none" : "4 4"}
                      />
                      <line
                        x1={h1.svgX}
                        y1={h1.svgY}
                        x2={h2.svgX}
                        y2={h2.svgY}
                        stroke={m === 0 ? "#B85A3D" : "#8D7B68"}
                        strokeWidth={m === 0 ? "1.5" : "0.6"}
                        strokeDasharray={m === 0 ? "none" : "4 4"}
                      />
                    </React.Fragment>
                  );
                })}
              </g>
            )}

            {/* 3. POLÍGONO REAL A-B-C-D (11.26 ha) */}
            <g filter="url(#block-shadow)">
              <path
                d={realPerimeterSvgPath}
                fill={renderMode === "architectural" ? "url(#desert-sand-grad)" : "#A6927E"}
                stroke="#161310"
                strokeWidth="4.0"
                strokeLinejoin="round"
              />
              {/* Pirca Perimetral de Piedra Caliche (Retiro 8m) */}
              <path
                d={realPerimeterSvgPath}
                fill="none"
                stroke="#C5A059"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                opacity="0.8"
              />
            </g>

            {/* 4. RED VIAL Y ALAMEDAS PEATONALES DEL RESORT */}
            <g className="road-network" opacity="0.85">
              {/* Boulevard Central Norte-Sur (10m) */}
              <line
                x1={toSvg(0, -245).svgX}
                y1={toSvg(0, -245).svgY}
                x2={toSvg(0, -45).svgX}
                y2={toSvg(0, -45).svgY}
                stroke="#D8C8B5"
                strokeWidth="22"
                strokeLinecap="round"
              />
              <line
                x1={toSvg(0, 45).svgX}
                y1={toSvg(0, 45).svgY}
                x2={toSvg(0, 245).svgX}
                y2={toSvg(0, 245).svgY}
                stroke="#D8C8B5"
                strokeWidth="22"
                strokeLinecap="round"
              />

              {/* Alameda Transversal Este-Oeste (8m) */}
              <line
                x1={toSvg(-180, 0).svgX}
                y1={toSvg(-180, 0).svgY}
                x2={toSvg(-45, 0).svgX}
                y2={toSvg(-45, 0).svgY}
                stroke="#D8C8B5"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <line
                x1={toSvg(45, 0).svgX}
                y1={toSvg(45, 0).svgY}
                x2={toSvg(180, 0).svgX}
                y2={toSvg(180, 0).svgY}
                stroke="#D8C8B5"
                strokeWidth="18"
                strokeLinecap="round"
              />

              {/* Paseos Diagonales Radiales a las 4 Aldeas (6m) */}
              <line
                x1={toSvg(-35, 35).svgX}
                y1={toSvg(-35, 35).svgY}
                x2={toSvg(-140, 140).svgX}
                y2={toSvg(-140, 140).svgY}
                stroke="#DFD2C2"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <line
                x1={toSvg(35, 35).svgX}
                y1={toSvg(35, 35).svgY}
                x2={toSvg(140, 140).svgX}
                y2={toSvg(140, 140).svgY}
                stroke="#DFD2C2"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <line
                x1={toSvg(-35, -35).svgX}
                y1={toSvg(-35, -35).svgY}
                x2={toSvg(-140, -140).svgX}
                y2={toSvg(-140, -140).svgY}
                stroke="#DFD2C2"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <line
                x1={toSvg(35, -35).svgX}
                y1={toSvg(35, -35).svgY}
                x2={toSvg(140, -140).svgX}
                y2={toSvg(140, -140).svgY}
                stroke="#DFD2C2"
                strokeWidth="14"
                strokeLinecap="round"
              />
            </g>

            {/* 5. CAPA DE LOTES RESIDENCIALES (384 LOTES REALES) */}
            <g className="residential-lots-layer">
              {lots.map((lot) => {
                const isSelected = selectedLot?.id === lot.id;
                const isMatchAldea =
                  activeAldeaFilter === "all" || activeAldeaFilter === lot.aldea;
                const isMatchSearch =
                  !searchQuery ||
                  lot.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  lot.manzana.toLowerCase().includes(searchQuery.toLowerCase());
                const isVisible = isMatchAldea && isMatchSearch;

                const pathData =
                  lot.svgPolygon
                    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.svgX} ${pt.svgY}`)
                    .join(" ") + " Z";

                return (
                  <g
                    key={`lot-${lot.id}`}
                    onClick={() => {
                      setSelectedLot(lot);
                      setSelectedAmenity(null);
                    }}
                    className="cursor-pointer group"
                    opacity={isVisible ? 1.0 : 0.18}
                  >
                    {/* Parcela del Lote */}
                    <path
                      d={pathData}
                      fill={lot.themeColor}
                      fillOpacity={isSelected ? 0.95 : 0.85}
                      stroke={isSelected ? "#FFFFFF" : "#161310"}
                      strokeWidth={isSelected ? "2.6" : "0.75"}
                      className="transition-all duration-150 group-hover:brightness-115"
                    />

                    {/* Proyección 3D del Domo Geodésico */}
                    {showDomes && (
                      <g filter="url(#dome-shadow-3d)">
                        {/* Cúpula del Domo */}
                        <circle
                          cx={lot.svgCentroid.svgX}
                          cy={lot.svgCentroid.svgY}
                          r={lot.areaM2 === 240 ? 5.5 : 4.0}
                          fill="#FFFFFF"
                          fillOpacity="0.95"
                          stroke="#161310"
                          strokeWidth="0.8"
                        />
                        {/* Triangulación sutil de la Cúpula */}
                        <circle
                          cx={lot.svgCentroid.svgX}
                          cy={lot.svgCentroid.svgY}
                          r={lot.areaM2 === 240 ? 2.8 : 1.8}
                          fill="#E8E1D5"
                          stroke="#C5A059"
                          strokeWidth="0.5"
                        />
                        {/* Badge de Lote Premium Oasis (Ø8m) */}
                        {lot.areaM2 === 240 && (
                          <circle
                            cx={lot.svgCentroid.svgX}
                            cy={lot.svgCentroid.svgY}
                            r="1.2"
                            fill="#E07A5F"
                          />
                        )}
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* 6. OASIS CENTRAL ORGÁNICO (~20,000 m²) */}
            <g className="oasis-central-layer">
              {/* Playa de Arena Blanca */}
              <path
                d={sandBeachSvgPath}
                fill="url(#sand-beach-grad)"
                stroke="#C5A059"
                strokeWidth="2.0"
                strokeLinejoin="round"
                filter="url(#block-shadow)"
              />

              {/* Espejo de Agua de la Laguna Cristalina */}
              <path
                d={organicLagoonSvgPath}
                fill="url(#lagoon-water-grad)"
                stroke="#FFFFFF"
                strokeWidth="2.0"
                strokeLinejoin="round"
              />

              {/* Rótulo Central del Oasis */}
              <text
                x={toSvg(0, 12).svgX}
                y={toSvg(0, 12).svgY}
                fill="#FFFFFF"
                fontSize="10"
                fontWeight="900"
                textAnchor="middle"
                letterSpacing="0.8"
                pointerEvents="none"
              >
                OASIS CENTRAL · 20,000 m²
              </text>

              {/* Nodos de Amenidades del Oasis */}
              {amenities.map((am) => (
                <g
                  key={`am-${am.id}`}
                  onClick={() => {
                    setSelectedAmenity(am);
                    setSelectedLot(null);
                  }}
                  className="cursor-pointer group"
                >
                  {am.svgPolygon ? (
                    <polygon
                      points={am.svgPolygon.map((p) => `${p.svgX},${p.svgY}`).join(" ")}
                      fill="#161310"
                      stroke={am.badgeColor}
                      strokeWidth="1.8"
                      className="group-hover:fill-[#B85A3D] transition-colors"
                    />
                  ) : (
                    <g transform={`translate(${am.svgCenter.svgX}, ${am.svgCenter.svgY})`}>
                      <rect
                        x="-38"
                        y="-9"
                        width="76"
                        height="18"
                        rx="9"
                        fill="#161310"
                        stroke={am.badgeColor}
                        strokeWidth="1.5"
                        className="group-hover:fill-[#B85A3D] transition-colors"
                      />
                      <text
                        x="0"
                        y="3.5"
                        fill="#FFFFFF"
                        fontSize="7.5"
                        fontWeight="black"
                        textAnchor="middle"
                        letterSpacing="0.3"
                      >
                        {am.name.split(" ")[0]} {am.name.split(" ")[1] || ""}
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </g>

            {/* 7. COMPLEJO SUR DE LLEGADA & 192 COCHERAS PLUS */}
            <g className="arrival-complex">
              {/* Rotonda de Entrada en Vértice A */}
              {(() => {
                const rot = toSvg(-6.921, -250);
                return (
                  <g transform={`translate(${rot.svgX}, ${rot.svgY})`}>
                    <circle r="22" fill="#D8C8B5" stroke="#161310" strokeWidth="2.5" />
                    <circle r="8" fill="#4E7D5B" />
                  </g>
                );
              })()}

              {/* 192 Plazas Reales de Cochera Plus */}
              {parkingStalls.map((stall) => {
                const pathData =
                  stall.svgPolygon
                    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.svgX} ${pt.svgY}`)
                    .join(" ") + " Z";
                return (
                  <path
                    key={`stall-${stall.id}`}
                    d={pathData}
                    fill="#37474F"
                    stroke="#546E7A"
                    strokeWidth="0.5"
                    className="hover:fill-[#B85A3D] transition-colors"
                  />
                );
              })}

              {/* Rótulo de Cocheras Plus */}
              <text
                x={toSvg(-25, -243).svgX}
                y={toSvg(-25, -243).svgY}
                fill="#C5A059"
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
              >
                192 COCHERAS PLUS (COMPLEJO SUR)
              </text>
            </g>

            {/* 8. VÉRTICES OFICIALES Y COTAS DE LINDEROS */}
            {REAL_PERIMETER_LOCAL.map((v, i) => {
              const s = toSvg(v.x, v.y);
              const labels = ["A (Sur)", "B (Oeste)", "C (Norte)", "D (Este)"];
              return (
                <g key={`vertex-${i}`} transform={`translate(${s.svgX}, ${s.svgY})`}>
                  <circle r="6" fill="#161310" stroke="#C5A059" strokeWidth="2.0" />
                  <circle r="2.5" fill="#FFFFFF" />
                  <text
                    x="0"
                    y={i === 0 ? 16 : -10}
                    fill="#161310"
                    fontSize="9"
                    fontWeight="black"
                    textAnchor="middle"
                    className="bg-white/80 px-1 rounded"
                  >
                    {labels[i]}
                  </text>
                </g>
              );
            })}

            {/* 9. ESCALA GRÁFICA EN METROS */}
            <g transform={`translate(70, ${SVG_CONFIG.height - 45})`}>
              <rect x="-10" y="-18" width="160" height="30" rx="8" fill="#161310" opacity="0.9" />
              <line x1="0" y1="0" x2={50 * SVG_CONFIG.scale} y2="0" stroke="#C5A059" strokeWidth="3" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke="#C5A059" strokeWidth="2" />
              <line x1={25 * SVG_CONFIG.scale} y1="-3" x2={25 * SVG_CONFIG.scale} y2="3" stroke="#C5A059" strokeWidth="1.5" />
              <line x1={50 * SVG_CONFIG.scale} y1="-4" x2={50 * SVG_CONFIG.scale} y2="4" stroke="#C5A059" strokeWidth="2" />
              <text x="0" y="-7" fontSize="8" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">0m</text>
              <text x={25 * SVG_CONFIG.scale} y="-7" fontSize="8" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">25m</text>
              <text x={50 * SVG_CONFIG.scale} y="-7" fontSize="8" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">50m</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
