import React, { useCallback, useEffect, useRef, useState } from "react";
import { Lot, MasterplanScene } from "../../types/map";
import { pathFromPolygon, centroid, getLotLayoutPoints } from "../../lib/geometry";
import { LotsLayer } from "./layers/LotsLayer";
import { APIProvider, Map as GoogleMap, MapCameraChangedEvent, useMap } from "@vis.gl/react-google-maps";
import { CustomSVGOverlay } from "./CustomSVGOverlay";
import { svgToLatLng } from "../../lib/geo";
import { getMeterToSvgScale } from "../../lib/terrainModel";
import { AlertTriangle, Map, Maximize2, Satellite, Shapes, Tags, X } from "lucide-react";
import { Legend } from "./Legend";
import { LotColorMode, MapDetailLevel } from "./mapVisuals";

const PLAN_MAP_STYLES = [
  { featureType: "all", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#ddd9cf" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#a9c5c5" }] },
];

const AMENITY_FILL: Record<string, string> = {
  "pool":              "#3A688A",
  "clubhouse":         "#2D3C30",
  "deck":              "#8B6640",
  "firepit":           "#E15A42", // Glowing fire
  "sand-plaza":        "rgba(212, 163, 115, 0.06)", // Extremely subtle warm desert tint, so it blends perfectly
  "entry-plaza":       "#413B30",
  "moon-deck":         "#9a8c6e",
  "parking":           "#b0a898",
  "xerophytic-garden": "#98a886",
  "pocket-garden":     "#8ea27d",
  "zen-labyrinth":     "#c0a98f",
  "palm-forest":       "#2f4f2f",
  "yoga-plaza":        "#d5b895",
  "water-mirror":      "url(#pool-grad)",
  "welcome-center":    "#D4A373", // Warm wood color for sales office
  "helipad":           "#2B2E33", // Dark asphalt/concrete
  "gatehouse":         "#2D3C30", // Matches clubhouse for brand consistency
  "visitor-lobby":     "#8B6640", // Wood/deck material
  "bus-bay":           "#5C6065", // Lighter asphalt
  "gatehouse-roof":    "#2B2D2F", // Modern matte steel roof structure
};

const AMENITY_LABEL: Record<string, string> = {
  "pool":              "PISCINA OASIS",
  "clubhouse":         "CLUB MOON",
  "deck":              "DECK ZEN",
  "firepit":           "FOGÓN MÍSTICO",
  "sand-plaza":        "OASIS",
  "entry-plaza":       "INGRESO",
  "moon-deck":         "MIRADOR",
  "parking":           "PARKING",
  "xerophytic-garden": "JARDÍN XERÓFILO",
  "pocket-garden":     "JARDÍN DE BOLSILLO",
  "zen-labyrinth":     "LABERINTO",
  "palm-forest":       "BOSQUE",
  "yoga-plaza":        "YOGA",
  "water-mirror":      "ESPEJO DE AGUA",
  "welcome-center":    "WELCOME CENTER",
  "helipad":           "HELIPUERTO",
  "gatehouse":         "CONTROL",
  "visitor-lobby":     "LOBBY VISITAS",
  "bus-bay":           "ZONA DE CARGA",
  "gatehouse-roof":    "PÓRTICO DE INGRESO",
};

const AMENITY_LABEL_OFFSET: Record<string, { dx: number, dy: number }> = {
  "pool":              { dx: 0, dy: 0 },
  "deck":              { dx: 0, dy: 0 },
  "clubhouse":         { dx: 0, dy: 0 },
  "moon-deck":         { dx: 0, dy: 0 },
  "entry-plaza":       { dx: 0, dy: 4 },
  "parking":           { dx: 0, dy: 0 },
  "firepit":           { dx: 0, dy: 0 },
  "xerophytic-garden": { dx: 0, dy: 0 },
  "pocket-garden":     { dx: 0, dy: 0 },
  "zen-labyrinth":     { dx: 0, dy: 0 },
  "palm-forest":       { dx: 0, dy: 0 },
  "yoga-plaza":        { dx: 0, dy: 0 },
  "water-mirror":      { dx: 0, dy: 0 },
};

// Amenity kinds for which we suppress the text label
const AMENITY_NO_LABEL = new Set(["sand-plaza", "bus-bay", "entry-plaza", "parking-driveway"]);

const MapViewportController = ({ selectedLot, terrain }: { selectedLot: Lot | null; terrain: MasterplanScene["terrain"] }) => {
  const map = useMap();
  const initializedRef = useRef(false);
  const previousSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!initializedRef.current && terrain.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      terrain.forEach((point) => {
        const latLng = svgToLatLng(point.x, point.y);
        bounds.extend(latLng);
      });
      map.fitBounds(bounds, 24);
      google.maps.event.addListenerOnce(map, "idle", () => {
        map.setZoom((map.getZoom() ?? 17) + 0.35);
      });
      initializedRef.current = true;
      previousSelectedIdRef.current = selectedLot?.id ?? null;
      return;
    }

    if (selectedLot && selectedLot.id !== previousSelectedIdRef.current && selectedLot.polygon && selectedLot.polygon.length > 0) {
      const pt = centroid(selectedLot.polygon);
      const ll = svgToLatLng(pt.x, pt.y);
      map.panTo(ll);
      previousSelectedIdRef.current = selectedLot.id;
    }
  }, [map, selectedLot, terrain]);
  return null;
};

