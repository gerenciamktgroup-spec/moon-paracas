import { create } from "zustand";
import {
  LotArea,
  DomeDiameter,
  TimeOfDay,
  CameraPreset,
  StylePresetId,
  STYLE_PRESETS,
  BathLocation,
  WaterFeature,
  GroundTreatment,
  MetricData,
  DOME_SPECS_MAP,
  FIXED_EXTERIOR,
} from "../types/configurator";

interface ConfiguratorState {
  // Config state
  lotArea: LotArea;
  diameter: DomeDiameter;
  timeOfDay: TimeOfDay;
  coverProgress: number; // 0.0=Estructura, 0.45=Timber-Glass, 1.0=Adobe
  cameraPreset: CameraPreset;
  activePreset: StylePresetId | null;
  bathLocation: BathLocation;
  waterFeature: WaterFeature;
  groundTreatment: GroundTreatment;
  isFullscreen: boolean;
  toastMessage: string | null;

  // Amenity toggles
  amenities: {
    deck: boolean;
    firepit: boolean;
    garden: boolean;
    path: boolean;
    scaleRod: boolean;
  };

  // Actions
  setLotArea: (lot: LotArea) => void;
  setDiameter: (dia: DomeDiameter) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setCoverProgress: (progress: number) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setBathLocation: (loc: BathLocation) => void;
  setWaterFeature: (feat: WaterFeature) => void;
  setGroundTreatment: (treat: GroundTreatment) => void;
  applyPreset: (presetId: StylePresetId) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  toggleAmenity: (key: keyof ConfiguratorState["amenities"]) => void;
  setToastMessage: (msg: string | null) => void;

  // Computed metric helper
  getMetrics: () => MetricData;
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  lotArea: 240,
  diameter: 8,
  timeOfDay: "day",
  coverProgress: 0.55,
  cameraPreset: "iso",
  activePreset: null,
  bathLocation: "inside",
  waterFeature: "plunge",
  groundTreatment: "xeriscape",
  isFullscreen: false,
  toastMessage: null,

  amenities: {
    deck: true,
    firepit: true,
    garden: true,
    path: true,
    scaleRod: true,
  },

  setLotArea: (newLot) => {
    const currentDia = get().diameter;
    let nextDia = currentDia;

    if (newLot === 120 && currentDia === 8) {
      nextDia = 6;
      set({
        lotArea: newLot,
        diameter: nextDia,
        activePreset: null,
        amenities: { ...get().amenities, firepit: false },
        toastMessage: "Lote 120 m²: Ø8m sobrepasa retiros. Seleccionado Ø6m Studio.",
      });
      setTimeout(() => set({ toastMessage: null }), 4000);
      return;
    }

    set({
      lotArea: newLot,
      diameter: nextDia,
      activePreset: null,
      amenities: {
        ...get().amenities,
        firepit: newLot === 240 ? get().amenities.firepit : false,
      },
    });
  },

  setDiameter: (newDia) => {
    const currentLot = get().lotArea;
    if (currentLot === 120 && newDia === 8) {
      set({
        toastMessage: "En lote 120 m², Ø8m deja retiros insuficientes. Pasa a lote 240 m².",
      });
      setTimeout(() => set({ toastMessage: null }), 4000);
      return;
    }

    if (newDia === 6) {
      set({
        diameter: newDia,
        activePreset: null,
        toastMessage: "Ø6m: Formato Studio optimizado (Cama King + Baño completo).",
      });
      setTimeout(() => set({ toastMessage: null }), 3500);
      return;
    }

    set({ diameter: newDia, activePreset: null });
  },

  setTimeOfDay: (timeOfDay) => set({ timeOfDay, activePreset: null }),
  setCoverProgress: (coverProgress) => set({ coverProgress, activePreset: null }),
  setCameraPreset: (cameraPreset) => {
    const updates: Partial<ConfiguratorState> = { cameraPreset, activePreset: null };
    // Smart auto-lighting suggestion
    if (cameraPreset === "deck" && get().timeOfDay === "day") {
      updates.timeOfDay = "golden";
      updates.toastMessage = "Cámara Deck: Activada atmósfera Golden Hour";
      setTimeout(() => set({ toastMessage: null }), 3000);
    }
    set(updates);
  },

  setBathLocation: (bathLocation) => {
    const msg =
      bathLocation === "outside"
        ? "Baño Exterior activado: Mayor amplitud en la suite interior."
        : "Baño Interior: Suite integrada.";
    set({ bathLocation, activePreset: null, toastMessage: msg });
    setTimeout(() => set({ toastMessage: null }), 3000);
  },

