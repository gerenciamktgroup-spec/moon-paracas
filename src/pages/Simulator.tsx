import React, { useState, useEffect } from "react";
import { Lot } from "../types/map";
import MoonParacasMap from "../components/map/MoonParacasMap";
import { LotDetailsModal } from "../components/LotDetailsModal";

// Interactive count-up animation component
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 1200; // 1.2s duration
    const steps = 60;
    const increment = end / steps;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      start += increment;
      if (stepCount >= steps) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue}</>;
};

interface SimulatorProps {
  lots: Lot[];
  selectedLot: Lot | null;
  setSelectedLot: (lot: Lot | null) => void;
  handleReserveLot: (lotId: string, clientData?: { 
    name: string; 
    dni: string; 
    email: string; 
    phone: string;
    monthlyAmount: number;
    installmentsCount: number;
    isCash: boolean;
  }) => Promise<void>;
}

export const Simulator: React.FC<SimulatorProps> = ({ lots, selectedLot, setSelectedLot, handleReserveLot }) => {
  // Helper metrics for overall dashboard counters
  const residentialLots = lots.filter(l => l.blockId !== "PARKING");
  const parkingLots = lots.filter(l => l.blockId === "PARKING");
  
  const libresCount = residentialLots.filter(l => l.status === "available" || l.status === "offer").length;
  const reservadosCount = residentialLots.filter(l => l.status === "reserved").length;
  const vendidosCount = residentialLots.filter(l => l.status === "sold").length;
  const cocherasCount = parkingLots.length;

  // Auto-scroll to simulator details on mobile/tablet viewports (< 1280px)
  useEffect(() => {
    if (selectedLot && window.innerWidth < 1280) {
      const element = document.getElementById("financiamiento");
      if (element) {
        // Delay scroll slightly to allow the map pan-to animation to settle first
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedLot]);

  return (
    <div className="relative min-h-[90vh] text-[#E1D9C1] py-12 px-4 sm:px-6 md:px-8 space-y-12 overflow-hidden">
      
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E2725B]">Simulación Financiera</span>
        <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase text-white tracking-wide">
          El Masterplan Moon Paracas
        </h2>
        <p className="text-stone-300 font-sans text-xs sm:text-sm font-light leading-relaxed">
          Selecciona un lote residencial en el plano interactivo para simular el cronograma de pagos, la cuota inicial (30%) y el financiamiento directo sin intereses en tiempo real.
        </p>
      </div>

      {/* Quick numbers tracker bar (Quiet Luxury Glassmorphic style) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 pb-4 text-center max-w-[1400px] mx-auto">
        <div className="glass-card p-3 sm:p-5 border-t-2 border-t-[#E1D9C1] shadow-md flex flex-col gap-1">
          <p className="text-[8px] sm:text-[9px] font-bold text-[#E1D9C1]/80 uppercase tracking-widest">Disponibilidad</p>
          <p className="font-sans font-extrabold text-white text-2xl sm:text-3xl">
            <AnimatedNumber value={libresCount} />
          </p>
        </div>
        <div className="glass-card p-3 sm:p-5 border-t-2 border-t-[#E2725B] shadow-md flex flex-col gap-1">
          <p className="text-[8px] sm:text-[9px] font-bold text-[#E2725B]/85 uppercase tracking-widest">Separados (Pre-venta)</p>
          <p className="font-sans font-extrabold text-[#E2725B] text-2xl sm:text-3xl">
            <AnimatedNumber value={reservadosCount} />
          </p>
        </div>
        <div className="glass-card p-3 sm:p-5 border-t-2 border-t-stone-500 shadow-md flex flex-col gap-1">
          <p className="text-[8px] sm:text-[9px] font-bold text-stone-400 uppercase tracking-widest">Villas Vendidas</p>
          <p className="font-sans font-extrabold text-stone-400 text-2xl sm:text-3xl">
            <AnimatedNumber value={vendidosCount} />
          </p>
        </div>
        <div className="glass-card p-3 sm:p-5 border-t-2 border-t-[#C5B496] shadow-md flex flex-col gap-1">
          <p className="text-[8px] sm:text-[9px] font-bold text-[#C5B496] uppercase tracking-widest">Cocheras Disponibles</p>
          <p className="font-sans font-extrabold text-[#C5B496] text-2xl sm:text-3xl">
            <AnimatedNumber value={cocherasCount} />
          </p>
        </div>
      </div>

      <div className="w-full max-w-[1200px] mx-auto space-y-8">
        {/* Map Container */}
        <div className="w-full glass-card p-1.5 sm:p-3 shadow-2xl border border-white/10 rounded-2xl overflow-hidden">
          <MoonParacasMap
            lots={lots}
            selectedLot={selectedLot}
            onSelectLot={setSelectedLot}
          />
        </div>
        
        {/* Simulator / Details Container */}
        <div id="financiamiento" className="w-full">
          <LotDetailsModal
            lot={selectedLot}
            onReserve={handleReserveLot}
          />
        </div>
      </div>
    </div>
  );
};
