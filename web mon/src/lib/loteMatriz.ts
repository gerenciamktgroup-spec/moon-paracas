/**
 * ============================================================================
 * LOTE MATRIZ — GEOMETRÍA DE VENTA COMERCIAL
 * MOON PARACAS MASTERPLAN
 * ============================================================================
 *
 * El visor comercial es un cuadrado de programa de 112,554.30 m² (11.255 ha).
 * Lado S = sqrt(112554.30) ≈ 335.49 m.
 * Origen (0, 0) = Centro geométrico del proyecto (+Y = Norte, +X = Este).
 * Frontis: Lado Sur horizontal (Y = -HALF).
 * Franja de Servicios: Y in [-HALF, -HALF + 48] (Cero lotes aquí).
 * Oasis: Polígono octogonal de 20,662 m² ± 1% con centro en (0, +18).
 * 4 Aldeas en Trapecios delimitadas por diagonales SW-NE y SE-NW.
 */

export interface Point2D {
  x: number;
  y: number;
}

// 1. Constantes del Predio Cuadrado
export const PROGRAM_AREA_M2 = 112554.30;
export const SQUARE_SIDE_M = Math.sqrt(PROGRAM_AREA_M2); // 335.490685 m
export const HALF_SIDE_M = SQUARE_SIDE_M / 2;           // 167.74534 m

export const PERIMETER_SETBACK_M = 10.0; // Retiro perimetral de pirca
export const SERVICE_DEPTH_M = 48.0;     // Profundidad de franja sur de servicios

export const FRONT_Y = -HALF_SIDE_M;                     // -167.74534 m
export const SERVICE_Y = FRONT_Y + SERVICE_DEPTH_M;      // -119.74534 m

export const GATE_POSITION: Point2D = { x: 0, y: FRONT_Y };

// Anillos del Predio
export const PROPERTY_BOUNDS = {
  minX: -HALF_SIDE_M,
  maxX: HALF_SIDE_M,
  minY: -HALF_SIDE_M,
  maxY: HALF_SIDE_M,
};

export const INSET_RING_BOUNDS = {
  minX: -HALF_SIDE_M + PERIMETER_SETBACK_M, // -157.74534 m
  maxX: HALF_SIDE_M - PERIMETER_SETBACK_M,  // +157.74534 m
  minY: SERVICE_Y,                          // -119.74534 m (Franja sur excluida para lotes)
  maxY: HALF_SIDE_M - PERIMETER_SETBACK_M,  // +157.74534 m
};

// 2. Geometría Oficial del Oasis Octagonal (Área = 20,662.38 m²)
export const OASIS_CENTER: Point2D = { x: 0, y: 18.0 };
export const OASIS_RX = 72.0;
export const OASIS_RY = 80.01;
export const OASIS_CHAMFER = 34.5;

export const OASIS_OCTAGON_VERTICES: Point2D[] = [
  { x: OASIS_CENTER.x - OASIS_RX + OASIS_CHAMFER, y: OASIS_CENTER.y + OASIS_RY },           // Top-Left (-37.5, 98.01)
  { x: OASIS_CENTER.x + OASIS_RX - OASIS_CHAMFER, y: OASIS_CENTER.y + OASIS_RY },           // Top-Right (37.5, 98.01)
  { x: OASIS_CENTER.x + OASIS_RX, y: OASIS_CENTER.y + OASIS_RY - OASIS_CHAMFER },           // Right-Top (72, 63.51)
  { x: OASIS_CENTER.x + OASIS_RX, y: OASIS_CENTER.y - OASIS_RY + OASIS_CHAMFER },           // Right-Bottom (72, -27.51)
  { x: OASIS_CENTER.x + OASIS_RX - OASIS_CHAMFER, y: OASIS_CENTER.y - OASIS_RY },           // Bottom-Right (37.5, -62.01)
  { x: OASIS_CENTER.x - OASIS_RX + OASIS_CHAMFER, y: OASIS_CENTER.y - OASIS_RY },           // Bottom-Left (-37.5, -62.01)
  { x: OASIS_CENTER.x - OASIS_RX, y: OASIS_CENTER.y - OASIS_RY + OASIS_CHAMFER },           // Left-Bottom (-72, -27.51)
  { x: OASIS_CENTER.x - OASIS_RX, y: OASIS_CENTER.y + OASIS_RY - OASIS_CHAMFER },           // Left-Top (-72, 63.51)
];

