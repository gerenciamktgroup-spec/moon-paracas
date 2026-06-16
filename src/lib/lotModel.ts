import { BlockPolygon, Lot, LotStatus, LotTypology, XY } from "../types/map";
import { BLOCK_SPECS } from "../data/business";
import { shoelaceArea, centroid } from "./geometry";
import { getMeterToSvgScale, buildTerrainScene } from "./terrainModel";
import { slicePolyRing, getPointOnPoly, getPointAndNormalOnPoly } from "./curve";
import { BAND_BLOCKS, BAND_OFFSETS, getBandPoint, globalOasisBoundary } from "./blockModel";
import { checkCollision } from "./spatialAnalyzer";


function makeLotId(n: number) {
  return `L${String(n).padStart(3, "0")}`;
}

function inferStatus(n: number): LotStatus {
  // Oferta comercial etapa 30 lotes a S/ 50. Elegimos un bloque consecutivo o intercalado.
  // We'll pick 30 specific lots to be on "offer" (e.g. from 20 to 49)
  if (n >= 20 && n <= 49) return "offer";
  return "available";
}

// Ray-polyline intersection
function getRayPolylineIntersection(rayStart: XY, rayDir: XY, polyline: XY[]): XY | null {
  let minT = Infinity;
  let intersectPt: XY | null = null;

  for (let i = 0; i < polyline.length; i++) {
    const A = polyline[i];
    const B = polyline[(i + 1) % polyline.length];
    const v = { x: B.x - A.x, y: B.y - A.y };

    const cross_d_v = rayDir.x * v.y - rayDir.y * v.x;
    if (Math.abs(cross_d_v) < 1e-9) continue; // Parallel

    const cross_ap_v = (A.x - rayStart.x) * v.y - (A.y - rayStart.y) * v.x;
    const cross_ap_d = (A.x - rayStart.x) * rayDir.y - (A.y - rayStart.y) * rayDir.x;

    const t = cross_ap_v / cross_d_v;
    const u = cross_ap_d / cross_d_v;

    if (t >= 0 && u >= 0 && u <= 1) {
      if (t < minT) {
        minT = t;
        intersectPt = {
          x: rayStart.x + t * rayDir.x,
          y: rayStart.y + t * rayDir.y
        };
      }
    }
  }

  return intersectPt;
}

function projectPointAlongNormalToPoly(
  pt: XY,
  normal: XY,
  center: XY,
  polyline: XY[],
  fallbackT: number
): XY {
  const intersect = getRayPolylineIntersection(pt, normal, polyline);
  if (intersect) return intersect;

  // Fallback 1: Project towards the center of gravity
  const dir = { x: center.x - pt.x, y: center.y - pt.y };
  const fallbackIntersect = getRayPolylineIntersection(pt, dir, polyline);
  if (fallbackIntersect) return fallbackIntersect;

  // Fallback 2: Direct parametric point
  return getPointOnPoly(polyline, fallbackT);
}

