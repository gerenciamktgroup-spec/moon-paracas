/**
 * Zustand store — single source of truth for the 3D Configurator
 * All dimensions remain metric. No relative scaling.
 */

import { create } from "zustand";
import {
  ConfiguratorState,
  LotSize,
  DomeDiameter,
  TimeOfDay,
  CameraPreset,
  computeSpatialMetrics,
  SpatialMetrics,
} from "../types/configurator";

interface ConfiguratorStore extends ConfiguratorState {
  metrics: SpatialMetrics;
  setLotSize: (size: LotSize) => void;
  setDomeDiameter: (d: DomeDiameter) => void;
  setTimeOfDay: (t: TimeOfDay) => void;
  setCameraPreset: (p: CameraPreset) => void;
  setCoverOpacity: (v: number) => void;
  toggleDeck: () => void;
  togglePlunge: () => void;
  toggleFirepit: () => void;
  toggleVegetation: () => void;
  toggleScaleBar: () => void;
  toggleClipping: () => void;
  reset: () => void;
}

const initialState: ConfiguratorState = {
  lotSize: 240,
  domeDiameter: 8,
  timeOfDay: "day",
  cameraPreset: "aerial",
  coverOpacity: 0.85,
  showDeck: true,
  showPlunge: true,
  showFirepit: true,
  showVegetation: true,
  showScaleBar: true,
  clippingEnabled: false,
};

function deriveMetrics(s: ConfiguratorState): SpatialMetrics {
  return computeSpatialMetrics(s.lotSize, s.domeDiameter, {
    deck: s.showDeck,
    plunge: s.showPlunge,
  });
}

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  ...initialState,
  metrics: deriveMetrics(initialState),

  setLotSize: (lotSize) => {
    const next = { ...get(), lotSize };
    if (lotSize === 120 && next.domeDiameter === 8) {
      next.domeDiameter = 7;
    }
    set({ ...next, metrics: deriveMetrics(next) });
  },

  setDomeDiameter: (domeDiameter) => {
    const { lotSize } = get();
    if (lotSize === 120 && domeDiameter === 8) return;
    const next = { ...get(), domeDiameter };
    set({ ...next, metrics: deriveMetrics(next) });
  },

  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setCameraPreset: (cameraPreset) => set({ cameraPreset }),
  setCoverOpacity: (coverOpacity) => set({ coverOpacity: Math.max(0, Math.min(1, coverOpacity)) }),

  toggleDeck: () => {
    const next = { ...get(), showDeck: !get().showDeck };
    set({ ...next, metrics: deriveMetrics(next) });
  },
  togglePlunge: () => {
    const next = { ...get(), showPlunge: !get().showPlunge };
    set({ ...next, metrics: deriveMetrics(next) });
  },
  toggleFirepit: () => set({ showFirepit: !get().showFirepit }),
  toggleVegetation: () => set({ showVegetation: !get().showVegetation }),
  toggleScaleBar: () => set({ showScaleBar: !get().showScaleBar }),
  toggleClipping: () => set({ clippingEnabled: !get().clippingEnabled }),

  reset: () => set({ ...initialState, metrics: deriveMetrics(initialState) }),
}));
