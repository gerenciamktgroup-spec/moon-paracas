import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { buildBlocks } from './src/lib/blockModel';
import { buildLots } from './src/lib/lotModel';
import { buildTerrainScene } from './src/lib/terrainModel';
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const { innerBuffer } = buildTerrainScene();
  const blocks = buildBlocks(innerBuffer);
  const localLots = buildLots(blocks);
  console.log(`Generated ${localLots.length} lots locally.`);

  const lotsCol = collection(db, "lots");
  const snap = await getDocs(lotsCol);
  console.log(`Found ${snap.size} existing lots in Firestore.`);

  if (snap.size > 0) {
    const deleteBatch1 = writeBatch(db);
    const deleteBatch2 = writeBatch(db);
    snap.docs.forEach((d, i) => {
      if (i < 200) deleteBatch1.delete(d.ref);
      else deleteBatch2.delete(d.ref);
    });
    await deleteBatch1.commit();
    await deleteBatch2.commit();
    console.log("Deleted old lots from Firestore.");
  }

  // Upload in batches of 200
  const batch1 = writeBatch(db);
  const batch2 = writeBatch(db);
  localLots.forEach((lot, i) => {
    const ref = doc(db, "lots", lot.id);
    const firestoreLot = {
      ...lot,
      // 15 fields required by local rules validation
      id: lot.id,
      number: lot.number,
      area: lot.areaM2,
      status: lot.status,
      price: lot.price,
      elevation: lot.elevation,
      quadrant: lot.quadrant,
      x: 0,
      y: 0,
      width: 10,
      height: 25,
      row: 1,
      hasSolarOpt: true,
      distanceToPool: lot.distanceToPool,
      rotation: 0
    };
    if (i < 200) batch1.set(ref, firestoreLot);
    else batch2.set(ref, firestoreLot);
  });
  await batch1.commit();
  await batch2.commit();
  console.log("Seeded new lots successfully!");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
