import React, { useState } from "react";

export function Legend() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-8 left-8 z-20 bg-white/90 backdrop-blur-md border border-[var(--color-desert-taupe)] shadow-lg font-sans transition-all duration-300 pointer-events-auto rounded-sm">
      {/* Header / Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-desert-charcoal)] hover:bg-[var(--color-desert-sand)] transition-colors cursor-pointer rounded-sm focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-stone-500 text-[11px]">🎨</span>
          <span>Leyenda</span>
        </div>
        <span className="text-[8px] opacity-70 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 border-t border-[var(--color-desert-taupe)]/50 flex flex-col gap-3.5 bg-white/95 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-status-available)] block shadow-sm border border-[rgba(0,0,0,0.1)]"></span>
            <span className="text-[var(--color-desert-charcoal)] text-[9px] font-bold uppercase tracking-wider">Disponible</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-status-offer)] block shadow-sm border border-[rgba(0,0,0,0.1)]"></span>
            <span className="text-[var(--color-desert-charcoal)] text-[9px] font-bold uppercase tracking-wider">En Oferta</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-status-sold)] block shadow-sm border border-[rgba(0,0,0,0.1)]"></span>
            <span className="text-[var(--color-desert-charcoal)] text-[9px] font-bold uppercase tracking-wider">Vendido</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-status-blocked)] block shadow-sm border border-[rgba(0,0,0,0.1)]"></span>
            <span className="text-[var(--color-desert-charcoal)] text-[9px] font-bold uppercase tracking-wider">Reservado</span>
          </div>
        </div>
      )}
    </div>
  );
}

