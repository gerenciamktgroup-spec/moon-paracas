import React, { useState } from "react";
import { Lot } from "../../../types/map";
import { pathFromPolygon, centroid, getLotLayoutPoints } from "../../../lib/geometry";
import { getMeterToSvgScale } from "../../../lib/terrainModel";
import { getLotVisual, LotColorMode, MapDetailLevel, STATUS_VISUALS } from "../mapVisuals";

export function LotsLayer({
  lots,
  selectedLotId,
  onSelect,
  colorMode,
  detailLevel,
  baseMap,
}: {
  lots: Lot[];
  selectedLotId?: string;
  onSelect: (lot: Lot) => void;
  colorMode: LotColorMode;
  detailLevel: MapDetailLevel;
  baseMap: "roadmap" | "satellite";
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <>
      {lots.map(lot => {
        const visual = getLotVisual(lot, colorMode);
        const statusLabel = STATUS_VISUALS[lot.status]?.label ?? STATUS_VISUALS.available.label;
        const isSelected = selectedLotId === lot.id;
        const isHovered = hoveredId === lot.id;

        const isInternalParking = lot.typology === "parking";
        const isExternalParking = lot.typology === "parking-external";
        const isParking = isInternalParking || isExternalParking;

        const fillOpacity = isParking
          ? isSelected ? 0.92 : isHovered ? 0.82 : baseMap === "roadmap" ? 0.72 : 0.56
          : isSelected ? 0.96 : isHovered ? 0.92 : baseMap === "roadmap" ? 0.86 : 0.72;
        const strokeColor = isSelected ? "#FFF8EC" : lot.status === "offer" && colorMode === "typology" ? "#B94E35" : visual.stroke;
        const strokeWidth = isSelected ? 3.2 : isHovered ? 2.3 : lot.status === "offer" && colorMode === "typology" ? 2.0 : 1.2;

        const hasPin = detailLevel === "close" && !isParking && lot.status === "offer";
        const center = hasPin ? centroid(lot.polygon) : { x: 0, y: 0 };

        return (
          <g key={lot.id}>
            <path
              d={pathFromPolygon(lot.polygon)}
              data-lot-id={lot.id}
              role="button"
              tabIndex={0}
              aria-label={`${isParking ? "Cochera" : "Lote"} ${lot.number}, ${statusLabel}, ${lot.areaM2.toFixed(2)} metros cuadrados`}
              fill={visual.fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              style={{
                cursor: "pointer",
                transition: "fill-opacity 200ms ease, stroke-width 200ms ease",
                filter: isSelected ? "drop-shadow(0 2px 5px rgba(19,43,45,0.55))" : "none"
              }}
              onClick={() => onSelect(lot)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(lot);
                }
              }}
              onMouseEnter={() => setHoveredId(lot.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <title>{isParking ? "Cochera" : "Lote"} {lot.number} · {statusLabel} · {lot.areaM2.toFixed(2)} m²</title>
            </path>
            
            {/* GEODESIC DOME AND DECORATION LAYER */}
            {!isParking && detailLevel !== "overview" && (() => {
              const layout = getLotLayoutPoints(lot.polygon);
              const domeCenter = lot.buildableCircleCenter ?? layout.dome;
              const domeRadius = ((lot.recommendedDomeDiameterM ?? 4) * getMeterToSvgScale()) / 2;
              const domeScale = domeRadius / 3.2;
              const clearRadius = ((lot.buildableCircleDiameterM ?? 0) * getMeterToSvgScale()) / 2;
              const lotHash = typeof lot.number === "number" ? lot.number : parseInt(String(lot.number).replace(/\D/g, "")) || 0;
              const decorType = lotHash % 20;
              
              return (
                <>
                  {/* GEODESIC DOME ICON FOR RESIDENTIAL LOTS */}
                  {detailLevel === "close" && clearRadius > 0 && (
                    <circle
                      cx={domeCenter.x}
                      cy={domeCenter.y}
                      r={clearRadius}
                      fill="none"
                      stroke={isSelected ? "rgba(255,248,236,0.9)" : "rgba(105,84,58,0.38)"}
                      strokeWidth={isSelected ? 0.65 : 0.35}
                      strokeDasharray="1.6 1.4"
                      style={{ pointerEvents: "none" }}
                    >
                      <title>Huella circular disponible: Ø {lot.buildableCircleDiameterM?.toFixed(2)} m</title>
                    </circle>
                  )}
                  <g 
                    transform={`translate(${domeCenter.x}, ${domeCenter.y}) scale(${domeScale})`}
                    style={{ pointerEvents: "none" }}
                  >
                    {/* Shaded dome body with 3D radial gradient */}
                    <circle 
                      cx="0" 
                      cy="0" 
                      r="3.2" 
                      fill="url(#dome-3d)" 
                      stroke={isSelected ? "#A67C52" : "#8F8269"} 
                      strokeWidth="0.4" 
                      filter="url(#shadow)" 
                    />
                    {/* Geodesic triangular wireframe struts */}
                    <path 
                      d="M 2.1 0 L 1.05 1.82 L -1.05 1.82 L -2.1 0 L -1.05 -1.82 L 1.05 -1.82 Z" 
                      fill="none" 
                      stroke={isSelected ? "rgba(166, 124, 82, 0.5)" : "rgba(110, 101, 82, 0.4)"} 
                      strokeWidth="0.2" 
                    />
                    <path 
                      d="M 0 0 L 2.1 0 M 0 0 L 1.05 1.82 M 0 0 L -1.05 1.82 M 0 0 L -2.1 0 M 0 0 L -1.05 -1.82 M 0 0 L 1.05 -1.82" 
                      fill="none" 
                      stroke={isSelected ? "rgba(166, 124, 82, 0.5)" : "rgba(110, 101, 82, 0.4)"} 
                      strokeWidth="0.2" 
                    />
                    <path 
                      d="M 2.1 0 L 3.2 0 M 1.05 1.82 L 1.6 2.77 M -1.05 1.82 L -1.6 2.77 M -2.1 0 L -3.2 0 M -1.05 -1.82 L -1.6 -2.77 M 1.05 -1.82 L 1.6 -2.77" 
                      fill="none" 
                      stroke={isSelected ? "rgba(166, 124, 82, 0.5)" : "rgba(110, 101, 82, 0.4)"} 
                      strokeWidth="0.2" 
                    />
                    {/* Entry vestibule/porch (artistic touch) */}
                    <path 
                      d="M -0.8 2.7 L 0.8 2.7 L 0.6 3.4 L -0.6 3.4 Z" 
                      fill={isSelected ? "#A67C52" : "#D4A373"} 
                      stroke={isSelected ? "#7A5C3D" : "#8F8269"} 
                      strokeWidth="0.2" 
                    />
                  </g>

                  {/* SUBTLE LOT DECORATIONS — only ~25% of lots get one */}
                  {detailLevel === "close" && decorType <= 4 && (
                    <g transform={`translate(${layout.decor.x}, ${layout.decor.y}) scale(0.7)`} style={{ pointerEvents: "none" }}>
                      {decorType === 0 && (
                        /* Firepit */
                        <g>
                          <circle cx="0" cy="0" r="1.1" fill="#7A7568" stroke="#524E46" strokeWidth="0.2" />
                          <circle cx="0" cy="0" r="0.55" fill="url(#fire-grad)" filter="url(#glow)" />
                          <circle cx="-1.3" cy="0" r="0.25" fill="#8F8776" />
                          <circle cx="1.3" cy="0" r="0.25" fill="#8F8776" />
                          <circle cx="0" cy="-1.3" r="0.25" fill="#8F8776" />
                        </g>
                      )}
                      {decorType === 1 && (
                        /* Jacuzzi */
                        <g>
                          <rect x="-1.2" y="-1.2" width="2.4" height="2.4" rx="0.3" fill="#A77A56" stroke="#6E4F36" strokeWidth="0.2" />
                          <circle cx="0" cy="0" r="0.85" fill="url(#pool-grad)" stroke="#FFF" strokeWidth="0.12" opacity="0.9" />
                          <circle cx="0" cy="0" r="0.6" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.1" strokeDasharray="0.8 0.8" />
                        </g>
                      )}
                      {decorType === 2 && (
                        /* Mini Pool */
                        <g>
                          <rect x="-1.4" y="-1.0" width="2.8" height="2.0" rx="0.15" fill="#DFDCD6" stroke="#A6A196" strokeWidth="0.15" />
                          <rect x="-1.1" y="-0.7" width="2.2" height="1.4" rx="0.1" fill="url(#pool-grad)" />
                          <rect x="-1.1" y="-0.7" width="2.2" height="1.4" rx="0.1" fill="url(#water-ripples)" opacity="0.7" />
                        </g>
                      )}
                      {decorType === 3 && (
                        /* Solar Panels */
                        <g>
                          <rect x="-1.2" y="-0.6" width="0.7" height="1.2" rx="0.08" fill="#1A365D" stroke="#FFF" strokeWidth="0.1" />
                          <rect x="-0.35" y="-0.6" width="0.7" height="1.2" rx="0.08" fill="#1A365D" stroke="#FFF" strokeWidth="0.1" />
                          <rect x="0.5" y="-0.6" width="0.7" height="1.2" rx="0.08" fill="#1A365D" stroke="#FFF" strokeWidth="0.1" />
                        </g>
                      )}
                      {decorType === 4 && (
                        /* ATV */
                        <g>
                          <rect x="-0.5" y="-0.35" width="1.0" height="0.7" rx="0.12" fill={lotHash % 2 === 0 ? "#E2725B" : "#D4A373"} stroke={lotHash % 2 === 0 ? "#7A2A1E" : "#8F7A56"} strokeWidth="0.15" />
                          <circle cx="-0.5" cy="-0.35" r="0.15" fill="#1C2024" />
                          <circle cx="0.5" cy="-0.35" r="0.15" fill="#1C2024" />
                          <circle cx="-0.5" cy="0.35" r="0.15" fill="#1C2024" />
                          <circle cx="0.5" cy="0.35" r="0.15" fill="#1C2024" />
                        </g>
                      )}
                    </g>
                  )}
                </>
              );
            })()}

            {hasPin && (
              <g
                transform={`translate(${center.x}, ${center.y - 1.5}) scale(0.12)`}
                style={{ pointerEvents: "none" }}
              >
                {/* SVG Map Pin */}
                <path
                  d="M0 0 C-10 -10 -15 -20 -15 -30 A 15 15 0 1 1 15 -30 C15 -20 10 -10 0 0 Z"
                  fill="#E15A42" // Orange red accent for offer pin
                  stroke="#ffffff"
                  strokeWidth="3"
                  filter="drop-shadow(0px 8px 8px rgba(0,0,0,0.5))"
                />
                <circle cx="0" cy="-30" r="5" fill="#ffffff" />
              </g>
            )}
          </g>
        );
      })}
    </>
  );
}

