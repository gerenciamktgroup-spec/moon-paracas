import { BlockPolygon, Lot, LotStatus, LotTypology, XY } from "../types/map";
import { BLOCK_SPECS } from "../data/business";

function makeLotId(n: number) {
  return `L${String(n).padStart(3, "0")}`;
}

function inferStatus(n: number): LotStatus {
  // Realistic scatter of sold/reserved lots
  if (n % 13 === 0) return "blocked";
  if (n % 5 === 0) return "sold";
  if (n % 7 === 0) return "offer";
  return "available";
}

// Bilinear interpolation inside a quad
function bilerp(p0: XY, p1: XY, p2: XY, p3: XY, u: number, v: number): XY {
  const topX = p0.x + (p1.x - p0.x) * u;
  const topY = p0.y + (p1.y - p0.y) * u;
  const botX = p3.x + (p2.x - p3.x) * u;
  const botY = p3.y + (p2.y - p3.y) * u;

  return {
    x: topX + (botX - topX) * v,
    y: topY + (botY - topY) * v
  };
}

// Spine-based back-to-back subdivision
function subdivideQuadBilinear(poly: XY[], count: number): XY[][] {
  // Ensure we have exactly 4 corners for bilerp
  const corners = poly.slice(0, 4);
  if (corners.length < 4) return [poly];

  const [P0, P1, P2, P3] = corners;
  
  // Decide which axis is longer to be the "row" direction
  const dist01 = Math.hypot(P1.x - P0.x, P1.y - P0.y);
  const dist12 = Math.hypot(P2.x - P1.x, P2.y - P1.y);

  // u-axis is horizontal (0 to 1), v-axis is vertical (0 to 1)
  // If dist12 > dist01, the block is taller than it is wide. We want the spine to be vertical.
  const isVerticalSpine = dist12 > dist01;

  const lots: XY[][] = [];
  
  const rows = 2; // Always 2 back-to-back rows to avoid "striped bands"
  const cols = Math.ceil(count / rows);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (lots.length >= count) break;

      let u1 = c / cols;
      let u2 = (c + 1) / cols;
      let v1 = r / rows;
      let v2 = (r + 1) / rows;

      // Swap UV if the spine is vertical
      if (isVerticalSpine) {
        const tempU1 = u1, tempU2 = u2;
        u1 = v1; u2 = v2;
        v1 = tempU1; v2 = tempU2;
      }

      // Generate the 4 corners of the lot
      const lotP0 = bilerp(P0, P1, P2, P3, u1, v1); // top-left
      const lotP1 = bilerp(P0, P1, P2, P3, u2, v1); // top-right
      const lotP2 = bilerp(P0, P1, P2, P3, u2, v2); // bottom-right
      const lotP3 = bilerp(P0, P1, P2, P3, u1, v2); // bottom-left

      lots.push([lotP0, lotP1, lotP2, lotP3]);
    }
  }

  return lots;
}

export function buildLots(blocks: BlockPolygon[]): Lot[] {
  let counter = 1;
  const lots: Lot[] = [];

  for (const block of blocks) {
    const spec = BLOCK_SPECS.find(b => b.id === block.id)!;
    
    const mix: LotTypology[] = [
      ...Array(spec.lotMix.standard).fill("standard"),
      ...Array(spec.lotMix.premium).fill("premium"),
      ...Array(spec.lotMix.adjustment).fill("adjustment")
    ];

    // Shuffle typologies deterministically for natural distribution
    mix.sort((a, b) => a.localeCompare(b)); 

    const subPolygons = subdivideQuadBilinear(block.polygon, spec.targetLotCount);

    for (let i = 0; i < spec.targetLotCount; i++) {
      const typology = mix[i] ?? "standard";
      const area = typology === "premium" ? 272 : typology === "adjustment" ? 232 : 246;
        
      const polygon = subPolygons[i] || block.polygon;

      lots.push({
        id: makeLotId(counter),
        blockId: block.id,
        typology,
        status: inferStatus(counter),
        areaM2: area,
        polygon: polygon,
        priceLabel: typology === "premium" ? "Consultar" : "Desde S/ 12,000",
        
        // Legacy compat fields
        price: typology === "premium" ? 25000 : 12000,
        number: counter,
        quadrant: block.id,
        area: area,
        elevation: 108 + Math.floor(Math.random() * 5),
        distanceToPool: 40 + Math.floor(Math.random() * 100),
        hubDistance: 20 + Math.floor(Math.random() * 80)
      });

      counter++;
    }
  }

  return lots;
}
