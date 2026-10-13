import React from "react";
import { ArrowUpRight, Sparkles, MessageCircle, ShieldCheck, MapPin, Download, Calendar, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { PROJECT, whatsappHref } from "../../config/project";
import { STANDARD_LOT_PRICE_USD, STANDARD_LOT_PRICE_PEN, LOT_PRICE_PER_M2_USD } from "../../config/pricing";

interface ProjectHeroProps {
  onOpenDossier?: () => void;
  onOpenShowroom?: () => void;
}

export const ProjectHero: React.FC<ProjectHeroProps> = ({ onOpenDossier, onOpenShowroom }) => {
  const waHeroMsg = "Hola! Quiero información sobre los lotes de 120 m² a $120/m² en Moon Paracas (Precio de Lanzamiento desde $14,400 USD).";

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#FAF7F2] pt-32 sm:pt-40 pb-16">
      
      {/* Luces y Atmósfera Cálida de Desierto */}
      <div className="absolute inset-0 ambient-desert-glow pointer-events-none" />
      <div className="absolute top-0 right-0 w-[550px] h-[550px] ambient-sunset-flare pointer-events-none opacity-60" />
      <div className="pointer-events-none absolute -left-20 bottom-10 h-[400px] w-[400px] rounded-full bg-[#C5A059]/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12 w-full flex-1 flex flex-col justify-center text-center lg:text-left">
        
        {/* Top Eyebrow Badges */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/40 bg-white/95 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#A84F36] shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
            Lanzamiento Oficial · ${LOT_PRICE_PER_M2_USD} USD / m²
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4E6646]/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#4E6646]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#4E6646]" />
            Asociación & Adjudicación Notarial
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#161311]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#38312B]">
            <MapPin className="h-3.5 w-3.5 text-[#C85B3E]" />
            A 3 horas de Lima · Km 240
          </span>
        </div>

        {/* Titular Principal Editorial */}
        <div className="max-w-4xl mx-auto lg:mx-0">
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-[5.2rem] font-bold leading-[1.04] text-[#161311] tracking-tight">
            El lujo del <span className="font-serif-italic font-normal text-[#C85B3E]">silencio</span>.<br />
            Tu santuario en Paracas.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-[#38312B]/85">
            Lotes residenciales de <strong>120 m² y 240 m²</strong> para casa domo bioclimática desde <strong>${STANDARD_LOT_PRICE_USD.toLocaleString()} USD</strong> (~S/ {STANDARD_LOT_PRICE_PEN.toLocaleString()} PEN). Disfruta de un <strong>Oasis de {Math.round(PROJECT.oasisAreaM2).toLocaleString("es-PE")} m²</strong>, laguna zen y sol todo el año a 3 horas de Lima.
          </p>
        </div>

        {/* Acciones de Navegación Claras y Ordenadas */}
        <div className="mt-10 flex flex-wrap gap-4 items-center justify-center lg:justify-start">
          <Link
            to="/simulador"
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#C85B3E] px-8 py-4 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#C85B3E]/25 transition-all duration-300 hover:bg-[#A84F36] hover:shadow-xl active:scale-95"
          >
            <Compass className="h-4 w-4" />
            <span>Explorar Masterplan 3D</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          {onOpenDossier && (
            <button
              onClick={onOpenDossier}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#C5A059]/60 bg-white px-7 py-4 font-sans text-xs font-bold uppercase tracking-wider text-[#161311] shadow-sm transition-all duration-300 hover:bg-[#FAF7F2] active:scale-95 cursor-pointer"
            >
              <Download className="h-4 w-4 text-[#A84F36]" />
              <span>Descargar Dossier 2026</span>
            </button>
          )}

          {onOpenShowroom && (
            <button
              onClick={onOpenShowroom}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E8E1D5] bg-white/80 px-6 py-4 font-sans text-xs font-bold uppercase tracking-wider text-[#38312B] shadow-sm transition-all duration-300 hover:bg-white active:scale-95 cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-[#4E6646]" />
              <span>Agendar Visita / Showroom</span>
            </button>
          )}
        </div>

      </div>

      {/* Franja Minimalista de Métricas */}
      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12 mt-14 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#E8E1D5] pt-8 text-center sm:text-left">
          <div>
            <span className="block font-display text-3xl font-bold text-[#161311]">$120 USD</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786F66]">Lanzamiento x m²</span>
          </div>
          <div>
            <span className="block font-display text-3xl font-bold text-[#C85B3E]">120 y 240 m²</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786F66]">Lote Simple o Doble</span>
          </div>
          <div>
            <span className="block font-display text-3xl font-bold text-[#C5A059]">{Math.round(PROJECT.oasisAreaM2).toLocaleString("es-PE")} m²</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786F66]">Oasis & Laguna Zen</span>
          </div>
          <div>
            <span className="block font-display text-3xl font-bold text-[#4E6646]">36 Cuotas</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786F66]">Financiamiento Directo</span>
          </div>
        </div>
      </div>
    </section>
  );
};


