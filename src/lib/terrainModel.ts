import { terrain } from "../data/terrain";
import { BUSINESS_RULES } from "../data/business";
import { utmToLocal, fitToViewport } from "./coordinates";
import { createInnerBuffer } from "./polygonOffset";

export function buildTerrainScene(viewportW = 1200, viewportH = 820) {
  const local = utmToLocal(terrain.vertices);
  const fitted = fitToViewport(local, viewportW, viewportH, 70);
  const innerBuffer = createInnerBuffer(fitted, BUSINESS_RULES.perimeterBufferM);

  return { terrain: fitted, innerBuffer };
}
