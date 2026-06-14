import React from "react";
import { Lot, LotStatus } from "../../../types/map";
import { pathFromPolygon } from "../../../lib/geometry";

const lotFill: Record<LotStatus, string> = {
  available: "#a9bb8d",
  offer: "#d8b07a",
  sold: "#e8e2d7",
  blocked: "#6571df"
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
  return (
    <>
      {lots.map(lot => (
        <path
          key={lot.id}
          d={pathFromPolygon(lot.polygon)}
          fill={lotFill[lot.status]}
          fillOpacity={selectedLotId === lot.id ? 0.8 : 0.4}
          stroke={selectedLotId === lot.id ? "#2D3339" : "#6c6558"}
          strokeWidth={selectedLotId === lot.id ? 2.5 : 1.2}
          strokeLinejoin="round"
          style={{ cursor: "pointer", transition: "all 160ms ease" }}
          onClick={() => onSelect(lot)}
        >
          <title>{lot.id} - {lot.status}</title>
        </path>
      ))}
    </>
  );
}
