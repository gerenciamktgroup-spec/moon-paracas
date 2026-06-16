import React, { useState } from "react";
import { Lot, LotStatus } from "../../../types/map";
import { pathFromPolygon, centroid } from "../../../lib/geometry";

const statusConfig: Record<LotStatus, { fill: string; stroke: string; label: string }> = {
  available: { fill: "#748D70",  stroke: "#4A5D47", label: "DISPONIBLE" },
  offer:     { fill: "#8EA98A",  stroke: "#627B5E", label: "EN OFERTA"  },
  sold:      { fill: "#D6D1CA",  stroke: "#B5B0A9", label: "VENDIDO"    },
  blocked:   { fill: "#EADCC9",  stroke: "#CBBDAA", label: "RESERVADO"  },
};

export function LotsLayer({
  lots,
  selectedLotId,
  onSelect
}: {
  lots: Lot[];
  selectedLotId?: string;
  onSelect: (lot: Lot) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <>
      {lots.map(lot => {
        const cfg = statusConfig[lot.status];
        const isSelected = selectedLotId === lot.id;
        const isHovered = hoveredId === lot.id;

        const isInternalParking = lot.typology === "parking";
        const isExternalParking = lot.typology === "parking-external";
        const isParking = isInternalParking || isExternalParking;

        // Removed typology overrides per user request (all green), except parking
        const fill = isInternalParking ? "#8a8172" : isExternalParking ? "#5c6065" : cfg.fill;
        const baseStroke = isInternalParking ? "#6e675b" : isExternalParking ? "#45484c" : cfg.stroke;

        // Transparent tint for residential lots, and semi-transparent for parking
        const fillOpacity = isParking ? (isSelected ? 0.7 : isHovered ? 0.6 : 0.4) : (isSelected ? 0.3 : isHovered ? 0.2 : 0.08);
        const strokeColor = isSelected ? "#A67C52" : baseStroke;
        const strokeWidth = isSelected ? 2.5 : isHovered ? 1.5 : 0.8;

        const hasPin = !isParking && (lot.status === "available" || lot.status === "offer");
        const center = hasPin ? centroid(lot.polygon) : { x: 0, y: 0 };

        return (
          <g key={lot.id}>
            <path
              d={pathFromPolygon(lot.polygon)}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              style={{
                cursor: "pointer",
                transition: "fill-opacity 200ms ease, stroke-width 200ms ease",
                filter: isSelected ? "drop-shadow(0 2px 4px rgba(166,124,82,0.4))" : "none"
              }}
              onClick={() => onSelect(lot)}
              onMouseEnter={() => setHoveredId(lot.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <title>Lote {lot.number} — {cfg.label} — {lot.areaM2.toFixed(2)} m²</title>
            </path>
            {hasPin && (
              <g
                transform={`translate(${center.x}, ${center.y - 1.5}) scale(0.12)`}
                style={{ pointerEvents: "none" }}
              >
                {/* SVG Map Pin */}
                <path
                  d="M0 0 C-10 -10 -15 -20 -15 -30 A 15 15 0 1 1 15 -30 C15 -20 10 -10 0 0 Z"
                  fill={lot.status === "offer" ? "#8EA98A" : "#748D70"}
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

