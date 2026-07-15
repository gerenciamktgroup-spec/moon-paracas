import React, { useState } from "react";
import { SalesFilters } from "../../types/map";
import { BLOCK_SPECS } from "../../data/business";
import { SlidersHorizontal, ChevronDown, ChevronUp, Search } from "lucide-react";

export function FiltersBar({
  filters,
  onChange
}: {
  filters: SalesFilters;
  onChange: (next: SalesFilters) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#1D1714]/75 backdrop-blur-xl border-b border-[rgba(225,217,193,0.15)] py-3 px-4 sm:px-6 md:px-8 flex flex-col md:flex-row md:items-center gap-3 relative z-10 font-sans text-[#E1D9C1]">
      <div className="flex items-center justify-between gap-3 w-full md:w-auto md:flex-1">
        {/* Search input - takes all space in mobile */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#E1D9C1]/50" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-[rgba(225,217,193,0.15)] rounded-none text-sm text-white focus:outline-none focus:border-[#E2725B] bg-[#1D1714]/50 placeholder:text-[#E1D9C1]/50 font-light"
            value={filters.search}
            placeholder="Buscar Lote (Ej. M1, 01)"
            onChange={e => onChange({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-[#E2725B] text-white text-xs font-bold uppercase tracking-wider transition-all hover:bg-[#d85e45] cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filtros</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Selects container: hidden on mobile unless open, always flex on md and up */}
      <div className={`${isOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row flex-wrap gap-3 md:gap-4 items-stretch md:items-center w-full md:w-auto pt-2 md:pt-0 border-t border-[rgba(225,217,193,0.1)] md:border-none`}>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <select
            className="px-4 py-2.5 md:py-2 border border-[rgba(225,217,193,0.15)] rounded-none text-sm text-white focus:outline-none focus:border-[#E2725B] bg-[#1D1714]/50 cursor-pointer font-light w-full md:w-auto"
            value={filters.blockId}
            onChange={e => onChange({ ...filters, blockId: e.target.value as any })}
          >
            <option value="all" className="bg-[#1D1714] text-white">Todas las Manzanas</option>
            {BLOCK_SPECS.map(b => <option key={b.id} value={b.id} className="bg-[#1D1714] text-white">{b.id}</option>)}
          </select>
          <select
            className="px-4 py-2.5 md:py-2 border border-[rgba(225,217,193,0.15)] rounded-none text-sm text-white focus:outline-none focus:border-[#E2725B] bg-[#1D1714]/50 cursor-pointer font-light w-full md:w-auto"
            value={filters.status}
            onChange={e => onChange({ ...filters, status: e.target.value as any })}
          >
            <option value="all" className="bg-[#1D1714] text-white">Todos los estados</option>
            <option value="available" className="bg-[#1D1714] text-white">Disponible</option>
            <option value="offer" className="bg-[#1D1714] text-white">En Oferta</option>
            <option value="sold" className="bg-[#1D1714] text-white">Vendido</option>
            <option value="blocked" className="bg-[#1D1714] text-white">Reservado</option>
          </select>
          <select
            className="px-4 py-2.5 md:py-2 border border-[rgba(225,217,193,0.15)] rounded-none text-sm text-white focus:outline-none focus:border-[#E2725B] bg-[#1D1714]/50 cursor-pointer font-light w-full md:w-auto"
            value={filters.typology}
            onChange={e => onChange({ ...filters, typology: e.target.value as any })}
          >
            <option value="all" className="bg-[#1D1714] text-white">Todos los tipos</option>
            <option value="standard" className="bg-[#1D1714] text-white">Estándar</option>
            <option value="premium" className="bg-[#1D1714] text-white">Premium</option>
            <option value="adjustment" className="bg-[#1D1714] text-white">Ajuste / Esquina</option>
          </select>
        </div>
      </div>
    </div>
  );
}
