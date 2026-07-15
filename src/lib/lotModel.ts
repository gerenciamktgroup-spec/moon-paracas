import { BlockPolygon, Lot, LotStatus, LotTypology, XY } from "../types/map";
import { BLOCK_SPECS } from "../data/business";
import { shoelaceArea, centroid, isPointInPolygon } from "./geometry";
import { getMeterToSvgScale, buildTerrainScene } from "./terrainModel";
import { slicePolyRing, getPointOnPoly, getPointAndNormalOnPoly } from "./curve";
import { BAND_BLOCKS, BAND_OFFSETS, getBandPoint, globalOasisBoundary, getCurvedD } from "./blockModel";
import { checkCollision, assertInsidePerimeter } from "./spatialAnalyzer";
import lotsStatusMap from "../data/lots_status.json";

export interface GeospatialValidator {
  validateCollision(polygon: XY[], obstacles: XY[][], shrinkM?: number): boolean;
  validateInsidePerimeter(polygon: XY[], label: string): void;
}

export const turfValidator: GeospatialValidator = {
  validateCollision(polygon: XY[], obstacles: XY[][], shrinkM = 0.1): boolean {
    return checkCollision(polygon, obstacles, shrinkM);
  },
  validateInsidePerimeter(polygon: XY[], label: string): void {
    assertInsidePerimeter(polygon, label);
  }
};

function makeLotId(n: number) {
  return `LOTE-${n}`;
}

function getLotCorners(polygon: XY[]): { p1: XY; p2: XY; p3: XY; p4: XY } {
  // polygon has (steps + 1) * 2 = 14 points (from steps = 6)
  const steps = 6;
  return {
    p1: polygon[0],
    p2: polygon[steps],
    p3: polygon[steps + 1],
    p4: polygon[polygon.length - 1]
  };
}

// Parallel block subdivision (1 row per block, aligned t-cuts, curved edges)
export function subdivideParallelBlockCustom(block: BlockPolygon, count: number, d_low_val: number, d_high_val: number): XY[][] {
  if (!block.ringData) return [block.polygon];
  
  const { t_start, t_end } = block.ringData;
  const scale = getMeterToSvgScale();
  const { innerBuffer } = buildTerrainScene();
  
  const gap_t = 0.0015;
  const half = Math.floor(count / 2);
  
  // Compute arc length parameters to equalize frontages in curved streets
  const samples = 50;
  const t_vals: number[] = [];
  const arc_lengths: number[] = [0];
  let total_arc = 0;
  
  for (let s = 0; s <= samples; s++) {
    const t = t_start + s * (t_end - t_start) / samples;
    t_vals.push(t);
    if (s > 0) {
      const prev_t = t_vals[s - 1];
      const p_low_prev = getBandPoint(innerBuffer, prev_t, getCurvedD(prev_t, d_low_val), scale);
      const p_low_curr = getBandPoint(innerBuffer, t, getCurvedD(t, d_low_val), scale);
      
      const p_high_prev = getBandPoint(innerBuffer, prev_t, getCurvedD(prev_t, d_high_val), scale);
      const p_high_curr = getBandPoint(innerBuffer, t, getCurvedD(t, d_high_val), scale);
      
      const d_low = Math.hypot(p_low_curr.x - p_low_prev.x, p_low_curr.y - p_low_prev.y) / scale;
      const d_high = Math.hypot(p_high_curr.x - p_high_prev.x, p_high_curr.y - p_high_prev.y) / scale;
      
      const avg_d = (d_low + d_high) / 2;
      total_arc += avg_d;
      arc_lengths.push(total_arc);
    }
  }

  function getRawEqualCuts(): number[] {
    const u: number[] = [t_start];
    const segment = total_arc / count;
    for (let c = 1; c < count; c++) {
      const target = c * segment;
      let idx = 0;
      while (idx < arc_lengths.length && arc_lengths[idx] < target) {
        idx++;
      }
      if (idx === 0) {
        u.push(t_start);
      } else {
        const l_prev = arc_lengths[idx - 1];
        const l_curr = arc_lengths[idx];
        const t_prev = t_vals[idx - 1];
        const t_curr = t_vals[idx];
        const f = (target - l_prev) / (l_curr - l_prev || 1);
        u.push(t_prev + f * (t_curr - t_prev));
      }
    }
    u.push(t_end);
    return u;
  }
  
  const u = getRawEqualCuts();
  const u_half = u[half];
  const lots: XY[][] = [];
  
  function createLotPolygon(t1: number, t2: number): XY[] {
    const curvedEdgeLow: XY[] = [];
    const curvedEdgeHigh: XY[] = [];
    const steps = 6;
    
    for (let s = 0; s <= steps; s++) {
      const curr_t = t1 + (t2 - t1) * (s / steps);
      const curr_d_low = getCurvedD(curr_t, d_low_val);
      curvedEdgeLow.push(getBandPoint(innerBuffer, curr_t, curr_d_low, scale));
    }
    for (let s = steps; s >= 0; s--) {
      const curr_t = t1 + (t2 - t1) * (s / steps);
      const curr_d_high = getCurvedD(curr_t, d_high_val);
      curvedEdgeHigh.push(getBandPoint(innerBuffer, curr_t, curr_d_high, scale));
    }
    
    return [...curvedEdgeLow, ...curvedEdgeHigh];
  }
  
  for (let c = 0; c < count; c++) {
    const t1 = u[c];
    const t2 = u[c + 1];
    
    let t1_shifted = t1;
    let t2_shifted = t2;
    
    if (c < half) {
      t1_shifted = t1 - (gap_t / 2) * ((t1 - t_start) / (u_half - t_start || 1));
    } else {
      t1_shifted = t1 + (gap_t / 2) * ((t_end - t1) / (t_end - u_half || 1));
    }
    
    if (c < half - 1) {
      t2_shifted = t2 - (gap_t / 2) * ((t2 - t_start) / (u_half - t_start || 1));
    } else if (c === half - 1) {
      t2_shifted = u_half - gap_t / 2;
    } else {
      t2_shifted = t2 + (gap_t / 2) * ((t_end - t2) / (t_end - u_half || 1));
    }
    
    lots.push(createLotPolygon(t1_shifted, t2_shifted));
  }
  
  return lots;
}

