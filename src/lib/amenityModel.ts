import { Amenity, XY } from "../types/map";
import { centroid } from "./geometry";

export function buildAmenities(innerBuffer: XY[]): Amenity[] {
  const c = centroid(innerBuffer);

  return [
    {
      id: "A_ENTRY",
      kind: "entry-plaza",
      polygon: [
        { x: c.x - 55, y: c.y + 280 },
        { x: c.x + 55, y: c.y + 280 },
        { x: c.x + 70, y: c.y + 235 },
        { x: c.x - 70, y: c.y + 235 }
      ]
    },
    {
      id: "A_PARKING_W",
      kind: "parking",
      polygon: [
        { x: c.x - 125, y: c.y + 290 },
        { x: c.x - 65, y: c.y + 290 },
        { x: c.x - 65, y: c.y + 245 },
        { x: c.x - 125, y: c.y + 245 }
      ]
    },
    {
      id: "A_PARKING_E",
      kind: "parking",
      polygon: [
        { x: c.x + 65, y: c.y + 290 },
        { x: c.x + 125, y: c.y + 290 },
        { x: c.x + 125, y: c.y + 245 },
        { x: c.x + 65, y: c.y + 245 }
      ]
    },
    {
      id: "A_CLUB",
      kind: "clubhouse",
      polygon: [
        { x: c.x - 45, y: c.y - 30 },
        { x: c.x + 45, y: c.y - 30 },
        { x: c.x + 55, y: c.y - 95 },
        { x: c.x - 55, y: c.y - 95 }
      ]
    },
    {
      id: "A_POOL",
      kind: "pool",
      polygon: [
        { x: c.x - 100, y: c.y - 20 },
        { x: c.x - 50, y: c.y - 10 },
        { x: c.x - 38, y: c.y - 55 },
        { x: c.x - 85, y: c.y - 72 }
      ]
    },
    {
      id: "A_DECK",
      kind: "deck",
      polygon: [
        { x: c.x + 55, y: c.y - 15 },
        { x: c.x + 120, y: c.y - 10 },
        { x: c.x + 110, y: c.y - 55 },
        { x: c.x + 50, y: c.y - 60 }
      ]
    },
    {
      id: "A_FIRE",
      kind: "firepit",
      polygon: [
        { x: c.x - 12, y: c.y + 5 },
        { x: c.x + 12, y: c.y + 5 },
        { x: c.x + 10, y: c.y - 12 },
        { x: c.x - 10, y: c.y - 12 }
      ]
    },
    {
      id: "A_SAND",
      kind: "sand-plaza",
      polygon: [
        { x: c.x - 140, y: c.y + 25 },
        { x: c.x + 135, y: c.y + 25 },
        { x: c.x + 150, y: c.y - 135 },
        { x: c.x - 150, y: c.y - 135 }
      ]
    },
    {
      id: "A_MOON",
      kind: "moon-deck",
      polygon: [
        { x: c.x - 28, y: c.y - 135 },
        { x: c.x + 28, y: c.y - 135 },
        { x: c.x + 18, y: c.y - 165 },
        { x: c.x - 18, y: c.y - 165 }
      ]
    }
  ];
}
