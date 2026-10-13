import React, { useState } from "react";
import {
  Maximize2,
  Minimize2,
  Sun,
  Sunset,
  Moon,
  Layers,
  Eye,
  Sparkles,
  Info,
  Flame,
  Waves,
  Trees,
  Footprints,
  Ruler,
  Compass,
  Bath,
  Check,
  ChevronRight,
  Share2,
  X,
  DollarSign,
  Droplet,
  Grid,
} from "lucide-react";
import { useConfiguratorStore } from "../../store/useConfiguratorStore";
import { DomeScene } from "./DomeScene";
import { DOME_SPECS_MAP, STYLE_PRESETS, BathLocation, WaterFeature, GroundTreatment } from "../../types/configurator";

export const DomeConfigurator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"lookbook" | "refugio" | "agua-bano" | "camaras">("lookbook");
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Zustand state
  const lotArea = useConfiguratorStore((s) => s.lotArea);
  const diameter = useConfiguratorStore((s) => s.diameter);
  const timeOfDay = useConfiguratorStore((s) => s.timeOfDay);
  const coverProgress = useConfiguratorStore((s) => s.coverProgress);
  const cameraPreset = useConfiguratorStore((s) => s.cameraPreset);
  const activePreset = useConfiguratorStore((s) => s.activePreset);
  const bathLocation = useConfiguratorStore((s) => s.bathLocation);
  const waterFeature = useConfiguratorStore((s) => s.waterFeature);
  const groundTreatment = useConfiguratorStore((s) => s.groundTreatment);
  const isFullscreen = useConfiguratorStore((s) => s.isFullscreen);
  const toastMessage = useConfiguratorStore((s) => s.toastMessage);
  const amenities = useConfiguratorStore((s) => s.amenities);

  // Zustand actions
  const setLotArea = useConfiguratorStore((s) => s.setLotArea);
  const setDiameter = useConfiguratorStore((s) => s.setDiameter);
  const setTimeOfDay = useConfiguratorStore((s) => s.setTimeOfDay);
  const setCoverProgress = useConfiguratorStore((s) => s.setCoverProgress);
  const setCameraPreset = useConfiguratorStore((s) => s.setCameraPreset);
  const setBathLocation = useConfiguratorStore((s) => s.setBathLocation);
  const setWaterFeature = useConfiguratorStore((s) => s.setWaterFeature);
  const setGroundTreatment = useConfiguratorStore((s) => s.setGroundTreatment);
  const applyPreset = useConfiguratorStore((s) => s.applyPreset);
  const setIsFullscreen = useConfiguratorStore((s) => s.setIsFullscreen);
  const toggleAmenity = useConfiguratorStore((s) => s.toggleAmenity);
  const getMetrics = useConfiguratorStore((s) => s.getMetrics);

  const metrics = getMetrics();
  const specs = DOME_SPECS_MAP[diameter];

  const statusColor =
    metrics.status === "NO RECOMENDADO"
      ? "text-red-600 bg-red-50 border-red-200"
      : metrics.status === "JUSTO"
      ? "text-amber-600 bg-amber-50 border-amber-200"
      : "text-[#4E6646] bg-[#4E6646]/10 border-[#4E6646]/30";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[2.5rem] border border-[#E8E1D5] bg-[#FAF7F2] shadow-2xl transition-all font-sans ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none"
          : "h-[740px] sm:h-[800px]"
      }`}
    >
      {/* 3D WebGL Three.js Scene */}
      <DomeScene />

      {/* Toast Notificación de Reglas Arquitectónicas */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-2xl border border-[#C5A059]/40 bg-[#161311] px-5 py-3 text-xs font-bold text-white shadow-2xl animate-fade-in backdrop-blur-md">
          <Info className="h-4 w-4 text-[#C5A059] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP LEFT: SELECTORES PARAMÉTRICOS & HUD MÉTRICO */}
      <div className="pointer-events-none absolute top-4 left-4 sm:top-5 sm:left-5 z-20 flex flex-col gap-2 max-w-[85vw] sm:max-w-none">
        
        {/* Badge Principal con Precio Dinámico */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-full border border-white/60 bg-white/95 px-4 py-2 text-xs font-bold text-[#161311] shadow-md backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-[#C5A059]" />
          <span>Domo Ø{diameter}m · {specs.footprintM2} m² ({specs.preset})</span>
          <span className="text-[10px] text-[#786F66] font-normal">| Lote {lotArea} m²</span>
          <span className="rounded-full bg-[#161311] px-2.5 py-0.5 text-[10px] font-bold text-[#C5A059]">
            ${metrics.estimatedPriceUSD.toLocaleString()} USD
          </span>
        </div>

        {/* HUD Métrico: Patio Libre & Status */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <div className="rounded-2xl border border-white/60 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-[#161311] shadow-sm backdrop-blur-md flex items-center gap-1.5">
            <span className="text-[#786F66]">Patio Libre:</span>
            <span className="text-[#A84F36] font-display text-xs sm:text-sm">{metrics.freeYardM2} m²</span>
            <span className="text-[#786F66] font-normal text-[10px]">({(100 - metrics.occupancyPercent).toFixed(1)}%)</span>
          </div>

          <div
            className={`rounded-2xl border px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-md ${statusColor}`}
          >
            {metrics.status}
          </div>
        </div>

      </div>

      {/* TOP RIGHT: DÍA/GOLDEN/NOCHE & PANTALLA COMPLETA */}
      <div className="pointer-events-auto absolute top-4 right-4 sm:top-5 sm:right-5 z-20 flex items-center gap-2">
        
        {/* Toggle Vara 1.00m */}
        <button
          onClick={() => toggleAmenity("scaleRod")}
          className={`hidden md:flex items-center gap-1.5 rounded-full border border-white/60 px-3 py-1.5 text-xs font-bold shadow-md backdrop-blur-xl transition cursor-pointer ${
            amenities.scaleRod
              ? "bg-[#FF6B00] text-white border-[#FF6B00]"
              : "bg-white/90 text-[#786F66] hover:text-[#161311]"
          }`}
          title="Vara de escala física de 1.00 metro exacto"
        >
          <Ruler className="h-3.5 w-3.5" />
          <span>Vara 1.00 m</span>
        </button>

        {/* Selector de Iluminación Cinemática */}
        <div className="flex rounded-full border border-white/60 bg-white/90 p-1 shadow-md backdrop-blur-xl">
          <button
            onClick={() => setTimeOfDay("day")}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              timeOfDay === "day"
                ? "bg-[#C85B3E] text-white shadow"
                : "text-[#786F66] hover:text-[#161311]"
            }`}
            title="Día Paracas"
          >
            <Sun className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Día</span>
          </button>
          <button
            onClick={() => setTimeOfDay("golden")}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              timeOfDay === "golden"
                ? "bg-[#D97724] text-white shadow"
                : "text-[#786F66] hover:text-[#161311]"
            }`}
            title="Golden Hour 3200K"
          >
            <Sunset className="h-3.5 w-3.5 text-[#FFE082]" /> <span className="hidden sm:inline">Golden</span>
          </button>
          <button
            onClick={() => setTimeOfDay("night")}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              timeOfDay === "night"
                ? "bg-[#161310] text-white shadow"
                : "text-[#786F66] hover:text-[#161311]"
            }`}
            title="Noche 2700K"
          >
            <Moon className="h-3.5 w-3.5 text-[#C5A059]" /> <span className="hidden sm:inline">Noche</span>
          </button>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="rounded-full border border-white/60 bg-white/90 p-2 text-[#161311] shadow-md backdrop-blur-xl hover:bg-white transition cursor-pointer"
          title="Pantalla Completa"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* BOTTOM CONTROL CENTER (GLASSMORPHIC LUXURY HUD) */}
      <div className="pointer-events-auto absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-5 z-20 flex flex-col gap-2 rounded-3xl border border-white/75 bg-white/95 p-3 sm:p-4 shadow-2xl backdrop-blur-2xl max-w-5xl mx-auto">
        
        {/* Pestañas de Navegación del Configurador */}
        <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-2 gap-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("lookbook")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                activeTab === "lookbook"
                  ? "bg-[#161311] text-white shadow-sm"
                  : "bg-transparent text-[#786F66] hover:text-[#161311]"
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Lookbook</span>
            </button>

            <button
              onClick={() => setActiveTab("refugio")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                activeTab === "refugio"
                  ? "bg-[#161311] text-white shadow-sm"
                  : "bg-transparent text-[#786F66] hover:text-[#161311]"
              }`}
            >
              <Grid className="h-3.5 w-3.5 text-[#A84F36]" />
              <span>Lote & Domo</span>
            </button>

            <button
              onClick={() => setActiveTab("agua-bano")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                activeTab === "agua-bano"
                  ? "bg-[#161311] text-white shadow-sm"
                  : "bg-transparent text-[#786F66] hover:text-[#161311]"
              }`}
            >
              <Droplet className="h-3.5 w-3.5 text-[#3D8B84]" />
              <span>Baño & Relax</span>
            </button>

            <button
              onClick={() => setActiveTab("camaras")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                activeTab === "camaras"
                  ? "bg-[#161311] text-white shadow-sm"
                  : "bg-transparent text-[#786F66] hover:text-[#161311]"
              }`}
            >
              <Eye className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Vistas 3D</span>
            </button>
          </div>

          <button
            onClick={() => setShowQuoteModal(true)}
            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#A84F36] to-[#C5A059] px-3.5 py-1 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer shrink-0"
          >
            <span>Cotizar</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* CONTENIDO DE LA PESTAÑA ACTIVA */}
        <div className="pt-1">
          
          {/* TAB 1: LOOKBOOK */}
          {activeTab === "lookbook" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STYLE_PRESETS.map((preset) => {
                const isLocked = preset.requiredLot && preset.requiredLot !== lotArea;
                const isActive = activePreset === preset.id;

                return (
                  <button
                    key={preset.id}
                    disabled={Boolean(isLocked)}
                    onClick={() => applyPreset(preset.id)}
                    className={`relative flex flex-col justify-between p-2.5 rounded-2xl border transition cursor-pointer text-left ${
                      isLocked
                        ? "opacity-35 cursor-not-allowed bg-[#FAF7F2] border-[#E8E1D5] text-[#786F66]"
                        : isActive
                        ? "bg-[#161311] text-white border-[#161311] shadow-lg ring-2 ring-[#C5A059]/60"
                        : "bg-[#FAF7F2] text-[#161311] border-[#E8E1D5] hover:border-[#C5A059] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold leading-tight">{preset.title}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase ${
                          isActive
                            ? "bg-[#C5A059] text-[#161311]"
                            : "bg-[#E8E1D5]/70 text-[#786F66]"
                        }`}
                      >
                        {preset.tag}
                      </span>
                    </div>
                    <span className={`text-[10px] mt-1 ${isActive ? "text-white/70" : "text-[#786F66]"}`}>
                      {preset.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: REFUGIO & SUELO */}
          {activeTab === "refugio" && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Lote */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#786F66]">Lote:</span>
                {([120, 240] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLotArea(l)}
                    className={`rounded-xl px-3 py-1 font-bold border transition cursor-pointer ${
                      lotArea === l
                        ? "bg-[#A84F36] text-white border-[#A84F36]"
                        : "bg-[#FAF7F2] text-[#786F66] border-[#E8E1D5]"
                    }`}
                  >
                    {l} m²
                  </button>
                ))}
              </div>

              {/* Diámetro */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#786F66]">Domo:</span>
                {([6, 7, 8] as const).map((d) => {
                  const disabled = lotArea === 120 && d === 8;
                  return (
                    <button
                      key={d}
                      disabled={disabled}
                      onClick={() => setDiameter(d)}
                      className={`rounded-xl px-3 py-1 font-bold border transition ${
                        disabled
                          ? "opacity-30 cursor-not-allowed border-[#E8E1D5] text-[#786F66]"
                          : diameter === d
                          ? "bg-[#161311] text-white border-[#161311]"
                          : "bg-[#FAF7F2] text-[#786F66] border-[#E8E1D5] cursor-pointer"
                      }`}
                    >
                      Ø{d}m
                    </button>
                  );
                })}
              </div>

              {/* Tratamiento Suelo */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#786F66]">Suelo:</span>
                {(
                  [
                    { id: "xeriscape", label: "Arena" },
                    { id: "lawn", label: "Pasto" },
                    { id: "mixed", label: "Mixto" },
                  ] as const
                ).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGroundTreatment(g.id)}
                    className={`rounded-xl px-2.5 py-1 font-bold border transition cursor-pointer ${
                      groundTreatment === g.id
                        ? "bg-[#4E6646] text-white border-[#4E6646]"
                        : "bg-[#FAF7F2] text-[#786F66] border-[#E8E1D5]"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: BAÑO & AGUA */}
          {activeTab === "agua-bano" && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Baño */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#786F66] flex items-center gap-1">
                  <Bath className="h-3 w-3" /> Baño:
                </span>
                {(
                  [
                    { id: "inside", label: "Interior" },
                    { id: "outside", label: "Exterior (+Suite)" },
                  ] as const
                ).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBathLocation(b.id)}
                    className={`rounded-xl px-2.5 py-1 font-bold border transition cursor-pointer ${
                      bathLocation === b.id
                        ? "bg-[#161311] text-white border-[#161311]"
                        : "bg-[#FAF7F2] text-[#786F66] border-[#E8E1D5]"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Agua / Relax */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#786F66] flex items-center gap-1">
                  <Waves className="h-3 w-3" /> Agua:
                </span>
                {(
                  [
                    { id: "none", label: "Ninguno" },
                    { id: "plunge", label: "Plunge 2.5m" },
                    { id: "jacuzzi", label: "Jacuzzi Spa" },
                  ] as const
                ).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWaterFeature(w.id)}
                    className={`rounded-xl px-2.5 py-1 font-bold border transition cursor-pointer ${
                      waterFeature === w.id
                        ? "bg-[#3D8B84] text-white border-[#3D8B84]"
                        : "bg-[#FAF7F2] text-[#786F66] border-[#E8E1D5]"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              {/* Amenities Toggles */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleAmenity("deck")}
                  className={`rounded-xl px-2 py-1 font-bold border transition cursor-pointer ${
                    amenities.deck
                      ? "bg-[#161311] text-white border-[#161311]"
                      : "bg-[#FAF7F2] text-[#786F66] border-[#E8E1D5]"
                  }`}
                >
                  Deck
                </button>
                <button
                  onClick={() => toggleAmenity("firepit")}
                  className={`rounded-xl px-2 py-1 font-bold border transition cursor-pointer ${
                    amenities.firepit
                      ? "bg-[#FF5722] text-white border-[#FF5722]"
                      : "bg-[#FAF7F2] text-[#786F66] border-[#E8E1D5]"
                  }`}
                >
                  Firepit
                </button>
              </div>

            </div>
          )}

          {/* TAB 4: CÁMARAS & CUBIERTA */}
          {activeTab === "camaras" && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Presets de Cámara */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setCameraPreset("iso")}
                  className={`rounded-xl px-2.5 py-1 font-bold border transition cursor-pointer ${
                    cameraPreset === "iso"
                      ? "bg-[#161311] text-white border-[#161311]"
                      : "bg-[#FAF7F2] text-[#786F66] border-[#E8E1D5]"
                  }`}
                >
                  Aérea
                </button>
                <button
                  onClick={() => setCameraPreset("interior")}
                  className={`rounded-xl px-2.5 py-1 font-bold border transition cursor-pointer ${
                    cameraPreset === "interior"
                      ? "bg-[#161311] text-white border-[#161311]"
                      : "bg-[#FAF7F2] text-[#786F66] border-[#E8E1D5]"
                  }`}
                >
                  Suite King
                </button>
                <button
                  onClick={() => setCameraPreset("deck")}
                  className={`rounded-xl px-2.5 py-1 font-bold border transition cursor-pointer ${
                    cameraPreset === "deck"
                      ? "bg-[#161311] text-white border-[#161311]"
                      : "bg-[#FAF7F2] text-[#786F66] border-[#E8E1D5]"
                  }`}
                >
                  Deck & Relax
                </button>
                <button
                  onClick={() => setCameraPreset("top")}
                  className={`rounded-xl px-2.5 py-1 font-bold border transition cursor-pointer ${
                    cameraPreset === "top"
                      ? "bg-[#A84F36] text-white border-[#A84F36]"
                      : "bg-[#FAF7F2] text-[#786F66] border-[#E8E1D5]"
                  }`}
                >
                  Planta 3D (Corte 1.5m)
                </button>
              </div>

              {/* Slider Cubierta */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#786F66] flex items-center gap-1">
                  <Eye className="h-3 w-3 text-[#A84F36]" /> Cubierta:
                </span>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={coverProgress}
                  onChange={(e) => setCoverProgress(Number(e.target.value))}
                  className="h-2 w-24 sm:w-32 bg-[#E8E1D5] rounded-lg appearance-none cursor-pointer accent-[#A84F36]"
                />
                <span className="text-[10px] font-bold text-[#161311] w-14">
                  {coverProgress <= 0.15
                    ? "Estructura"
                    : coverProgress >= 0.85
                    ? "Adobe"
                    : `${Math.round(coverProgress * 100)}%`}
                </span>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* MODAL RESUMEN DE COTIZACIÓN */}
      {showQuoteModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/60 bg-[#FAF7F2] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowQuoteModal(false)}
              className="absolute top-4 right-4 rounded-full p-2 text-[#786F66] hover:bg-[#E8E1D5]/60 hover:text-[#161311] transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-[#A84F36] mb-1">
              <Sparkles className="h-5 w-5 text-[#C5A059]" />
              <span className="text-xs font-bold uppercase tracking-wider">Moon Paracas Eco-Resort</span>
            </div>
            
            <h3 className="font-display text-2xl font-bold text-[#161311] mb-4">
              Configuración de tu Refugio
            </h3>

            <div className="space-y-3 rounded-2xl border border-[#E8E1D5] bg-white p-4 text-xs">
              <div className="flex justify-between border-b border-[#E8E1D5] pb-2">
                <span className="text-[#786F66]">Lote Seleccionado:</span>
                <span className="font-bold text-[#161311]">{lotArea} m²</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E1D5] pb-2">
                <span className="text-[#786F66]">Domo Geodésico:</span>
                <span className="font-bold text-[#161311]">Ø{diameter}m ({specs.footprintM2} m² utiles · {specs.preset})</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E1D5] pb-2">
                <span className="text-[#786F66]">Ubicación del Baño:</span>
                <span className="font-bold text-[#161311]">{bathLocation === "inside" ? "Suite Integrada" : "Exterior (+Suite Abierta)"}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E1D5] pb-2">
                <span className="text-[#786F66]">Elemento de Agua:</span>
                <span className="font-bold text-[#161311]">{waterFeature === "plunge" ? "Plunge Pool 2.50m (5 m²)" : waterFeature === "jacuzzi" ? "Jacuzzi Spa Circular (3.5 m²)" : "Sin Agua"}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E1D5] pb-2">
                <span className="text-[#786F66]">Tratamiento de Suelo:</span>
                <span className="font-bold text-[#161311]">{groundTreatment === "xeriscape" ? "Arena & Botánica Xerófila" : groundTreatment === "lawn" ? "Pasto Verde Costero" : "Jardín Mixto"}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E1D5] pb-2">
                <span className="text-[#786F66]">Patio Libre Resultante:</span>
                <span className="font-bold text-[#A84F36]">{metrics.freeYardM2} m² ({(100 - metrics.occupancyPercent).toFixed(1)}% libre)</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold text-[#161311]">
                <span>Inversión Estimada:</span>
                <span className="text-[#A84F36] font-display text-lg">${metrics.estimatedPriceUSD.toLocaleString()} USD</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <a
                href={`https://wa.me/51999999999?text=Hola,%20deseo%20reservar%20mi%20refugio%20Moon%20Paracas:%20Lote%20${lotArea}m2,%20Domo%20Ø${diameter}m%20(${specs.preset}),%20Baño%20${bathLocation},%20Agua%20${waterFeature},%20Inversión%20estimada%20$${metrics.estimatedPriceUSD}%20USD.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#161311] px-5 py-3.5 text-xs font-bold text-white shadow-xl hover:bg-[#A84F36] transition cursor-pointer"
              >
                <span>Confirmar Reserva por WhatsApp</span>
                <ChevronRight className="h-4 w-4" />
              </a>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="rounded-2xl border border-[#E8E1D5] bg-white px-5 py-2.5 text-xs font-bold text-[#786F66] hover:text-[#161311] transition cursor-pointer"
              >
                Seguir Personalizando
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
