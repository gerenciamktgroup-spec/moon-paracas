import React from "react";
import { Lot } from "../../types/map";
import { realUrbanLotToCommercial } from "../../lib/commercialInventory";
import { REAL_MASTERPLAN_MODEL, type RealUrbanLot } from "../../lib/realUrbanMasterplanModel";
import { MapCanvas } from "./MapCanvas";

export default function MoonParacasMap({
  selectedLot,
  onSelectLot,
}: {
  lots?: Lot[];
  selectedLot?: Lot | null;
  onSelectLot?: (lot: Lot | null) => void;
}) {
  const urbanSelected = selectedLot
    ? REAL_MASTERPLAN_MODEL.lots.find((lot) => lot.id === selectedLot.id) ?? null
    : null;

  return (
    <section className="moon-paracas-map relative flex h-auto w-full flex-col overflow-hidden rounded-3xl bg-transparent">
      <div className="relative w-full">
        <MapCanvas
          selectedLot={urbanSelected}
          onSelectLot={(lot: RealUrbanLot | null) => {
            if (!onSelectLot) return;
            onSelectLot(lot ? realUrbanLotToCommercial(lot) : null);
          }}
        />
      </div>
    </section>
  );
}
