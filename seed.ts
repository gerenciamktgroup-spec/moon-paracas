import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { getGeneratedLots } from "./src/data/lotsData.js";
import fs from "fs";

// Load config
const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  const lotsCol = collection(db, "lots");
  const snap = await getDocs(lotsCol);
  console.log(`Found ${snap.size} existing lots.`);
  
  // Use multiple batches since firestore limits 500 writes per batch, and we have 252 lots * 2
  
  if (snap.size > 0) {
    const batch = writeBatch(db);
    snap.docs.forEach(d => {
      batch.delete(d.ref);
    });
    await batch.commit();
    console.log("Deleted old lots");
  }

  const batch2 = writeBatch(db);
  const generated = getGeneratedLots();
  generated.forEach(lot => {
    batch2.set(doc(db, "lots", lot.id), lot);
  });
  await batch2.commit();
  console.log("Seeded new lots!");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
