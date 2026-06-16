import React from "react";
import { Lot } from "../../types/map";
import { BUSINESS_RULES } from "../../data/business";

export function RightPanel({ lot, onDeselect }: { lot: Lot | null, onDeselect?: () => void }) {
  if (!lot) {
    return (
      <aside className="w-full md:w-[360px] bg-white border-t md:border-t-0 md:border-l border-[var(--color-desert-taupe)] p-6 sm:p-10 flex flex-col shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] h-auto md:h-full overflow-y-auto">
        <div className="font-display font-medium text-[var(--color-desert-bronze)] tracking-[0.25em] mb-10 text-xl uppercase">MOON PARACAS</div>
        <h3 className="font-sans text-xs font-semibold text-[var(--color-desert-slate)] tracking-widest uppercase mb-4">Fase 0 - Founder</h3>
        <p className="font-sans text-[var(--color-desert-slate)] text-sm leading-relaxed mb-6 font-light">Selecciona una parcela en el masterplan para visualizar su información técnica, tipología y disponibilidad comercial.</p>
        
        <div className="mt-auto pt-8 border-t border-[var(--color-desert-taupe)]">
          <p className="font-sans text-[#8C8881] text-[10px] leading-relaxed uppercase tracking-wider">{BUSINESS_RULES.legalDisclaimer}</p>
        </div>
      </aside>
    );
  }

  const lotNum = lot.id.includes('-') ? lot.id.split('-')[1].replace('L', '') : lot.id;

  return (
    <aside className="w-full md:w-[360px] bg-white border-t md:border-t-0 md:border-l border-[var(--color-desert-taupe)] p-6 sm:p-10 flex flex-col shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] h-auto md:h-full overflow-y-auto animate-fade-in">
      <div 
        className="font-sans text-[10px] font-bold text-[var(--color-desert-bronze)] tracking-widest cursor-pointer hover:text-[var(--color-desert-charcoal)] transition-colors mb-8 uppercase flex items-center gap-2"
        onClick={onDeselect}
      >
        <span>&larr;</span> VOLVER AL PLANO
      </div>
      
      <h3 className="font-sans text-[10px] font-bold text-[var(--color-desert-slate)] tracking-widest uppercase mb-2">MANZANA {lot.blockId}</h3>
      <h4 className="font-display text-4xl font-light text-[var(--color-desert-charcoal)] mb-6">Lote {lotNum}</h4>
      
      <div className="mb-10">
        <span className={`font-sans inline-block px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
          lot.status === 'available' ? 'bg-[var(--color-status-available)] text-white' :
          lot.status === 'offer' ? 'bg-[var(--color-status-offer)] text-white' :
          lot.status === 'sold' ? 'bg-[var(--color-status-sold)] text-[var(--color-desert-charcoal)]' :
          'bg-[var(--color-status-blocked)] text-[var(--color-desert-charcoal)]'
        }`}>
          {lot.status === 'available' ? 'DISPONIBLE' : 
           lot.status === 'offer' ? 'EN OFERTA' : 
           lot.status === 'sold' ? 'VENDIDO' : 'RESERVADO'}
        </span>
      </div>

      <div className="space-y-5 mb-10 font-sans">
        <div className="flex justify-between items-end border-b border-[var(--color-desert-taupe)] pb-3">
          <label className="text-xs text-[var(--color-desert-slate)] font-light uppercase tracking-wider">Tipología</label>
          <strong className="text-sm text-[var(--color-desert-charcoal)] font-medium uppercase tracking-wide">{lot.typology}</strong>
        </div>

        <div className="flex justify-between items-end border-b border-[var(--color-desert-taupe)] pb-3">
          <label className="text-xs text-[var(--color-desert-slate)] font-light uppercase tracking-wider">Área Exacta (Aprox.)</label>
          <strong className="text-sm text-[var(--color-desert-charcoal)] font-medium">{lot.areaM2.toFixed(2)} m²</strong>
        </div>

        {lot.dimensions && (
          <div className="flex justify-between items-end border-b border-[var(--color-desert-taupe)] pb-3">
            <label className="text-xs text-[var(--color-desert-slate)] font-light uppercase tracking-wider">Dimensiones</label>
            <strong className="text-sm text-[var(--color-desert-charcoal)] font-medium">{lot.dimensions}</strong>
          </div>
        )}

        <div className="flex justify-between items-end border-b border-[var(--color-desert-taupe)] pb-3">
          <label className="text-xs text-[var(--color-desert-slate)] font-light uppercase tracking-wider">Inversión</label>
          <strong className="text-sm text-[var(--color-desert-bronze)] font-semibold">{lot.priceLabel}</strong>
        </div>
      </div>

      <p className="font-sans text-[var(--color-desert-slate)] text-[11px] leading-relaxed mb-10 bg-[var(--color-desert-sand)] p-5 rounded-sm border border-[var(--color-desert-taupe)] font-light">
        Área de uso exclusivo calculada matemáticamente. Proyecto privado de baja densidad en desarrollo progresivo. No constituye habilitación urbana tradicional.
      </p>

      <div className="flex flex-col gap-4 mt-auto font-sans">
        <button className="w-full bg-[var(--color-desert-charcoal)] text-white font-medium text-[11px] tracking-widest uppercase py-4 hover:bg-black transition-colors shadow-lg">
          Contactar Asesor
        </button>
        <button className="w-full bg-transparent border border-[var(--color-desert-charcoal)] text-[var(--color-desert-charcoal)] font-medium text-[11px] tracking-widest uppercase py-4 hover:bg-[var(--color-desert-sand)] transition-colors">
          Simular Inversión
        </button>
      </div>
    </aside>
  );
}
