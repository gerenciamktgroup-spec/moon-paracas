/**
 * MOON PARACAS — 3D Configurator Types
 * World scale rule: 1 Three.js unit = 1.00 real meter
 * All dimensions are absolute metric values. Never scale furniture/amenities with dome diameter.
 */

export type LotSize = 120 | 240;
export type DomeDiameter = 6 | 7 | 8; // meters
export type TimeOfDay = "day" | "night";
export type CameraPreset = "aerial" | "suite" | "deck" | "plan-cut";

/** Lot physical dimensions (meters) */
export const LOT_DIMENSIONS: Record<LotSize, { width: number; depth: number }> = {
  120: { width: 10, depth: 12 },
  240: { width: 12, depth: 20 },
};

/** Dome footprints (circular area in m²) */
export const DOME_FOOTPRINT: Record<DomeDiameter, number> = {
  6: 28.274, // π * 3²
  7: 38.485, // π * 3.5²
  8: 50.265, // π * 4²
};

/** Fixed interior modules — NEVER scale these */
export const INTERIOR_MODULES = {
  kingBed: {
    id: "king-bed",
    name: "Cama King",
    width: 2.2,
    depth: 2.2,
    height: 0.55,
  },
  bathPod: {
    id: "bath-pod",
    name: "Bath Pod",
    width: 2.2,
    depth: 1.8,
    height: 2.2,
  },
  kitchenette: {
    id: "kitchenette",
    name: "Kitchenette",
    width: 2.4,
    depth: 0.65,
    height: 0.9,
  },
} as const;

/** Fixed exterior amenities — NEVER scale these */
export const EXTERIOR_AMENITIES = {
  deckPergola: {
    id: "deck-pergola",
    name: "Deck + Pérgola",
    width: 4.5,
    depth: 4.0,
    height: 2.6,
    areaM2: 18,
  },
  plungePool: {
    id: "plunge-pool",
    name: "Plunge Pool",
    width: 2.5,
    depth: 2.5,
    waterDepth: 1.1,
    areaM2: 6.25,
  },
  firepit: {
    id: "firepit",
    name: "Firepit Zen",
    diameter: 1.2,
    height: 0.35,
  },
  accessPath: {
    id: "access-path",
    name: "Sendero de Acceso",
    width: 0.9,
  },
} as const;

/** Setback rules (Paracas / common coastal desert practice) */
export const SETBACKS = {
  front: 1.5,
  side: 1.0,
  rear: 1.5,
} as const;

/** Quiet Luxury brand palette */
export const PALETTE = {
  night: "#161310",
  sand: "#F7F1E8",
  sandWarm: "#F4EFE6",
  clay: "#B85A3D",
  olive: "#4A5F44",
  water: "#3D5C5A",
  woodDark: "#3A2F28",
  woodTeak: "#8B6F47",
  concrete: "#C4B8A8",
  pirca: "#A89B8C",
  gold: "#C5A059",
} as const;

export interface ConfiguratorState {
  lotSize: LotSize;
  domeDiameter: DomeDiameter;
  timeOfDay: TimeOfDay;
  cameraPreset: CameraPreset;
  coverOpacity: number;
  showDeck: boolean;
  showPlunge: boolean;
  showFirepit: boolean;
  showVegetation: boolean;
  showScaleBar: boolean;
  clippingEnabled: boolean;
}

export interface SpatialMetrics {
  lotAreaM2: number;
  domeFootprintM2: number;
  amenitiesAreaM2: number;
  occupiedM2: number;
  freePatioM2: number;
  occupancyPercent: number;
  status: "VALIDO" | "JUSTO" | "NO_RECOMENDADO" | "BLOQUEADO";
  statusLabel: string;
}

export function computeSpatialMetrics(
  lotSize: LotSize,
  domeDiameter: DomeDiameter,
  amenities: { deck: boolean; plunge: boolean }
): SpatialMetrics {
  const lotArea = lotSize;
  const domeFootprint = DOME_FOOTPRINT[domeDiameter];
  let amenitiesArea = 0;
  if (amenities.deck) amenitiesArea += EXTERIOR_AMENITIES.deckPergola.areaM2;
  if (amenities.plunge) amenitiesArea += EXTERIOR_AMENITIES.plungePool.areaM2;

  const occupied = domeFootprint + amenitiesArea;
  const free = Math.max(0, lotArea - occupied);
  const occupancy = (occupied / lotArea) * 100;

  let status: SpatialMetrics["status"] = "VALIDO";
  let statusLabel = "VÁLIDO · EXCELENTE RETIRO";

  if (lotSize === 120 && domeDiameter === 8) {
    status = "BLOQUEADO";
    statusLabel = "BLOQUEADO · SUPERA RETIROS";
  } else if (occupancy > 48) {
    status = "NO_RECOMENDADO";
    statusLabel = "NO RECOMENDADO · SOBREOCUPADO";
  } else if (occupancy > 38) {
    status = "JUSTO";
    statusLabel = "JUSTO · RETIRO MÍNIMO";
  }

  return {
    lotAreaM2: lotArea,
    domeFootprintM2: domeFootprint,
    amenitiesAreaM2: amenitiesArea,
    occupiedM2: occupied,
    freePatioM2: free,
    occupancyPercent: occupancy,
    status,
    statusLabel,
  };
}
