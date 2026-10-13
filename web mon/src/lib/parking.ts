/**
 * ============================================================================
 * SOUTH SERVICE ZONE & 192 COCHERAS PLUS
 * MOON PARACAS MASTERPLAN
 * ============================================================================
 *
 * Franja Sur de Servicios (48.00 m x 335.49 m):
 * Y in [FRONT_Y, SERVICE_Y] = [-167.74534, -119.74534].
 *
 * Componentes de Acceso & Llegada:
 * - Rotonda exterior (R=10m) en (0, FRONT_Y - 12)
 * - Pórtico Monumental 22x16 m en el eje X=0
 * - Welcome Center 24x12 m a la izquierda (X ≈ -36)
 * - Lobby Vistas 24x12 m a la derecha (X ≈ +36)
 * - 192 Plazas de Estacionamiento reales de 2.50 x 5.00 m en 4 bahías legibles
 *
 * Cero lotes residenciales en esta franja.
 */

import { Point2D, FRONT_Y, SERVICE_Y, metersToSvg } from "./loteMatriz";

export interface ParkingStall {
  id: string;             // P-001 .. P-192
  numero: number;
  bayName: string;
  width_m: number;        // 2.50 m
  depth_m: number;        // 5.00 m
  area_m2: number;        // 12.50 m²
  polygon: Point2D[];     // 4 vértices CCW
  svgPolygon: { svgX: number; svgY: number }[];
  centroid: Point2D;
  svgCentroid: { svgX: number; svgY: number };
  status: "disponible" | "reservado" | "asignado";
  price_usd: number;
}

export interface ArrivalAmenity {
  id: string;
  name: string;
  shortLabel: string;
  category: "acceso" | "recepcion" | "experiencia";
  width_m: number;
  depth_m: number;
  center: Point2D;
  polygon: Point2D[];
  svgPolygon: { svgX: number; svgY: number }[];
  blurb: string;
  badgeColor: string;
}

/**
 * Genera las 192 plazas de Cochera Plus en 4 campos de estacionamiento ordenados
 */
export function generateParkingStalls(): ParkingStall[] {
  const stalls: ParkingStall[] = [];

  // 4 Bahías de 48 plazas cada una (2 filas de 24 plazas) = 192 plazas
  const BAYS = [
    { name: "Bahía Oeste A (Superior)", xStart: -142.0, yStart: -128.0, rows: 2, cols: 24 },
    { name: "Bahía Oeste B (Inferior)", xStart: -142.0, yStart: -148.0, rows: 2, cols: 24 },
    { name: "Bahía Este A (Superior)",  xStart: 82.0,  yStart: -128.0, rows: 2, cols: 24 },
    { name: "Bahía Este B (Inferior)",  xStart: 82.0,  yStart: -148.0, rows: 2, cols: 24 },
  ];

  let idNum = 1;
  BAYS.forEach((bay) => {
    for (let r = 0; r < bay.rows; r++) {
      for (let c = 0; c < bay.cols; c++) {
        const x = bay.xStart + c * 2.50;
        const y = bay.yStart - r * 5.00;

        const poly: Point2D[] = [
          { x, y },
          { x: x + 2.50, y },
          { x: x + 2.50, y: y + 5.00 },
          { x, y: y + 5.00 },
        ];

        const cx = x + 1.25;
        const cy = y + 2.50;

        const svgPoly = poly.map((pt) => metersToSvg(pt.x, pt.y));
        const svgCent = metersToSvg(cx, cy);

        stalls.push({
          id: `P-${String(idNum).padStart(3, "0")}`,
          numero: idNum++,
          bayName: bay.name,
          width_m: 2.50,
          depth_m: 5.00,
          area_m2: 12.50,
          polygon: poly,
          svgPolygon: svgPoly,
          centroid: { x: cx, y: cy },
          svgCentroid: svgCent,
          status: idNum % 7 === 0 ? "reservado" : "disponible",
          price_usd: 4500,
        });
      }
    }
  });

  return stalls;
}

/**
 * Equipamientos y Pabellones de la Franja de Acceso Sur
 */
export function getArrivalAmenities(): ArrivalAmenity[] {
  const amenities: {
    id: string;
    name: string;
    shortLabel: string;
    category: "acceso" | "recepcion" | "experiencia";
    width_m: number;
    depth_m: number;
    cx: number;
    cy: number;
    blurb: string;
    badgeColor: string;
  }[] = [
    {
      id: "portico-monumental",
      name: "Pórtico Monumental 24/7",
      shortLabel: "PÓRTICO INGRESO",
      category: "acceso",
      width_m: 22.0,
      depth_m: 16.0,
      cx: 0.0,
      cy: FRONT_Y + 12.0, // Y = -155.74
      blurb: "Ingreso monumental con control biométrico, garita de vigilancia 24/7 y carril exclusivo para residentes.",
      badgeColor: "#161310",
    },
    {
      id: "welcome-center",
      name: "Welcome Center & Concierge",
      shortLabel: "WELCOME CENTER",
      category: "recepcion",
      width_m: 24.0,
      depth_m: 12.0,
      cx: -38.0,
      cy: FRONT_Y + 14.0, // Y = -153.74
      blurb: "Pabellón de recepción de propietarios y huéspedes con atención de concierge, check-in y carritos eléctricos.",
      badgeColor: "#C5A059",
    },
    {
      id: "lobby-vistas",
      name: "Lobby de Vistas & Showroom",
      shortLabel: "LOBBY VISTAS",
      category: "experiencia",
      width_m: 24.0,
      depth_m: 12.0,
      cx: 38.0,
      cy: FRONT_Y + 14.0, // Y = -153.74
      blurb: "Espacio de exhibición arquitectónica de tipologías de domos, maquetas interactivas y terraza de bienvenida.",
      badgeColor: "#C5A059",
    },
  ];

  return amenities.map((am) => {
    const hw = am.width_m / 2.0;
    const hd = am.depth_m / 2.0;
    const poly: Point2D[] = [
      { x: am.cx - hw, y: am.cy - hd },
      { x: am.cx + hw, y: am.cy - hd },
      { x: am.cx + hw, y: am.cy + hd },
      { x: am.cx - hw, y: am.cy + hd },
    ];
    return {
      ...am,
      center: { x: am.cx, y: am.cy },
      polygon: poly,
      svgPolygon: poly.map((pt) => metersToSvg(pt.x, pt.y)),
    };
  });
}

export const PARKING_STALLS = generateParkingStalls();
export const ARRIVAL_AMENITIES = getArrivalAmenities();
