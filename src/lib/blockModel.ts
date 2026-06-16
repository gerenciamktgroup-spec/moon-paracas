import { BlockPolygon, XY } from "../types/map";
import { getMeterToSvgScale } from "./terrainModel";

export let globalOasisBoundary: XY[] = [];

// Offsets in meters from the Northwest boundary of innerBuffer
export const BAND_OFFSETS = [
  { low: 0, high: 20 },                  // Band 1: M1, M2, M3
  { low: 26, high: 46 },                 // Band 2: M4, M5, M6
  { low: 52, high: 72 },                 // Band 3: M7, M8, M9
  { low: 78, high: 98 },                 // Band 4: M10, M11, M12
  // Oasis: 98 to 133 (35m wide)
  { low: 133, high: 153 },               // Band 5: M13, M14, M15
  { low: 159, high: 179 },               // Band 6: M16, M17, M18
  { low: 185, high: 205 },               // Band 7: M19, M20, M21
  { low: 211, high: 231 }                // Band 8: M22, M23, M24
];

export const BAND_BLOCKS = [
  ["M1", "M2", "M3"],
  ["M4", "M5", "M6"],
  ["M7", "M8", "M9"],
  ["M10", "M11", "M12"],
  ["M13", "M14", "M15"],
  ["M16", "M17", "M18"],
  ["M19", "M20", "M21"],
  ["M22", "M23", "M24"]
];


const BLOCK_LOT_COUNTS: Record<string, number> = {
  M1: 10, M2: 10, M3: 10,
  M4: 10, M5: 10, M6: 11,
  M7: 10, M8: 11, M9: 10,
  M10: 11, M11: 10, M12: 10,
  M13: 10, M14: 10, M15: 11,
  M16: 10, M17: 11, M18: 10,
  M19: 11, M20: 10, M21: 10,
  M22: 10, M23: 10, M24: 12
};

export function getMaxTForD(d: number): number {
  // Pure diagonal from edges to the center entry
  // Center is at d = 115.5
  // Left side: d = 0 to 98
  if (d <= 98) {
    return 0.145 - (0.145 - 0.035) * (d / 98);
  }
  // Center access gap: d = 98 to 133
  if (d > 98 && d < 133) {
    return 0.035;
  }
  // Right side: d = 133 to 231
  if (d >= 133) {
    return 0.035 + (0.145 - 0.035) * ((d - 133) / (231 - 133));
  }
  
  return 0;
}

export function getBandPoint(innerBuffer: XY[], t: number, dMeters: number, scale: number): XY {
  if (innerBuffer.length < 4) {
    return { x: 0, y: 0 };
  }
  // NW boundary is B' -> C' (from t=0 to t=1)
  const B = innerBuffer[1];
  const C = innerBuffer[2];
  const pNW = {
    x: B.x + t * (C.x - B.x),
    y: B.y + t * (C.y - B.y)
  };
  
  // SE boundary is A' -> D' (from t=0 to t=1)
  const A = innerBuffer[0];
  const D = innerBuffer[3];
  const pSE = {
    x: A.x + t * (D.x - A.x),
    y: A.y + t * (D.y - A.y)
  };
  
  // Vector from NW to SE
  const dx = pSE.x - pNW.x;
  const dy = pSE.y - pNW.y;
  const distPixels = Math.sqrt(dx * dx + dy * dy);
  const distMeters = distPixels / scale;
  
  // Map dMeters (0..231) proportionally to the dynamic width distMeters
  const f = Math.max(0, Math.min(1, dMeters / 231));
  const shiftMeters = f * distMeters;
  
  // Unit vector
  const ux = dx / (distPixels || 1);
  const uy = dy / (distPixels || 1);
  
  return {
    x: pNW.x + ux * shiftMeters * scale,
    y: pNW.y + uy * shiftMeters * scale
  };
}

