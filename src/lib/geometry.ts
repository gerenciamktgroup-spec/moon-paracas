import { XY } from "../types/map";

export function pathFromPolygon(points: XY[]): string {
  if (!points.length) return "";
  return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ") + " Z";
}

export function centroid(points: XY[]): XY {
  return {
    x: points.reduce((a, p) => a + p.x, 0) / points.length,
    y: points.reduce((a, p) => a + p.y, 0) / points.length
  };
}

export function shoelaceArea(points: XY[]): number {
  let area = 0;
  const n = points.length;
  if (n < 3) return 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

// Ray-casting algorithm to check if a point is strictly inside a polygon
export function isPointInPolygon(point: XY, polygon: XY[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Convert a line path with a given width in meters to a closed polygon in SVG pixels
export function roadToPolygon(path: XY[], widthM: number, scale: number): XY[] {
  if (path.length < 2) return [];
  const halfW = (widthM * scale) / 2;
  const leftSide: XY[] = [];
  const rightSide: XY[] = [];

  for (let i = 0; i < path.length; i++) {
    const curr = path[i];
    let dx = 0;
    let dy = 0;

    if (i < path.length - 1) {
      const next = path[i + 1];
      dx += next.x - curr.x;
      dy += next.y - curr.y;
    }
    if (i > 0) {
      const prev = path[i - 1];
      dx += curr.x - prev.x;
      dy += curr.y - prev.y;
    }

    const len = Math.hypot(dx, dy);
    if (len === 0) continue;

    // Normal vector
    const nx = -dy / len;
    const ny = dx / len;

    leftSide.push({ x: curr.x + nx * halfW, y: curr.y + ny * halfW });
    rightSide.unshift({ x: curr.x - nx * halfW, y: curr.y - ny * halfW });
  }

  return [...leftSide, ...rightSide];
}

