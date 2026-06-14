import { XY } from "../types/map";

export function createInnerBuffer(polygon: XY[], meters: number): XY[] {
  // A simple naive inward scale based on centroid for the buffer
  // We compute the centroid and pull every vertex towards it by a factor
  // For a more robust algorithm, polybool/clipper would be used, but this works for convex/near-convex polygons
  const cx = polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length;
  const cy = polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length;

  return polygon.map(p => {
    const dx = cx - p.x;
    const dy = cy - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Move `meters` units inward
    const factor = (dist - meters * 2) / dist; // scale factor
    return {
      x: cx - dx * factor,
      y: cy - dy * factor
    };
  });
}
