/**
 * ============================================================================
 * OASIS CENTRAL PROGRAM — MOON PARACAS
 * ============================================================================
 *
 * Programa interior del Oasis (Área = 20,662.38 m²).
 * Todos los elementos están estrictamente contenidos dentro del octágono central.
 *
 * Nodos:
 * - Espejo de agua / Laguna orgánica al centro
 * - Bar & Lounge al Norte
 * - Fogatas Sociales al NE
 * - Juegos Infantiles al SE
 * - Yoga Deck al SO
 * - Hamacas / Zona Chill al NO
 */

import { Point2D, OASIS_CENTER, metersToSvg } from "./loteMatriz";

export interface OasisNode {
  id: string;
  name: string;
  shortLabel: string;
  category: "oasis" | "wellness" | "gastronomia" | "recreacion";
  categoryLabel: string;
  center: Point2D;
  svgCenter: { svgX: number; svgY: number };
  blurb: string;
  details: string[];
  badgeColor: string;
}

export const OASIS_NODES: OasisNode[] = [
  {
    id: "laguna-cristalina",
    name: "Laguna Cristalina & Playa de Arena",
    shortLabel: "LAGUNA CRISTALINA",
    category: "oasis",
    categoryLabel: "Oasis Central",
    center: { x: OASIS_CENTER.x, y: OASIS_CENTER.y + 4.0 },
    svgCenter: { svgX: 0, svgY: 0 },
    blurb: "Espejo de agua cristalina orgánica de 3,200 m² con orillas de arena blanca desértica y palmeras nativas.",
    details: ["3,200 m² de espejo de agua", "Playa de arena compactada", "Ecosistema de palmeras datileras"],
    badgeColor: "#3D8B84",
  },
  {
    id: "bar-lounge",
    name: "Bar & Lounge El Mirador",
    shortLabel: "BAR & LOUNGE",
    category: "gastronomia",
    categoryLabel: "Gastronomía",
    center: { x: OASIS_CENTER.x, y: OASIS_CENTER.y + 52.0 },
    svgCenter: { svgX: 0, svgY: 0 },
    blurb: "Cocktail bar y lounge con cocina de autor paracas, terraza elevada con pérgola de caña brava.",
    details: ["Coctelería de autor y piscos", "Cocina marina fresca", "Terraza panorámica sombreada"],
    badgeColor: "#A84F36",
  },
  {
    id: "fogatas-sociales",
    name: "Fogatas Sociales & Astroturismo",
    shortLabel: "FOGATAS SOCIALES",
    category: "recreacion",
    categoryLabel: "Noche Estelar",
    center: { x: OASIS_CENTER.x + 44.0, y: OASIS_CENTER.y + 32.0 },
    svgCenter: { svgX: 0, svgY: 0 },
    blurb: "Firepits de piedra caliche hundidos en la arena bajo el cielo estrellado libre de contaminación lumínica.",
    details: ["3 Firepits de piedra caliche", "Telescopio para astroturismo", "Música acústica y wine bar"],
    badgeColor: "#C5A059",
  },
  {
    id: "juegos-infantiles",
    name: "Juegos Infantiles Naturales",
    shortLabel: "JUEGOS INFANTILES",
    category: "recreacion",
    categoryLabel: "Familia",
    center: { x: OASIS_CENTER.x + 44.0, y: OASIS_CENTER.y - 32.0 },
    svgCenter: { svgX: 0, svgY: 0 },
    blurb: "Área de juegos ecológicos de madera y cuerdas, integrado armónicamente con el paisaje dunar.",
    details: ["Materiales de madera certificada", "Sombra continua", "Piso de arena tamizada segura"],
    badgeColor: "#C5A059",
  },
  {
    id: "yoga-deck",
    name: "Santuario & Yoga Deck",
    shortLabel: "YOGA DECK",
    category: "wellness",
    categoryLabel: "Bienestar",
    center: { x: OASIS_CENTER.x - 44.0, y: OASIS_CENTER.y - 32.0 },
    svgCenter: { svgX: 0, svgY: 0 },
    blurb: "Plataforma de madera flotante inmersa en la vegetación xerófila para meditación, yoga y sound healing.",
    details: ["Pisos de madera natural", "Clases guiadas al amanecer", "Zona de silencio y meditación"],
    badgeColor: "#4E6646",
  },
  {
    id: "zona-chill",
    name: "Zona Chill & Hamacas",
    shortLabel: "CHILL & HAMACAS",
    category: "wellness",
    categoryLabel: "Relax",
    center: { x: OASIS_CENTER.x - 44.0, y: OASIS_CENTER.y + 32.0 },
    svgCenter: { svgX: 0, svgY: 0 },
    blurb: "Bosque de palmeras con hamacas colgantes de algodón y sombrillas de yute para lectura y descanso.",
    details: ["Hamacas artesanales", "Sombra natural de palmeras", "Conexión wifi de alta velocidad"],
    badgeColor: "#4E6646",
  },
];

// Precalcular svgCenter
OASIS_NODES.forEach((n) => {
  n.svgCenter = metersToSvg(n.center.x, n.center.y);
});

/**
 * Polígono de la laguna orgánica interna en metros
 */
export const INTERNAL_LAGOON_POLYGON: Point2D[] = [
  { x: OASIS_CENTER.x - 18.0, y: OASIS_CENTER.y + 24.0 },
  { x: OASIS_CENTER.x + 2.0,  y: OASIS_CENTER.y + 26.0 },
  { x: OASIS_CENTER.x + 20.0, y: OASIS_CENTER.y + 20.0 },
  { x: OASIS_CENTER.x + 26.0, y: OASIS_CENTER.y + 2.0 },
  { x: OASIS_CENTER.x + 22.0, y: OASIS_CENTER.y - 18.0 },
  { x: OASIS_CENTER.x + 4.0,  y: OASIS_CENTER.y - 24.0 },
  { x: OASIS_CENTER.x - 18.0, y: OASIS_CENTER.y - 20.0 },
  { x: OASIS_CENTER.x - 26.0, y: OASIS_CENTER.y + 4.0 },
];
