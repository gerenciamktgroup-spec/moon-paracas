import { buildTerrainScene } from "./src/lib/terrainModel";
import { buildBlocks } from "./src/lib/blockModel";
import { buildLots, buildParkingLots } from "./src/lib/lotModel";
import { buildAmenities } from "./src/lib/amenityModel";
import { buildRoads } from "./src/lib/roadModel";

const t = buildTerrainScene();
const blocks = buildBlocks(t.innerBuffer);
const mainLots = buildLots(blocks);
const parkingLots = buildParkingLots(t.innerBuffer);

const totalLotsArea = mainLots.reduce((acc, l) => acc + l.areaM2, 0);
const totalParkingArea = parkingLots.reduce((acc, l) => acc + l.areaM2, 0);

let mix = {
  premium: 0,
  standard: 0,
  zen: 0,
  "tiny-house": 0,
  adjustment: 0,
  parking: 0
};

mainLots.forEach(l => mix[l.typology]++);
parkingLots.forEach(l => mix[l.typology]++);

console.log(JSON.stringify({
  mainLotsCount: mainLots.length,
  parkingLotsCount: parkingLots.length,
  mix: mix,
  totalLotsArea: totalLotsArea,
  totalParkingArea: totalParkingArea
}, null, 2));