// Anillo vial del Oasis (6.00 m de offset exterior)
export const OASIS_ROAD_BUFFER_M = 6.0;
export const OASIS_BUFFER_VERTICES: Point2D[] = [
  { x: OASIS_CENTER.x - (OASIS_RX + 6.0) + (OASIS_CHAMFER + 3.0), y: OASIS_CENTER.y + OASIS_RY + 6.0 },
  { x: OASIS_CENTER.x + (OASIS_RX + 6.0) - (OASIS_CHAMFER + 3.0), y: OASIS_CENTER.y + OASIS_RY + 6.0 },
  { x: OASIS_CENTER.x + OASIS_RX + 6.0, y: OASIS_CENTER.y + OASIS_RY + 6.0 - (OASIS_CHAMFER + 3.0) },
  { x: OASIS_CENTER.x + OASIS_RX + 6.0, y: OASIS_CENTER.y - OASIS_RY - 6.0 + (OASIS_CHAMFER + 3.0) },
  { x: OASIS_CENTER.x + (OASIS_RX + 6.0) - (OASIS_CHAMFER + 3.0), y: OASIS_CENTER.y - OASIS_RY - 6.0 },
  { x: OASIS_CENTER.x - (OASIS_RX + 6.0) + (OASIS_CHAMFER + 3.0), y: OASIS_CENTER.y - OASIS_RY - 6.0 },
  { x: OASIS_CENTER.x - OASIS_RX - 6.0, y: OASIS_CENTER.y - OASIS_RY - 6.0 + (OASIS_CHAMFER + 3.0) },
  { x: OASIS_CENTER.x - OASIS_RX - 6.0, y: OASIS_CENTER.y + OASIS_RY + 6.0 - (OASIS_CHAMFER + 3.0) },
];

/**
 * Calcula el área de un polígono 2D mediante la fórmula del agrimensor (shoelace)
 */
export function calculatePolygonArea(pts: Point2D[]): number {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2.0;
}

export const MEASURED_OASIS_AREA_M2 = calculatePolygonArea(OASIS_OCTAGON_VERTICES);

/**
 * Prueba si un punto 2D está dentro de un polígono (Ray Casting)
 */
export function isPointInPolygon(pt: Point2D, poly: Point2D[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
      (pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Prueba si un punto está dentro del Oasis o de su anillo vial de 6m
 */
export function isPointInOasis(pt: Point2D, includeBuffer = true): boolean {
  const poly = includeBuffer ? OASIS_BUFFER_VERTICES : OASIS_OCTAGON_VERTICES;
  return isPointInPolygon(pt, poly);
}

// 3. Paleta Oficial de Colores de Aldea
export const ALDEA_COLORS = {
  1: "#4E7D5B", // Aldea 1 (Oeste) - Verde Agave
  2: "#C89D34", // Aldea 2 (Norte) - Ocre Dorado
  3: "#D35400", // Aldea 3 (Este)  - Terracota Paracas
  4: "#8D7B68", // Aldea 4 (Sur)   - Arena Desértica
} as const;

export const UI_PALETTE = {
  night: "#161310",
  sand: "#F7F1E8",
  clay: "#B85A3D",
  gold: "#C5A059",
  road: "#E3D7C5",
  roadDash: "#C5A059",
  waterLight: "#66D3C7",
  waterDeep: "#3D8B84",
  waterDark: "#205853",
} as const;

// 4. Configuración del Canvas SVG y Transformación
export const SVG_VIEWPORT = {
  width: 1000,
  height: 1000,
  centerX: 500,
  centerY: 500,
  // 1 metro = 2.45 píxeles para que 335.49 m ocupe ~822 px (dejando márgenes cómodos)
  scalePxPerMeter: 2.45,
};

/**
 * Convierte coordenadas métricas locales (origen centro 0,0, +Y Norte) a coordenadas SVG (origen superior-izq, +Y hacia abajo)
 */
export function metersToSvg(x: number, y: number): { svgX: number; svgY: number } {
  return {
    svgX: Number((SVG_VIEWPORT.centerX + x * SVG_VIEWPORT.scalePxPerMeter).toFixed(2)),
    svgY: Number((SVG_VIEWPORT.centerY - y * SVG_VIEWPORT.scalePxPerMeter).toFixed(2)),
  };
}

export function svgToMeters(svgX: number, svgY: number): Point2D {
  return {
    x: Number(((svgX - SVG_VIEWPORT.centerX) / SVG_VIEWPORT.scalePxPerMeter).toFixed(2)),
    y: Number(((SVG_VIEWPORT.centerY - svgY) / SVG_VIEWPORT.scalePxPerMeter).toFixed(2)),
  };
}

// 5. Inset Técnico Legal (Predio Matriz KMZ UTM Zona 18S)
export const LEGAL_KMZ_INSET_DATA = {
  title: "Predio Legal Matriz (KMZ UTM Zona 18S)",
  description: "Polígono irregular A-B-C-D inscrito en Registros Públicos (Sunarp)",
  vertices: [
    { id: "A", east: 374753.150, north: 8460135.042, label: "Sur (Frontis)" },
    { id: "B", east: 374652.533, north: 8460334.307, label: "Oeste" },
    { id: "C", east: 374772.257, north: 8460646.472, label: "Norte" },
    { id: "D", east: 374993.877, north: 8460441.531, label: "Este" },
  ],
  areaM2: 112591.80,
  perimeterM: 1357.21,
};
