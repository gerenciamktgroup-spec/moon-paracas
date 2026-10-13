/**
 * ============================================================================
 * MASTERPLAN AMENITIES MODULE — MOON PARACAS
 * ============================================================================
 * 
 * Capa oficial de amenidades y equipamientos del Masterplan Moon Paracas.
 * Ubicadas con precisión métrica en el Oasis Central (Centroide 0,0) y en la
 * Franja de Acceso Sur (Vértice A), con etiquetas radiales limpias y sin superposiciones.
 */

import { localMetersToSvg } from "./loteMatrizGeometry";

export type AmenityCategory = "oasis" | "wellness" | "gastronomia" | "acceso" | "recreacion" | "estacionamiento";

export interface MasterplanAmenity {
  id: string;
  name: string;
  shortLabel: string;
  category: AmenityCategory;
  categoryLabel: string;
  anchorMeters: [number, number];   // Coordenadas locales en metros [x, y]
  svgAnchor: [number, number];      // Coordenadas en canvas SVG [svgX, svgY]
  blurb: string;
  details: string[];
  badgeColor: string;
}

/**
 * Puntos del polígono de la Laguna Orgánica Central (en metros locales)
 * Espejo de agua amplio, generoso y de forma orgánica natural.
 */
export const ORGANIC_LAGOON_LOCAL_POLYGON: [number, number][] = [
  [-16, 26],
  [0, 28],
  [18, 24],
  [26, 12],
  [28, -2],
  [24, -16],
  [12, -24],
  [-2, -26],
  [-16, -22],
  [-24, -12],
  [-26, 2],
  [-24, 18],
];

/**
 * Puntos de la Isla Central de la Laguna
 */
export const OASIS_ISLAND_LOCAL_POLYGON: [number, number][] = [
  [-5, 5],
  [5, 6],
  [7, 0],
  [4, -5],
  [-3, -5],
  [-6, 0],
];

/**
 * Catálogo Oficial de Amenidades Georreferenciadas con Posicionamiento Radial Despejado
 */
