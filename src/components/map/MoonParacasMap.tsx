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

export default function MoonParacasMap({
  lots,
  selectedLot,
  onSelectLot
}: {
  lots: Lot[];
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot) => void;
}) {
  const [viewMode, setViewMode] = useState<"interactive" | "render3d">("interactive");
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
    <section className="moon-paracas-map flex flex-col h-auto md:h-[720px] w-full bg-[#1D1714]/60 backdrop-blur-xl overflow-hidden border border-[rgba(225,217,193,0.15)] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative">
      {/* View Selector Tabs */}
      <div className="flex border-b border-[rgba(225,217,193,0.15)] bg-[#1D1714]/90 z-20">
        <button
          onClick={() => setViewMode("interactive")}
          className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
            viewMode === "interactive"
              ? "bg-[#E2725B] text-white"
              : "text-[#E1D9C1]/60 hover:text-[#E1D9C1] hover:bg-[#1D1714]/50"
          }`}
        >
          <span>🗺️</span>
          <span>Mapa Interactivo (Google Earth)</span>
        </button>
        <button
          onClick={() => setViewMode("render3d")}
          className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
            viewMode === "render3d"
              ? "bg-[#E2725B] text-white"
              : "text-[#E1D9C1]/60 hover:text-[#E1D9C1] hover:bg-[#1D1714]/50"
          }`}
        >
          <span>📸</span>
          <span>Vista 3D Masterplan (Render)</span>
        </button>
      </div>

      {viewMode === "interactive" ? (
        <>
          <FiltersBar filters={filters} onChange={setFilters} />
          <div className="moon-paracas-map__layout flex flex-1 min-h-0 relative flex-col md:flex-row">
            <div className="moon-paracas-map__canvas relative flex-1 w-full h-[400px] sm:h-[500px] md:h-full md:w-auto md:min-w-0">
              <MapCanvas
                scene={scene}
                visibleLots={visibleLots}
                selectedLot={selectedLot}
                onSelectLot={onSelectLot}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 w-full min-h-[450px] bg-[#120F0D] flex items-center justify-center p-4 relative overflow-hidden group select-none">
          <img
            src="/images/masterplan_3d.jpg"
            alt="Vista 3D Masterplan Moon Paracas"
            className="max-w-full max-h-[85%] md:max-h-[90%] object-contain shadow-[0_16px_50px_rgba(0,0,0,0.8)] border border-[rgba(225,217,193,0.15)] transition-transform duration-500 hover:scale-[1.01]"
          />
          <div className="absolute bottom-4 left-4 right-4 bg-[#1D1714]/90 backdrop-blur-xl border border-[rgba(225,217,193,0.2)] p-4 text-xs text-[#E1D9C1] text-center font-sans shadow-lg max-w-2xl mx-auto">
            <span className="font-bold text-white uppercase tracking-widest text-xs block mb-1">Plan Maestro Moon Paracas</span>
            <span className="block text-[11px] text-[#E1D9C1]/80 leading-relaxed">
              Vista tridimensional conceptual (3D Render) mostrando la distribución de las 11.2 hectáreas, el oasis de palmeras central con lagunas, club house y la urbanización geométrica de los lotes residenciales.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
