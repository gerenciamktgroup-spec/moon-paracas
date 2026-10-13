/**
 * ============================================================================
 * LOTE MATRIZ MOON PARACAS — GEOMETRÍA OFICIAL Y CONVERSIÓN GEOESPACIAL
 * ============================================================================
 * 
 * DATOS OFICIALES DE TÍTULO / REGISTRO MATRIZ:
 * - Sistema de Coordenadas: UTM Zona 18S (Hemisferio Sur)
 * - Elipsoide / Datum: WGS 84
 * - Área Total Registrada: 112,591.80 m² (11.26 ha)
 * - Perímetro Total: 1,357.21 ml
 * - Lados:
 *   - Lado A-B: 290.24 m
 *   - Lado B-C: 381.74 m
 *   - Lado C-D: 301.85 m
 *   - Lado D-A: 383.38 m
 * 
 * VÉRTICES OFICIALES (UTM 18S):
 * - Vértice A: Este (X) = 374753.150 m, Norte (Y) = 8460135.042 m  (Sur)
 * - Vértice B: Este (X) = 374652.533 m, Norte (Y) = 8460334.307 m  (Oeste)
 * - Vértice C: Este (X) = 374772.257 m, Norte (Y) = 8460646.472 m  (Norte)
 * - Vértice D: Este (X) = 374993.877 m, Norte (Y) = 8460441.531 m  (Este)
 * 
 * TRANSFORMACIÓN A SISTEMA LOCAL DE ESCENA (1 unidad = 1.00 metro):
 * - Origen Cartesiano (0,0): Centroide geométrico del Lote Matriz
 *   - X₀ (Easting)  = 374,792.954 m
 *   - Y₀ (Northing) = 8,460,389.338 m
 * - Coordenada Local en Metros:
 *   - X_local = X_UTM - X₀  (+X = Este, -X = Oeste)
 *   - Y_local = Y_UTM - Y₀  (+Y = Norte, -Y = Sur)
 * - Coordenada en Canvas SVG (1000 × 1000):
 *   - X_svg = 500 + X_local * scale
 *   - Y_svg = 500 - Y_local * scale  (Inversión de eje Y de pantalla hacia arriba)
 */

export interface UtmVertex {
  id: "A" | "B" | "C" | "D";
  name: string;
  cardinalLabel: string;
  easting: number;   // Metros UTM Este
  northing: number;  // Metros UTM Norte
  statedDistanceToNextM: number; // Longitud oficial de lindero
}

export interface LocalVertex {
  id: "A" | "B" | "C" | "D";
  name: string;
  cardinalLabel: string;
  xMeters: number;   // Metros locales (+X = Este)
  yMeters: number;   // Metros locales (+Y = Norte)
  svgX: number;      // Coordenada SVG
  svgY: number;      // Coordenada SVG
  statedDistanceToNextM: number;
}

export const LOTE_MATRIZ_UTM_VERTICES: UtmVertex[] = [
  {
    id: "A",
    name: "Vértice A",
    cardinalLabel: "Vértice Sur",
    easting: 374753.150,
    northing: 8460135.042,
    statedDistanceToNextM: 290.24,
  },
  {
    id: "B",
    name: "Vértice B",
    cardinalLabel: "Vértice Oeste",
    easting: 374652.533,
    northing: 8460334.307,
    statedDistanceToNextM: 381.74,
  },
  {
    id: "C",
    name: "Vértice C",
    cardinalLabel: "Vértice Norte",
    easting: 374772.257,
    northing: 8460646.472,
    statedDistanceToNextM: 301.85,
  },
  {
    id: "D",
    name: "Vértice D",
    cardinalLabel: "Vértice Este",
    easting: 374993.877,
    northing: 8460441.531,
    statedDistanceToNextM: 383.38,
  },
];

