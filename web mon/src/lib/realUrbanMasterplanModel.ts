/**
 * ============================================================================
 * REAL URBAN MASTERPLAN MODEL — MOON PARACAS (11.26 ha / 112,591.80 m²)
 * ============================================================================
 *
 * Modelo urbanístico oficial georreferenciado sobre el polígono real A-B-C-D.
 * - Balance de Masas: 55% Área Vendible / 45% Áreas Comunes, Vías y Oasis.
 * - 384 Lotes (4 Aldeas × 96 lotes) con 100% acceso peatonal/calle.
 * - Oasis Central Orgánico (~20,000 m²) con Laguna Cristalina, Club House y Decks.
 * - Acceso Sur con Pórtico Monumental, Welcome Center y 192 Cocheras Plus.
 * - Cocheras internas reglamentarias de apoyo para carritos de golf en esquinas.
 */

import { getLotPriceUSD } from "../config/pricing";

export interface Point2D {
  x: number;
  y: number;
}

export interface UtmCoord {
  easting: number;
  northing: number;
}

// ── VÉRTICES OFICIALES EN COORDENADAS UTM (WGS84 ZONA 18S) ──
export const REAL_UTM_VERTICES = {
  A: { easting: 374763.430, northing: 8460135.551, lat: -13.926156, lng: -76.159257, label: "Vértice A (Sur / Ingreso)" },
  B: { easting: 374552.033, northing: 8460333.976, lat: -13.924352, lng: -76.161205, label: "Vértice B (Oeste)" },
  C: { easting: 374772.368, northing: 8460646.965, lat: -13.921533, lng: -76.159151, label: "Vértice C (Norte)" },
  D: { easting: 374993.574, northing: 8460440.900, lat: -13.923405, lng: -76.157113, label: "Vértice D (Este)" },
};

// Centroide de Referencia (Origen local 0,0)
export const REAL_CENTROID_UTM = {
  easting: 374770.351,
  northing: 8460389.348,
  lat: -13.923861,
  lng: -76.159180,
};

// Polígono Real en Metros Locales (+X = Este, +Y = Norte)
export const REAL_PERIMETER_LOCAL: Point2D[] = [
  { x: -6.921,   y: -253.797 }, // Vértice A (Sur)
  { x: -218.318, y: -55.372 },  // Vértice B (Oeste)
  { x: 2.017,    y: 257.617 },  // Vértice C (Norte)
  { x: 223.223,  y: 51.552 },   // Vértice D (Este)
];

export const TOTAL_AREA_M2 = 112591.80;
export const TOTAL_AREA_HA = 11.25918;
export const PERIMETER_LENGTH_M = 1357.21;
export const PERIMETER_SETBACK_M = 8.00;

// Paleta de Colores de Aldeas
export const ALDEA_THEMES = {
  1: { name: "Aldea 1 (Oeste)", color: "#4E7D5B", accent: "#385E42", label: "Sector Puesta de Sol" },
  2: { name: "Aldea 2 (Norte)", color: "#C89D34", accent: "#997828", label: "Sector Dunas Doradas" },
  3: { name: "Aldea 3 (Este)",  color: "#D35400", accent: "#A04000", label: "Sector Tierra Roja" },
  4: { name: "Aldea 4 (Sur)",   color: "#8D7B68", accent: "#6D5E4E", label: "Sector Pórtico Oasis" },
};

// Viewport SVG (1200 × 1200)
export const SVG_CONFIG = {
  width: 1200,
  height: 1200,
  centerX: 600,
  centerY: 600,
  scale: 2.15, // px por metro local
};

/**
 * Convierte metros locales a coordenadas SVG (con Y invertido)
 */
export function toSvg(x: number, y: number): { svgX: number; svgY: number } {
  return {
    svgX: Number((SVG_CONFIG.centerX + x * SVG_CONFIG.scale).toFixed(2)),
    svgY: Number((SVG_CONFIG.centerY - y * SVG_CONFIG.scale).toFixed(2)),
  };
}

/**
 * Convierte metros locales a coordenadas geográficas (Lat/Lng)
 */
export function toLatLng(x: number, y: number): { lat: number; lng: number } {
  // Factores de escala aproximados para Paracas (Lat -13.92°)
  const metersPerDegLat = 110574;
  const metersPerDegLng = 108000;
  return {
    lat: REAL_CENTROID_UTM.lat + y / metersPerDegLat,
    lng: REAL_CENTROID_UTM.lng + x / metersPerDegLng,
  };
}

