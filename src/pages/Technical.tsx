import React from "react";
import { Lot } from "../types/map";
import { EngineeringSpecs } from "../components/EngineeringSpecs";
import { ContractsAndRules } from "../components/ContractsAndRules";
import { ContractsSignature } from "../components/ContractsSignature";
import { AccessRoute } from "../components/AccessRoute";
import { Scale, ShieldAlert, Award, Compass } from "lucide-react";

interface TechnicalProps {
  selectedLot: Lot | null;
  onSignatureSuccess: (message: string) => void;
}

export const Technical: React.FC<TechnicalProps> = ({ selectedLot, onSignatureSuccess }) => {
  return (
    <div className="relative min-h-[90vh] text-[#E1D9C1] py-12 px-4 sm:px-6 md:px-8 space-y-16 overflow-hidden">

      {/* Header section with neuromarketing storytelling copy */}
      <div className="text-center space-y-4 max-w-4xl mx-auto pt-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E2725B] px-3 py-1 bg-[#E2725B]/10 rounded-full border border-[#E2725B]/20">
          Transparencia y Legalidad
        </span>
        <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase text-white tracking-wide leading-tight">
          Memoria Técnica y Visor Contractual
        </h2>
        <p className="text-stone-300 font-sans text-xs sm:text-sm font-light leading-relaxed max-w-3xl mx-auto">
          La compra de un lote en el desierto requiere certeza física y jurídica absoluta. Ponemos a tu disposición los parámetros estrictos de cimentación, revestimientos bioclimáticos y los contratos de incorporación y reglamentos oficiales de <strong>Moon Paracas</strong>.
        </p>
      </div>

      {/* Layout components column */}
      <div className="max-w-[1200px] mx-auto space-y-16">
        
        {/* Section 1: Engineering & Specs */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 max-w-4xl mx-auto">
            <ShieldAlert className="w-6 h-6 text-[#E2725B]" />
            <h3 className="font-display text-2xl font-bold uppercase text-white tracking-wider">
              1. Parámetros de Ingeniería y Coexistencia
            </h3>
          </div>
          <EngineeringSpecs />
        </section>

        {/* Section 2: Contracts and bylaws */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 max-w-5xl mx-auto">
            <Scale className="w-6 h-6 text-[#E2725B]" />
            <h3 className="font-display text-2xl font-bold uppercase text-white tracking-wider">
              2. Documentos y Contratos del Eco-Condominio
            </h3>
          </div>
          <ContractsAndRules />
        </section>

        {/* Section 3: Safe Digital Signature */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 max-w-5xl mx-auto">
            <Award className="w-6 h-6 text-[#E2725B]" />
            <h3 className="font-display text-2xl font-bold uppercase text-white tracking-wider">
              3. Simulador de Firma Digital de Contratos
            </h3>
          </div>
          <ContractsSignature 
            selectedLot={selectedLot} 
            onSignatureSuccess={onSignatureSuccess} 
          />
        </section>

        {/* Section 4: Access Route from Panamericana Sur */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 max-w-5xl mx-auto">
            <Compass className="w-6 h-6 text-[#E2725B]" />
            <h3 className="font-display text-2xl font-bold uppercase text-white tracking-wider">
              4. Ruta de Acceso desde la Panamericana Sur
            </h3>
          </div>
          <AccessRoute />
        </section>

      </div>
    </div>
  );
};
