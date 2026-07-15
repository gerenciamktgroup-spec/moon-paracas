import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { buildTerrainScene, getMeterToSvgScale } from "./src/lib/terrainModel";
import { buildBlocks } from "./src/lib/blockModel";
import { buildLots, buildParkingLots } from "./src/lib/lotModel";
import { buildAmenities } from "./src/lib/amenityModel";
import { buildRoads } from "./src/lib/roadModel";
import { roadToPolygon } from "./src/lib/geometry";
import { checkCollision } from "./src/lib/spatialAnalyzer";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
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
  
  const parkings = buildParkingLots(terrainScene.innerBuffer, obstacles, roadPolys);
  
  function circleToPolygon(center: any, radiusM: number, scale: number): any[] {
    const poly: any[] = [];
    const points = 12;
    const r = radiusM * scale;
    for (let i = 0; i < points; i++) {
      const angle = (i * 2 * Math.PI) / points;
      poly.push({
        x: center.x + r * Math.cos(angle),
        y: center.y + r * Math.sin(angle)
      });
    }
    return poly;
  }

  const culDeSacs: any[][] = [];
  roads.forEach(r => {
    if (r.id.startsWith("LINEAR_ROAD")) {
      culDeSacs.push(circleToPolygon(r.path[0], 6.0, scale));
    }
  });

  const activeBuildings = [
    ...amenities
      .filter((a: any) => a.id !== "A_SAND" && a.kind !== "sand-plaza")
      .map((a: any) => a.polygon),
    ...culDeSacs,
    ...parkings.map((p: any) => p.polygon),
    ...roadPolys
  ];
  
  const cleanLocalLots = buildLots(blocks, parkings, roadPolys, activeBuildings);
  
  const allLots = [...cleanLocalLots, ...parkings];
  
  console.log(`Generated ${cleanLocalLots.length} clean residential lots and ${parkings.length} parking spaces locally.`);
  console.log(`Total items to upload: ${allLots.length}`);

  const lotsCol = collection(db, "lots");
  const snap = await getDocs(lotsCol);
  console.log(`Found ${snap.size} existing lots in Firestore.`);

  if (snap.size > 0) {
    // Delete in batches of 200 to be safe
    let deleteBatch = writeBatch(db);
    let count = 0;
    for (const d of snap.docs) {
      deleteBatch.delete(d.ref);
      count++;
      if (count % 200 === 0) {
        await deleteBatch.commit();
        deleteBatch = writeBatch(db);
      }
    }
    if (count % 200 !== 0) {
      await deleteBatch.commit();
    }
    console.log("Deleted old lots from Firestore.");
  }

  // Upload in batches of 200
  let uploadBatch = writeBatch(db);
  let count = 0;
  for (const lot of allLots) {
    const ref = doc(db, "lots", lot.id);
    const firestoreLot = {
      id: lot.id,
      number: lot.number,
      blockId: lot.blockId,
      typology: lot.typology,
      status: lot.status,
      areaM2: lot.areaM2,
      polygon: lot.polygon,
      dimensions: lot.dimensions || "",
      priceLabel: lot.priceLabel || "",
      price: lot.price,
      quadrant: lot.quadrant,
      area: lot.areaM2,
      elevation: lot.elevation,
      distanceToPool: lot.distanceToPool,
      hubDistance: lot.hubDistance,
      hasSolarOpt: true,
      
      frontage: lot.frontage || 0,
      depth: lot.depth || 0,
      price_soles: lot.price_soles || 0,
      parking_type: lot.parking_type || "",
      walk_distance_parking_meters: lot.walk_distance_parking_meters || 0,
      walk_distance_oasis_meters: lot.walk_distance_oasis_meters || 0
    };
    uploadBatch.set(ref, firestoreLot);
    count++;
    if (count % 200 === 0) {
      await uploadBatch.commit();
      uploadBatch = writeBatch(db);
    }
  }
  if (count % 200 !== 0) {
    await uploadBatch.commit();
  }
  console.log("Seeded new lots successfully!");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
