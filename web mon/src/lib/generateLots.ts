/**
 * ============================================================================
 * COMMERCIAL SALES PLAN LOT GENERATOR & INVENTORY
 * MOON PARACAS MASTERPLAN (CUADRADO DE VENTA DE 112,554.30 m²)
 * ============================================================================
 *
 * 4 Aldeas en Trapecios:
 *   - Aldea 1 (Oeste #4E7D5B): Manzanas Verticales (frente 8m en Y, fondo 15m en +X)
 *   - Aldea 2 (Norte #C89D34): Manzanas Horizontales (frente 8m en X, fondo 15m en -Y)
 *   - Aldea 3 (Este #D35400):  Manzanas Verticales (frente 8m en Y, fondo 15m en -X)
 *   - Aldea 4 (Sur #8D7B68):   Manzanas Horizontales (frente 8m en X, fondo 15m en +Y)
 *
 * Reglas Estrictas:
 *   - CERO Solapes entre lotes (área de intersección <= 0.01 m²)
 *   - CERO Invasión del Oasis octagonal ni de su anillo vial de 6.00 m
 *   - CERO Lotes en la Franja Sur de Servicios (Y < SERVICE_Y = -119.745 m)
 *   - Lotes 100% dentro de su respectivo trapecio de Aldea
 *   - Lados estrictamente paralelos a los ejes X/Y (N-S / E-O)
 *   - Áreas exactas: 120.00 m² (Regular) y 240.00 m² (Premium Oasis)
 *   - Compatible Domes: 240 m² -> [6, 7, 8] | 120 m² -> [6, 7]
 */

import {
  Point2D,
  HALF_SIDE_M,
  PERIMETER_SETBACK_M,
  SERVICE_Y,
  ALDEA_COLORS,
  metersToSvg,
  isPointInOasis,
} from "./loteMatriz";

export interface CommercialLot {
  id: string;            // A{aldea}-{nn}
  manzana: string;       // A1-M1, A1-M2, ...
  aldea: 1 | 2 | 3 | 4;
  aldea_name: string;
  sector_color: string;  // #4E7D5B, #C89D34, #D35400, #8D7B68
  tipo: "Lote Regular" | "Lote Premium (Oasis)";
  area_m2: 120.00 | 240.00;
  width_m: number;       // 8 o 16
  depth_m: number;       // 15
  polygon: Point2D[];    // 4 vértices CCW
  svgPolygon: { svgX: number; svgY: number }[];
  centroid: Point2D;
  svgCentroid: { svgX: number; svgY: number };
  status: "disponible" | "reservado" | "vendido";
  precio_usd: number;
  cocheras_asignadas: number;
  compatible_domes: (6 | 7 | 8)[];
}

export interface MasterplanInventory {
  lots: CommercialLot[];
  stats: {
    totalLots: number;
    byAldea: { [key in 1 | 2 | 3 | 4]: number };
    byTipo: { regular: number; premium: number };
    byArea: { 120: number; 240: number };
    byStatus: { disponible: number; reservado: number; vendido: number };
    totalVendibleM2: number;
    deficitReport: { [key in 1 | 2 | 3 | 4]: { generated: number; maxCap: number; reason: string } };
  };
}

const GAP = 0.70;       // Setback entre lotes colindantes
const STREET = 6.00;    // Ancho de pasaje/calle entre manzanas

/**
 * Genera el inventario de lotes comerciales mediante grillas murales ortogonales con parada estricta en oasis y diagonales
 */
