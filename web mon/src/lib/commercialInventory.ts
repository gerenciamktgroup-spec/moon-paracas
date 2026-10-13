import {
  COMMERCIAL_PRICE_VERSION,
  getLotPricePEN,
  PRIVATE_PARKING_PRICE_PEN,
} from "../config/pricing";
import type { Lot, LotStatus } from "../types/map";
import {
  REAL_MASTERPLAN_MODEL,
  type RealParkingStall,
  type RealUrbanLot,
} from "./realUrbanMasterplanModel";

const MASTERPLAN_VERSION = "lote-matriz-utm-18s-v1";

function toLotStatus(status: RealUrbanLot["status"]): LotStatus {
  if (status === "reservado") return "reserved";
  if (status === "vendido") return "sold";
  return "available";
}

export function realUrbanLotToCommercial(lot: RealUrbanLot): Lot {
  const pricePen = getLotPricePEN(lot.areaM2);
  const isPremium = lot.areaM2 === 240;

  return {
    id: lot.id,
    blockId: `A${lot.aldea}`,
    projectId: "moon-paracas",
    typology: isPremium ? "premium" : "standard",
    status: toLotStatus(lot.status),
    areaM2: lot.areaM2,
    polygon: lot.polygon,
    dimensions: `${lot.widthM.toFixed(2)} m × ${lot.depthM.toFixed(2)} m`,
    price: pricePen,
    number: lot.id,
    quadrant: lot.aldeaName,
    area: lot.areaM2,
    elevation: 0,
    distanceToPool: Math.round(Math.hypot(lot.centroid.x, lot.centroid.y - 10)),
    hubDistance: 0,
    frontage: lot.widthM,
    depth: lot.depthM,
    price_soles: pricePen,
    fitsDome4m: true,
    fitsDome8m: lot.compatibleDomes.includes(8),
    recommendedDomeDiameterM: lot.compatibleDomes.includes(8) ? 8 : 4,
    placementSource: "masterplan-v4",
    masterplanVersion: MASTERPLAN_VERSION,
    commercialPriceVersion: COMMERCIAL_PRICE_VERSION,
  };
}

export function realParkingToCommercial(stall: RealParkingStall): Lot {
  return {
    id: stall.id,
    blockId: stall.bay,
    projectId: "moon-paracas",
    typology: "parking",
    status: "available",
    areaM2: 12.5,
    polygon: stall.polygon,
    dimensions: "2.50 m × 5.00 m",
    price: PRIVATE_PARKING_PRICE_PEN,
    number: stall.id,
    quadrant: stall.sector,
    area: 12.5,
    elevation: 0,
    distanceToPool: 0,
    hubDistance: 0,
    price_soles: PRIVATE_PARKING_PRICE_PEN,
    fitsDome4m: false,
    fitsDome8m: false,
    placementSource: "masterplan-v4",
    masterplanVersion: MASTERPLAN_VERSION,
    commercialPriceVersion: COMMERCIAL_PRICE_VERSION,
  };
}

export function buildCommercialInventory(): { allLots: Lot[] } {
  return {
    allLots: [
      ...REAL_MASTERPLAN_MODEL.lots.map(realUrbanLotToCommercial),
      ...REAL_MASTERPLAN_MODEL.parkingStalls.map(realParkingToCommercial),
    ],
  };
}