  setWaterFeature: (waterFeature) => {
    const msg =
      waterFeature === "jacuzzi"
        ? "Jacuzzi Spa Circular (3.5 m²): Hidromasaje en cedro y piedra."
        : waterFeature === "plunge"
        ? "Plunge Pool (5.0 m²): Piscina privada 2.50m."
        : "Área de Agua desactivada.";
    set({ waterFeature, activePreset: null, toastMessage: msg });
    setTimeout(() => set({ toastMessage: null }), 3000);
  },

  setGroundTreatment: (groundTreatment) => {
    const msg =
      groundTreatment === "lawn"
        ? "Jardín Habitable: Pasto verde costero delimitado."
        : groundTreatment === "mixed"
        ? "Jardín Mixto: Césped junto al deck + Xeriscape perimetral."
        : "Xeriscape: Arena y vegetación nativa de Paracas.";
    set({ groundTreatment, activePreset: null, toastMessage: msg });
    setTimeout(() => set({ toastMessage: null }), 3000);
  },

  applyPreset: (presetId: StylePresetId) => {
    const preset = STYLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const currentLot = get().lotArea;
    if (preset.requiredLot && preset.requiredLot !== currentLot) {
      set({
        toastMessage: `El preset ${preset.title} requiere lote de ${preset.requiredLot} m².`,
      });
      setTimeout(() => set({ toastMessage: null }), 3500);
      return;
    }

    const updates: Partial<ConfiguratorState> = {
      activePreset: presetId,
      coverProgress: preset.coverProgress,
      timeOfDay: preset.timeOfDay,
      cameraPreset: preset.cameraPreset,
      bathLocation: preset.bathLocation,
      waterFeature: preset.waterFeature,
      groundTreatment: preset.groundTreatment,
      toastMessage: `Lookbook: ${preset.title} (${preset.subtitle})`,
    };

    if (preset.forceDiameter) {
      if (currentLot === 240 || preset.forceDiameter <= 7) {
        updates.diameter = preset.forceDiameter;
      }
    }

    if (preset.amenities) {
      updates.amenities = {
        ...get().amenities,
        ...preset.amenities,
      };
    }

    set(updates);
    setTimeout(() => {
      if (get().toastMessage?.includes(preset.title)) {
        set({ toastMessage: null });
      }
    }, 3500);
  },

  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),

  toggleAmenity: (key) =>
    set((state) => ({
      activePreset: null,
      amenities: {
        ...state.amenities,
        [key]: !state.amenities[key],
      },
    })),

  setToastMessage: (toastMessage) => set({ toastMessage }),

  getMetrics: () => {
    const { lotArea, diameter, amenities, bathLocation, waterFeature, groundTreatment } = get();
    const specs = DOME_SPECS_MAP[diameter];
    const footprintM2 = specs.footprintM2;
    const deckM2 = amenities.deck ? FIXED_EXTERIOR.deck.areaM2 : 0.0;
    const waterM2 =
      waterFeature === "plunge"
        ? FIXED_EXTERIOR.plungePool.areaM2
        : waterFeature === "jacuzzi"
        ? FIXED_EXTERIOR.jacuzzi.areaM2
        : 0.0;
    const bathOutdoorM2 = bathLocation === "outside" ? FIXED_EXTERIOR.outdoorBath.areaM2 : 0.0;

    const totalOccupiedM2 = Number((footprintM2 + deckM2 + waterM2 + bathOutdoorM2).toFixed(2));
    const freeYardM2 = Number((lotArea - totalOccupiedM2).toFixed(2));
    const occupancyPercent = Number(((totalOccupiedM2 / lotArea) * 100).toFixed(1));

    let status: "VÁLIDO" | "JUSTO" | "NO RECOMENDADO" = "VÁLIDO";
    if (occupancyPercent > 55) {
      status = "NO RECOMENDADO";
    } else if (occupancyPercent > 45) {
      status = "JUSTO";
    }

    // Dynamic Price Calculation (USD)
    let estimatedPriceUSD = specs.basePriceUSD;
    if (bathLocation === "outside") estimatedPriceUSD += 4500;
    if (waterFeature === "plunge") estimatedPriceUSD += 6500;
    if (waterFeature === "jacuzzi") estimatedPriceUSD += 4800;
    if (groundTreatment === "lawn") estimatedPriceUSD += 1800;
    if (groundTreatment === "mixed") estimatedPriceUSD += 2400;
    if (amenities.deck) estimatedPriceUSD += 3800;
    if (amenities.firepit) estimatedPriceUSD += 1200;

    return {
      lotAreaM2: lotArea,
      footprintM2,
      deckM2,
      waterM2,
      bathOutdoorM2,
      totalOccupiedM2,
      freeYardM2,
      occupancyPercent,
      status,
      estimatedPriceUSD,
    };
  },
}));
