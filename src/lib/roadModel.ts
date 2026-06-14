import { Road, XY } from "../types/map";
import { centroid, lerp } from "./geometry";

export function buildRoads(innerBuffer: XY[]): Road[] {
  const c = centroid(innerBuffer);

  const south = innerBuffer.reduce((acc, p) => (p.y > acc.y ? p : acc), innerBuffer[0]);
  const north = innerBuffer.reduce((acc, p) => (p.y < acc.y ? p : acc), innerBuffer[0]);

  const primary: Road = {
    id: "R1",
    kind: "primary",
    widthM: 8,
    path: [
      south,
      lerp(south, c, 0.25),
      { x: c.x - 10, y: c.y + 80 },
      { x: c.x + 5, y: c.y + 20 },
      { x: c.x + 10, y: c.y - 60 },
      lerp(c, north, 0.85)
    ]
  };

  const secondaryA: Road = {
    id: "R2",
    kind: "secondary",
    widthM: 6,
    path: [
      { x: c.x - 260, y: c.y + 140 },
      { x: c.x - 140, y: c.y + 90 },
      { x: c.x - 40, y: c.y + 55 }
    ]
  };

  const secondaryB: Road = {
    id: "R3",
    kind: "secondary",
    widthM: 6,
    path: [
      { x: c.x + 260, y: c.y + 130 },
      { x: c.x + 140, y: c.y + 85 },
      { x: c.x + 50, y: c.y + 45 }
    ]
  };

  const secondaryC: Road = {
    id: "R4",
    kind: "secondary",
    widthM: 6,
    path: [
      { x: c.x - 270, y: c.y - 20 },
      { x: c.x - 130, y: c.y - 25 },
      { x: c.x - 30, y: c.y - 5 }
    ]
  };

  const secondaryD: Road = {
    id: "R5",
    kind: "secondary",
    widthM: 6,
    path: [
      { x: c.x + 270, y: c.y - 20 },
      { x: c.x + 130, y: c.y - 25 },
      { x: c.x + 30, y: c.y - 5 }
    ]
  };

  return [primary, secondaryA, secondaryB, secondaryC, secondaryD];
}
