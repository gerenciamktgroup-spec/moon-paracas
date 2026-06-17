const fs = require('fs');

let roads = fs.readFileSync('src/lib/roadModel.ts', 'utf8');

const linearRoadOld = `    ...[23, 49, 75, 156, 182, 208].map((D_k, i) => ({
      id: \`LINEAR_ROAD_\${i}\`,
      kind: "secondary" as const,
      widthM: 6,
      path: [
        getBandPoint(innerBuffer, 0.025, D_k, scale),
        getBandPoint(innerBuffer, 0.99, D_k, scale)
      ]
    }))`;

const linearRoadNew = `    ...[23, 49, 75, 156, 182, 208].map((D_k, i) => {
      // Build a polyline that curves with the terrain rather than a straight 2-point line
      const path = [];
      for (let t = 0.025; t <= 0.99; t += 0.05) {
        path.push(getBandPoint(innerBuffer, t, D_k, scale));
      }
      path.push(getBandPoint(innerBuffer, 0.99, D_k, scale));
      
      return {
        id: \`LINEAR_ROAD_\${i}\`,
        kind: "secondary" as const,
        widthM: 6,
        path
      };
    })`;

roads = roads.replace(linearRoadOld, linearRoadNew);

// Also CROSS_ROAD_0 and CROSS_ROAD_1 are 2-point lines! Let's fix them too!
// They run horizontally, so they should iterate over D.
const crossRoad0Old = `    // Cross Street 1
    {
      id: "CROSS_ROAD_0",
      kind: "secondary" as const,
      widthM: 5,
      path: [
        getBandPoint(innerBuffer, 0.33, 0, scale),
        getBandPoint(innerBuffer, 0.33, 231, scale)
      ]
    },`;

const crossRoad0New = `    // Cross Street 1
    {
      id: "CROSS_ROAD_0",
      kind: "secondary" as const,
      widthM: 5,
      path: Array.from({length: 20}, (_, i) => getBandPoint(innerBuffer, 0.33, (i/19)*231, scale))
    },`;

const crossRoad1Old = `    // Cross Street 2
    {
      id: "CROSS_ROAD_1",
      kind: "secondary" as const,
      widthM: 5,
      path: [
        getBandPoint(innerBuffer, 0.65, 0, scale),
        getBandPoint(innerBuffer, 0.65, 231, scale)
      ]
    },`;

const crossRoad1New = `    // Cross Street 2
    {
      id: "CROSS_ROAD_1",
      kind: "secondary" as const,
      widthM: 5,
      path: Array.from({length: 20}, (_, i) => getBandPoint(innerBuffer, 0.65, (i/19)*231, scale))
    },`;

const crossRoadBackOld = `    // Rear Perimeter Cross Road (Flush against the back wall)
    {
      id: "CROSS_ROAD_BACK",
      kind: "secondary" as const,
      widthM: 6,
      path: [
        getBandPoint(innerBuffer, 0.99, 0, scale),
        getBandPoint(innerBuffer, 0.99, 231, scale)
      ]
    },`;

const crossRoadBackNew = `    // Rear Perimeter Cross Road (Flush against the back wall)
    {
      id: "CROSS_ROAD_BACK",
      kind: "secondary" as const,
      widthM: 6,
      path: Array.from({length: 20}, (_, i) => getBandPoint(innerBuffer, 0.99, (i/19)*231, scale))
    },`;

roads = roads.replace(crossRoad0Old, crossRoad0New);
roads = roads.replace(crossRoad1Old, crossRoad1New);
roads = roads.replace(crossRoadBackOld, crossRoadBackNew);

fs.writeFileSync('src/lib/roadModel.ts', roads);
console.log('Fixed roads');
