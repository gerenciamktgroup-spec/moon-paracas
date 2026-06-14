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

export function lerp(a: XY, b: XY, t: number): XY {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t
  };
}
