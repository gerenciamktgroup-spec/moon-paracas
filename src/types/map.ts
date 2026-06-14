export type XY = { x: number; y: number };
export type UTM = { e: number; n: number };

export type VertexId = "A" | "B" | "C" | "D";

export type TerrainVertex = {
  id: VertexId;
  utm: UTM;
};

export type TerrainEdge = {
  from: VertexId;
  to: VertexId;
  length: number;
};

export type TerrainModel = {
  areaM2: number;
  areaHa: number;
  perimeterMl: number;
  utmZone: string;
  vertices: TerrainVertex[];
  edges: TerrainEdge[];
};

export type LotStatus = "available" | "offer" | "sold" | "blocked";
export type LotTypology = "standard" | "premium" | "adjustment";

export type BlockRole =
  | "access-west"
  | "access-east"
  | "south-west"
  | "south-east"
  | "central-west"
  | "central-east"
  | "oasis-west"
  | "oasis-east"
  | "north-west"
  | "north-east"
  | "north-remate-west"
  | "north-remate-east";

export type BlockSpec = {
  id: string;
  role: BlockRole;
  targetLotCount: number;
  targetNetAreaM2: number;
  lotMix: {
    standard: number;
    premium: number;
    adjustment: number;
  };
};

export type Road = {
  id: string;
  kind: "primary" | "secondary" | "pedestrian";
  widthM: number;
  path: XY[];
};

export type Amenity = {
  id: string;
  kind:
    | "entry-plaza"
    | "parking"
    | "clubhouse"
    | "pool"
    | "deck"
    | "firepit"
    | "sand-plaza"
    | "moon-deck"
    | "xerophytic-garden";
  polygon: XY[];
};

export type BlockPolygon = {
  id: string;
  role: BlockRole;
  polygon: XY[];
};

export type Lot = {
  id: string;
  blockId: string;
  typology: LotTypology;
  status: LotStatus;
  areaM2: number;
  polygon: XY[];
  priceLabel?: string;
  
  // Legacy compatibility for UI
  price: number;
  number: number;
  quadrant: string;
  area: number;
  elevation: number;
  distanceToPool: number;
  hubDistance: number;
};

export type SalesFilters = {
  search: string;
  blockId: string | "all";
  status: LotStatus | "all";
  typology: LotTypology | "all";
};

export type MasterplanScene = {
  terrain: XY[];
  innerBuffer: XY[];
  roads: Road[];
  amenities: Amenity[];
  blocks: BlockPolygon[];
  lots: Lot[];
};
