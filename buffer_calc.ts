import { buildTerrainScene, METER_TO_SVG_SCALE } from './src/lib/terrainModel';
import { shoelaceArea } from './src/lib/geometry';

const { terrain, innerBuffer } = buildTerrainScene();

const grossArea = shoelaceArea(terrain) / (METER_TO_SVG_SCALE * METER_TO_SVG_SCALE);
const innerArea = shoelaceArea(innerBuffer) / (METER_TO_SVG_SCALE * METER_TO_SVG_SCALE);

console.log("Gross:", grossArea);
console.log("Inner:", innerArea);
console.log("Perimeter Buffer Loss:", grossArea - innerArea);
