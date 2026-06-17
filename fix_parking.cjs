const fs = require('fs');

// 1. Fix Road generation so vertical roads go through the parking area to provide access
let roads = fs.readFileSync('src/lib/roadModel.ts', 'utf8');

// Change vertical roads to start near t=0.03 so they cut through parking and provide access
roads = roads.replace(
  'getBandPoint(innerBuffer, getMaxTForD(D_k) + 0.015, D_k, scale),',
  'getBandPoint(innerBuffer, 0.025, D_k, scale),' // Start near the entrance wall
);

// Add the CROSS_ROAD_ENTRANCE back, just behind the parking area
const crossRoadStr = `    {
      id: "CROSS_ROAD_ENTRANCE",
      kind: "secondary" as const,
      widthM: 6,
      path: [
        getBandPoint(innerBuffer, 0.15, 0, scale),
        getBandPoint(innerBuffer, 0.15, 231, scale)
      ]
    },`;

roads = roads.replace(
  '// Rear Perimeter Cross Road',
  crossRoadStr + '\n    // Rear Perimeter Cross Road'
);

fs.writeFileSync('src/lib/roadModel.ts', roads);

// 2. Fix Parking Generation spacing
let lots = fs.readFileSync('src/lib/lotModel.ts', 'utf8');

// The loop inside fillParkingStrips
const oldLoop = `      let currentT = 0.032; 
      const boundaryT = getMaxTForD(d + 1.25) - 0.008; 

      while (currentT <= boundaryT) {
         const p1 = createParkingLot(prefix, {tCenter: currentT}, d + 1.25);
         if (!checkCollision(p1.polygon, obstacles)) lots.push(p1);
         
         let nextT = currentT + 0.015; 
         if (nextT <= boundaryT) {
            const p2 = createParkingLot(prefix, {tCenter: nextT}, d + 1.25);
            if (!checkCollision(p2.polygon, obstacles)) lots.push(p2);
         }

         currentT = nextT + 0.025; 
      }`;

const newLoop = `      let currentT = 0.035; 
      const boundaryT = getMaxTForD(d + 1.25) - 0.005; 

      while (currentT <= boundaryT) {
         const p1 = createParkingLot(prefix, {tCenter: currentT}, d + 1.25);
         if (!checkCollision(p1.polygon, obstacles)) lots.push(p1);
         
         // Aisle of 6.5 meters between rows facing each other (0.018 in t-space + 2 half spots = 0.032)
         let nextT = currentT + 0.032; 
         if (nextT <= boundaryT) {
            const p2 = createParkingLot(prefix, {tCenter: nextT}, d + 1.25);
            if (!checkCollision(p2.polygon, obstacles)) lots.push(p2);
         }

         // Back to back gap of 0 meters between blocks (0.014 in t-space)
         currentT = nextT + 0.014; 
      }`;

lots = lots.replace(oldLoop, newLoop);

// Also space out the external parking spots so they don't look like a solid wall,
// and pull them away from the wall slightly.
lots = lots.replace(
  'const p = createParkingLot(prefix, {tCenter: -0.008}, d + 1.25, "parking-external");',
  'const p = createParkingLot(prefix, {tCenter: -0.012}, d + 1.25, "parking-external");' // Move them 1.5m further out so there is an exit path
);

// We will only place external parking spots intermittently to simulate driveways.
lots = lots.replace(
  'for (let d = dStart; d <= dEnd; d += 2.5) {',
  'for (let d = dStart; d <= dEnd; d += 2.5) {\n      if (d % 20 > 15) continue; // Leave gaps for driveways'
);

fs.writeFileSync('src/lib/lotModel.ts', lots);
console.log('Fixed roads and parking spacing');
