import { buildTerrainScene, getMeterToSvgScale } from './src/lib/terrainModel';
import { buildBlocks } from './src/lib/blockModel';
import { buildLots, buildParkingLots } from './src/lib/lotModel';
import { buildAmenities } from './src/lib/amenityModel';
import { buildRoads } from './src/lib/roadModel';
import { roadToPolygon } from './src/lib/geometry';
import { checkCollision } from './src/lib/spatialAnalyzer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Generate lots from the TS model
const terrainScene = buildTerrainScene();
const scale = getMeterToSvgScale();
const blocks = buildBlocks(terrainScene.innerBuffer);
const roads = buildRoads(terrainScene.innerBuffer);
const amenities = buildAmenities(terrainScene.innerBuffer);

const roadPolys = roads.map(r => roadToPolygon(r.path, r.widthM, scale));
const obstacles = [
  ...blocks.map((b: any) => b.polygon),
  ...amenities.map((a: any) => a.polygon),
  ...roadPolys
];
const parkings = buildParkingLots(terrainScene.innerBuffer, obstacles);
const localLots = buildLots(blocks, parkings);

const activeBuildings = amenities
  .filter((a: any) => a.id !== "A_SAND" && a.kind !== "sand-plaza")
  .map((a: any) => a.polygon);
const cleanLocalLots = localLots.filter(l => !checkCollision(l.polygon, activeBuildings, 0.1));

// 2. Format CSV lines with semicolon separator for Spanish Excel
const headers = [
  "Manzana",
  "Numero de Lote",
  "Area (m2)",
  "Tipologia",
  "Precio (S/)",
  "Distancia Oasis (m)",
  "Distancia Cochera (m)",
  "Estado"
];

const separator = ";";
const csvLines = [headers.join(separator)];

cleanLocalLots.forEach(l => {
  const areaFormatted = l.areaM2.toFixed(2).replace('.', ',');
  
  const typMap: Record<string, string> = {
    standard: "Lote Estándar",
    premium: "Lote Premium (Oasis)",
    zen: "Lote Zen",
    "tiny-house": "Lote Tiny House",
    adjustment: "Lote Ajuste (Irregular)"
  };
  const typeLabel = typMap[l.typology] || l.typology;
  const statusLabel = l.status === "offer" ? "En Oferta" : (l.status === "blocked" ? "Separado" : (l.status === "sold" ? "Vendido" : "Disponible"));

  const row = [
    l.blockId,
    `Lote ${l.number}`,
    areaFormatted,
    typeLabel,
    l.price.toString(),
    l.distanceToPool.toString(),
    l.hubDistance.toString(),
    statusLabel
  ];
  
  csvLines.push(row.map(val => {
    return typeof val === 'string' && val.includes(';') ? `"${val}"` : val;
  }).join(separator));
});

// Prepend UTF-8 BOM so Spanish Excel reads accents and separates columns correctly
const csvContent = "\ufeff" + csvLines.join('\r\n');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outPath = path.resolve(__dirname, '../cuadro_lotes_masterplan_v2.csv');

try {
  fs.writeFileSync(outPath, csvContent, 'utf-8');
  console.log(`Successfully synced CSV file!`);
  console.log(`Saved ${cleanLocalLots.length} lots to: ${outPath}`);
} catch (e: any) {
  if (e.code === 'EBUSY') {
    console.warn("⚠️ ADVERTENCIA: El archivo 'cuadro_lotes_masterplan_v2.csv' está ocupado (abierto en Excel). Por favor ciérralo en Excel para actualizarlo allí.");
  } else {
    throw e;
  }
}