export const MASTERPLAN_AMENITIES: MasterplanAmenity[] = [
  // ── AMENIDADES DEL OASIS CENTRAL (~20,662 m²) ──
  {
    id: "laguna-oasis",
    name: "Laguna Cristalina & Playa de Arena",
    shortLabel: "LAGUNA CRISTALINA",
    category: "oasis",
    categoryLabel: "Oasis Central",
    anchorMeters: [0, 4],
    svgAnchor: [0, 0],
    blurb: "Espejo de agua cristalina orgánica de 3,200 m² con orillas de arena blanca desértica y palmeras nativas.",
    details: ["3,200 m² de espejo de agua", "Playa de arena compactada", "Ecosistema de palmeras datileras"],
    badgeColor: "#3D8B84",
  },
  {
    id: "piscina-oasis",
    name: "Piscina Infinity Oasis",
    shortLabel: "PISCINA OASIS",
    category: "oasis",
    categoryLabel: "Agua & Relax",
    anchorMeters: [0, -32],
    svgAnchor: [0, 0],
    blurb: "Piscina de borde infinito climatizada con deck solárium de teca y reposeras orientadas al atardecer.",
    details: ["Piscina climatizada 25m", "Deck solárium de teca", "Servicio de toallas y bar"],
    badgeColor: "#3D8B84",
  },
  {
    id: "bar-lounge",
    name: "Bar & Lounge El Mirador",
    shortLabel: "BAR & LOUNGE",
    category: "gastronomia",
    categoryLabel: "Gastronomía",
    anchorMeters: [26, 30],
    svgAnchor: [0, 0],
    blurb: "Cocktail bar y lounge con cocina de autor paracas, terraza elevada con pérgola de caña brava.",
    details: ["Coctelería de autor y piscos", "Cocina marina fresca", "Terraza panorámica sombreada"],
    badgeColor: "#A84F36",
  },
  {
    id: "yoga-deck",
    name: "Santuario & Yoga Deck",
    shortLabel: "YOGA DECK",
    category: "wellness",
    categoryLabel: "Bienestar",
    anchorMeters: [-36, 0],
    svgAnchor: [0, 0],
    blurb: "Plataforma de madera flotante inmersa en la vegetación xerófila para meditación, yoga y sound healing.",
    details: ["Pisos de madera natural", "Clases guiadas al amanecer", "Zona de silencio y meditación"],
    badgeColor: "#4E6646",
  },
  {
    id: "zona-chill",
    name: "Zona Chill & Hamacas",
    shortLabel: "ZONA CHILL",
    category: "wellness",
    categoryLabel: "Relax",
    anchorMeters: [-26, 30],
    svgAnchor: [0, 0],
    blurb: "Bosque de palmeras con hamacas colgantes de algodón y sombrillas de yute para lectura y descanso.",
    details: ["Hamacas artesanales", "Sombra natural de palmeras", "Conexión wifi de alta velocidad"],
    badgeColor: "#4E6646",
  },
  {
    id: "fogatas-sociales",
    name: "Fogatas Sociales & Astroturismo",
    shortLabel: "FOGATAS SOCIALES",
    category: "recreacion",
    categoryLabel: "Noche Estelar",
    anchorMeters: [36, 0],
    svgAnchor: [0, 0],
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
    anchorMeters: [26, -28],
    svgAnchor: [0, 0],
    blurb: "Área de juegos ecológicos de madera y cuerdas, integrado armónicamente con el paisaje dunar.",
    details: ["Materiales de madera certificada", "Sombra continua", "Piso de arena tamizada segura"],
    badgeColor: "#C5A059",
  },

  // ── EQUIPAMIENTOS DEL ACCESO SUR (VÉRTICE A) ──
  {
    id: "portico-ingreso",
    name: "Pórtico Monumental & Seguridad 24/7",
    shortLabel: "PÓRTICO INGRESO",
    category: "acceso",
    categoryLabel: "Seguridad & Acceso",
    anchorMeters: [-38, -246],
    svgAnchor: [0, 0],
    blurb: "Ingreso monumental con control biométrico, garita de vigilancia 24/7 y carril exclusivo de residentes.",
    details: ["Doble carril vehicular", "Control de acceso digital", "Vigilancia perimetral"],
    badgeColor: "#161310",
  },
  {
    id: "welcome-center",
    name: "Welcome Center & Concierge",
    shortLabel: "WELCOME CENTER",
    category: "acceso",
    categoryLabel: "Recepción",
    anchorMeters: [-72, -236],
    svgAnchor: [0, 0],
    blurb: "Pabellón de recepción de propietarios y huéspedes con atención de concierge, check-in y carritos eléctricos.",
    details: ["Atención concierge personalizada", "Flota de carritos de golf eléctricos", "Sala de espera climatizada"],
    badgeColor: "#C5A059",
  },
  {
    id: "lobby-vistas",
    name: "Lobby de Vistas & Showroom",
    shortLabel: "LOBBY VISTAS",
    category: "acceso",
    categoryLabel: "Experiencia",
    anchorMeters: [-4, -236],
    svgAnchor: [0, 0],
    blurb: "Espacio de exhibición arquitectónica de tipologías de domos, maquetas interactivas y terraza de bienvenida.",
    details: ["Showroom de materiales y domos", "Atención comercial VIP", "Cafetería de especialidad"],
    badgeColor: "#C5A059",
  },
  {
    id: "cocheras-plus-field",
    name: "Cochera Plus · 192 Plazas Privadas",
    shortLabel: "192 COCHERAS PLUS",
    category: "estacionamiento",
    categoryLabel: "Estacionamiento",
    anchorMeters: [-38, -218],
    svgAnchor: [0, 0],
    blurb: "Campos de estacionamiento privado en 4 bahías techadas con paneles solares y cargadores para vehículos eléctricos.",
    details: ["192 plazas individuales techadas", "Cargadores eléctricos", "Iluminación LED solar"],
    badgeColor: "#37474F",
  },
];

// Precalcular coordenadas SVG para cada amenidad
MASTERPLAN_AMENITIES.forEach((am) => {
  const svg = localMetersToSvg(am.anchorMeters[0], am.anchorMeters[1]);
  am.svgAnchor = [svg.svgX, svg.svgY];
});

/**
 * Puntos de palmeras decorativas dispersas en local meters (solo en bordes del oasis y bulevares)
 */
export const PALM_DECORATIONS_LOCAL: [number, number][] = [
  // Alrededor del borde de la laguna
  [-28, 14], [-18, 28], [0, 30], [20, 26], [28, 10], [30, -4],
  [24, -18], [10, -26], [-14, -24], [-26, -10],
  // En la isla
  [0, 2], [-2, 0], [2, -2],
  // En los bulevares principales
  [0, 48], [0, 95], [0, 145],
  [48, 0], [95, 0], [145, 0],
  [0, -48], [0, -95], [0, -145],
  [-48, 0], [-95, 0],
];
