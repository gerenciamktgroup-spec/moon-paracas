import React from "react";
import { Lot } from "../../types/map";
import { BUSINESS_RULES } from "../../data/business";

export function RightPanel({ lot }: { lot: Lot | null }) {
  if (!lot) {
    return (
      <aside className="panel w-full md:w-[350px] bg-[#fdfcfb] border-l border-[#e8e2d7] p-8 flex flex-col shrink-0 shadow-[-4px_0_15px_rgba(0,0,0,0.03)] h-full overflow-y-auto">
        <div className="panel__brand font-display font-black text-[#9e7e62] tracking-[0.2em] mb-8 text-xl">MOON PARACAS</div>
        <h3 className="font-sans text-sm font-bold text-[#38342f] tracking-widest uppercase mb-4">Fase 0 - Founder</h3>
        <p className="text-[#656059] text-sm leading-relaxed mb-6">Selecciona un lote en el masterplan para visualizar su información comercial y tipología.</p>
        
        <div className="mt-auto pt-6 border-t border-[#e8e2d7]">
          <p className="text-[#8c8881] text-xs leading-relaxed italic">{BUSINESS_RULES.legalDisclaimer}</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="panel w-full md:w-[350px] bg-[#fdfcfb] border-l border-[#e8e2d7] p-8 flex flex-col shrink-0 shadow-[-4px_0_15px_rgba(0,0,0,0.03)] h-full overflow-y-auto animate-fade-in font-sans">
      <div className="text-xs font-bold text-[#9e7e62] tracking-wider cursor-pointer hover:text-[#7d624b] transition-colors mb-6 uppercase">&larr; Volver al plano</div>
      <h3 className="text-xs font-bold text-[#8c8881] tracking-widest uppercase mb-1">FASE 0 - FOUNDER</h3>
      <h4 className="text-3xl font-display font-black text-[#38342f] mb-3">{lot.blockId} - {lot.id}</h4>
      
      <div className="mb-8">
        <span className={`inline-block px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider ${
          lot.status === 'available' ? 'bg-[#a9bb8d] text-[#1e2d22]' :
          lot.status === 'offer' ? 'bg-[#d8b07a] text-[#3e2c14]' :
          lot.status === 'sold' ? 'bg-[#e8e2d7] text-[#5e584f]' :
          'bg-[#6571df] text-white'
        }`}>
          {lot.status === 'available' ? 'DISPONIBLE' : 
           lot.status === 'offer' ? 'OFERTA' : 
           lot.status === 'sold' ? 'VENDIDO' : 'BLOQUEADO'}
        </span>
      </div>

      <div className="space-y-4 mb-8">
        <div className="metric flex justify-between items-center border-b border-[#f4efe5] pb-3">
          <label className="text-sm text-[#656059]">Tipología</label>
          <strong className="text-sm text-[#38342f] font-bold uppercase tracking-wide">{lot.typology}</strong>
        </div>

        <div className="metric flex justify-between items-center border-b border-[#f4efe5] pb-3">
          <label className="text-sm text-[#656059]">Área aprox.</label>
          <strong className="text-sm text-[#38342f] font-bold">{lot.areaM2.toFixed(2)} m²</strong>
        </div>

        <div className="metric flex justify-between items-center border-b border-[#f4efe5] pb-3">
          <label className="text-sm text-[#656059]">Precio</label>
          <strong className="text-sm text-[#9e7e62] font-bold">{lot.priceLabel}</strong>
        </div>
      </div>

      <p className="text-[#8c8881] text-[11px] leading-relaxed mb-8 bg-[#f4efe5] p-4 rounded border border-[#e8e2d7]">
        Área de uso exclusivo aproximada dentro de un proyecto privado de baja densidad y desarrollo progresivo. No constituye habilitación urbana tradicional.
      </p>

      <div className="flex flex-col gap-3 mt-auto">
        <button className="w-full bg-[#1e2d22] text-white font-bold text-sm tracking-widest uppercase py-4 rounded hover:bg-[#2c4031] transition-colors">
          Cotizar por WhatsApp
        </button>
        <button className="w-full bg-transparent border-2 border-[#1e2d22] text-[#1e2d22] font-bold text-sm tracking-widest uppercase py-3.5 rounded hover:bg-[#1e2d22] hover:text-white transition-colors">
          Simular Reserva
        </button>
      </div>
    </aside>
  );
}
