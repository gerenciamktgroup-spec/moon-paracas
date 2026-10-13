/**
 * ============================================================================
 * REAL MASTERPLAN RESIDENTIAL LOTS GENERATOR & INVENTORY
 * MOON PARACAS — POLÍGONO REAL MATRIZ (UTM ZONA 18S)
 * ============================================================================
 * 
 * MODELO URBANO DE SUPERMANZANAS (ALDEAS RESIDENCIALES)
 * - 384 Lotes Residenciales en Manzanas Rectangulares frente a calles de 6.00 m
 * - 4 Aldeas × 96 Lotes cada una:
 *   - Aldea 1 (Oeste / Verde Agave #4E6646): 96 lotes
 *   - Aldea 2 (Norte / Ocre Dorado #C5A059): 96 lotes
 *   - Aldea 3 (Este / Terracota Paracas #A84F36): 96 lotes
 *   - Aldea 4 (Sur / Arena Desértica #C4AE88): 96 lotes
 * - Desglose de Tipologías (Total = 384):
 *   - Premium Oasis: 48 (12 por Aldea en primera fila frente a la laguna)
 *   - Zen: 24 (6 por Aldea en calles interiores silenciosas)
 *   - Ajuste: 24 (6 por Aldea en transición al perímetro)
 *   - Standard: 288 (72 por Aldea)
 * - Cocheras Plus: 192 plazas en 4 bahías agrupadas en la franja sur
 * - Regla Estricta de Domos:
 *   - 120 m²: [6, 7] (NUNCA 8)
 *   - 240 m²: [6, 7, 8]
 */

import { localMetersToSvg } from "./loteMatrizGeometry";

export type LotTypology = "standard" | "premium-oasis" | "zen" | "ajuste";
export type LotStatus = "disponible" | "reservado" | "vendido" | "bloqueado";

export interface RealResidentialLot {
  id: string;
  manzana: string;
  numero: number;
  aldea: 1 | 2 | 3 | 4;
  aldeaName: string;
  typology: LotTypology;
  status: LotStatus;
  areaM2: 120 | 240;
  widthM: number;
  depthM: number;
  compatibleDomes: (6 | 7 | 8)[];
  priceUSD: number;
  polygon: [number, number][];      // Coordenadas locales en metros [x, y]
  svgPolygon: [number, number][];   // Coordenadas en canvas SVG
  centroid: [number, number];       // Centroide local en metros [x, y]
  svgCentroid: [number, number];    // Centroide SVG [x, y]
  nearOasis: boolean;
  nearEntrance: boolean;
}

export interface ParkingStall {
  id: string;
  numero: number;
  bayName: string;
  polygon: [number, number][];
  svgPolygon: [number, number][];
  centroid: [number, number];
  svgCentroid: [number, number];
  status: LotStatus;
  priceUSD: number;
}

export interface RealMasterplanInventory {
  lots: RealResidentialLot[];
  parkingStalls: ParkingStall[];
  stats: {
    totalResidential: number;
    byAldea: { [key in 1 | 2 | 3 | 4]: number };
    byTypology: { [key in LotTypology]: number };
    byStatus: { [key in LotStatus]: number };
    byArea: { 120: number; 240: number };
    parkingCount: number;
    dome8CountOn120: number;
    outsideCount: number;
  };
}

// Vértices locales del Lote Matriz
const VERTEX_A: [number, number] = [-39.804, -254.296]; // Sur
const VERTEX_B: [number, number] = [-140.421, -55.031]; // Oeste
const VERTEX_C: [number, number] = [-20.697, 257.134];  // Norte
const VERTEX_D: [number, number] = [200.923, 52.193];   // Este

const BOUNDARY_POLYGON = [VERTEX_A, VERTEX_B, VERTEX_C, VERTEX_D];

/**
 * Función de prueba de punto en polígono (Ray Casting)
 */
