import React, { useRef, useState, useEffect } from "react";
import { Lot, MasterplanScene } from "../../types/map";
import { pathFromPolygon, centroid, getLotLayoutPoints } from "../../lib/geometry";
import { LotsLayer } from "./layers/LotsLayer";
import { APIProvider, Map as GoogleMap, MapCameraChangedEvent, useMap } from "@vis.gl/react-google-maps";
import { CustomSVGOverlay } from "./CustomSVGOverlay";
import { svgToLatLng } from "../../lib/geo";
import { getMeterToSvgScale } from "../../lib/terrainModel";

// Amenity fill colors
const FILL_COLORS: Record<string, string> = {
  "premium": "#d4af37",
  "standard": "#8FA88B",
  "zen": "#D4A373",  "tiny-house": "#E07A5F",
  "parking": "#7A8288",
  "parking-external": "#5C6065",
};

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
  "zen-labyrinth":     { dx: 0, dy: 0 },
  "palm-forest":       { dx: 0, dy: 0 },
  "yoga-plaza":        { dx: 0, dy: 0 },
  "water-mirror":      { dx: 0, dy: 0 },
};

// Amenity kinds for which we suppress the text label
const AMENITY_NO_LABEL = new Set(["sand-plaza", "bus-bay", "entry-plaza", "parking-driveway"]);