export function subdivideParallelBlock(block: BlockPolygon, count: number): XY[][] {
  const b = BAND_BLOCKS.findIndex(arr => arr.includes(block.id));
  const offsets = BAND_OFFSETS[b];
  if (!offsets) return [block.polygon];
  return subdivideParallelBlockCustom(block, count, offsets.low, offsets.high);
}

export function subdivideDoubleRowBlock(block: BlockPolygon, count: number): XY[][] {
  const b = BAND_BLOCKS.findIndex(arr => arr.includes(block.id));
  const offsets = BAND_OFFSETS[b];
  if (!offsets) return [block.polygon];
  
  const d_mid = (offsets.low + offsets.high) / 2;
  const countPerRow = Math.floor(count / 2);
  
  const row1 = subdivideParallelBlockCustom(block, countPerRow, offsets.low, d_mid);
  const row2 = subdivideParallelBlockCustom(block, countPerRow, d_mid, offsets.high);
  
  return [...row1, ...row2];
}

export function buildLots(
  blocks: BlockPolygon[],
  parkings: Lot[] = [],
  roadPolys: XY[][] = [],
  activeObstacles: XY[][] = []
): Lot[] {
  let counter = 1;
  let premiumCounter = 0;
  let offerCount = 0;
  const lots: Lot[] = [];
  const scale = getMeterToSvgScale();

  // Seeded shuffle function to select exactly 30 tiny house lots randomly
  function seededShuffle<T>(array: T[], seed: number): T[] {
    const arr = [...array];
    let m = arr.length, t, i;
    let s = seed;
    while (m) {
      s = (s * 9301 + 49297) % 233280;
      i = Math.floor((s / 233280) * m--);
      t = arr[m];
      arr[m] = arr[i];
      arr[i] = t;
    }
    return arr;
  }

  const tinyHousePool: number[] = [];
  // M7-M9: 53 to 104
  for (let c = 53; c <= 104; c++) {
    tinyHousePool.push(c);
  }
  // M22-M24: 209 to 260
  for (let c = 209; c <= 260; c++) {
    tinyHousePool.push(c);
  }

  const shuffledPool = seededShuffle(tinyHousePool, 45); // Seed 45 gives a nice spread
  const selectedOfferCounters = new Set(shuffledPool.slice(0, 30));

  // Helper to compute minimum distance from a point to a polygon of vertices
  function distanceToPolygon(p: XY, poly: XY[]): number {
    if (poly.length === 0) return 100; // default fallback
    let minD = Infinity;
    for (const pt of poly) {
      const d = Math.hypot(p.x - pt.x, p.y - pt.y);
      if (d < minD) minD = d;
    }
    return minD;
  }

  // Cache parking centroids once at the start of buildLots to optimize distance calculations
  const parkingCentroids = parkings ? parkings.map(p => ({
    parking: p,
    centroid: centroid(p.polygon)
  })) : [];

  for (const block of blocks) {
    const spec = BLOCK_SPECS.find(b => b.id === block.id);
    if (!spec) continue;
    
    const b = BAND_BLOCKS.findIndex(arr => arr.includes(block.id));

    const isDoubleRow = ["M7", "M8", "M9", "M22", "M23", "M24"].includes(block.id);
    const subPolygons = isDoubleRow
      ? subdivideDoubleRowBlock(block, spec.targetLotCount)
      : subdivideParallelBlock(block, spec.targetLotCount);

    for (let i = 0; i < spec.targetLotCount; i++) {
      const polygon = subPolygons[i] || block.polygon;
      
      // True mathematically computed area in square meters
      const svgArea = shoelaceArea(polygon);
      const realArea = svgArea / (scale * scale);
      const roundedArea = Math.round(realArea * 100) / 100;

      // Calculate exact frontage and depth
      let frontage = 10;
      let depth = 20;
      let dimensions = "";
      if (polygon.length >= 4) {
        const corners = getLotCorners(polygon);
        const top = Math.hypot(corners.p4.x - corners.p3.x, corners.p4.y - corners.p3.y) / scale;
        const bottom = Math.hypot(corners.p1.x - corners.p2.x, corners.p1.y - corners.p2.y) / scale;
        const avgFrontage = Math.round(((top + bottom) / 2) * 100) / 100;

        const left = Math.hypot(corners.p4.x - corners.p1.x, corners.p4.y - corners.p1.y) / scale;
        const right = Math.hypot(corners.p2.x - corners.p3.x, corners.p2.y - corners.p3.y) / scale;
        const avgDepth = Math.round(((left + right) / 2) * 100) / 100;
        
        frontage = avgFrontage;
        depth = avgDepth;
        dimensions = `${frontage.toFixed(2)}m x ${depth.toFixed(2)}m`;
      }

      // Assign commercial typology
      let finalTypology: LotTypology = "standard";
      if (["M7", "M8", "M9", "M10", "M11", "M12", "M22", "M23", "M24"].includes(block.id)) {
        finalTypology = "tiny-house";
      } else if (["M13", "M14", "M15", "M16", "M17", "M18"].includes(block.id)) {
        finalTypology = "premium";
      } else if (["M1", "M2", "M3", "M4", "M5", "M6"].includes(block.id)) {
        finalTypology = "standard";
      } else if (["M20"].includes(block.id)) {
        finalTypology = "zen";
      } else if (["M28", "M29", "M30"].includes(block.id)) {
        finalTypology = "adjustment";
      }
      
      let status: LotStatus = "available";

      // ── PRICING — Fase 0 / Revista Costos ────────────────────────────────
      const rate = finalTypology === "premium" ? 170 : 120;
      const price = Math.round(roundedArea * rate);
      const priceLabel = `S/ ${price.toLocaleString('es-PE', {maximumFractionDigits:0})}`;

      // Mathematical distances
      const lotCentroid = centroid(polygon);
      const distToPool = Math.round(distanceToPolygon(lotCentroid, globalOasisBoundary) / scale);

      let minParkDist = 100; // fallback
      let assignedParkingType: "externo_ingreso" | "periferico_interno" = "externo_ingreso";
      if (parkingCentroids && parkingCentroids.length > 0) {
        let minD = Infinity;
        let closestP: Lot | null = null;
        for (const pc of parkingCentroids) {
          const d = Math.hypot(lotCentroid.x - pc.centroid.x, lotCentroid.y - pc.centroid.y);
          if (d < minD) {
            minD = d;
            closestP = pc.parking;
          }
        }
        minParkDist = Math.round(minD / scale);
        if (minParkDist > 145) {
          minParkDist = 145;
        }
        if (closestP && (closestP as any).parking_type) {
          assignedParkingType = (closestP as any).parking_type;
        }
      }

      // ── Collision with active obstacles (roads, amenities, cocheras) ──────
      if (activeObstacles && activeObstacles.length > 0) {
        if (checkCollision(polygon, activeObstacles, 0.1)) {
          continue; // Skip lot if it overlaps any active obstacle
        }
      } else if (roadPolys.length > 0 && checkCollision(polygon, roadPolys, 0.1)) {
        continue; // Legacy road fallback
      }

      // ── Bounding Box / Legal Perimeter constraint (Regla A / Phase A) ──────
      assertInsidePerimeter(polygon, `LOTE-${counter}`);

      lots.push({
        id: makeLotId(counter),
        blockId: block.id,
        typology: finalTypology,
        status: status,
        areaM2: roundedArea,
        polygon: polygon,
        dimensions: dimensions,
        priceLabel: priceLabel,
        price: price,
        number: counter,
        quadrant: block.id,
        area: roundedArea,
        elevation: 108 + Math.floor(Math.random() * 5),
        distanceToPool: distToPool,
        hubDistance: minParkDist,
        
        frontage: frontage,
        depth: depth,
        price_soles: price,
        parking_type: assignedParkingType,
        walk_distance_parking_meters: minParkDist,
        walk_distance_oasis_meters: distToPool
      });

      counter++;
    }
  }

  return lots;
}