// Parallel block subdivision (1 row per block, aligned t-cuts)
function subdivideParallelBlock(block: BlockPolygon, count: number): XY[][] {
  if (!block.ringData) return [block.polygon];
  
  const { t_start, t_end } = block.ringData;
  const scale = getMeterToSvgScale();
  const { innerBuffer } = buildTerrainScene();
  
  // Find band index and offsets
  const b = BAND_BLOCKS.findIndex(arr => arr.includes(block.id));
  const offsets = BAND_OFFSETS[b];
  if (!offsets) return [block.polygon];
  
  const lots: XY[][] = [];
  
  // 4m wide pedestrian gap in t (approx 0.012 on t-axis)
  const gap_t = 0.012;
  const L_t = t_end - t_start;
  const isTinyHouseBlock = ["M4", "M5", "M6", "M19", "M20", "M21"].includes(block.id);
  const effectiveCount = isTinyHouseBlock ? Math.floor(count / 2) : count;
  const dt = (L_t - gap_t) / effectiveCount;
  const half = Math.floor(effectiveCount / 2);
  
  // Helper to compute t value for each cut index
  const getTVal = (idx: number) => {
    let t_base = (idx <= half) ? t_start + idx * dt : t_start + idx * dt + gap_t;
    const isOrganic = ["M2", "M5", "M8", "M17", "M20", "M23"].includes(block.id);
    if (isOrganic && idx > 0 && idx < effectiveCount) {
      t_base += 0.007 * Math.sin(idx * 2.5);
    }
    return t_base;
  };
  
  // Helper to compute d shifts for each cut index (set to 0 for clean straight boundaries)
  const getShiftLow = (idx: number) => {
    return 0;
  };
  
  const getShiftHigh = (idx: number) => {
    return 0;
  };
  
  for (let c = 0; c < effectiveCount; c++) {
    const t1 = getTVal(c);
    const t2 = getTVal(c + 1);
    
    let d1_low  = offsets.low + getShiftLow(c);
    let d2_low  = offsets.low + getShiftLow(c + 1);
    let d2_high = offsets.high + getShiftHigh(c + 1);
    let d1_high = offsets.high + getShiftHigh(c);
    
    // Dynamic adjustments for Band 4 (M10-M12)
    if (b === 3) {
      d1_high = 103 - Math.max(0, 14 * Math.sin(3 * Math.PI * t1));
      d2_high = 103 - Math.max(0, 14 * Math.sin(3 * Math.PI * t2));
    }
    // Dynamic adjustments for Band 5 (M13-M15)
    if (b === 4) {
      d1_low = 128 + Math.max(0, 14 * Math.sin(3 * Math.PI * t1));
      d2_low = 128 + Math.max(0, 14 * Math.sin(3 * Math.PI * t2));
    }
    
    const slope = (block.ringData?.isFirstRow) 
        ? ((block.ringData.t_start_high ?? t_start) - (block.ringData.t_start_low ?? t_start)) 
        : 0;
        
    const getOffsetForT = (t_val: number) => {
      const progress = (t_val - t_start) / L_t;
      return slope * Math.max(0, Math.min(1, 1 - progress));
    };

    let current_t1_low = t1;
    let current_t1_high = t1 + getOffsetForT(t1);
    
    // For the back edge of the lot
    let current_t2_low = t2;
    let current_t2_high = t2 + getOffsetForT(t2);

    // Exact override for the very first lot to perfectly seal the block boundary
    if (c === 0 && block.ringData?.isFirstRow) {
       current_t1_low = block.ringData.t_start_low ?? current_t1_low;
       current_t1_high = block.ringData.t_start_high ?? current_t1_high;
    }

    const p1 = getBandPoint(innerBuffer, current_t1_low, d1_low,  scale);
    const p2 = getBandPoint(innerBuffer, current_t2_low, d2_low,  scale);
    const p3 = getBandPoint(innerBuffer, current_t2_high, d2_high, scale);
    const p4 = getBandPoint(innerBuffer, current_t1_high, d1_high, scale);
    
    if (isTinyHouseBlock) {
      const d1_mid = (d1_low + d1_high) / 2;
      const d2_mid = (d2_low + d2_high) / 2;
      
      const current_t1_mid = (current_t1_low + current_t1_high) / 2;
      const current_t2_mid = (current_t2_low + current_t2_high) / 2;
      
      const p1a = p1;
      const p2a = p2;
      const p3a = getBandPoint(innerBuffer, current_t2_mid, d2_mid, scale);
      const p4a = getBandPoint(innerBuffer, current_t1_mid, d1_mid, scale);
      
      const p1b = p4a;
      const p2b = p3a;
      const p3b = p3;
      const p4b = p4;
      
      lots.push([p1a, p2a, p3a, p4a]);
      lots.push([p1b, p2b, p3b, p4b]);
    } else {
      if (b === 3) {
        // Curve along d_high (from p3 back to p4, i.e. current_t2_high to current_t1_high)
        const curvedEdge: XY[] = [];
        const steps = 12;
        for (let s = 0; s <= steps; s++) {
          const curr_t = current_t2_high + (current_t1_high - current_t2_high) * (s / steps);
          const scallop = 14 * Math.sin(3 * Math.PI * curr_t);
          const curr_d = 103 - Math.max(0, scallop);
          curvedEdge.push(getBandPoint(innerBuffer, curr_t, curr_d, scale));
        }
        lots.push([p1, p2, ...curvedEdge]);
      } else if (b === 4) {
        // Curve along d_low (from p1 to p2, i.e. current_t1_low to current_t2_low)
        const curvedEdge: XY[] = [];
        const steps = 12;
        for (let s = 0; s <= steps; s++) {
          const curr_t = current_t1_low + (current_t2_low - current_t1_low) * (s / steps);
          const scallop = 14 * Math.sin(3 * Math.PI * curr_t);
          const curr_d = 128 + Math.max(0, scallop);
          curvedEdge.push(getBandPoint(innerBuffer, curr_t, curr_d, scale));
        }
        lots.push([...curvedEdge, p3, p4]);
      } else {
        lots.push([p1, p2, p3, p4]);
      }
    }
  }
  
  return lots;
}

