import { buildBlocks } from './src/lib/blockModel';
import { buildLots } from './src/lib/lotModel';
import { buildAmenities } from './src/lib/amenityModel';
import { buildRoads } from './src/lib/roadModel';
import { shoelaceArea } from './src/lib/geometry';
import { buildTerrainScene, METER_TO_SVG_SCALE } from './src/lib/terrainModel';

const { terrain, innerBuffer } = buildTerrainScene();

const blocks = buildBlocks(innerBuffer);
const lots = buildLots(blocks);
const amenities = buildAmenities(innerBuffer);

function svgAreaToM2(svgArea: number) {
  return svgArea / (METER_TO_SVG_SCALE * METER_TO_SVG_SCALE);
}

const grossArea = svgAreaToM2(shoelaceArea(terrain));
let totalLotArea = 0;
const lotAreas = [];

for (const lot of lots) {
  totalLotArea += lot.area;
  lotAreas.push(lot.area);
}

let totalBlockArea = 0;
for (const block of blocks) {
  totalBlockArea += svgAreaToM2(shoelaceArea(block.polygon));
}

let totalAmenityArea = 0;
for (const am of amenities) {
  totalAmenityArea += svgAreaToM2(shoelaceArea(am.polygon));
}

const report = {
  grossArea,
  totalLotArea,
  totalBlockArea,
  totalAmenityArea,
  lots: lots.map(l => ({ id: l.id, blockId: l.blockId, area: l.area, number: l.number })),
  blocks: blocks.map(b => ({ id: b.id, area: svgAreaToM2(shoelaceArea(b.polygon)) })),
  amenities: amenities.map(a => ({ id: a.id, kind: a.kind, area: svgAreaToM2(shoelaceArea(a.polygon)) }))
};

import fs from 'fs';
fs.writeFileSync('audit_output.json', JSON.stringify(report, null, 2));
