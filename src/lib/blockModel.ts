import { BlockPolygon, XY } from "../types/map";
import { centroid } from "./geometry";

export function buildBlocks(innerBuffer: XY[]): BlockPolygon[] {
  const c = centroid(innerBuffer);

  return [
    { id: "M1", role: "access-west", polygon: [
      { x: c.x - 255, y: c.y + 235 }, { x: c.x - 120, y: c.y + 225 }, { x: c.x - 92, y: c.y + 160 }, { x: c.x - 242, y: c.y + 150 }
    ]},
    { id: "M2", role: "access-east", polygon: [
      { x: c.x + 120, y: c.y + 225 }, { x: c.x + 255, y: c.y + 235 }, { x: c.x + 242, y: c.y + 150 }, { x: c.x + 92, y: c.y + 160 }
    ]},
    { id: "M3", role: "south-west", polygon: [
      { x: c.x - 280, y: c.y + 130 }, { x: c.x - 135, y: c.y + 122 }, { x: c.x - 110, y: c.y + 60 }, { x: c.x - 275, y: c.y + 42 }
    ]},
    { id: "M4", role: "south-east", polygon: [
      { x: c.x + 135, y: c.y + 122 }, { x: c.x + 280, y: c.y + 130 }, { x: c.x + 275, y: c.y + 42 }, { x: c.x + 110, y: c.y + 60 }
    ]},
    { id: "M5", role: "central-west", polygon: [
      { x: c.x - 286, y: c.y + 18 }, { x: c.x - 145, y: c.y + 18 }, { x: c.x - 125, y: c.y - 48 }, { x: c.x - 280, y: c.y - 62 }
    ]},
    { id: "M6", role: "central-east", polygon: [
      { x: c.x + 145, y: c.y + 18 }, { x: c.x + 286, y: c.y + 18 }, { x: c.x + 280, y: c.y - 62 }, { x: c.x + 125, y: c.y - 48 }
    ]},
    { id: "M7", role: "oasis-west", polygon: [
      { x: c.x - 250, y: c.y - 90 }, { x: c.x - 150, y: c.y - 70 }, { x: c.x - 90, y: c.y - 128 }, { x: c.x - 170, y: c.y - 200 }, { x: c.x - 255, y: c.y - 155 }
    ]},
    { id: "M8", role: "oasis-east", polygon: [
      { x: c.x + 150, y: c.y - 70 }, { x: c.x + 250, y: c.y - 90 }, { x: c.x + 255, y: c.y - 155 }, { x: c.x + 170, y: c.y - 200 }, { x: c.x + 90, y: c.y - 128 }
    ]},
    { id: "M9", role: "north-west", polygon: [
      { x: c.x - 262, y: c.y - 180 }, { x: c.x - 170, y: c.y - 225 }, { x: c.x - 105, y: c.y - 270 }, { x: c.x - 242, y: c.y - 305 }
    ]},
    { id: "M10", role: "north-east", polygon: [
      { x: c.x + 170, y: c.y - 225 }, { x: c.x + 262, y: c.y - 180 }, { x: c.x + 242, y: c.y - 305 }, { x: c.x + 105, y: c.y - 270 }
    ]},
    { id: "M11", role: "north-remate-west", polygon: [
      { x: c.x - 225, y: c.y - 325 }, { x: c.x - 115, y: c.y - 290 }, { x: c.x - 55, y: c.y - 350 }, { x: c.x - 190, y: c.y - 392 }
    ]},
    { id: "M12", role: "north-remate-east", polygon: [
      { x: c.x + 115, y: c.y - 290 }, { x: c.x + 225, y: c.y - 325 }, { x: c.x + 190, y: c.y - 392 }, { x: c.x + 55, y: c.y - 350 }
    ]}
  ];
}
