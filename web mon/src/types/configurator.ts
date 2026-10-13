export type LotArea = 120 | 240;
export type DomeDiameter = 6 | 7 | 8;
export type TimeOfDay = "day" | "golden" | "night";
export type CameraPreset = "iso" | "interior" | "deck" | "top";
export type StylePresetId = "founder" | "desert-lodge" | "noche-estelar" | "ritual-240";

export type BathLocation = "inside" | "outside";
export type WaterFeature = "none" | "plunge" | "jacuzzi";
export type GroundTreatment = "xeriscape" | "lawn" | "mixed";

export interface Dimensions3D {
  width: number;
  depth: number;
  height: number;
}

export interface MetricData {
  lotAreaM2: number;
  footprintM2: number;
  deckM2: number;
  waterM2: number;
  bathOutdoorM2: number;
  totalOccupiedM2: number;
  freeYardM2: number;
  occupancyPercent: number;
  status: "VÁLIDO" | "JUSTO" | "NO RECOMENDADO";
  estimatedPriceUSD: number;
}

export interface StylePresetDef {
  id: StylePresetId;
  title: string;
  subtitle: string;
  tag: string;
  coverProgress: number;
  timeOfDay: TimeOfDay;
  cameraPreset: CameraPreset;
  bathLocation: BathLocation;
  waterFeature: WaterFeature;
  groundTreatment: GroundTreatment;
  requiredLot?: LotArea;
  forceDiameter?: DomeDiameter;
  amenities?: Partial<{
    deck: boolean;
    firepit: boolean;
    garden: boolean;
    path: boolean;
    scaleRod: boolean;
  }>;
}

export const STYLE_PRESETS: StylePresetDef[] = [
  {
    id: "founder",
    title: "Founder",
    subtitle: "Estructura Pura",
    tag: "Base",
    coverProgress: 0.15,
    timeOfDay: "day",
    cameraPreset: "iso",
    bathLocation: "inside",
    waterFeature: "none",
    groundTreatment: "xeriscape",
  },
  {
    id: "desert-lodge",
    title: "Desert Lodge",
    subtitle: "Timber-Glass",
    tag: "Principal",
    coverProgress: 0.45,
    timeOfDay: "golden",
    cameraPreset: "deck",
    bathLocation: "inside",
    waterFeature: "plunge",
    groundTreatment: "xeriscape",
  },
  {
    id: "noche-estelar",
    title: "Noche Estelar",
    subtitle: "Piel Adobe",
    tag: "Atmósfera",
    coverProgress: 0.90,
    timeOfDay: "night",
    cameraPreset: "interior",
    bathLocation: "inside",
    waterFeature: "jacuzzi",
    groundTreatment: "mixed",
  },
  {
    id: "ritual-240",
    title: "Ritual 240",
    subtitle: "Master Suite Ø8m",
    tag: "240 m²",
    coverProgress: 0.50,
    timeOfDay: "golden",
    cameraPreset: "deck",
    bathLocation: "outside",
    waterFeature: "plunge",
    groundTreatment: "mixed",
    requiredLot: 240,
    forceDiameter: 8,
    amenities: {
      deck: true,
      firepit: true,
      garden: true,
      path: true,
      scaleRod: false,
    },
  },
];

export interface DomeSpecs {
  diameter: DomeDiameter;
  radius: number;
  height: number;
  footprintM2: number;
  preset: "Studio" | "Executive" | "Suite Lounge";
  basePriceUSD: number;
}

export const DOME_SPECS_MAP: Record<DomeDiameter, DomeSpecs> = {
  6: {
    diameter: 6,
    radius: 3.0,
    height: 2.45,
    footprintM2: 28.27,
    preset: "Studio",
    basePriceUSD: 34000,
  },
  7: {
    diameter: 7,
    radius: 3.5,
    height: 2.82,
    footprintM2: 38.48,
    preset: "Executive",
    basePriceUSD: 44000,
  },
  8: {
    diameter: 8,
    radius: 4.0,
    height: 3.25,
    footprintM2: 50.27,
    preset: "Suite Lounge",
    basePriceUSD: 56000,
  },
};

export const LOT_SPECS_MAP: Record<LotArea, { width: number; depth: number; maxDiameter: DomeDiameter }> = {
  120: { width: 10.0, depth: 12.0, maxDiameter: 7 },
  240: { width: 12.0, depth: 20.0, maxDiameter: 8 },
};

// FIXED REAL-WORLD DIMENSIONS (1 Three.js Unit = 1.00 Meter)
export const FIXED_FURNITURE = {
  kingBed: { width: 2.20, depth: 2.20, height: 0.55 },
  nightstand: { width: 0.45, depth: 0.45, height: 0.45 },
  bathPod: { width: 2.20, depth: 1.80, height: 2.10 },
  kitchenette: { width: 1.80, depth: 0.65, height: 0.90 },
  lounge: { width: 2.00, depth: 0.90, height: 0.45 },
};

export const FIXED_EXTERIOR = {
  plungePool: { width: 2.50, depth: 2.50, height: 0.60, waterDepth: 1.10, areaM2: 5.0 },
  jacuzzi: { diameter: 2.10, height: 0.85, areaM2: 3.5 },
  outdoorBath: { width: 2.20, depth: 1.80, height: 2.30, areaM2: 4.0 },
  firepit: { diameter: 1.20, height: 0.25 },
  deck: { width: 6.00, depth: 3.20, height: 0.20, areaM2: 18.0 },
  pergola: { width: 5.60, depth: 2.80, height: 2.70, slatSep: 0.28 },
  path: { width: 0.90 },
  scaleRod: { height: 1.00, diameter: 0.07, color: "#FF6B00" },
};

export const PALETTE = {
  sandBase: 0xf5efe6,
  desertNight: 0x161310,
  warmWood: 0x5c422f,
  teakDeck: 0xa88764,
  calicheStone: 0x9e8e78,
  calicheBase: 0xc4a574,
  calicheWarm: 0xb89a6a,
  calicheOchre: 0xac8e5e,
  calicheLight: 0xd0b888,
  terracotta: 0xa84f36,
  pvcMembrane: 0xf4efe6,
  glassCyan: 0xdff2f5,
  oasisWater: 0x3d5c5a,
  agaveGreen: 0x4e6646,
  cactusGreen: 0x5a7551,
  scaleOrange: 0xff6b00,
};