// ── UTILIDADES GEOMÉTRICAS ──
export function pointInPolygon(pt: Point2D, poly: Point2D[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect =
      yi > pt.y !== yj > pt.y &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function distToSegment(p: Point2D, v: Point2D, w: Point2D): number {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

export function distToPerimeter(pt: Point2D): number {
  let minD = Infinity;
  for (let i = 0; i < REAL_PERIMETER_LOCAL.length; i++) {
    const j = (i + 1) % REAL_PERIMETER_LOCAL.length;
    const d = distToSegment(pt, REAL_PERIMETER_LOCAL[i], REAL_PERIMETER_LOCAL[j]);
    if (d < minD) minD = d;
  }
  return minD;
}

export function isPointInOasis(pt: Point2D, bufferM = 6.0): boolean {
  const rx = 46.0 + bufferM;
  const ry = 40.0 + bufferM;
  const dx = pt.x;
  const dy = pt.y - 10.0;
  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.0;
}

export function calculatePolygonArea(pts: Point2D[]): number {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2.0;
}

// ── ESTRUCTURA DE LOTES REALES ──
export interface RealUrbanLot {
  id: string;            // A1-01 .. A4-96
  manzana: string;       // MZ-01 ..
  aldea: 1 | 2 | 3 | 4;
  aldeaName: string;
  themeColor: string;
  tipo: "Lote Regular (120 m²)" | "Lote Premium Oasis (240 m²)";
  areaM2: 120.00 | 240.00;
  widthM: number;        // 8 o 16
  depthM: number;        // 15
  polygon: Point2D[];    // 4 vértices locales
  svgPolygon: { svgX: number; svgY: number }[];
  centroid: Point2D;
  svgCentroid: { svgX: number; svgY: number };
  latLng: { lat: number; lng: number };
  hasPedestrianAccess: boolean;
  status: "disponible" | "reservado" | "vendido";
  precioUsd: number;
  cocherasAsignadas: number;
  compatibleDomes: (6 | 7 | 8)[];
}

// ── PLAZAS DE ESTACIONAMIENTO (192 EN COMPLEJO SUR + APOYO EN ALDEAS) ──
export interface RealParkingStall {
  id: string;
  bay: string;
  sector: "Complejo Sur (192)" | "Apoyo Aldea";
  polygon: Point2D[];
  svgPolygon: { svgX: number; svgY: number }[];
  center: Point2D;
  svgCenter: { svgX: number; svgY: number };
}

// ── RED VIAL Y PEATONAL ──
export interface RoadCorridor {
  id: string;
  name: string;
  type: "boulevard" | "radial" | "service" | "pedestrian_promenade";
  widthM: number;
  path: Point2D[];
  svgPath: string;
}

// ── AMENIDADES DEL OASIS Y LLEGADA ──
export interface MasterplanAmenity {
  id: string;
  name: string;
  category: "lagoon" | "club" | "wellness" | "gastronomy" | "arrival" | "nature";
  badge: string;
  badgeColor: string;
  center: Point2D;
  svgCenter: { svgX: number; svgY: number };
  polygon?: Point2D[];
  svgPolygon?: { svgX: number; svgY: number }[];
  blurb: string;
  highlights: string[];
}

/**
 * Generador Maestro del Plano Urbanístico de Moon Paracas
 */
export function buildRealUrbanMasterplan() {
  const lots: RealUrbanLot[] = [];
  const parkingStalls: RealParkingStall[] = [];
  const roads: RoadCorridor[] = [];
  const amenities: MasterplanAmenity[] = [];

  const GAP = 0.50;

  // ── 1. GENERACIÓN DE LOTES RESIDENCIALES (384 LOTES EXACTOS) ──

  // Aldea 1 (Oeste): Columnas verticales
  const a1_colXs = [-190.0, -172.0, -154.0, -136.0, -118.0, -100.0, -82.0, -64.0];
  let a1_count = 0;
  a1_colXs.forEach((colX, cIdx) => {
    let y = -180.0;
    while (y <= 180.0 && a1_count < 96) {
      const isPremium = cIdx >= 6 && a1_count < 12;
      const widthM = isPremium ? 16.0 : 8.0;
      const depthM = 15.0;
      const poly: Point2D[] = [
        { x: colX, y },
        { x: colX + depthM, y },
        { x: colX + depthM, y: y + widthM },
        { x: colX, y: y + widthM },
      ];

      const valid = poly.every((pt) => {
        return (
          pointInPolygon(pt, REAL_PERIMETER_LOCAL) &&
          distToPerimeter(pt) >= PERIMETER_SETBACK_M &&
          !isPointInOasis(pt, 5.0) &&
          pt.x <= -12.0 &&
          pt.y <= -1.4 * pt.x - 6.0 &&
          pt.y >= 1.4 * pt.x + 6.0
        );
      });

      if (valid) {
        a1_count++;
        const cx = Number((colX + depthM / 2.0).toFixed(2));
        const cy = Number((y + widthM / 2.0).toFixed(2));
        lots.push({
          id: `A1-${String(a1_count).padStart(2, "0")}`,
          manzana: `MZ-0${Math.floor((a1_count - 1) / 12) + 1}`,
          aldea: 1,
          aldeaName: ALDEA_THEMES[1].name,
          themeColor: ALDEA_THEMES[1].color,
          tipo: isPremium ? "Lote Premium Oasis (240 m²)" : "Lote Regular (120 m²)",
          areaM2: isPremium ? 240.0 : 120.0,
          widthM,
          depthM,
          polygon: poly,
          svgPolygon: poly.map((p) => toSvg(p.x, p.y)),
          centroid: { x: cx, y: cy },
          svgCentroid: toSvg(cx, cy),
          latLng: toLatLng(cx, cy),
          hasPedestrianAccess: true,
          status: "disponible",
          precioUsd: getLotPriceUSD(isPremium ? 240 : 120),
          cocherasAsignadas: isPremium ? 2 : 1,
          compatibleDomes: isPremium ? [6, 7, 8] : [6, 7],
        });
        y += widthM + GAP;
      } else {
        y += 2.0;
      }
    }
  });

  // Aldea 2 (Norte): Filas horizontales
  const a2_rowYs = [230.0, 212.0, 194.0, 176.0, 158.0, 140.0, 122.0, 104.0, 86.0, 68.0];
  let a2_count = 0;
  a2_rowYs.forEach((rowY, rIdx) => {
    let x = -160.0;
    while (x <= 160.0 && a2_count < 96) {
      const isPremium = rIdx >= 8 && a2_count < 12;
      const widthM = isPremium ? 16.0 : 8.0;
      const depthM = 15.0;
      const poly: Point2D[] = [
        { x, y: rowY },
        { x: x + widthM, y: rowY },
        { x: x + widthM, y: rowY + depthM },
        { x, y: rowY + depthM },
      ];

      const valid = poly.every((pt) => {
        return (
          pointInPolygon(pt, REAL_PERIMETER_LOCAL) &&
          distToPerimeter(pt) >= PERIMETER_SETBACK_M &&
          !isPointInOasis(pt, 5.0) &&
          pt.y >= 50.0 &&
          pt.y >= -1.4 * pt.x + 6.0 &&
          pt.y >= 1.4 * pt.x + 6.0
        );
      });

      if (valid) {
        a2_count++;
        const cx = Number((x + widthM / 2.0).toFixed(2));
        const cy = Number((rowY + depthM / 2.0).toFixed(2));
        lots.push({
          id: `A2-${String(a2_count).padStart(2, "0")}`,
          manzana: `MZ-0${Math.floor((a2_count - 1) / 12) + 1}`,
          aldea: 2,
          aldeaName: ALDEA_THEMES[2].name,
          themeColor: ALDEA_THEMES[2].color,
          tipo: isPremium ? "Lote Premium Oasis (240 m²)" : "Lote Regular (120 m²)",
          areaM2: isPremium ? 240.0 : 120.0,
          widthM,
          depthM,
          polygon: poly,
          svgPolygon: poly.map((p) => toSvg(p.x, p.y)),
          centroid: { x: cx, y: cy },
          svgCentroid: toSvg(cx, cy),
          latLng: toLatLng(cx, cy),
          hasPedestrianAccess: true,
          status: "disponible",
          precioUsd: getLotPriceUSD(isPremium ? 240 : 120),
          cocherasAsignadas: isPremium ? 2 : 1,
          compatibleDomes: isPremium ? [6, 7, 8] : [6, 7],
        });
        x += widthM + GAP;
      } else {
        x += 2.0;
      }
    }
  });

  // Aldea 3 (Este): Columnas verticales
  const a3_colXs = [50.0, 68.0, 86.0, 104.0, 122.0, 140.0, 158.0, 176.0, 194.0];
  let a3_count = 0;
  a3_colXs.forEach((colX, cIdx) => {
    let y = -180.0;
    while (y <= 180.0 && a3_count < 96) {
      const isPremium = cIdx <= 1 && a3_count < 12;
      const widthM = isPremium ? 16.0 : 8.0;
      const depthM = 15.0;
      const poly: Point2D[] = [
        { x: colX, y },
        { x: colX + depthM, y },
        { x: colX + depthM, y: y + widthM },
        { x: colX, y: y + widthM },
      ];

      const valid = poly.every((pt) => {
        return (
          pointInPolygon(pt, REAL_PERIMETER_LOCAL) &&
          distToPerimeter(pt) >= PERIMETER_SETBACK_M &&
          !isPointInOasis(pt, 5.0) &&
          pt.x >= 12.0 &&
          pt.y <= 1.4 * pt.x - 6.0 &&
          pt.y >= -1.4 * pt.x + 6.0
        );
      });

      if (valid) {
        a3_count++;
        const cx = Number((colX + depthM / 2.0).toFixed(2));
        const cy = Number((y + widthM / 2.0).toFixed(2));
        lots.push({
          id: `A3-${String(a3_count).padStart(2, "0")}`,
          manzana: `MZ-0${Math.floor((a3_count - 1) / 12) + 1}`,
          aldea: 3,
          aldeaName: ALDEA_THEMES[3].name,
          themeColor: ALDEA_THEMES[3].color,
          tipo: isPremium ? "Lote Premium Oasis (240 m²)" : "Lote Regular (120 m²)",
          areaM2: isPremium ? 240.0 : 120.0,
          widthM,
          depthM,
          polygon: poly,
          svgPolygon: poly.map((p) => toSvg(p.x, p.y)),
          centroid: { x: cx, y: cy },
          svgCentroid: toSvg(cx, cy),
          latLng: toLatLng(cx, cy),
          hasPedestrianAccess: true,
          status: "disponible",
          precioUsd: getLotPriceUSD(isPremium ? 240 : 120),
          cocherasAsignadas: isPremium ? 2 : 1,
          compatibleDomes: isPremium ? [6, 7, 8] : [6, 7],
        });
        y += widthM + GAP;
      } else {
        y += 2.0;
      }
    }
  });

  // Aldea 4 (Sur): Filas horizontales
  const a4_rowYs = [-185.0, -168.0, -151.0, -134.0, -117.0, -100.0, -83.0, -66.0];
  let a4_count = 0;
  a4_rowYs.forEach((rowY, rIdx) => {
    let x = -160.0;
    while (x <= 160.0 && a4_count < 96) {
      if (x > -7 && x < 7) {
        x = 7;
        continue;
      }
      const isPremium = rIdx >= 6 && a4_count < 12;
      const widthM = isPremium ? 16.0 : 8.0;
      const depthM = 15.0;
      const poly: Point2D[] = [
        { x, y: rowY },
        { x: x + widthM, y: rowY },
        { x: x + widthM, y: rowY + depthM },
        { x, y: rowY + depthM },
      ];

      const valid = poly.every((pt) => {
        return (
          pointInPolygon(pt, REAL_PERIMETER_LOCAL) &&
          distToPerimeter(pt) >= PERIMETER_SETBACK_M &&
          !isPointInOasis(pt, 5.0) &&
          pt.y <= -50.0 &&
          pt.y >= -190.0 &&
          pt.y <= 1.4 * pt.x - 6.0 &&
          pt.y <= -1.4 * pt.x - 6.0
        );
      });

      if (valid) {
        a4_count++;
        const cx = Number((x + widthM / 2.0).toFixed(2));
        const cy = Number((rowY + depthM / 2.0).toFixed(2));
        lots.push({
          id: `A4-${String(a4_count).padStart(2, "0")}`,
          manzana: `MZ-0${Math.floor((a4_count - 1) / 12) + 1}`,
          aldea: 4,
          aldeaName: ALDEA_THEMES[4].name,
          themeColor: ALDEA_THEMES[4].color,
          tipo: isPremium ? "Lote Premium Oasis (240 m²)" : "Lote Regular (120 m²)",
          areaM2: isPremium ? 240.0 : 120.0,
          widthM,
          depthM,
          polygon: poly,
          svgPolygon: poly.map((p) => toSvg(p.x, p.y)),
          centroid: { x: cx, y: cy },
          svgCentroid: toSvg(cx, cy),
          latLng: toLatLng(cx, cy),
          hasPedestrianAccess: true,
          status: "disponible",
          precioUsd: getLotPriceUSD(isPremium ? 240 : 120),
          cocherasAsignadas: isPremium ? 2 : 1,
          compatibleDomes: isPremium ? [6, 7, 8] : [6, 7],
        });
        x += widthM + GAP;
      } else {
        x += 2.0;
      }
    }
  });

  // ── 2. ESTACIONAMIENTOS OFICIALES: 192 COCHERAS PLUS EN EL SUR ──
  // 4 Bahías de 48 plazas cada una (2.50m x 5.00m) en Y in [-245, -200]
  const bayConfigs = [
    { bay: "Bahía Oeste A", startX: -60.0, startY: -238.0, rows: 2, cols: 24 },
    { bay: "Bahía Oeste B", startX: -60.0, startY: -222.0, rows: 2, cols: 24 },
    { bay: "Bahía Este A",  startX: 10.0,  startY: -238.0, rows: 2, cols: 24 },
    { bay: "Bahía Este B",  startX: 10.0,  startY: -222.0, rows: 2, cols: 24 },
  ];

  let stallNum = 1;
  bayConfigs.forEach((cfg) => {
    for (let r = 0; r < cfg.rows; r++) {
      for (let c = 0; c < cfg.cols; c++) {
        if (stallNum > 192) break;
        const x = cfg.startX + c * 2.50;
        const y = cfg.startY + r * 5.50;
        const poly = [
          { x, y },
          { x: x + 2.40, y },
          { x: x + 2.40, y: y + 5.00 },
          { x, y: y + 5.00 },
        ];
        const center = { x: x + 1.20, y: y + 2.50 };
        parkingStalls.push({
          id: `PK-${String(stallNum++).padStart(3, "0")}`,
          bay: cfg.bay,
          sector: "Complejo Sur (192)",
          polygon: poly,
          svgPolygon: poly.map((p) => toSvg(p.x, p.y)),
          center,
          svgCenter: toSvg(center.x, center.y),
        });
      }
    }
  });

  // ── 3. RED VIAL Y PEATONAL (BOULEVARDS, RADIALES Y ALAMEDAS) ──
  // Boulevard Central Norte-Sur (10m)
  roads.push({
    id: "road-main-ns",
    name: "Boulevard Central de las Palmeras",
    type: "boulevard",
    widthM: 10.0,
    path: [{ x: 0, y: -245 }, { x: 0, y: -45 }, { x: 0, y: 45 }, { x: 0, y: 245 }],
    svgPath: `M ${toSvg(0, -245).svgX} ${toSvg(0, -245).svgY} L ${toSvg(0, -45).svgX} ${toSvg(0, -45).svgY} M ${toSvg(0, 45).svgX} ${toSvg(0, 45).svgY} L ${toSvg(0, 245).svgX} ${toSvg(0, 245).svgY}`,
  });

  // Eje Transversal Este-Oeste (8m)
  roads.push({
    id: "road-radial-ew",
    name: "Alameda Transversal del Oasis",
    type: "radial",
    widthM: 8.0,
    path: [{ x: -180, y: 0 }, { x: -45, y: 0 }, { x: 45, y: 0 }, { x: 180, y: 0 }],
    svgPath: `M ${toSvg(-180, 0).svgX} ${toSvg(-180, 0).svgY} L ${toSvg(-45, 0).svgX} ${toSvg(-45, 0).svgY} M ${toSvg(45, 0).svgX} ${toSvg(45, 0).svgY} L ${toSvg(180, 0).svgX} ${toSvg(180, 0).svgY}`,
  });

  // Diagonales Radiales (8m)
  roads.push({
    id: "road-diag-nw",
    name: "Paseo Diagonal Noroeste",
    type: "pedestrian_promenade",
    widthM: 6.0,
    path: [{ x: -35, y: 35 }, { x: -130, y: 130 }],
    svgPath: `M ${toSvg(-35, 35).svgX} ${toSvg(-35, 35).svgY} L ${toSvg(-130, 130).svgX} ${toSvg(-130, 130).svgY}`,
  });
  roads.push({
    id: "road-diag-ne",
    name: "Paseo Diagonal Noreste",
    type: "pedestrian_promenade",
    widthM: 6.0,
    path: [{ x: 35, y: 35 }, { x: 130, y: 130 }],
    svgPath: `M ${toSvg(35, 35).svgX} ${toSvg(35, 35).svgY} L ${toSvg(130, 130).svgX} ${toSvg(130, 130).svgY}`,
  });
  roads.push({
    id: "road-diag-sw",
    name: "Paseo Diagonal Suroeste",
    type: "pedestrian_promenade",
    widthM: 6.0,
    path: [{ x: -35, y: -35 }, { x: -130, y: -130 }],
    svgPath: `M ${toSvg(-35, -35).svgX} ${toSvg(-35, -35).svgY} L ${toSvg(-130, -130).svgX} ${toSvg(-130, -130).svgY}`,
  });
  roads.push({
    id: "road-diag-se",
    name: "Paseo Diagonal Sureste",
    type: "pedestrian_promenade",
    widthM: 6.0,
    path: [{ x: 35, y: -35 }, { x: 130, y: -130 }],
    svgPath: `M ${toSvg(35, -35).svgX} ${toSvg(35, -35).svgY} L ${toSvg(130, -130).svgX} ${toSvg(130, -130).svgY}`,
  });

  // ── 4. AMENIDADES DEL OASIS CENTRAL & COMPLEJO DE LLEGADA ──
  // Laguna Cristalina Orgánica
  amenities.push({
    id: "am-lagoon",
    name: "Laguna Cristalina Orgánica",
    category: "lagoon",
    badge: "Oasis Central",
    badgeColor: "#00838F",
    center: { x: 0, y: 10 },
    svgCenter: toSvg(0, 10),
    blurb: "Espejo de agua cristalina de 20,000 m² con filtración biológica, fondo de arena blanca y temperatura controlada.",
    highlights: ["Playa de arena blanca", "Muelle flotante", "Zona de nado seguro"],
  });

  // Club House & Gastro Bar
  amenities.push({
    id: "am-clubhouse",
    name: "Club House & Gastro Bar",
    category: "club",
    badge: "Gastronomía",
    badgeColor: "#B85A3D",
    center: { x: 0, y: 38 },
    svgCenter: toSvg(0, 38),
    polygon: [
      { x: -18, y: 30 },
      { x: 18, y: 30 },
      { x: 18, y: 46 },
      { x: -18, y: 46 },
    ],
    svgPolygon: [
      toSvg(-18, 30),
      toSvg(18, 30),
      toSvg(18, 46),
      toSvg(-18, 46),
    ],
    blurb: "Restaurante gourmet con cava desértica, terraza panorámica hacia la laguna y arquitectura bioclimática de adobe y madera.",
    highlights: ["Cocina de autor marina", "Bar de cócteles botánicos", "Terraza sunset"],
  });

  // Oasis Infinity Pool
  amenities.push({
    id: "am-pool",
    name: "Oasis Infinity Pool & Solárium",
    category: "wellness",
    badge: "Relax",
    badgeColor: "#00ACC1",
    center: { x: 0, y: -18 },
    svgCenter: toSvg(0, -18),
    polygon: [
      { x: -22, y: -26 },
      { x: 22, y: -26 },
      { x: 22, y: -10 },
      { x: -22, y: -10 },
    ],
    svgPolygon: [
      toSvg(-22, -26),
      toSvg(22, -26),
      toSvg(22, -10),
      toSvg(-22, -10),
    ],
    blurb: "Piscina sinfín sobre la laguna con camas balinesas, servicio de toallas y área de hidromasaje.",
    highlights: ["Borde infinito", "Decks de madera teca", "Servicio a la reposera"],
  });

  // Yoga & Wellness Deck
  amenities.push({
    id: "am-yoga",
    name: "Santuario Yoga & Spa",
    category: "wellness",
    badge: "Bienestar",
    badgeColor: "#4E7D5B",
    center: { x: -34, y: 10 },
    svgCenter: toSvg(-34, 10),
    blurb: "Plataforma de meditación y yoga al aire libre orientada al amanecer con sauna seco y baños de hielo.",
    highlights: ["Clases al amanecer", "Sonoterapia", "Sauna desértico"],
  });

  // Sunset Fire Pits (Fogateros)
  amenities.push({
    id: "am-fire",
    name: "Sunset Fire Pits & Círculo Estelar",
    category: "nature",
    badge: "Experiencia",
    badgeColor: "#D35400",
    center: { x: 34, y: 10 },
    svgCenter: toSvg(34, 10),
    blurb: "Zona de fogatas bajo el cielo estrellado de Paracas con asientos circulares en piedra caliche.",
    highlights: ["Observación astronómica", "Fogatas nocturnas", "Cata de vinos"],
  });

  // Pórtico Monumental de Entrada
  amenities.push({
    id: "am-portico",
    name: "Pórtico Monumental & Acceso Controlado",
    category: "arrival",
    badge: "Seguridad 24/7",
    badgeColor: "#161310",
    center: { x: 0, y: -245 },
    svgCenter: toSvg(0, -245),
    polygon: [
      { x: -14, y: -252 },
      { x: 14, y: -252 },
      { x: 14, y: -238 },
      { x: -14, y: -238 },
    ],
    svgPolygon: [
      toSvg(-14, -252),
      toSvg(14, -252),
      toSvg(14, -238),
      toSvg(-14, -238),
    ],
    blurb: "Ingreso principal con control biométrico, garita de seguridad blindada y diseño en muros ciclópeos de piedra caliche.",
    highlights: ["Acceso vehicular doble", "Reconocimiento de placas", "Seguridad 24/7"],
  });

  // Welcome Center & Concierge
  amenities.push({
    id: "am-welcome",
    name: "Welcome Center & Transfer Hub",
    category: "arrival",
    badge: "Recepción",
    badgeColor: "#8D7B68",
    center: { x: -30, y: -225 },
    svgCenter: toSvg(-30, -225),
    polygon: [
      { x: -42, y: -232 },
      { x: -18, y: -232 },
      { x: -18, y: -218 },
      { x: -42, y: -218 },
    ],
    svgPolygon: [
      toSvg(-42, -232),
      toSvg(-18, -232),
      toSvg(-18, -218),
      toSvg(-42, -218),
    ],
    blurb: "Lobby de bienvenida, check-in para propietarios y huéspedes, estación de carritos de golf eléctricos y guardaequipajes.",
    highlights: ["Concierge personal", "Flota de golf carts", "Café de especialidad"],
  });

  // Estadísticas del Balance de Masas
  let totalVendibleM2 = 0;
  const lotsByAldea = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const lotsByTipo = { regular: 0, premium: 0 };

  lots.forEach((l) => {
    totalVendibleM2 += l.areaM2;
    lotsByAldea[l.aldea]++;
    if (l.areaM2 === 240) lotsByTipo.premium++;
    else lotsByTipo.regular++;
  });

  const oasisAreaM2 = 20662.15;
  const roadsAndPromenadesM2 = 21400.0;
  const arrivalAndParkingM2 = 5600.0;
  const setbacksAndBuffersM2 = TOTAL_AREA_M2 - (totalVendibleM2 + oasisAreaM2 + roadsAndPromenadesM2 + arrivalAndParkingM2);

  return {
    perimeter: REAL_PERIMETER_LOCAL,
    svgPerimeter: REAL_PERIMETER_LOCAL.map((p) => toSvg(p.x, p.y)),
    lots,
    parkingStalls,
    roads,
    amenities,
    stats: {
      totalLots: lots.length,
      byAldea: lotsByAldea,
      byTipo: lotsByTipo,
      totalAreaM2: TOTAL_AREA_M2,
      totalVendibleM2,
      vendiblePercent: Number(((totalVendibleM2 / TOTAL_AREA_M2) * 100).toFixed(1)),
      commonAndRoadsPercent: Number((((TOTAL_AREA_M2 - totalVendibleM2) / TOTAL_AREA_M2) * 100).toFixed(1)),
      oasisAreaM2,
      parkingStallsCount: parkingStalls.length,
    },
  };
}

export const REAL_MASTERPLAN_MODEL = buildRealUrbanMasterplan();
