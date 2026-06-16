import { BlockSpec } from "../types/map";

export const BUSINESS_RULES = {
  perimeterBufferM: 6,
  primaryRoadWidthM: 8,
  secondaryRoadWidthM: 6,
  pedestrianRoadWidthM: 4,
  totalLots: 248,
  averageLotApproxM2: 230,
  legalDisclaimer:
    "Área de uso exclusivo aproximada dentro de un proyecto privado de desarrollo progresivo."
};

export const CONDITIONAL_METADATA = {
  mainAccessSide: "Acceso principal rústico (Provisional - Pendiente de validación final)",
  runoffDirection: "Sentido de escorrentía pluvial preliminar (Sujeto a ingeniería hidráulica)",
  utilitySide: "Puntos de conexión eléctrica/agua provisionales (Sujeto a factibilidad)",
  internalCorridorsValidation: "El diseño de corredores de 6m de ancho requiere conformidad definitiva de Defensa Civil y Municipalidad de Paracas"
};

export const BLOCK_SPECS: BlockSpec[] = [
  // M1-M4: Banda 1-2
  { id: "M1", role: "inner-oasis", targetLotCount: 5, targetNetAreaM2: 1200, lotMix: { standard: 5, premium: 0, adjustment: 0 } },
  { id: "M2", role: "inner-oasis", targetLotCount: 7, targetNetAreaM2: 2300, lotMix: { standard: 0, premium: 0, adjustment: 0, zen: 7 } },
  { id: "M3", role: "inner-oasis", targetLotCount: 10, targetNetAreaM2: 2300, lotMix: { standard: 8, premium: 2, adjustment: 0 } },
  { id: "M4", role: "inner-oasis", targetLotCount: 10, targetNetAreaM2: 1800, lotMix: { standard: 0, premium: 0, adjustment: 0, "tiny-house": 10 } },
  
  // M5-M10: Banda 2-4
  { id: "M5", role: "middle-ring", targetLotCount: 16, targetNetAreaM2: 3000, lotMix: { standard: 0, premium: 0, adjustment: 0, "tiny-house": 16 } },
  { id: "M6", role: "middle-ring", targetLotCount: 18, targetNetAreaM2: 3300, lotMix: { standard: 0, premium: 0, adjustment: 0, "tiny-house": 18 } },
  { id: "M7", role: "middle-ring", targetLotCount: 8, targetNetAreaM2: 1900, lotMix: { standard: 8, premium: 0, adjustment: 0 } },
  { id: "M8", role: "middle-ring", targetLotCount: 8, targetNetAreaM2: 2530, lotMix: { standard: 0, premium: 0, adjustment: 0, zen: 8 } },
  { id: "M9", role: "middle-ring", targetLotCount: 10, targetNetAreaM2: 2300, lotMix: { standard: 8, premium: 2, adjustment: 0 } },
  { id: "M10", role: "middle-ring", targetLotCount: 9, targetNetAreaM2: 2205, lotMix: { standard: 0, premium: 9, adjustment: 0 } },
  
  // M11-M12: Banda 4
  { id: "M11", role: "middle-ring", targetLotCount: 8, targetNetAreaM2: 1960, lotMix: { standard: 0, premium: 8, adjustment: 0 } },
  { id: "M12", role: "middle-ring", targetLotCount: 9, targetNetAreaM2: 2205, lotMix: { standard: 0, premium: 9, adjustment: 0 } },
  
  // M13-M19: Banda 5-7
  { id: "M13", role: "outer-ring", targetLotCount: 9, targetNetAreaM2: 2205, lotMix: { standard: 0, premium: 9, adjustment: 0 } },
  { id: "M14", role: "outer-ring", targetLotCount: 8, targetNetAreaM2: 1960, lotMix: { standard: 0, premium: 8, adjustment: 0 } },
  { id: "M15", role: "outer-ring", targetLotCount: 9, targetNetAreaM2: 2205, lotMix: { standard: 0, premium: 9, adjustment: 0 } },
  { id: "M16", role: "outer-ring", targetLotCount: 8, targetNetAreaM2: 1900, lotMix: { standard: 8, premium: 0, adjustment: 0 } },
  { id: "M17", role: "outer-ring", targetLotCount: 8, targetNetAreaM2: 2530, lotMix: { standard: 0, premium: 0, adjustment: 0, zen: 8 } },
  { id: "M18", role: "outer-ring", targetLotCount: 10, targetNetAreaM2: 2300, lotMix: { standard: 8, premium: 2, adjustment: 0 } },
  { id: "M19", role: "outer-ring", targetLotCount: 10, targetNetAreaM2: 1800, lotMix: { standard: 0, premium: 0, adjustment: 0, "tiny-house": 10 } },
  
  // M20-M24: Banda 7-8
  { id: "M20", role: "north-reserve", targetLotCount: 16, targetNetAreaM2: 3000, lotMix: { standard: 0, premium: 0, adjustment: 0, "tiny-house": 16 } },
  { id: "M21", role: "north-reserve", targetLotCount: 18, targetNetAreaM2: 3300, lotMix: { standard: 0, premium: 0, adjustment: 0, "tiny-house": 18 } },
  { id: "M22", role: "outer-ring", targetLotCount: 5, targetNetAreaM2: 1200, lotMix: { standard: 5, premium: 0, adjustment: 0 } },
  { id: "M23", role: "outer-ring", targetLotCount: 7, targetNetAreaM2: 2300, lotMix: { standard: 0, premium: 0, adjustment: 0, zen: 7 } },
  { id: "M24", role: "outer-ring", targetLotCount: 12, targetNetAreaM2: 2760, lotMix: { standard: 10, premium: 2, adjustment: 0 } }
];
