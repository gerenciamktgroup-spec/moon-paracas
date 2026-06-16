import React, { useMemo, useState } from "react";
import { Lot, MasterplanScene, SalesFilters } from "../../types/map";
import { buildTerrainScene } from "../../lib/terrainModel";
import { buildRoads } from "../../lib/roadModel";
import { buildAmenities } from "../../lib/amenityModel";
import { buildBlocks } from "../../lib/blockModel";
import { buildLots, buildParkingLots } from "../../lib/lotModel";
import { filterLots } from "../../lib/salesModel";
import { FiltersBar } from "./FiltersBar";
import { MapCanvas } from "./MapCanvas";
import { RightPanel } from "./RightPanel";
import { Legend } from "./Legend";

export default function MoonParacasMap({
  lots,
  selectedLot,
  onSelectLot
}: {
  lots: Lot[];
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot) => void;
}) {
  const [filters, setFilters] = useState<SalesFilters>({
    search: "",
    blockId: "all",
    status: "all",
    typology: "all"
  });

  const scene = useMemo<MasterplanScene>(() => {
    const terrainScene = buildTerrainScene();
    const roads = buildRoads(terrainScene.innerBuffer);
    // buildBlocks MUST run first — it populates globalOasisBoundary for the sand-plaza
    const blocks = buildBlocks(terrainScene.innerBuffer);
    const amenities = buildAmenities(terrainScene.innerBuffer);

    return {
      terrain: terrainScene.terrain,
      innerBuffer: terrainScene.innerBuffer,
      roads,
      amenities,
      blocks,
      lots
    };
  }, [lots]);

  const visibleLots = useMemo(
    () => filterLots(scene.lots, filters),
    [scene.lots, filters]
  );

  return (
    <section className="moon-paracas-map flex flex-col h-auto md:h-[700px] w-full bg-[#f4efe5] overflow-hidden border-4 border-[#2D312E] shadow-[8px_8px_0px_rgba(45,49,46,0.15)] relative">
      <FiltersBar filters={filters} onChange={setFilters} />
      <div className="moon-paracas-map__layout flex flex-1 min-h-0 relative flex-col md:flex-row">
        <div className="moon-paracas-map__canvas relative flex-1 w-full h-[400px] sm:h-[500px] md:h-full md:w-auto md:min-w-0">
          <MapCanvas
            scene={scene}
            visibleLots={visibleLots}
            selectedLot={selectedLot}
            onSelectLot={onSelectLot}
          />
          <Legend />
        </div>
        <RightPanel lot={selectedLot} />
      </div>
    </section>
  );
}