export function MapCanvas({
  scene, visibleLots, selectedLot, onSelectLot
}: {
  scene: MasterplanScene;
  visibleLots: Lot[];
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [warningsOpen, setWarningsOpen] = useState(false);
  const [baseMap, setBaseMap] = useState<"roadmap" | "satellite">("roadmap");
  const [colorMode, setColorMode] = useState<LotColorMode>("typology");
  const [detailLevel, setDetailLevel] = useState<MapDetailLevel>("overview");
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const residentialCount = scene.lots.filter((lot) => !lot.typology.startsWith("parking")).length;
  const privateParkingCount = scene.lots.filter((lot) => lot.typology === "parking").length;
  
  const scale = getMeterToSvgScale();

  const handleCameraChanged = useCallback((event: MapCameraChangedEvent) => {
    const nextLevel: MapDetailLevel = event.detail.zoom >= 18.4 ? "close" : event.detail.zoom >= 17.6 ? "detail" : "overview";
    setDetailLevel((current) => current === nextLevel ? current : nextLevel);
  }, []);

  const handleOverlayRef = useCallback((node: SVGSVGElement | null) => {
    svgRef.current = node;
    if (node) setMapUnavailable(false);
  }, []);

  useEffect(() => {
    let monitor = 0;
    const checkMapAvailability = () => {
      const overlay = svgRef.current;
      const hasInteractiveInventory = Boolean(overlay?.isConnected && overlay.querySelector("[data-lot-id]"));
      setMapUnavailable(!hasInteractiveInventory);
    };
    const timer = window.setTimeout(() => {
      checkMapAvailability();
      monitor = window.setInterval(checkMapAvailability, 2500);
    }, 7000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(monitor);
    };
  }, [scene.lots.length]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void mapContainerRef.current?.requestFullscreen();
  };

  return (
    <div ref={mapContainerRef} className="relative h-[520px] w-full touch-none select-none overflow-hidden bg-[#d8d5cc] md:h-full">
      {/* Floating Warning Panel overlay */}
      {!warningsOpen ? (
        <button
          type="button"
          onClick={() => setWarningsOpen(true)}
          className="pointer-events-auto absolute left-3 top-3 z-20 inline-flex min-h-10 items-center gap-2 rounded-md border border-[#18353b]/15 bg-[#f7f5ef]/95 px-3 text-[10px] font-bold uppercase text-[#344c4a] shadow-md backdrop-blur-md transition-colors hover:bg-white sm:left-4 sm:top-4"
        >
          <AlertTriangle className="h-4 w-4 text-[#bd603f]" aria-hidden="true" />
          <span className="hidden sm:inline">Alcances</span>
        </button>
      ) : (
        <div className="pointer-events-auto absolute left-3 top-3 z-30 max-w-[calc(100%-1.5rem)] rounded-md border border-[#18353b]/15 border-l-4 border-l-[#bd603f] bg-[#f7f5ef]/97 p-4 font-sans text-[11px] shadow-xl backdrop-blur-md transition-all sm:left-4 sm:top-4 sm:max-w-sm">
          <div className="mb-3 flex items-center justify-between gap-4 border-b border-[#18353b]/10 pb-2 text-xs font-bold uppercase text-[#18353b]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#bd603f]" /> Alcances técnicos
            </div>
            <button
              type="button"
              onClick={() => setWarningsOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#64706d] hover:bg-[#e7e6de] hover:text-[#18353b]"
              aria-label="Cerrar alcances técnicos"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="space-y-3 text-[#596560]">
            <li className="leading-relaxed">
              <strong className="block font-semibold text-[#263d3c]">Una cochera por lote</strong>
              P001–P{String(privateParkingCount).padStart(3, "0")} son cocheras privadas de 2.50 × 5.00 m. Se incorporan 18 espacios comunes para visita, accesibilidad y servicio.
            </li>
            <li className="leading-relaxed">
              <strong className="block font-semibold text-[#263d3c]">Cabida circular verificada</strong>
              Los {residentialCount} lotes contienen geométricamente huellas de Ø4 m y Ø8 m. Los retiros, cimentación y licencia se validan con topografía y expediente técnico.
            </li>
            <li className="leading-relaxed">
              <strong className="block font-semibold text-[#263d3c]">Acceso principal referencial</strong>
              Ubicación del ingreso y frente oficial es supuesta provisionalmente; sujeta a cambios de diseño del eje vial externo.
            </li>
            <li className="leading-relaxed">
              <strong className="block font-semibold text-[#263d3c]">Escorrentía y drenaje</strong>
              La dirección de escorrentía pluvial es preliminar y requiere estudio de pendientes e ingeniería hidráulica definitiva.
            </li>
            <li className="leading-relaxed">
              <strong className="block font-semibold text-[#263d3c]">Puntos de servicios</strong>
              Los puntos de empalme eléctrico/agua son provisionales, pendientes de factibilidad final por empresas de servicios.
            </li>
            <li className="leading-relaxed">
              <strong className="block font-semibold text-[#263d3c]">Órbita vehicular de 6 m</strong>
              Los autos circulan por el perímetro. El interior conecta seis aldeas mediante paseos peatonales de 4 m; la sección final queda sujeta a validación municipal, accesibilidad y atención de emergencias.
            </li>
          </ul>
        </div>
      )}

      <div className="pointer-events-auto absolute right-3 top-3 z-20 flex items-center gap-2 sm:right-4 sm:top-4">
        <div className="grid grid-cols-2 rounded-md border border-[#18353b]/15 bg-[#f7f5ef]/95 p-1 shadow-md backdrop-blur-md">
          <button
            type="button"
            onClick={() => setBaseMap("roadmap")}
            className={`inline-flex h-9 items-center justify-center gap-2 rounded-[4px] px-2.5 text-[9px] font-bold uppercase ${baseMap === "roadmap" ? "bg-[#18353b] text-white" : "text-[#4e605d] hover:bg-[#e7e6de]"}`}
            aria-pressed={baseMap === "roadmap"}
            title="Plano limpio"
          >
            <Map className="h-4 w-4" /><span className="hidden lg:inline">Plano</span>
          </button>
          <button
            type="button"
            onClick={() => setBaseMap("satellite")}
            className={`inline-flex h-9 items-center justify-center gap-2 rounded-[4px] px-2.5 text-[9px] font-bold uppercase ${baseMap === "satellite" ? "bg-[#18353b] text-white" : "text-[#4e605d] hover:bg-[#e7e6de]"}`}
            aria-pressed={baseMap === "satellite"}
            title="Vista satelital"
          >
            <Satellite className="h-4 w-4" /><span className="hidden lg:inline">Satélite</span>
          </button>
        </div>

        <div className="grid grid-cols-2 rounded-md border border-[#18353b]/15 bg-[#f7f5ef]/95 p-1 shadow-md backdrop-blur-md">
          <button
            type="button"
            onClick={() => setColorMode("typology")}
            className={`inline-flex h-9 items-center justify-center gap-2 rounded-[4px] px-2.5 text-[9px] font-bold uppercase ${colorMode === "typology" ? "bg-[#b55034] text-white" : "text-[#4e605d] hover:bg-[#e7e6de]"}`}
            aria-pressed={colorMode === "typology"}
            title="Colorear por tipología"
          >
            <Shapes className="h-4 w-4" /><span className="hidden xl:inline">Tipología</span>
          </button>
          <button
            type="button"
            onClick={() => setColorMode("status")}
            className={`inline-flex h-9 items-center justify-center gap-2 rounded-[4px] px-2.5 text-[9px] font-bold uppercase ${colorMode === "status" ? "bg-[#b55034] text-white" : "text-[#4e605d] hover:bg-[#e7e6de]"}`}
            aria-pressed={colorMode === "status"}
            title="Colorear por estado comercial"
          >
            <Tags className="h-4 w-4" /><span className="hidden xl:inline">Estado</span>
          </button>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#18353b]/15 bg-[#f7f5ef]/95 text-[#344c4a] shadow-md backdrop-blur-md hover:bg-white"
          aria-label="Alternar pantalla completa"
          title="Pantalla completa"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <Legend colorMode={colorMode} />

      <APIProvider apiKey={(import.meta as any).env.VITE_GOOGLE_MAPS_PLATFORM_KEY || ""}>
        <MapViewportController selectedLot={selectedLot} terrain={scene.terrain} />
        <GoogleMap
          defaultCenter={{ lat: -13.92385, lng: -76.16017 }}
          defaultZoom={17}
          mapTypeId={baseMap}
          styles={baseMap === "roadmap" ? PLAN_MAP_STYLES : undefined}
          disableDefaultUI
          zoomControl
          gestureHandling="greedy"
          onCameraChanged={handleCameraChanged}
        />
        <CustomSVGOverlay terrainSvgPoints={scene.terrain}>
            <svg ref={handleOverlayRef} viewBox="0 0 730 820" className="w-full h-full pointer-events-auto">
              <defs>
                {/* Visual glow filter for pools, firepits, and club houses */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                
                {/* 3D drop-shadow filter for roads and buildings */}
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0.4" dy="1.0" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.4" />
                </filter>
                
                {/* Water ripples pattern for Piscina Oasis */}
                <pattern id="water-ripples" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 0 4 Q 2 2, 4 4 T 8 4" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.3" />
                  <path d="M 0 8 Q 2 6, 4 8 T 8 8" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.3" />
                </pattern>
                
                {/* Premium Palm Tree icon definition (centered at 0,0) */}
                <g id="palm-icon">
                  {/* Subtle ground shadow */}
                  <circle cx="0.15" cy="0.3" r="1.1" fill="rgba(0,0,0,0.22)" />
                  {/* Trunk base */}
                  <circle cx="0" cy="0" r="0.35" fill="#5c4a37" />
                  {/* Leaves radiating outward */}
                  <path d="M 0 0 Q 0.7 -0.7, 1.2 -0.5" fill="none" stroke="#254a20" strokeWidth="0.35" strokeLinecap="round" />
                  <path d="M 0 0 Q -0.7 -0.7, -1.2 -0.5" fill="none" stroke="#254a20" strokeWidth="0.35" strokeLinecap="round" />
                  <path d="M 0 0 Q 0.6 0.6, 1.0 1.0" fill="none" stroke="#1d3b19" strokeWidth="0.35" strokeLinecap="round" />
                  <path d="M 0 0 Q -0.6 0.6, -1.0 1.0" fill="none" stroke="#1d3b19" strokeWidth="0.35" strokeLinecap="round" />
                  <path d="M 0 0 Q 0 -1.0, 0 -1.3" fill="none" stroke="#2e6328" strokeWidth="0.35" strokeLinecap="round" />
                  <path d="M 0 0 Q 0 1.0, 0 1.3" fill="none" stroke="#2e6328" strokeWidth="0.35" strokeLinecap="round" />
                </g>
                
                <radialGradient id="dome-3d" cx="35%" cy="35%" r="65%">
                  <stop offset="0%"   stopColor="#FFFFFF" />
                  <stop offset="35%"  stopColor="#FAF7F0" />
                  <stop offset="70%"  stopColor="#EADEC9" />
                  <stop offset="100%" stopColor="#C4B79A" />
                </radialGradient>

                <radialGradient id="terrain-grad" cx="45%" cy="40%" r="70%">
                  <stop offset="0%"   stopColor="#2A2F35" />
                  <stop offset="55%"  stopColor="#202428" />
                  <stop offset="100%" stopColor="#15181A" />
                </radialGradient>
                <radialGradient id="pool-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="#4A90E2" />
                  <stop offset="70%"  stopColor="#00E5FF" />
                  <stop offset="100%" stopColor="#003366" />
                </radialGradient>
                <radialGradient id="fire-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="#FFF5E1" />
                  <stop offset="20%"  stopColor="#FFB703" />
                  <stop offset="70%"  stopColor="#E15A42" />
                  <stop offset="100%" stopColor="#4A1C15" />
                </radialGradient>
                <radialGradient id="club-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="#E3CEB6" />
                  <stop offset="60%"  stopColor="#D4A373" />
                  <stop offset="100%" stopColor="#5D4037" />
                </radialGradient>
                <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#4a3c28" />
                </marker>
              </defs>

              

              {/* === Terrain border === */}
              <path
                d={pathFromPolygon(scene.terrain)}
                fill={baseMap === "roadmap" ? "rgba(240, 237, 226, 0.72)" : "rgba(19, 31, 30, 0.08)"}
                stroke="#152d30"
                strokeWidth={3}
                strokeLinejoin="round"
              />
              <path d={pathFromPolygon(scene.terrain)} fill="none" stroke="rgba(255,255,255,0.52)" strokeWidth={0.8} strokeDasharray="10 5" />

              {/* === Roads (Earth tones & Floor Lighting) === */}
              {scene.roads.map(r => {
                const d = `M ${r.path[0].x} ${r.path[0].y} ` + r.path.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
                const isPrimary = r.kind === "primary";
                const roadWidthPx = r.widthM * scale;
                return (
                  <g key={r.id}>
                    {isPrimary ? (
                      <>
                        <path d={d} fill="none" stroke="#6D6558" strokeWidth={roadWidthPx} strokeLinecap="round" strokeLinejoin="round" opacity={baseMap === "roadmap" ? 0.94 : 0.78} />
                        <path d={d} fill="none" stroke="#D8C7A7" strokeWidth={1.2} strokeLinecap="round" strokeDasharray="7 7" opacity={0.8} />
                      </>
                    ) : (
                      <g>
                        <path d={d} fill="none" stroke="#C8B895" strokeWidth={roadWidthPx} strokeLinecap="round" strokeLinejoin="round" opacity={baseMap === "roadmap" ? 0.92 : 0.68} />
                        <path d={d} fill="none" stroke="#685E50" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" opacity={0.62} strokeDasharray="2 4" />
                        {detailLevel === "close" && (
                          <text x={(r.path[0].x + r.path[1].x) / 2} y={(r.path[0].y + r.path[1].y) / 2 + 1} textAnchor="middle" fontSize="3.2" fontWeight="bold" fill="#4f493f" opacity={0.9} pointerEvents="none">
                            {r.widthM} m
                          </text>
                        )}
                      </g>
                    )}
                    {detailLevel !== "overview" && (
                      <>
                        <path d={d} fill="none" stroke="#E2B98B" strokeWidth={isPrimary ? 1.2 : 0.7} strokeDasharray={isPrimary ? "4 8" : "2 7"} strokeLinecap="round" opacity={0.72} />
                        {r.path.map((pt, i) => (
                          <circle key={`farol-${r.id}-${i}`} cx={pt.x} cy={pt.y} r={isPrimary ? 1.2 : 0.8} fill="#FFF3E0" opacity={0.8} />
                        ))}
                      </>
                    )}
                  </g>
                );
              })}

              {/* === Trees on Roads === */}
              {detailLevel !== "overview" && scene.roads.filter((road) => road.kind === "primary").map(r => {
                const trees = [];
                const isPrimary = r.kind === "primary";
                const offset = isPrimary ? 7.5 : 3.5;
                const spacing = isPrimary ? 9 : 12;

                if (r.path.length >= 2) {
                   for (let j = 0; j < r.path.length - 1; j++) {
                     const p1 = r.path[j];
                     const p2 = r.path[j+1];
                     const dx = p2.x - p1.x;
                     const dy = p2.y - p1.y;
                     const dist = Math.sqrt(dx*dx + dy*dy);
                     const steps = Math.floor(dist / spacing); 
                     for (let i = 1; i <= steps; i++) {
                       const f = i / (steps + 1);
                       const tx = p1.x + f * dx;
                       const ty = p1.y + f * dy;
                       const perpX = -dy / dist;
                       const perpY = dx / dist;
                       // Left tree
                       trees.push(
                         <use
                           key={`tl-${j}-${i}`}
                           href="#palm-icon"
                           transform={`translate(${tx + perpX * offset}, ${ty + perpY * offset}) scale(${isPrimary ? 1.15 : 0.85})`}
                         />
                       );
                       // Right tree
                       trees.push(
                         <use
                           key={`tr-${j}-${i}`}
                           href="#palm-icon"
                           transform={`translate(${tx - perpX * offset}, ${ty - perpY * offset}) scale(${isPrimary ? 1.15 : 0.85})`}
                         />
                       );
                     }
                   }
                }
                return <g key={`trees-${r.id}`}>{trees}</g>;
              })}

              {/* === Zen Garden Rings around Oasis === */}
              {scene.amenities.filter(a => a.kind === "sand-plaza").map((a, i) => (
                <g key={`zen-rings-${i}`}>
                   <path d={pathFromPolygon(a.polygon)} fill="none" stroke="#D4A373" strokeWidth={18} opacity={0.06} />
                   <path d={pathFromPolygon(a.polygon)} fill="none" stroke="#D4A373" strokeWidth={12} opacity={0.08} />
                   <path d={pathFromPolygon(a.polygon)} fill="none" stroke="#D4A373" strokeWidth={6} opacity={0.12} />
                   <path d={pathFromPolygon(a.polygon)} fill="none" stroke="#D4A373" strokeWidth={2} opacity={0.2} />
                </g>
              ))}

              {/* === Amenity zones (Oasis, club, pool, and detailed parking) === */}
              {scene.amenities.map(a => {
                let fill = AMENITY_FILL[a.kind] ?? "#bfb2a0";
                let stroke = "rgba(255,255,255,0.6)";
                let strokeWidth = 1;
                
                if (a.kind === "pool") fill = "url(#pool-grad)";
                if (a.kind === "firepit") fill = "url(#fire-grad)";
                if (a.kind === "clubhouse") fill = "url(#club-grad)";
                
                if (a.kind === "water-mirror") {
                  stroke = "#DFDCD6";
                  strokeWidth = 1.5;
                }

                if (a.kind === "parking-spot") {
                  fill = "rgba(160, 152, 138, 0.4)";
                  stroke = "rgba(255,255,255,0.85)"; // Bright white lines for parking bays
                  strokeWidth = 1.5;
                } else if (a.kind === "parking-driveway") {
                  fill = "transparent";
                  stroke = "rgba(255,255,255,0.2)";
                  strokeWidth = 0.5;
                } else if (a.kind === "parking") {
                  fill = "transparent";
                  stroke = "none";
                }

                const cPt = centroid(a.polygon);
                const label = AMENITY_LABEL[a.kind] ?? a.kind.toUpperCase();
                const isSpot = a.kind === "parking-spot" || a.kind === "parking-driveway";
                const isGlowing = ["pool", "firepit", "clubhouse"].includes(a.kind);

                // Get offset if defined
                const offset = AMENITY_LABEL_OFFSET[a.kind] || { dx: 0, dy: 0 };
                const labelX = cPt.x + offset.dx;
                const labelY = cPt.y + 2.5 + offset.dy;

                // ICAO Helipad Rendering
                if (a.kind === "helipad") {
                  const dist = a.polygon.length > 0 ? Math.hypot(a.polygon[0].x - cPt.x, a.polygon[0].y - cPt.y) : 10;
                  return (
                    <g key={a.id}>
                      {/* Transparent Square TLOF border */}
                      <path d={pathFromPolygon(a.polygon)} fill="transparent" stroke="white" strokeWidth={1.5} opacity={0.9} />
                      {/* International H symbol */}
                      <text x={cPt.x} y={cPt.y} fill="white" fontSize={dist * 0.7} fontWeight="bold" textAnchor="middle" dominantBaseline="central" style={{ fontFamily: 'Arial, sans-serif',  }}>H</text>
                    </g>
                  );
                }

                // Entry Plaza Custom Rotonda Rendering
                if (a.kind === "entry-plaza") {
                  return (
                    <g key={a.id}>
                      {/* Main Paved Plaza (Rectangle) */}
                      <path d={pathFromPolygon(a.polygon)} fill="#3a342c" stroke="#5c4a37" strokeWidth={1.5} opacity={0.95} />
                      {/* Lane divider dashed lines (translucent cream) */}
                      <path d={`M ${cPt.x - 3 * scale} ${cPt.y} L ${cPt.x + 3 * scale} ${cPt.y}`} fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} strokeDasharray="3 3" />
                      {/* Central landscaped island (oval) */}
                      <ellipse cx={cPt.x} cy={cPt.y} rx={2.5 * scale} ry={5 * scale} fill="#708764" stroke="#4d5c45" strokeWidth={1.0} />
                      {/* Center Palm tree indicator */}
                      <use href="#palm-icon" transform={`translate(${cPt.x}, ${cPt.y}) scale(1.3)`} />
                      {/* Radial agave/flower details inside the island */}
                      <circle cx={cPt.x} cy={cPt.y - 3} r={0.7} fill="#d4a373" />
                      <circle cx={cPt.x} cy={cPt.y + 3} r={0.7} fill="#d4a373" />
                      <circle cx={cPt.x - 1.2} cy={cPt.y} r={0.6} fill="#d4a373" />
                      <circle cx={cPt.x + 1.2} cy={cPt.y} r={0.6} fill="#d4a373" />
                    </g>
                  );
                }

                return (
                  <g key={a.id}>
                    <path
                      d={pathFromPolygon(a.polygon)}
                      fill={fill}
                      stroke={a.kind === "sand-plaza" ? "rgba(255,255,255,0.06)" : stroke}
                      strokeWidth={strokeWidth}
                      opacity={a.kind === "sand-plaza" ? 1 : 0.95}
                      filter={isGlowing ? "url(#glow)" : undefined}
                    />
                    {a.kind === "pool" && (
                      <path
                        d={pathFromPolygon(a.polygon)}
                        fill="url(#water-ripples)"
                        stroke="none"
                        opacity={0.85}
                        pointerEvents="none"
                      />
                    )}
                    {!isSpot && !AMENITY_NO_LABEL.has(a.kind) && a.id !== "A_GATE_L" && a.id !== "A_GATE_R" && a.id !== "A_GATE_BAR" && (
                      <>
                        <text
                          x={labelX}
                          y={labelY}
                          fill="#FFF"
                          fontSize={a.kind === "sand-plaza" ? 8 : 3.5}
                          fontFamily="Montserrat, sans-serif"
                          fontWeight="bold"
                          textAnchor="middle"
                          pointerEvents="none"
                          style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}
                          className="uppercase"
                        >
                          {label}
                        </text>
                        {a.areaM2 && a.areaM2 > 0 && (
                          <text
                            x={labelX}
                            y={labelY + (a.kind === "sand-plaza" ? 8 : 4)}
                            fill="#FFD700"
                            fontSize={a.kind === "sand-plaza" ? 5 : 2.5}
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                            pointerEvents="none"
                            style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.8)" }}
                          >
                            {a.areaM2} m²
                          </text>
                        )}
                      </>
                    )}
                  </g>
                );
              })}





              {/* === Interactive Lots === */}
              <LotsLayer
                lots={visibleLots}
                selectedLotId={selectedLot?.id}
                onSelect={onSelectLot}
                colorMode={colorMode}
                detailLevel={detailLevel}
                baseMap={baseMap}
              />

              {/* === Lot number labels === */}
              {visibleLots.map(lot => {
                if (!lot.polygon || lot.polygon.length < 3) return null;
                if (lot.typology === "parking-external") return null;
                
                const isParking = lot.typology === "parking";
                if (!isParking && detailLevel === "overview") return null;
                let textX: number;
                let textY: number;

                if (isParking && detailLevel !== "close") return null;

                if (isParking) {
                  const pt = centroid(lot.polygon);
                  textX = pt.x;
                  textY = pt.y + 0.4;
                } else {
                  const layout = getLotLayoutPoints(lot.polygon);
                  textX = layout.text.x;
                  textY = layout.text.y;
                }

                return (
                  <text key={`n-${lot.id}`} x={textX} y={textY} textAnchor="middle"
                    fontSize={isParking ? "1.15" : detailLevel === "close" ? "3.8" : "3.2"}
                    fontWeight="800"
                    fontFamily="var(--font-sans)"
                    fill="#18353b"
                    stroke="rgba(255,255,255,0.72)"
                    strokeWidth={isParking ? 0.18 : 0.7}
                    paintOrder="stroke"
                    opacity={1}
                    pointerEvents="none">
                    {isParking ? lot.number.toString().replace('P', '') : lot.number}
                  </text>
                );
              })}

              {/* === Block labels === */}
              {detailLevel === "overview" && scene.blocks.map(block => {
                const pt = block.labelPoint || centroid(block.polygon);
                return (
                  <g key={`bl-${block.id}`} pointerEvents="none">
                    {/* Badge background to prevent overlapping lot numbers */}
                    <rect 
                      x={pt.x - 7} 
                      y={pt.y - 2.5} 
                      width={14} 
                      height={6} 
                      rx={1.5} 
                      fill="rgba(24, 53, 59, 0.9)"
                      stroke="rgba(255,255,255,0.82)"
                      strokeWidth={0.5} 
                    />
                    <text 
                      x={pt.x} 
                      y={pt.y + 1.8} 
                      textAnchor="middle" 
                      fontSize="4.2" 
                      fontWeight="800"
                      fontFamily="Montserrat, sans-serif" 
                      fill="#FFFFFF" 
                      letterSpacing="0.05em"
                    >
                      {block.id}
                    </text>
                  </g>
                );
              })}

              {/* === Compass === */}
              <g transform="translate(690, 52)" pointerEvents="none">
                <circle cx={0} cy={0} r={18} fill="rgba(255,255,255,0.88)" stroke="#9a8060" strokeWidth={1.2} />
                <polygon points="0,-13 -4,5 0,2 4,5" fill="#c0392b" opacity={0.9} />
                <polygon points="0,13 -4,-5 0,-2 4,-5" fill="#4a3c28" opacity={0.75} />
                <text x={0} y={-16} textAnchor="middle" fontSize="7" fontWeight="900" fontFamily="ui-sans-serif" fill="#c0392b">N</text>
              </g>

              {/* === Scale bar (approx 100m) === */}
              <g transform="translate(40, 800)" pointerEvents="none">
                <rect x={0} y={-4} width={60} height={5} fill="#4a3c28" opacity={0.75} rx={1} />
                <rect x={0} y={-4} width={30} height={5} fill="#fff" opacity={0.75} rx={1} />
                <text x={0}  y={5}  fontSize="5.5" fontFamily="ui-sans-serif" fill="#4a3c28" fontWeight="700">0</text>
                <text x={24} y={5}  fontSize="5.5" fontFamily="ui-sans-serif" fill="#4a3c28" fontWeight="700">~100m</text>
                <text x={50} y={5}  fontSize="5.5" fontFamily="ui-sans-serif" fill="#4a3c28" fontWeight="700">~200m</text>
              </g>

              {/* === Project title watermark === */}
              <text x={365} y={412} textAnchor="middle" dominantBaseline="middle"
                fontSize="60" fontWeight="400" fontFamily="var(--font-display)"
                fill="var(--color-desert-bronze)" opacity={0.06} pointerEvents="none" letterSpacing="0.2em">
                MOON PARACAS
              </text>
</svg>
</CustomSVGOverlay>
      </APIProvider>

      {mapUnavailable && (
        <div data-testid="map-fallback" className="absolute inset-0 z-40 flex items-center justify-center overflow-hidden bg-[#d7d0c2] p-3 sm:p-5">
          <img
            src="/images/masterplan-v2.2-commercial.png"
            alt="Plano comercial vigente de Moon Paracas con sus seis aldeas y el Oasis central"
            className="absolute inset-0 h-full w-full object-contain opacity-90"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,23,24,0.92),transparent_56%)]" />
          <div className="relative mt-auto flex w-full max-w-2xl flex-col items-start justify-between gap-4 rounded-lg border border-white/18 bg-[#102022]/88 p-5 text-white shadow-2xl backdrop-blur-md sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#f0b08c]">Plano local disponible</p>
              <p className="mt-2 font-display text-2xl font-semibold">El masterplan continúa visible.</p>
              <p className="mt-2 max-w-lg text-xs leading-5 text-white/65">La base cartográfica externa no respondió. Mostramos la edición comercial vigente para que puedas seguir revisando la distribución.</p>
            </div>
            <a href="/images/masterplan-v2.2-commercial.png" target="_blank" rel="noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#bb5638] px-5 text-[9px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#a64932]">Ampliar plano</a>
          </div>
        </div>
      )}
    </div>
  );
}