function getLotCorners(polygon: XY[], b: number): { p1: XY; p2: XY; p3: XY; p4: XY } {
  if (polygon.length === 4) {
    return { p1: polygon[0], p2: polygon[1], p3: polygon[2], p4: polygon[3] };
  }
  if (b === 3) {
    // [p1, p2, ...curvedEdge] where curvedEdge starts at p3 and ends at p4
    return { p1: polygon[0], p2: polygon[1], p3: polygon[2], p4: polygon[polygon.length - 1] };
  }
  if (b === 4) {
    // [...curvedEdge, p3, p4] where curvedEdge starts at p1 and ends at p2 (13 elements, index 0 to 12)
    return { p1: polygon[0], p2: polygon[12], p3: polygon[13], p4: polygon[14] };
  }
  return { p1: polygon[0], p2: polygon[1], p3: polygon[2], p4: polygon[3] };
}

export function buildLots(blocks: BlockPolygon[], parkings?: Lot[]): Lot[] {
  let counter = 1;
  let premiumCounter = 0;
  const lots: Lot[] = [];
  const scale = getMeterToSvgScale();

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

  for (const block of blocks) {
    const spec = BLOCK_SPECS.find(b => b.id === block.id);
    if (!spec) continue;
    
    const b = BAND_BLOCKS.findIndex(arr => arr.includes(block.id));
    
    const mix: LotTypology[] = [
      ...Array(spec.lotMix.standard || 0).fill("standard"),
      ...Array(spec.lotMix.premium || 0).fill("premium"),
      ...Array(spec.lotMix.adjustment || 0).fill("adjustment"),
      ...Array(spec.lotMix.zen || 0).fill("zen")
    ];
    mix.sort((a, b) => a.localeCompare(b)); 

    const subPolygons = subdivideParallelBlock(block, spec.targetLotCount);

    for (let i = 0; i < spec.targetLotCount; i++) {
      const polygon = subPolygons[i] || block.polygon;
      
      // True mathematically computed area in square meters
      const svgArea = shoelaceArea(polygon);
      const realArea = svgArea / (scale * scale);
      const roundedArea = Math.round(realArea * 100) / 100;

      let dimensions = "";
      if (polygon.length >= 4) {
        const corners = getLotCorners(polygon, b);
        const left = Math.hypot(corners.p4.x - corners.p1.x, corners.p4.y - corners.p1.y) / scale;
        const right = Math.hypot(corners.p2.x - corners.p3.x, corners.p2.y - corners.p3.y) / scale;
        const avgDepth = (left + right) / 2;
        
        let bestW = 10;
        let bestH = 10;
        let minDiff = Infinity;
        
        const hStart = Math.max(1, avgDepth - 0.5);
        const hEnd = avgDepth + 0.5;
        for (let testH = hStart; testH <= hEnd; testH += 0.1) {
          const h_rounded = Math.round(testH * 10) / 10;
          const w_rounded = Math.round((roundedArea / h_rounded) * 10) / 10;
          const diff = Math.abs(w_rounded * h_rounded - roundedArea);
          if (diff < minDiff) {
            minDiff = diff;
            bestW = w_rounded;
            bestH = h_rounded;
          }
        }
        dimensions = `${bestW.toFixed(1)}m x ${bestH.toFixed(1)}m`;
      }

      // Assign commercial typology
      let finalTypology: LotTypology = "standard";
  
      // Tiny House: Longitudinal split
      if (["M4", "M5", "M6", "M19", "M20", "M21"].includes(block.id)) {
        finalTypology = "tiny-house";
      }
      // Premium: Lots directly facing the Oasis (inner-ring blocks M10-M15)
      else if (["M10", "M11", "M12", "M13", "M14", "M15"].includes(block.id)) {
        finalTypology = "premium";
      } 
      // Adjustment/Irregular: The sharp tips of the diamond terrain
      else if (["M1", "M3", "M22", "M24"].includes(block.id)) {
        finalTypology = "adjustment";
      }
      // Zen: The organic domo villages
      else if (["M2", "M8", "M17", "M23"].includes(block.id)) {
        finalTypology = "zen";
      }

      let status: LotStatus = "available";
      if (counter <= 30) {
        if (counter <= 5) {
          status = "blocked"; // 5 separados
        } else if (counter <= 8) {
          status = "sold";    // 3 vendidos
        } else {
          status = "offer";   // 22 en oferta
        }
      } else {
        if (finalTypology === "premium") {
          premiumCounter++;
          if (premiumCounter <= 31) {
            status = "blocked"; // 60% of premium blocked
          } else {
            status = "available";
          }
        } else {
          status = "available";
        }
      }

      const rate = counter <= 30 ? 60 : 120;
      const price = Math.round(roundedArea * rate);
      const priceLabel = `S/ ${price.toLocaleString('en-US', {maximumFractionDigits:0})}`;

      // Mathematical distances
      const lotCentroid = centroid(polygon);
      const distToPool = Math.round(distanceToPolygon(lotCentroid, globalOasisBoundary) / scale);

      let minParkDist = 100; // fallback
      if (parkings && parkings.length > 0) {
        let minD = Infinity;
        for (const p of parkings) {
          const pCentroid = centroid(p.polygon);
          const d = Math.hypot(lotCentroid.x - pCentroid.x, lotCentroid.y - pCentroid.y);
          if (d < minD) minD = d;
        }
        minParkDist = Math.round(minD / scale);
      }

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
        hubDistance: minParkDist
      });

      counter++;
    }
  }

  return lots;
}