export function buildBlocks(innerBuffer: XY[]): BlockPolygon[] {
  const scale = getMeterToSvgScale();
  const blocks: BlockPolygon[] = [];
  
  if (innerBuffer.length < 4) return [];

  // Generate the central Oasis boundary polygon (curved crater shape)
  const oasisPoly: XY[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // 3 crater-like bulges
    const scallop = 14 * Math.sin(3 * Math.PI * t); 
    const d_low = 103 - Math.max(0, scallop);
    oasisPoly.push(getBandPoint(innerBuffer, t, d_low, scale));
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const scallop = 14 * Math.sin(3 * Math.PI * t);
    const d_high = 128 + Math.max(0, scallop);
    oasisPoly.push(getBandPoint(innerBuffer, t, d_high, scale));
  }
  globalOasisBoundary = oasisPoly;
  
  // Optimized t intervals to maximize land use and eliminate dead space
  const tRanges = [
    { start: 0.02, end: 0.32 }, // Block 0 
    { start: 0.34, end: 0.64 }, // Block 1 
    { start: 0.66, end: 0.98 }  // Block 2 
  ];

  // Now build the blocks for each band
  for (let b = 0; b < 8; b++) {
    const blockIds = BAND_BLOCKS[b];
    const offsets = BAND_OFFSETS[b];
    
    for (let i = 0; i < blockIds.length; i++) {
      const id = blockIds[i];
      let { start: tStart, end: tEnd } = tRanges[i];
      
      let d_low_start = offsets.low;
      let d_low_end = offsets.low;
      let d_high_start = offsets.high;
      let d_high_end = offsets.high;
      
      let t1 = tStart;
      let t2 = tStart;
      
      // Implement Red Line (Mega Parking) cut on the first row of blocks
      if (i === 0) {
        // Continuous diagonal curve matching the parking boundary + 6m gap (0.015)
        t1 = Math.max(tStart, getMaxTForD(d_low_start) + 0.015);
        t2 = Math.max(tStart, getMaxTForD(offsets.high) + 0.015);
        tStart = Math.max(t1, t2);
      }
      
      // Band 4 (M10-M12) borders the NW side of the Oasis
      if (b === 3) {
        const scallopStart = 14 * Math.sin(3 * Math.PI * tStart);
        const scallopEnd = 14 * Math.sin(3 * Math.PI * tEnd);
        d_high_start = 103 - Math.max(0, scallopStart);
        d_high_end = 103 - Math.max(0, scallopEnd);
      }
      // Band 5 (M13-M15) borders the SE side of the Oasis
      if (b === 4) {
        const scallopStart = 14 * Math.sin(3 * Math.PI * tStart);
        const scallopEnd = 14 * Math.sin(3 * Math.PI * tEnd);
        d_low_start = 128 + Math.max(0, scallopStart);
        d_low_end = 128 + Math.max(0, scallopEnd);
      }
      
      const c1 = getBandPoint(innerBuffer, t1, d_low_start, scale);
      const c2 = getBandPoint(innerBuffer, tEnd, d_low_end, scale);
      const c3 = getBandPoint(innerBuffer, tEnd, d_high_end, scale);
      const c4 = getBandPoint(innerBuffer, t2, d_high_start, scale);
      
      const blockPoly = [c1, c2, c3, c4];
      
      const blockCenterD = [10, 36, 62, 88, 143, 169, 195, 221][b];
      let tCenter = (tStart + tEnd) / 2;
      
      // Shift block labels slightly along the shared roads to prevent 100% overlap
      if (b === 0) {
        tCenter -= 0.05;
      } else if (b === 1) {
        tCenter += 0.05;
      } else if (b === 6) {
        tCenter -= 0.05;
      } else if (b === 7) {
        tCenter += 0.05;
      }
      
      const labelD = b < 4 ? blockCenterD - 6.5 : blockCenterD + 6.5;
      const labelPoint = getBandPoint(innerBuffer, tCenter, labelD, scale);
      
      let role = "outer-ring";
      if (["M1", "M2", "M3", "M4"].includes(id)) {
        role = "inner-oasis";
      } else if (["M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"].includes(id)) {
        role = "middle-ring";
      } else if (["M20", "M21"].includes(id)) {
        role = "north-reserve";
      }
      
      blocks.push({
        id,
        role,
        polygon: blockPoly,
        labelPoint,
        ringData: {
          innerPoly: [],
          outerPoly: [],
          t_start: tStart, // logical start for calculating dt
          t_end: tEnd,
          t_start_low: t1,
          t_start_high: t2,
          isFirstRow: i === 0
        }
      });
    }
  }
  
  return blocks;
}
