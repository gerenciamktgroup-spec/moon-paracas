import React, { useMemo, useState } from "react";
import { Lot, MasterplanScene, SalesFilters } from "../../types/map";
import { buildTerrainScene } from "../../lib/terrainModel";
import { buildRoads } from "../../lib/roadModel";
import { buildAmenities } from "../../lib/amenityModel";
import { buildBlocks } from "../../lib/blockModel";
import { buildLots } from "../../lib/lotModel";
import { filterLots } from "../../lib/salesModel";
import { FiltersBar } from "./FiltersBar";
import { MapCanvas } from "./MapCanvas";
import { RightPanel } from "./RightPanel";
import { Legend } from "./Legend";

export default function MoonParacasMap() {
  const [filters, setFilters] = useState<SalesFilters>({
    search: "",
    blockId: "all",
    status: "all",
    typology: "all"
  });

  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

  const scene = useMemo<MasterplanScene>(() => {
    const terrainScene = buildTerrainScene();
    const roads = buildRoads(terrainScene.innerBuffer);
    const amenities = buildAmenities(terrainScene.innerBuffer);
    const blocks = buildBlocks(terrainScene.innerBuffer);
    const lots = buildLots(blocks);

    return {
      terrain: terrainScene.terrain,
      innerBuffer: terrainScene.innerBuffer,
      roads,
      amenities,
      blocks,
      lots
    };
  }, []);

  const visibleLots = useMemo(
    () => filterLots(scene.lots, filters),
    [scene.lots, filters]
  );

  return (
    <section className="moon-paracas-map flex flex-col h-screen w-full bg-[#f4efe5] overflow-hidden">
      <FiltersBar filters={filters} onChange={setFilters} />
      <div className="moon-paracas-map__layout flex flex-1 h-[calc(100vh-73px)] relative flex-col md:flex-row">
        <div className="moon-paracas-map__canvas relative flex-1 h-full w-full">
          <MapCanvas
            scene={scene}
            visibleLots={visibleLots}
            selectedLot={selectedLot}
            onSelectLot={setSelectedLot}
          />
          <Legend />
        </div>
        <RightPanel lot={selectedLot} />
      </div>
    </section>
  );
}
