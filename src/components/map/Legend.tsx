import React from "react";

export function Legend() {
  return (
    <div className="legend absolute bottom-6 right-6 bg-white/95 backdrop-blur-md px-6 py-4 rounded shadow-lg border border-[#e8e2d7] flex flex-col gap-3 font-sans">
      <div className="flex items-center gap-3">
        <span className="w-4 h-4 rounded-full bg-[#a9bb8d] block shadow-sm border border-[rgba(0,0,0,0.1)]"></span>
        <span className="text-[#38342f] text-xs font-bold uppercase tracking-wider">Disponible</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-4 h-4 rounded-full bg-[#d8b07a] block shadow-sm border border-[rgba(0,0,0,0.1)]"></span>
        <span className="text-[#38342f] text-xs font-bold uppercase tracking-wider">Oferta</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-4 h-4 rounded-full bg-[#e8e2d7] block shadow-sm border border-[rgba(0,0,0,0.1)]"></span>
        <span className="text-[#38342f] text-xs font-bold uppercase tracking-wider">Vendido</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-4 h-4 rounded-full bg-[#6571df] block shadow-sm border border-[rgba(0,0,0,0.1)]"></span>
        <span className="text-[#38342f] text-xs font-bold uppercase tracking-wider">Bloqueado</span>
      </div>
    </div>
  );
}