export function buildParkingLots(
  innerBuffer: XY[],
  obstacles: XY[][] = [],
  roadPolys: XY[][] = []
 ): Lot[] {
  const scale = getMeterToSvgScale();
  const lots: Lot[] = [];
  let parkingCount = 1;
 
  // ── PARKING HUB GEOMETRY: 4 × L-shaped corner hubs ─────────────────────────
  interface HubDef {
    prefix: string;
    quadrant: string;
    parking_type: "externo_ingreso" | "periferico_interno";
    typology: LotTypology;
    arm1: { tStart: number; tEnd: number; dStart: number; dEnd: number; rows: number };
    arm2?: { tStart: number; tEnd: number; dStart: number; dEnd: number; rows: number };
  }
 
  const hubs: HubDef[] = [
    {
      prefix: "SW-", quadrant: "PARKING_SW",
      parking_type: "externo_ingreso", typology: "parking",
      arm1: { tStart: 0.012, tEnd: 0.042, dStart:   1.0, dEnd:  55.0, rows: 2 },
    },
    {
      prefix: "SE-", quadrant: "PARKING_SE",
      parking_type: "externo_ingreso", typology: "parking",
      arm1: { tStart: 0.012, tEnd: 0.042, dStart: 170.0, dEnd: 252.0, rows: 2 },
    },
    {
      prefix: "NW-", quadrant: "PARKING_NW",
      parking_type: "periferico_interno", typology: "parking",
      // arm1: Spans left half of the back border, meeting the center (placed behind the road)
      arm1: { tStart: 0.985, tEnd: 0.985, dStart:   1.0, dEnd: 127.0, rows: 1 },
      arm2: { tStart: 0.877, tEnd: 0.918, dStart:   1.0, dEnd:  57.0, rows: 3 },
    },
    {
      prefix: "NE-", quadrant: "PARKING_NE",
      parking_type: "periferico_interno", typology: "parking",
      // arm1: Spans right half of the back border, starting at the center (placed behind the road)
      arm1: { tStart: 0.985, tEnd: 0.985, dStart: 127.0, dEnd: 254.0, rows: 1 },
      arm2: { tStart: 0.875, tEnd: 0.916, dStart: 197.0, dEnd: 254.5, rows: 3 },
    },
  ];

  function isAdjacentToRoad(polygon: XY[], roadPolysList: XY[][], sScale: number): boolean {
    if (roadPolysList.length === 0) return true;
    const threshold = 45.0 * sScale; // 45 meters threshold
    for (const pt of polygon) {
      for (const roadPoly of roadPolysList) {
        for (const rPt of roadPoly) {
          const d = Math.hypot(pt.x - rPt.x, pt.y - rPt.y);
          if (d <= threshold) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function createParkingLot(
    prefix: string,
    t: number,
    d: number,
    idNum: number,
    quadrant: string,
    parking_type: string,
    typology: LotTypology = "parking"
  ): Lot {
    const curved_d = getCurvedD(t, d);
    const center = getBandPoint(innerBuffer, t, curved_d, scale);
    const nextP  = getBandPoint(innerBuffer, t, curved_d + 1, scale);
    const angle  = Math.atan2(nextP.y - center.y, nextP.x - center.x);

    // True Cartesian 2.5m × 5.0m stall
    const wPx = (2.5 * scale) / 2;
    const dPx = (5.0 * scale) / 2;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const polygon = [
      { x: -wPx, y: -dPx }, { x: wPx, y: -dPx },
      { x:  wPx, y:  dPx }, { x: -wPx, y:  dPx },
    ].map(c => ({
      x: center.x + c.x * cosA - c.y * sinA,
      y: center.y + c.x * sinA + c.y * cosA
    }));

    const isPrivate = typology === "parking";
    const pPrice = isPrivate ? 5000 : 0;
    const pPriceLabel = isPrivate ? "S/ 5,000" : "Uso Común";
    const pStatus = isPrivate ? "available" : "blocked";

    return {
      id: `P-${prefix}${idNum}`,
      number: `P${idNum}`,
      blockId: "PARKING",
      typology,
      areaM2: 12.5,
      status: pStatus,
      priceLabel: pPriceLabel,
      price: pPrice,
      polygon,
      dimensions: "2.5m x 5.0m",
      quadrant,
      area: 12.5,
      elevation: 108,
      distanceToPool: 50,
      hubDistance: 0,
      frontage: 2.5,
      depth: 5.0,
      price_soles: pPrice,
      parking_type: parking_type as any,
      walk_distance_parking_meters: 0,
      walk_distance_oasis_meters: 50
    };
  }

  // ── Generate stalls arm-by-arm with collision mask ────────────────────────
  const generatedAllParkingPolys: XY[][] = [];
  for (const hub of hubs) {
    let count = 0;
    const TARGET_PER_HUB = 65;

    // Arm 1 — long arm
    const arm1 = hub.arm1;
    const a1_cols = Math.floor((arm1.dEnd - arm1.dStart) / 2.8); // ~2.8m spacing = 2.5m stall + 0.3m gap
    for (let row = 0; row < arm1.rows && count < TARGET_PER_HUB; row++) {
      const t_row = arm1.tStart + row * (arm1.tEnd - arm1.tStart) / Math.max(arm1.rows - 1, 1);
      for (let col = 0; col < a1_cols && count < TARGET_PER_HUB; col++) {
        const d_col = arm1.dStart + col * (arm1.dEnd - arm1.dStart) / Math.max(a1_cols - 1, 1);
        const p = createParkingLot(hub.prefix, t_row, d_col, parkingCount, hub.quadrant, hub.parking_type, hub.typology);
        
        // ── Inside innerBuffer boundary check ──────────────────────────────
        const inside = p.polygon.every(pt => isPointInPolygon(pt, innerBuffer));
        if (!inside) continue;

        // ── Connectivity check: must not be isolated ────────────────────────
        if (!isAdjacentToRoad(p.polygon, roadPolys, scale)) continue;

        // ── Collision mask: external obstacles + already placed hub stalls ──
        const allObstacles = obstacles.length > 0 ? [...obstacles, ...generatedAllParkingPolys] : generatedAllParkingPolys;
        if (allObstacles.length === 0 || !checkCollision(p.polygon, allObstacles, 0.05)) {
          assertInsidePerimeter(p.polygon, p.id); // Regla A / Phase A
          generatedAllParkingPolys.push(p.polygon);
          lots.push(p);
          parkingCount++; // Increment only on success!
          count++;
        }
      }
    }

    // Arm 2 — short fold arm (L-shape articulation)
    const arm2 = hub.arm2;
    if (arm2) {
      const a2_cols = Math.floor((arm2.dEnd - arm2.dStart) / 2.8);
      for (let row = 0; row < arm2.rows && count < TARGET_PER_HUB; row++) {
        const t_row = arm2.tStart + row * (arm2.tEnd - arm2.tStart) / Math.max(arm2.rows - 1, 1);
        for (let col = 0; col < a2_cols && count < TARGET_PER_HUB; col++) {
          const d_col = arm2.dStart + col * (arm2.dEnd - arm2.dStart) / Math.max(a2_cols - 1, 1);
          const p = createParkingLot(hub.prefix, t_row, d_col, parkingCount, hub.quadrant, hub.parking_type, hub.typology);
          
          // ── Inside innerBuffer boundary check ──────────────────────────────
          const inside = p.polygon.every(pt => isPointInPolygon(pt, innerBuffer));
          if (!inside) continue;
  
          // ── Connectivity check: must not be isolated ────────────────────────
          if (!isAdjacentToRoad(p.polygon, roadPolys, scale)) continue;
  
          // ── Collision mask: external obstacles + already placed hub stalls ──
          const allObstacles2 = obstacles.length > 0 ? [...obstacles, ...generatedAllParkingPolys] : generatedAllParkingPolys;
          if (allObstacles2.length === 0 || !checkCollision(p.polygon, allObstacles2, 0.05)) {
            assertInsidePerimeter(p.polygon, p.id); // Regla A / Phase A
            generatedAllParkingPolys.push(p.polygon);
            lots.push(p);
            parkingCount++; // Increment only on success!
            count++;
          }
        }
      }
    }
  }

  return lots;
}
