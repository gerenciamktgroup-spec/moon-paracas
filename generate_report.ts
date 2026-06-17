import fs from 'fs';

const data = JSON.parse(fs.readFileSync('audit_output.json', 'utf-8'));

const { grossArea, totalLotArea, totalBlockArea, totalAmenityArea, lots, blocks } = data;

// 1. Calculations
const numLots = lots.length;
const numBlocks = blocks.length;

let minArea = Infinity;
let maxArea = -Infinity;
let sumArea = 0;
const areas = lots.map(l => l.area).sort((a, b) => a - b);

const sizeBands = {
  '<200': 0,
  '200-225': 0,
  '225-250': 0,
  '250-275': 0,
  '275-300': 0,
  '>300': 0
};

for (const a of areas) {
  sumArea += a;
  minArea = Math.min(minArea, a);
  maxArea = Math.max(maxArea, a);

  if (a < 200) sizeBands['<200']++;
  else if (a < 225) sizeBands['200-225']++;
  else if (a < 250) sizeBands['225-250']++;
  else if (a < 275) sizeBands['250-275']++;
  else if (a < 300) sizeBands['275-300']++;
  else sizeBands['>300']++;
}

const avgArea = sumArea / numLots;
const medianArea = areas[Math.floor(areas.length / 2)];

// Standard deviation
let sumSqDiff = 0;
for (const a of areas) {
  sumSqDiff += Math.pow(a - avgArea, 2);
}
const stdevArea = Math.sqrt(sumSqDiff / numLots);

// Blocks summary
const blockStats = {};
for (const l of lots) {
  if (!blockStats[l.blockId]) {
    blockStats[l.blockId] = { count: 0, min: Infinity, max: -Infinity, sum: 0 };
  }
  const s = blockStats[l.blockId];
  s.count++;
  s.sum += l.area;
  s.min = Math.min(s.min, l.area);
  s.max = Math.max(s.max, l.area);
}

const bufferArea = grossArea - (totalBlockArea + totalAmenityArea + (grossArea * 0.15)); // approximation for roads if roads are not strictly polygons
// Actually, totalBlockArea + totalAmenityArea + Roads + Buffer = GrossArea.
// Let's print out the raw numbers so the AI can interpret them.

console.log("GROSS AREA:", grossArea);
console.log("TOTAL LOT AREA:", totalLotArea);
console.log("TOTAL BLOCK AREA:", totalBlockArea);
console.log("TOTAL AMENITY AREA:", totalAmenityArea);
console.log("ESTIMATED ROAD AREA (TotalBlockArea - TotalLotArea) is 0 because lots completely fill blocks right now.");
console.log("LOT COUNT:", numLots);
console.log("BLOCK COUNT:", numBlocks);
console.log("MIN AREA:", minArea);
console.log("MAX AREA:", maxArea);
console.log("AVG AREA:", avgArea);
console.log("MEDIAN AREA:", medianArea);
console.log("STDEV:", stdevArea);
console.log("BANDS:", sizeBands);
console.log("BLOCK STATS:", blockStats);
