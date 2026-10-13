import { getLotPriceUSD } from "../src/config/pricing";
import { buildCommercialInventory } from "../src/lib/commercialInventory";
import {
  REAL_MASTERPLAN_MODEL,
  REAL_PERIMETER_LOCAL,
  calculatePolygonArea,
  pointInPolygon,
} from "../src/lib/realUrbanMasterplanModel";

const EXPECTED_LOTS = 384;
const EXPECTED_PARKING = 192;

const errors: string[] = [];
const model = REAL_MASTERPLAN_MODEL;
const commercial = buildCommercialInventory();

if (model.stats.totalLots !== EXPECTED_LOTS) {
  errors.push(`lots ${model.stats.totalLots} !== ${EXPECTED_LOTS}`);
}

for (const key of [1, 2, 3, 4] as const) {
  if (model.stats.byAldea[key] !== 96) {
    errors.push(`aldea ${key} has ${model.stats.byAldea[key]} lots, expected 96`);
  }
}

if (model.stats.parkingStallsCount !== EXPECTED_PARKING) {
  errors.push(`parking ${model.stats.parkingStallsCount} !== ${EXPECTED_PARKING}`);
}

const outside = model.lots.filter(
  (lot) => !lot.polygon.every((pt) => pointInPolygon(pt, REAL_PERIMETER_LOCAL)),
);
if (outside.length > 0) {
  errors.push(`${outside.length} lots have a vertex outside the UTM perimeter`);
}

const priceMismatch = model.lots.filter((lot) => lot.precioUsd !== getLotPriceUSD(lot.areaM2));
if (priceMismatch.length > 0) {
  errors.push(`${priceMismatch.length} lots have prices that do not match pricing.ts`);
}

const residential = commercial.allLots.filter((lot) => lot.typology !== "parking");
if (residential.length !== EXPECTED_LOTS) {
  errors.push(`commercial residential lots ${residential.length} !== ${EXPECTED_LOTS}`);
}

const perimeterM2 = calculatePolygonArea(REAL_PERIMETER_LOCAL);
if (Math.abs(perimeterM2 - 112591.8) / 112591.8 > 0.02) {
  errors.push(`perimeter shoelace ${perimeterM2.toFixed(2)} m² diverges from 112,591.80 m²`);
}

if (errors.length > 0) {
  console.error("GEOMETRY VERIFY FAILED");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      lots: model.stats.totalLots,
      byAldea: model.stats.byAldea,
      byTipo: model.stats.byTipo,
      parking: model.stats.parkingStallsCount,
      vendibleM2: model.stats.totalVendibleM2,
      oasisM2: model.stats.oasisAreaM2,
      perimeterM2: Number(perimeterM2.toFixed(2)),
      commercialLots: commercial.allLots.length,
    },
    null,
    2,
  ),
);