export function isPointInsideMatriz(pt: [number, number]): boolean {
  let inside = false;
  for (let i = 0, j = BOUNDARY_POLYGON.length - 1; i < BOUNDARY_POLYGON.length; j = i++) {
    const xi = BOUNDARY_POLYGON[i][0], yi = BOUNDARY_POLYGON[i][1];
    const xj = BOUNDARY_POLYGON[j][0], yj = BOUNDARY_POLYGON[j][1];
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
        (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

interface BlockDefinition {
  letter: string;
  center: [number, number];
  angleDeg: number;
  cols: number;
  rows: number;
  lotW?: number;
  lotD?: number;
  streetW?: number;
  is240Indices?: number[];
}

/**
 * Genera el inventario de 384 lotes organizados en manzanas rectangulares con frentes de calle
 */
export function generateRealMasterplanLots(): RealMasterplanInventory {
  const lots: RealResidentialLot[] = [];
  const parkingStalls: ParkingStall[] = [];

  const ALDEA_BLOCKS_CONFIG: { aldea: 1 | 2 | 3 | 4; name: string; blocks: BlockDefinition[] }[] = [
    // 1. Aldea 1 (Oeste / Verde Agave): 6 Manzanas de 16 lotes = 96 lotes
    {
      aldea: 1,
      name: "Aldea 1 (Oeste)",
      blocks: [
        { letter: "A", center: [-52, 26], angleDeg: 145, cols: 8, rows: 2, lotW: 6.8, lotD: 11.5 }, // Mz A (16)
        { letter: "B", center: [-56, 0], angleDeg: 180, cols: 8, rows: 2, lotW: 6.8, lotD: 11.5 },  // Mz B (16)
        { letter: "C", center: [-52, -26], angleDeg: -145, cols: 8, rows: 2, lotW: 6.8, lotD: 11.5 }, // Mz C (16)
        { letter: "D", center: [-80, 16], angleDeg: 145, cols: 8, rows: 2, lotW: 6.0, lotD: 10.5 },  // Mz D (16)
        { letter: "E", center: [-86, 0], angleDeg: 180, cols: 8, rows: 2, lotW: 6.0, lotD: 10.5 },  // Mz E (16)
        { letter: "F", center: [-80, -16], angleDeg: -145, cols: 8, rows: 2, lotW: 6.0, lotD: 10.5 }, // Mz F (16)
      ],
    },
    // 2. Aldea 2 (Norte / Ocre Dorado): 6 Manzanas de 16 lotes = 96 lotes
    {
      aldea: 2,
      name: "Aldea 2 (Norte)",
      blocks: [
        { letter: "A", center: [-18, 54], angleDeg: 60, cols: 8, rows: 2, lotW: 6.8, lotD: 11.5 }, // Mz A (16)
        { letter: "B", center: [16, 54], angleDeg: 120, cols: 8, rows: 2, lotW: 6.8, lotD: 11.5, is240Indices: [4, 5, 12, 13] }, // Mz B (16)
        { letter: "C", center: [-14, 105], angleDeg: 75, cols: 8, rows: 2, lotW: 6.6, lotD: 11.0 }, // Mz C (16)
        { letter: "D", center: [22, 105], angleDeg: 105, cols: 8, rows: 2, lotW: 6.6, lotD: 11.0, is240Indices: [4, 5, 12, 13] }, // Mz D (16)
        { letter: "E", center: [-6, 155], angleDeg: 85, cols: 8, rows: 2, lotW: 6.2, lotD: 10.5 },  // Mz E (16)
        { letter: "F", center: [-12, 205], angleDeg: 90, cols: 8, rows: 2, lotW: 5.5, lotD: 9.5 },  // Mz F (16)
      ],
    },
    // 3. Aldea 3 (Este / Terracota Paracas): 6 Manzanas de 16 lotes = 96 lotes
    {
      aldea: 3,
      name: "Aldea 3 (Este)",
      blocks: [
        { letter: "A", center: [52, 26], angleDeg: 35, cols: 8, rows: 2, lotW: 6.8, lotD: 11.5 }, // Mz A (16)
        { letter: "B", center: [56, 0], angleDeg: 0, cols: 8, rows: 2, lotW: 6.8, lotD: 11.5, is240Indices: [4, 5, 12, 13] }, // Mz B (16)
        { letter: "C", center: [52, -26], angleDeg: -35, cols: 8, rows: 2, lotW: 6.8, lotD: 11.5 }, // Mz C (16)
        { letter: "D", center: [95, 24], angleDeg: 25, cols: 8, rows: 2, lotW: 6.6, lotD: 11.0 },  // Mz D (16)
        { letter: "E", center: [102, 0], angleDeg: 0, cols: 8, rows: 2, lotW: 6.6, lotD: 11.0 },  // Mz E (16)
        { letter: "F", center: [136, 10], angleDeg: 15, cols: 8, rows: 2, lotW: 5.8, lotD: 9.5 },  // Mz F (16)
      ],
    },
    // 4. Aldea 4 (Sur / Arena Desértica): 6 Manzanas de 16 lotes = 96 lotes
    {
      aldea: 4,
      name: "Aldea 4 (Sur)",
      blocks: [
        { letter: "A", center: [-18, -54], angleDeg: -60, cols: 8, rows: 2, lotW: 6.8, lotD: 11.5 }, // Mz A (16)
        { letter: "B", center: [16, -54], angleDeg: -120, cols: 8, rows: 2, lotW: 6.8, lotD: 11.5 }, // Mz B (16)
        { letter: "C", center: [-14, -105], angleDeg: -75, cols: 8, rows: 2, lotW: 6.6, lotD: 11.0 }, // Mz C (16)
        { letter: "D", center: [20, -105], angleDeg: -105, cols: 8, rows: 2, lotW: 6.6, lotD: 11.0 }, // Mz D (16)
        { letter: "E", center: [-12, -155], angleDeg: -85, cols: 8, rows: 2, lotW: 6.2, lotD: 10.5 }, // Mz E (16)
        { letter: "F", center: [-25, -198], angleDeg: -90, cols: 8, rows: 2, lotW: 5.5, lotD: 9.5 },  // Mz F (16)
      ],
    },
  ];

  ALDEA_BLOCKS_CONFIG.forEach((ald) => {
    ald.blocks.forEach((blk, blkIdx) => {
      const mz = `A${ald.aldea}-${blk.letter}`;
      const angleRad = (blk.angleDeg * Math.PI) / 180;
      const cosA = Math.cos(angleRad);
      const sinA = Math.sin(angleRad);
      const cosP = -sinA;
      const sinP = cosA;

      for (let r = 0; r < blk.rows; r++) {
        for (let c = 0; c < blk.cols; c++) {
          const num = r * blk.cols + c + 1;
          const is240 = Boolean(blk.is240Indices && blk.is240Indices.includes(num));
          const lotW = is240 ? 14.0 : (blk.lotW || 6.8);
          const lotD = is240 ? 14.0 : (blk.lotD || 11.5);

          const offsetX = (c - (blk.cols - 1) / 2) * (blk.lotW || 6.8);
          const offsetY = (r - (blk.rows - 1) / 2) * (lotD + 5.0); // 5.0m de calle interior

          const cx = Number((blk.center[0] + offsetX * cosA + offsetY * cosP).toFixed(2));
          const cy = Number((blk.center[1] + offsetX * sinA + offsetY * sinP).toFixed(2));

          const hw = lotW / 2;
          const hd = lotD / 2;

          const p1: [number, number] = [
            Number((cx - hw * cosA - hd * cosP).toFixed(2)),
            Number((cy - hw * sinA - hd * cosP).toFixed(2)),
          ];
          const p2: [number, number] = [
            Number((cx + hw * cosA - hd * cosP).toFixed(2)),
            Number((cy + hw * sinA - hd * cosP).toFixed(2)),
          ];
          const p3: [number, number] = [
            Number((cx + hw * cosA + hd * cosP).toFixed(2)),
            Number((cy + hw * sinA + hd * cosP).toFixed(2)),
          ];
          const p4: [number, number] = [
            Number((cx - hw * cosA + hd * cosP).toFixed(2)),
            Number((cy - hw * sinA + hd * cosP).toFixed(2)),
          ];

          // Tipologías:
          // Premium Oasis: Mz A (lotes 3 al 14) -> 12 por Aldea = 48
          // Zen: Mz C (lotes 1, 2, 7, 8, 15, 16) -> 6 por Aldea = 24
          // Ajuste: Mz F (lotes 1, 2, 7, 8, 15, 16) -> 6 por Aldea = 24
          // Standard: restantes -> 72 por Aldea = 288
          let typology: LotTypology = "standard";
          let nearOasis = false;

          if (blk.letter === "A" && num >= 3 && num <= 14) {
            typology = "premium-oasis";
            nearOasis = true;
          } else if (blk.letter === "F" && (num <= 2 || (num >= 7 && num <= 8) || num >= 15)) {
            typology = "ajuste";
          } else if (blk.letter === "C" && (num <= 2 || (num >= 7 && num <= 8) || num >= 15)) {
            typology = "zen";
          }

          const areaM2: 120 | 240 = is240 ? 240 : 120;
          const compatibleDomes: (6 | 7 | 8)[] = areaM2 === 240 ? [6, 7, 8] : [6, 7];

          // Estado comercial determinista
          let status: LotStatus = "disponible";
          const pseudoRand = (ald.aldea * 100 + blkIdx * 20 + num * 7) % 100;
          if (pseudoRand < 18) {
            status = "reservado";
          } else if (pseudoRand >= 18 && pseudoRand < 26) {
            status = "vendido";
          } else if (pseudoRand >= 98) {
            status = "bloqueado";
          }

          let priceUSD = 16800;
          if (typology === "premium-oasis") priceUSD = 19200;
          else if (typology === "zen") priceUSD = 17400;
          else if (typology === "ajuste") priceUSD = 15600;
          if (areaM2 === 240) priceUSD *= 2;

          const svgPoly: [number, number][] = [p1, p2, p3, p4].map((pt) => {
            const s = localMetersToSvg(pt[0], pt[1]);
            return [s.svgX, s.svgY];
          });
          const svgCent = localMetersToSvg(cx, cy);

          lots.push({
            id: `L-${mz}-${String(num).padStart(2, "0")}`,
            manzana: mz,
            numero: num,
            aldea: ald.aldea,
            aldeaName: ald.name,
            typology,
            status,
            areaM2,
            widthM: is240 ? 12.0 : 8.0,
            depthM: is240 ? 20.0 : 15.0,
            compatibleDomes,
            priceUSD,
            polygon: [p1, p2, p3, p4],
            svgPolygon: svgPoly,
            centroid: [cx, cy],
            svgCentroid: [svgCent.svgX, svgCent.svgY],
            nearOasis,
            nearEntrance: ald.aldea === 4 && blk.letter === "F",
          });
        }
      }
    });
  });

  // Generación de 192 Cocheras Plus organizadas en 4 bahías legibles
  const BAYS = [
    { name: "Bahía Oeste A", originX: -88, originY: -218, count: 48 },
    { name: "Bahía Oeste B", originX: -88, originY: -232, count: 48 },
    { name: "Bahía Este A", originX: 6, originY: -218, count: 48 },
    { name: "Bahía Este B", originX: 6, originY: -232, count: 48 },
  ];

  let stallNum = 1;
  BAYS.forEach((bay) => {
    for (let s = 0; s < bay.count; s++) {
      const col = s % 24;
      const row = Math.floor(s / 24);
      const x = bay.originX + col * 3.2;
      const y = bay.originY - row * 6.0;
      const w = 2.8;
      const h = 5.4;

      const poly: [number, number][] = [
        [Number((x - w/2).toFixed(2)), Number((y - h/2).toFixed(2))],
        [Number((x + w/2).toFixed(2)), Number((y - h/2).toFixed(2))],
        [Number((x + w/2).toFixed(2)), Number((y + h/2).toFixed(2))],
        [Number((x - w/2).toFixed(2)), Number((y + h/2).toFixed(2))],
      ];
      const svgPoly: [number, number][] = poly.map((pt) => {
        const sp = localMetersToSvg(pt[0], pt[1]);
        return [sp.svgX, sp.svgY];
      });
      const svgCent = localMetersToSvg(x, y);

      parkingStalls.push({
        id: `P-${String(stallNum).padStart(3, "0")}`,
        numero: stallNum++,
        bayName: bay.name,
        polygon: poly,
        svgPolygon: svgPoly,
        centroid: [x, y],
        svgCentroid: [svgCent.svgX, svgCent.svgY],
        status: s % 6 === 0 ? "reservado" : s % 10 === 0 ? "vendido" : "disponible",
        priceUSD: 4500,
      });
    }
  });

  // Verificación de estadísticas y límites
  let outsideCount = 0;
  let dome8CountOn120 = 0;
  const byAldea = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const byTypology = { standard: 0, "premium-oasis": 0, zen: 0, ajuste: 0 };
  const byStatus = { disponible: 0, reservado: 0, vendido: 0, bloqueado: 0 };
  const byArea = { 120: 0, 240: 0 };

  lots.forEach((lot) => {
    byAldea[lot.aldea]++;
    byTypology[lot.typology]++;
    byStatus[lot.status]++;
    byArea[lot.areaM2]++;

    if (lot.areaM2 === 120 && lot.compatibleDomes.includes(8)) {
      dome8CountOn120++;
    }

    const allIn = lot.polygon.every((pt) => isPointInsideMatriz(pt));
    if (!allIn) outsideCount++;
  });

  return {
    lots,
    parkingStalls,
    stats: {
      totalResidential: lots.length,
      byAldea,
      byTypology,
      byStatus,
      byArea,
      parkingCount: parkingStalls.length,
      dome8CountOn120,
      outsideCount,
    },
  };
}

// Instancia única exportada del inventario
export const REAL_MASTERPLAN_INVENTORY = generateRealMasterplanLots();