export const LOTE_MATRIZ_TECHNICAL_DATA = {
  areaM2: 112391.80,
  areaHa: 11.23918,
  perimeterM: 1357.21,
  zone: "UTM Zona 18S",
  datum: "WGS 84",
  department: "Ica",
  province: "Pisco",
  district: "Paracas",
  sides: [
    { from: "A", to: "B", lengthM: 290.24, bearingLabel: "Sur a Oeste" },
    { from: "B", to: "C", lengthM: 381.74, bearingLabel: "Oeste a Norte" },
    { from: "C", to: "D", lengthM: 301.85, bearingLabel: "Norte a Este" },
    { from: "D", to: "A", lengthM: 383.38, bearingLabel: "Este a Sur" },
  ],
};

// Centroide de referencia (Origen local 0,0)
export const LOTE_MATRIZ_CENTROID_UTM = {
  easting: (374753.150 + 374652.533 + 374772.257 + 374993.877) / 4, // 374792.954
  northing: (8460135.042 + 8460334.307 + 8460646.472 + 8460441.531) / 4, // 8460389.338
};

/**
 * Convierte coordenadas UTM a coordenadas locales en metros centradas en el centroide
 */
export function utmToLocalMeters(easting: number, northing: number): { x: number; y: number } {
  return {
    x: Number((easting - LOTE_MATRIZ_CENTROID_UTM.easting).toFixed(3)),
    y: Number((northing - LOTE_MATRIZ_CENTROID_UTM.northing).toFixed(3)),
  };
}

/**
 * Configuración de Escala para Visualizadores 2D (SVG Canvas)
 */
export const SVG_CANVAS_CONFIG = {
  width: 1000,
  height: 1000,
  centerX: 500,
  centerY: 500,
  // Rango local: X de -140.4 a +200.9 (341.3m), Y de -254.3 a +257.1 (511.4m)
  // Escala en px/metro para encajar 511.4m en ~760px disponibles (dejando padding):
  scalePxPerMeter: 1.48,
};

/**
 * Convierte metros locales a coordenadas del Canvas SVG
 */
export function localMetersToSvg(xLocal: number, yLocal: number): { svgX: number; svgY: number } {
  return {
    svgX: Number((SVG_CANVAS_CONFIG.centerX + xLocal * SVG_CANVAS_CONFIG.scalePxPerMeter).toFixed(2)),
    svgY: Number((SVG_CANVAS_CONFIG.centerY - yLocal * SVG_CANVAS_CONFIG.scalePxPerMeter).toFixed(2)),
  };
}

/**
 * Vértices del Lote Matriz calculados y listos para dibujo 2D/3D
 */
export const REAL_LOTE_MATRIZ_LOCAL_VERTICES: LocalVertex[] = LOTE_MATRIZ_UTM_VERTICES.map((v) => {
  const local = utmToLocalMeters(v.easting, v.northing);
  const svg = localMetersToSvg(local.x, local.y);
  return {
    id: v.id,
    name: v.name,
    cardinalLabel: v.cardinalLabel,
    xMeters: local.x,
    yMeters: local.y,
    svgX: svg.svgX,
    svgY: svg.svgY,
    statedDistanceToNextM: v.statedDistanceToNextM,
  };
});

/**
 * Path SVG cerrado para renderizar el perímetro del Lote Matriz
 */
export const LOTE_MATRIZ_SVG_PATH = REAL_LOTE_MATRIZ_LOCAL_VERTICES.map((v, i) =>
  `${i === 0 ? "M" : "L"} ${v.svgX} ${v.svgY}`
).join(" ") + " Z";

/**
 * Retorna las coordenadas del Oasis Placeholder en el centroide geométrico
 */
export const OASIS_CENTROID_LOCAL = {
  xMeters: 0,
  yMeters: 0,
  svgX: SVG_CANVAS_CONFIG.centerX,
  svgY: SVG_CANVAS_CONFIG.centerY,
  radiusMeters: 45.0, // Radio del oasis central ~5,000-6,000 m²
};
