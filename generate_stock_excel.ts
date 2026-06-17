import { buildBlocks } from './src/lib/blockModel.ts';
import { buildRoads } from './src/lib/roadModel.ts';
import { buildLots, buildParkingLots } from './src/lib/lotModel.ts';
import { buildTerrainScene } from './src/lib/terrainModel.ts';
import fs from 'fs';

// Initialize the terrain math correctly
const { innerBuffer } = buildTerrainScene();
const blocks = buildBlocks(innerBuffer);
const lots = [...buildLots(blocks), ...buildParkingLots(innerBuffer)];

const outLines = ["ID_Lote,Bloque,Tipologia,Estado,Area_m2,Precio_x_m2_S/,Precio_Total_S/"];

let totalOferta = 0;
let totalDisp = 0;
let totalCocheras = 0;
let areaResidencial = 0;

lots.forEach(lot => {
  let price_m2 = 0;
  let total_price = 0;
  let estado = lot.status;
  
  if (lot.typology === "parking") {
    total_price = 5000;
    estado = "available";
    totalCocheras += total_price;
  } else {
    areaResidencial += lot.areaM2;
    if (lot.status === "offer") {
      price_m2 = 50;
      total_price = Math.round(lot.areaM2 * price_m2);
      totalOferta += total_price;
    } else {
      price_m2 = 100;
      total_price = Math.round(lot.areaM2 * price_m2);
      totalDisp += total_price;
    }
  }
  
  const formattedEstado = estado === "offer" ? "Oferta" : (estado === "available" ? "Disponible" : estado);

  outLines.push([
    lot.id,
    lot.blockId,
    lot.typology === "parking" ? "Cochera Plus" : "Lote Residencial",
    formattedEstado,
    Math.round(lot.areaM2 * 100) / 100,
    price_m2,
    total_price
  ].join(","));
});

const csvStr = outLines.join("\n");
fs.writeFileSync('C:/Users/LENOVO/.gemini/antigravity/brain/fd575652-1b2e-4c1d-9ad9-e4c195083132/INVENTARIO_PARACAS.csv', csvStr);

console.log("Generado exitosamente INVENTARIO_PARACAS.csv con " + lots.length + " items.");
console.log("--- RESUMEN FINANCIERO ---");
console.log("Total Ventas (Oferta S/50): S/ " + totalOferta.toLocaleString());
console.log("Total Ventas (Disp S/100):  S/ " + totalDisp.toLocaleString());
console.log("Total Ventas (Cocheras):    S/ " + totalCocheras.toLocaleString());
console.log("PROYECCIÓN TOTAL BRUTA:     S/ " + (totalOferta + totalDisp + totalCocheras).toLocaleString());
console.log("Área Residencial Útil:      " + Math.round(areaResidencial) + " m2");