export function generateMasterplanLots(): MasterplanInventory {
  const lots: CommercialLot[] = [];

  // ── 1. ALDEA 1 (OESTE #4E7D5B) ──
  // Columnas verticales de X = -157.74 hacia el Oasis
  const a1_colXs = [-157.74, -136.74, -115.74, -94.74];
  let a1_counter = 1;
  a1_colXs.forEach((colX, cIdx) => {
    let y = -140.0;
    let inBlock = 0;
    let blockNum = 1;
    while (y <= 140.0 && a1_counter <= 96) {
      const isPremium = cIdx === 3 && a1_counter <= 12;
      const width_m = isPremium ? 16.0 : 8.0;
      const depth_m = 15.0;

      const poly: Point2D[] = [
        { x: colX, y },
        { x: colX + depth_m, y },
        { x: colX + depth_m, y: y + width_m },
        { x: colX, y: y + width_m },
      ];

      const valid = poly.every((pt) => {
        return (
          pt.x >= -HALF_SIDE_M + PERIMETER_SETBACK_M &&
          pt.x <= -78.0 &&
          pt.y >= SERVICE_Y &&
          pt.y <= HALF_SIDE_M - PERIMETER_SETBACK_M &&
          !isPointInOasis(pt, true) &&
          pt.y <= -pt.x - 4.25 &&
          pt.y >= pt.x + 4.25
        );
      });

      if (valid) {
        const cx = Number((colX + depth_m / 2.0).toFixed(2));
        const cy = Number((y + width_m / 2.0).toFixed(2));
        lots.push({
          id: `A1-${String(a1_counter++).padStart(2, "0")}`,
          manzana: `A1-M${cIdx * 6 + blockNum}`,
          aldea: 1,
          aldea_name: "Aldea 1 (Oeste)",
          sector_color: ALDEA_COLORS[1],
          tipo: isPremium ? "Lote Premium (Oasis)" : "Lote Regular",
          area_m2: isPremium ? 240.00 : 120.00,
          width_m,
          depth_m,
          polygon: poly,
          svgPolygon: poly.map((pt) => metersToSvg(pt.x, pt.y)),
          centroid: { x: cx, y: cy },
          svgCentroid: metersToSvg(cx, cy),
          status: "disponible",
          precio_usd: isPremium ? 33600 : 16800,
          cocheras_asignadas: isPremium ? 2 : 1,
          compatible_domes: isPremium ? [6, 7, 8] : [6, 7],
        });

        inBlock++;
        if (inBlock >= 4) {
          y += width_m + STREET;
          inBlock = 0;
          blockNum++;
        } else {
          y += width_m + GAP;
        }
      } else {
        y += 2.0;
      }
    }
  });

  // ── 2. ALDEA 2 (NORTE #C89D34) ──
  // Filas horizontales de Y = +157.74 hacia el Oasis
  const a2_rowYs = [142.74, 121.74, 100.74, 79.74, 58.74];
  let a2_counter = 1;
  a2_rowYs.forEach((rowY, rIdx) => {
    let x = -140.0;
    let inBlock = 0;
    let blockNum = 1;
    while (x <= 140.0 && a2_counter <= 96) {
      const isPremium = rIdx >= 3 && a2_counter <= 12;
      const width_m = isPremium ? 16.0 : 8.0;
      const depth_m = 15.0;

      const poly: Point2D[] = [
        { x, y: rowY },
        { x: x + width_m, y: rowY },
        { x: x + width_m, y: rowY + depth_m },
        { x, y: rowY + depth_m },
      ];

      const valid = poly.every((pt) => {
        return (
          pt.x >= -HALF_SIDE_M + PERIMETER_SETBACK_M &&
          pt.x <= HALF_SIDE_M - PERIMETER_SETBACK_M &&
          pt.y >= 20.0 &&
          pt.y <= HALF_SIDE_M - PERIMETER_SETBACK_M &&
          !isPointInOasis(pt, true) &&
          pt.x >= -pt.y + 4.25 &&
          pt.x <= pt.y - 4.25
        );
      });

      if (valid) {
        const cx = Number((x + width_m / 2.0).toFixed(2));
        const cy = Number((rowY + depth_m / 2.0).toFixed(2));
        lots.push({
          id: `A2-${String(a2_counter++).padStart(2, "0")}`,
          manzana: `A2-M${rIdx * 6 + blockNum}`,
          aldea: 2,
          aldea_name: "Aldea 2 (Norte)",
          sector_color: ALDEA_COLORS[2],
          tipo: isPremium ? "Lote Premium (Oasis)" : "Lote Regular",
          area_m2: isPremium ? 240.00 : 120.00,
          width_m,
          depth_m,
          polygon: poly,
          svgPolygon: poly.map((pt) => metersToSvg(pt.x, pt.y)),
          centroid: { x: cx, y: cy },
          svgCentroid: metersToSvg(cx, cy),
          status: "disponible",
          precio_usd: isPremium ? 33600 : 16800,
          cocheras_asignadas: isPremium ? 2 : 1,
          compatible_domes: isPremium ? [6, 7, 8] : [6, 7],
        });

        inBlock++;
        if (inBlock >= 4) {
          x += width_m + STREET;
          inBlock = 0;
          blockNum++;
        } else {
          x += width_m + GAP;
        }
      } else {
        x += 2.0;
      }
    }
  });

  // ── 3. ALDEA 3 (ESTE #D35400) ──
  // Columnas verticales de X = +157.74 hacia el Oasis
  const a3_colXs = [78.0, 99.0, 120.0, 141.0];
  let a3_counter = 1;
  a3_colXs.forEach((colX, cIdx) => {
    let y = -140.0;
    let inBlock = 0;
    let blockNum = 1;
    while (y <= 140.0 && a3_counter <= 96) {
      const isPremium = cIdx === 0 && a3_counter <= 12;
      const width_m = isPremium ? 16.0 : 8.0;
      const depth_m = 15.0;

      const poly: Point2D[] = [
        { x: colX, y },
        { x: colX + depth_m, y },
        { x: colX + depth_m, y: y + width_m },
        { x: colX, y: y + width_m },
      ];

      const valid = poly.every((pt) => {
        return (
          pt.x >= 78.0 &&
          pt.x <= HALF_SIDE_M - PERIMETER_SETBACK_M &&
          pt.y >= SERVICE_Y &&
          pt.y <= HALF_SIDE_M - PERIMETER_SETBACK_M &&
          !isPointInOasis(pt, true) &&
          pt.y <= pt.x - 4.25 &&
          pt.y >= -pt.x + 4.25
        );
      });

      if (valid) {
        const cx = Number((colX + depth_m / 2.0).toFixed(2));
        const cy = Number((y + width_m / 2.0).toFixed(2));
        lots.push({
          id: `A3-${String(a3_counter++).padStart(2, "0")}`,
          manzana: `A3-M${cIdx * 6 + blockNum}`,
          aldea: 3,
          aldea_name: "Aldea 3 (Este)",
          sector_color: ALDEA_COLORS[3],
          tipo: isPremium ? "Lote Premium (Oasis)" : "Lote Regular",
          area_m2: isPremium ? 240.00 : 120.00,
          width_m,
          depth_m,
          polygon: poly,
          svgPolygon: poly.map((pt) => metersToSvg(pt.x, pt.y)),
          centroid: { x: cx, y: cy },
          svgCentroid: metersToSvg(cx, cy),
          status: "disponible",
          precio_usd: isPremium ? 33600 : 16800,
          cocheras_asignadas: isPremium ? 2 : 1,
          compatible_domes: isPremium ? [6, 7, 8] : [6, 7],
        });

        inBlock++;
        if (inBlock >= 4) {
          y += width_m + STREET;
          inBlock = 0;
          blockNum++;
        } else {
          y += width_m + GAP;
        }
      } else {
        y += 2.0;
      }
    }
  });

  // ── 4. ALDEA 4 (SUR #8D7B68) ──
  // Filas horizontales desde SERVICE_Y hacia el Oasis
  const a4_rowYs = [-118.0, -97.0, -76.0, -55.0, -34.0];
  let a4_counter = 1;
  a4_rowYs.forEach((rowY, rIdx) => {
    let x = -140.0;
    let inBlock = 0;
    let blockNum = 1;
    while (x <= 140.0 && a4_counter <= 96) {
      const isPremium = rIdx >= 3 && a4_counter <= 12;
      const width_m = isPremium ? 16.0 : 8.0;
      const depth_m = 15.0;

      const poly: Point2D[] = [
        { x, y: rowY },
        { x: x + width_m, y: rowY },
        { x: x + width_m, y: rowY + depth_m },
        { x, y: rowY + depth_m },
      ];

      const valid = poly.every((pt) => {
        return (
          pt.x >= -HALF_SIDE_M + PERIMETER_SETBACK_M &&
          pt.x <= HALF_SIDE_M - PERIMETER_SETBACK_M &&
          pt.y >= SERVICE_Y &&
          pt.y <= -6.0 &&
          !isPointInOasis(pt, true) &&
          pt.x >= pt.y + 4.25 &&
          pt.x <= -pt.y - 4.25
        );
      });

      if (valid) {
        const cx = Number((x + width_m / 2.0).toFixed(2));
        const cy = Number((rowY + depth_m / 2.0).toFixed(2));
        lots.push({
          id: `A4-${String(a4_counter++).padStart(2, "0")}`,
          manzana: `A4-M${rIdx * 6 + blockNum}`,
          aldea: 4,
          aldea_name: "Aldea 4 (Sur)",
          sector_color: ALDEA_COLORS[4],
          tipo: isPremium ? "Lote Premium (Oasis)" : "Lote Regular",
          area_m2: isPremium ? 240.00 : 120.00,
          width_m,
          depth_m,
          polygon: poly,
          svgPolygon: poly.map((pt) => metersToSvg(pt.x, pt.y)),
          centroid: { x: cx, y: cy },
          svgCentroid: metersToSvg(cx, cy),
          status: "disponible",
          precio_usd: isPremium ? 33600 : 16800,
          cocheras_asignadas: isPremium ? 2 : 1,
          compatible_domes: isPremium ? [6, 7, 8] : [6, 7],
        });

        inBlock++;
        if (inBlock >= 4) {
          x += width_m + STREET;
          inBlock = 0;
          blockNum++;
        } else {
          x += width_m + GAP;
        }
      } else {
        x += 2.0;
      }
    }
  });

  // Estadísticas y Reporte de Capacidad
  const byAldea = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const byTipo = { regular: 0, premium: 0 };
  const byArea = { 120: 0, 240: 0 };
  const byStatus = { disponible: 0, reservado: 0, vendido: 0 };
  let totalVendibleM2 = 0;

  lots.forEach((lot) => {
    byAldea[lot.aldea]++;
    if (lot.tipo === "Lote Premium (Oasis)") byTipo.premium++;
    else byTipo.regular++;
    byArea[lot.area_m2]++;
    byStatus[lot.status]++;
    totalVendibleM2 += lot.area_m2;
  });

  const deficitReport = {
    1: { generated: byAldea[1], maxCap: 96, reason: byAldea[1] >= 96 ? "Capacidad completa (96/96)" : "Delimitado por diagonales NW/SW y Oasis oeste" },
    2: { generated: byAldea[2], maxCap: 96, reason: byAldea[2] >= 96 ? "Capacidad completa (96/96)" : "Delimitado por diagonales NW/NE y Oasis norte" },
    3: { generated: byAldea[3], maxCap: 96, reason: byAldea[3] >= 96 ? "Capacidad completa (96/96)" : "Delimitado por diagonales NE/SE y Oasis este" },
    4: { generated: byAldea[4], maxCap: 96, reason: "Franja Sur de 48m (Rotonda, Pórtico, 192 Cocheras) reduce área útil" },
  };

  return {
    lots,
    stats: {
      totalLots: lots.length,
      byAldea,
      byTipo,
      byArea,
      byStatus,
      totalVendibleM2,
      deficitReport,
    },
  };
}

/**
 * Exporta el inventario a formato GeoJSON estándar
 */
export function toGeoJSON(lots: CommercialLot[]): object {
  return {
    type: "FeatureCollection",
    features: lots.map((lot) => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            ...lot.polygon.map((pt) => [pt.x, pt.y]),
            [lot.polygon[0].x, lot.polygon[0].y],
          ],
        ],
      },
      properties: {
        id: lot.id,
        manzana: lot.manzana,
        aldea: lot.aldea,
        aldea_name: lot.aldea_name,
        sector_color: lot.sector_color,
        tipo: lot.tipo,
        area_m2: lot.area_m2,
        width_m: lot.width_m,
        depth_m: lot.depth_m,
        status: lot.status,
        precio_usd: lot.precio_usd,
        cocheras_asignadas: lot.cocheras_asignadas,
        compatible_domes: lot.compatible_domes,
      },
    })),
  };
}

export const MASTERPLAN_INVENTORY = generateMasterplanLots();
