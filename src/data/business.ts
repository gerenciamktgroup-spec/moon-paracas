import { BlockSpec } from "../types/map";

export const BUSINESS_RULES = {
  perimeterBufferM: 4,
  primaryRoadWidthM: 8,
  secondaryRoadWidthM: 6,
  pedestrianRoadWidthM: 4,
  totalLots: 234,
  averageLotApproxM2: 250,
  legalDisclaimer:
    "Área de uso exclusivo aproximada dentro de un proyecto privado de desarrollo progresivo."
};

export const BLOCK_SPECS: BlockSpec[] = [
  { id: "M1", role: "access-west", targetLotCount: 14, targetNetAreaM2: 3500, lotMix: { standard: 10, premium: 2, adjustment: 2 } },
  { id: "M2", role: "access-east", targetLotCount: 14, targetNetAreaM2: 3500, lotMix: { standard: 10, premium: 2, adjustment: 2 } },
  { id: "M3", role: "south-west", targetLotCount: 16, targetNetAreaM2: 4000, lotMix: { standard: 12, premium: 2, adjustment: 2 } },
  { id: "M4", role: "south-east", targetLotCount: 16, targetNetAreaM2: 4000, lotMix: { standard: 12, premium: 2, adjustment: 2 } },
  { id: "M5", role: "central-west", targetLotCount: 18, targetNetAreaM2: 4500, lotMix: { standard: 14, premium: 3, adjustment: 1 } },
  { id: "M6", role: "central-east", targetLotCount: 18, targetNetAreaM2: 4500, lotMix: { standard: 14, premium: 3, adjustment: 1 } },
  { id: "M7", role: "oasis-west", targetLotCount: 22, targetNetAreaM2: 5500, lotMix: { standard: 16, premium: 5, adjustment: 1 } },
  { id: "M8", role: "oasis-east", targetLotCount: 22, targetNetAreaM2: 5500, lotMix: { standard: 16, premium: 5, adjustment: 1 } },
  { id: "M9", role: "north-west", targetLotCount: 22, targetNetAreaM2: 5450, lotMix: { standard: 18, premium: 2, adjustment: 2 } },
  { id: "M10", role: "north-east", targetLotCount: 22, targetNetAreaM2: 5450, lotMix: { standard: 18, premium: 2, adjustment: 2 } },
  { id: "M11", role: "north-remate-west", targetLotCount: 25, targetNetAreaM2: 6250, lotMix: { standard: 19, premium: 5, adjustment: 1 } },
  { id: "M12", role: "north-remate-east", targetLotCount: 25, targetNetAreaM2: 6250, lotMix: { standard: 19, premium: 5, adjustment: 1 } }
];
