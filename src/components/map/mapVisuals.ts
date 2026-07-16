import { Lot } from "../../types/map";

export type LotColorMode = "typology" | "status";
export type MapDetailLevel = "overview" | "detail" | "close";

type VisualConfig = {
  fill: string;
  stroke: string;
  label: string;
};

export const TYPOLOGY_VISUALS: Record<string, VisualConfig> = {
  standard: { fill: "#9DB49A", stroke: "#4F6952", label: "Jardín de Duna · 185 m²" },
  premium: { fill: "#D2B56B", stroke: "#806B35", label: "Oasis · 240 m²" },
  "tiny-house": { fill: "#C77B64", stroke: "#7E4133", label: "Patio Lunar · 150 m²" },
  zen: { fill: "#B59A79", stroke: "#6F5B44", label: "Lote Zen" },
  adjustment: { fill: "#B9B8AE", stroke: "#6F706A", label: "Horizonte irregular · 255 m²" },
  parking: { fill: "#A7A397", stroke: "#68675F", label: "Cochera privada" },
  "parking-external": { fill: "#666C70", stroke: "#3D4245", label: "Cochera común" },
};

export const STATUS_VISUALS: Record<string, VisualConfig> = {
  available: { fill: "#8EAA91", stroke: "#49634F", label: "Disponible" },
  offer: { fill: "#D2674D", stroke: "#873B2C", label: "En oferta" },
  reserved: { fill: "#C4A36E", stroke: "#765C35", label: "Reservado" },
  blocked: { fill: "#C4A36E", stroke: "#765C35", label: "Reservado" },
  sold: { fill: "#444C4C", stroke: "#1E2728", label: "Vendido" },
};

export const TYPOLOGY_LEGEND = [
  TYPOLOGY_VISUALS.standard,
  TYPOLOGY_VISUALS.premium,
  TYPOLOGY_VISUALS["tiny-house"],
  TYPOLOGY_VISUALS.adjustment,
];

export const STATUS_LEGEND = [
  STATUS_VISUALS.available,
  STATUS_VISUALS.offer,
  STATUS_VISUALS.reserved,
  STATUS_VISUALS.sold,
];

export function getLotVisual(lot: Lot, mode: LotColorMode): VisualConfig {
  const isParking = lot.typology === "parking" || lot.typology === "parking-external";

  if (isParking) {
    if (["sold", "reserved", "blocked"].includes(lot.status)) {
      return STATUS_VISUALS[lot.status] ?? STATUS_VISUALS.reserved;
    }
    return TYPOLOGY_VISUALS[lot.typology];
  }

  if (mode === "status") {
    return STATUS_VISUALS[lot.status] ?? STATUS_VISUALS.available;
  }

  if (["sold", "reserved", "blocked"].includes(lot.status)) {
    return STATUS_VISUALS[lot.status] ?? STATUS_VISUALS.reserved;
  }

  return TYPOLOGY_VISUALS[lot.typology] ?? TYPOLOGY_VISUALS.standard;
}