export function buildParkingLots(innerBuffer: XY[], obstacles: XY[][] = []): Lot[] {
  const scale = getMeterToSvgScale();
  const lots: Lot[] = [];
  let parkingCount = 1;

  function getMaxTForD(d: number): number {
    if (d <= 20) return 0.145;
    if (d <= 46) return 0.115;
    if (d <= 72) return 0.075;
    if (d <= 98) return 0.035;
    
    if (d >= 133 && d <= 153) return 0.035;
    if (d > 153 && d <= 179) return 0.075;
    if (d > 179 && d <= 205) return 0.115;
    if (d > 205 && d <= 231) return 0.145;
    
    return 0;
  }

  function createParkingLot(prefix: string, rowDef: {tCenter: number}, dCenter: number, typology: LotTypology = "parking"): Lot {
    const center = getBandPoint(innerBuffer, rowDef.tCenter, dCenter, scale);
    const nextP = getBandPoint(innerBuffer, rowDef.tCenter, dCenter + 1, scale);
    const angle = Math.atan2(nextP.y - center.y, nextP.x - center.x);
    
    // True Cartesian dimensions: 2.5m wide x 5m deep
    const wPx = (2.5 * scale) / 2;
    const dPx = (5.0 * scale) / 2;

    const corners = [
      { x: -wPx, y: -dPx },
      { x:  wPx, y: -dPx },
      { x:  wPx, y:  dPx },
      { x: -wPx, y:  dPx },
    ];

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const polygon = corners.map(c => ({
      x: center.x + c.x * cosA - c.y * sinA,
      y: center.y + c.x * sinA + c.y * cosA
    }));
    
    const idNum = parkingCount++;
    return {
      id: `P-${prefix}${idNum}`,
      number: `P${idNum}`,
      blockId: "PARKING",
      typology: typology,
      areaM2: 12.5,
      status: "available",
      priceLabel: typology === "parking-external" ? "PÚBLICO" : "S/ 5,000",
      price: typology === "parking-external" ? 0 : 5000,
      polygon: polygon,
      dimensions: "2.5m x 5.0m",
      quadrant: "PARKING",
      area: 12.5,
      elevation: 108,
      distanceToPool: 50,
      hubDistance: 0
    };
  }

  function fillParkingStrips(dStart: number, dEnd: number, prefix: string) {
    for (let d = dStart; d <= dEnd; d += 2.5) {
      let currentT = 0.032; 
      const boundaryT = getMaxTForD(d + 1.25) - 0.008; 

      while (currentT <= boundaryT) {
         const p1 = createParkingLot(prefix, {tCenter: currentT}, d + 1.25);
         if (!checkCollision(p1.polygon, obstacles)) lots.push(p1);
         
         let nextT = currentT + 0.015; 
         if (nextT <= boundaryT) {
            const p2 = createParkingLot(prefix, {tCenter: nextT}, d + 1.25);
            if (!checkCollision(p2.polygon, obstacles)) lots.push(p2);
         }

         currentT = nextT + 0.025; 
      }
    }
  }

  // Left side internal parking block: clear of entrance (d=15 to 92.5)
  fillParkingStrips(15, 92.5, "L1-");

  // Right side internal parking block: safe after d=137.5
  fillParkingStrips(137.5, 225, "R");

  // External Visitor Parking (setback outside front wall)
  let extCount = 0;
  function fillExternalParking(dStart: number, dEnd: number, prefix: string) {
    for (let d = dStart; d <= dEnd; d += 2.5) {
      extCount++;
      const p = createParkingLot(prefix, {tCenter: -0.008}, d + 1.25, "parking-external");
      if (!checkCollision(p.polygon, obstacles)) lots.push(p);
    }
  }

  // Add external visitor parking along the setback
  fillExternalParking(15, 90, "EXT-L-");
  fillExternalParking(135, 215, "EXT-R-");

  console.log(`Generated ${extCount} external visitor parking spots outside the wall.`);

  return lots;
}