const MapCenterController = ({ selectedLot }: { selectedLot: Lot | null }) => {
  const map = useMap();
  useEffect(() => {
    if (map && selectedLot && selectedLot.polygon && selectedLot.polygon.length > 0) {
      const pt = centroid(selectedLot.polygon);
      const ll = svgToLatLng(pt.x, pt.y);
      map.panTo(ll);
    }
  }, [map, selectedLot]);
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
  const svgRef = useRef<SVGSVGElement>(null);
  const [warningsOpen, setWarningsOpen] = useState(false);
  
  const c = centroid(scene.innerBuffer);
  const scale = getMeterToSvgScale();

  return (
    <div className="relative w-full h-full bg-transparent overflow-hidden touch-none select-none">
      {/* Floating Warning Panel overlay */}
      {!warningsOpen ? (
        <button
          onClick={() => setWarningsOpen(true)}
          className="absolute top-4 left-4 z-20 px-3 py-2 bg-white/90 backdrop-blur-md border border-[var(--color-desert-taupe)] hover:bg-[var(--color-desert-sand)] text-[var(--color-desert-charcoal)] font-bold text-[10px] tracking-widest uppercase shadow-md transition-all flex items-center gap-1.5 pointer-events-auto rounded-sm cursor-pointer"
        >
          <span className="text-amber-600">⚠</span>
          <span>Advertencias</span>
        </button>
      ) : (
        <div className="absolute top-4 left-4 z-20 max-w-[280px] sm:max-w-sm bg-white/95 backdrop-blur-md border border-[var(--color-desert-taupe)] border-l-4 border-l-amber-600 p-4 shadow-xl pointer-events-auto text-[11px] font-sans transition-all duration-300">
          <div className="flex items-center justify-between gap-2 mb-2 border-b border-amber-600/20 pb-1 text-amber-900 font-bold uppercase tracking-wider text-xs">
            <div className="flex items-center gap-2">
              <span>⚠</span> Advertencias Normativas
            </div>
            <button
              onClick={() => setWarningsOpen(false)}
              className="text-[10px] font-bold text-stone-400 hover:text-stone-700 tracking-wider transition-colors cursor-pointer"
            >
              [ OCULTAR ]
            </button>
          </div>
          <ul className="space-y-2 text-stone-700">
            <li className="leading-relaxed">
              <strong className="text-stone-900 block font-semibold">◆ Acceso Principal Oficial:</strong>
              Ubicación del ingreso y frente oficial es supuesta provisionalmente; sujeta a cambios de diseño del eje vial externo.
            </li>
            <li className="leading-relaxed">
              <strong className="text-stone-900 block font-semibold">◆ Escorrentía / Drenaje:</strong>
              La dirección de escorrentía pluvial es preliminar y requiere estudio de pendientes e ingeniería hidráulica definitiva.
            </li>
            <li className="leading-relaxed">
              <strong className="text-stone-900 block font-semibold">◆ Puntos de Servicios:</strong>
              Los puntos de empalme eléctrico/agua son provisionales, pendientes de factibilidad final por empresas de servicios.
            </li>
            <li className="leading-relaxed">
              <strong className="text-stone-900 block font-semibold">◆ Corredores Internos de 6m:</strong>
              Vías internas de 6.0 m representadas como circulación compartida (Living Streets), sujetas a validación legal y municipal definitiva.
            </li>
          </ul>
        </div>
      )}

      {/* Commercial Legend Floating Panel */}
      <div className="absolute bottom-8 left-8 z-20 bg-white/95 backdrop-blur-md border border-[var(--color-desert-taupe)] p-4 shadow-xl pointer-events-auto rounded-sm text-[11px] font-sans text-stone-700">
        <h3 className="font-bold uppercase tracking-wider mb-3 text-[var(--color-desert-charcoal)] border-b border-stone-200 pb-1">Leyenda Comercial</h3>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#748D70] border border-[#4A5D47] shadow-sm"></div>
            <span className="font-medium text-stone-800">Lote Disponible (S/ 120 m²)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#8EA98A] border border-[#627B5E]"></div>
            <span className="font-medium text-stone-800">Lote en Oferta (S/ 60 m²)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#b0a898] border border-[#9b9383]"></div>
            <span>Cochera Plus (S/ 5,000)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#5c6065] border border-[#45484c]"></div>
            <span>Cochera Visitas (Público)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-200 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#3A688A] border border-[#234b67] shadow-sm"></div>
              <span className="font-medium text-stone-800">Piscina Oasis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#00E5FF] border border-[#003366] shadow-sm"></div>
              <span className="font-medium text-stone-800">Espejo de Agua</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#D4A373] border border-[#a27447] shadow-sm"></div>
              <span className="font-medium text-stone-800">Club Moon (Club House)</span>
            </div>
          </div>
        </div>
      </div>

      <APIProvider apiKey={(import.meta as any).env.VITE_GOOGLE_MAPS_PLATFORM_KEY || ""}>
        <MapCenterController selectedLot={selectedLot} />
        <GoogleMap
          defaultCenter={{ lat: -13.92385, lng: -76.16017 }}
          defaultZoom={17}
          mapTypeId="satellite"
          disableDefaultUI={false}
          gestureHandling="greedy"
          mapTypeControl={false}
          streetViewControl={false}
        />
        <CustomSVGOverlay terrainSvgPoints={scene.terrain}>
            <svg ref={svgRef} viewBox="0 0 730 820" className="w-full h-full pointer-events-auto">
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

              

              {/* === Terrain border (transparent fill for Google Maps) === */}
              <path d={pathFromPolygon(scene.terrain)} fill="none" stroke="#101214" strokeWidth={2.5} strokeLinejoin="round" />
              <path d={pathFromPolygon(scene.terrain)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={0.8} strokeDasharray="10 5" />

              {/* === Roads (Earth tones & Floor Lighting) === */}
              {scene.roads.map(r => {
                const d = `M ${r.path[0].x} ${r.path[0].y} ` + r.path.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
                const isPrimary = r.kind === "primary";
                return (
                  <g key={r.id}>
                    {isPrimary ? (
                      <path d={d} fill="none" stroke="#8C6B4E" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} filter="url(#shadow)" />
                    ) : (
                      <g>
                        {/* Turnaround Oval (Cul-de-sac) at the start of dead-end streets */}
                        {r.id.startsWith("LINEAR_ROAD") && (
                          <g>
                            <circle cx={r.path[0].x} cy={r.path[0].y} r={4.5} fill="#c9a67f" opacity={0.3} />
                            <circle cx={r.path[0].x} cy={r.path[0].y} r={3} fill="none" stroke="#e3ceb6" strokeWidth={1.5} opacity={0.5} strokeDasharray="2 4" />
                          </g>
                        )}
                        <path d={d} fill="none" stroke="#c9a67f" strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.65} filter="url(#shadow)" />
                        <path d={d} fill="none" stroke="#5c4a37" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} strokeDasharray="2 4" />
                        <text x={(r.path[0].x + r.path[1].x) / 2} y={(r.path[0].y + r.path[1].y) / 2 + 1} textAnchor="middle" fontSize="4" fontWeight="bold" fill="#5c4a37" opacity={0.9} pointerEvents="none">
                          {r.widthM}m
                        </text>
                      </g>
                    )}
                    {/* Amber floor bollard lighting glow (continuous) */}
                    <path d={d} fill="none" stroke="#D4A373" strokeWidth={isPrimary ? 1.5 : 0.8} strokeDasharray={isPrimary ? "4 8" : "2 6"} strokeLinecap="round" strokeLinejoin="round"  opacity={0.8} />
                    {isPrimary && <path d={d} fill="none" stroke="#E15A42" strokeWidth={0.5} strokeDasharray="8 6" strokeLinecap="round" opacity={0.4} />}
                    
                    {/* Farolitos de piso en las esquinas */}
                    {r.path.map((pt, i) => (
                       <circle key={`farol-${r.id}-${i}`} cx={pt.x} cy={pt.y} r={isPrimary ? 1.5 : 1.0} fill="#FFF3E0"  opacity={0.9} />
                    ))}
                  </g>
                );
              })}

              {/* === Trees on Roads === */}
              {scene.roads.map(r => {
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
              <LotsLayer lots={visibleLots} selectedLotId={selectedLot?.id} onSelect={onSelectLot} />

              {/* === Lot number labels === */}
              {visibleLots.map(lot => {
                if (!lot.polygon || lot.polygon.length < 3) return null;
                if (lot.typology === "parking-external") return null;
                
                const isParking = lot.typology === "parking";
                let textX: number;
                let textY: number;

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
                    fontSize={isParking ? "1.2" : "6.5"} fontWeight="700" fontFamily="var(--font-sans)"
                    fill="var(--color-desert-charcoal)" opacity={1.0} pointerEvents="none">
                    {isParking ? lot.number.toString().replace('P', '') : lot.number}
                  </text>
                );
              })}

              {/* === Block labels === */}
              {scene.blocks.map(block => {
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
                      fill="rgba(45, 51, 57, 0.88)" 
                      stroke="#FFFFFF" 
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
    </div>
  );
}

