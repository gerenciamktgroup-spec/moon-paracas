import { Road, XY } from "../types/map";
import { getBandPoint, getMaxTForD } from "./blockModel";
import { getMeterToSvgScale } from "./terrainModel";
import { centroid } from "./geometry";

export function buildRoads(innerBuffer: XY[]): Road[] {
  if (innerBuffer.length < 4) return [];

  const scale = getMeterToSvgScale();
  const c = centroid(innerBuffer);

  const entryBoulevardStart = getBandPoint(innerBuffer, 0.00, 115.5, scale);
  const entryBoulevardEnd = getBandPoint(innerBuffer, 0.065, 115.5, scale);

  return [
    // Central Entrance Boulevard (8m)
    {
      id: "MAIN_ACCESS_ROAD",
      kind: "primary" as const,
      widthM: 8,
      path: [entryBoulevardStart, entryBoulevardEnd]
    },
    // Removed redundant CROSS_ROAD_ENTRANCE which was drawn under the parking lot
    // Rear Perimeter Cross Road (Flush against the back wall)
    {
      id: "CROSS_ROAD_BACK",
      kind: "secondary" as const,
      widthM: 6,
      path: [
        getBandPoint(innerBuffer, 0.99, 0, scale),
        getBandPoint(innerBuffer, 0.99, 231, scale)
      ]
    },
    // Cross Street 1
    {
      id: "CROSS_ROAD_0",
      kind: "secondary" as const,
      widthM: 5,
      path: [
        getBandPoint(innerBuffer, 0.33, 0, scale),
        getBandPoint(innerBuffer, 0.33, 231, scale)
      ]
    },
    // Cross Street 2
    {
      id: "CROSS_ROAD_1",
      kind: "secondary" as const,
      widthM: 5,
      path: [
        getBandPoint(innerBuffer, 0.65, 0, scale),
        getBandPoint(innerBuffer, 0.65, 231, scale)
      ]
    },
    // Vertical roads connecting the front flush road to the back flush road
    ...[23, 49, 75, 156, 182, 208].map((D_k, i) => ({
      id: `LINEAR_ROAD_${i}`,
      kind: "secondary" as const,
      widthM: 6,
      path: [
        getBandPoint(innerBuffer, getMaxTForD(D_k) + 0.015, D_k, scale),
        getBandPoint(innerBuffer, 0.99, D_k, scale)
      ]
    }))
  ];
}
