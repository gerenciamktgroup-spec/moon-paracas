import React from "react";
import { SalesFilters } from "../../types/map";
import { BLOCK_SPECS } from "../../data/business";

export function FiltersBar({
  filters,
  onChange
}: {
  filters: SalesFilters;
  onChange: (next: SalesFilters) => void;
}) {
  return (
    <div className="filters bg-white border-b border-[#e8e2d7] p-4 flex flex-wrap gap-4 items-center shadow-sm relative z-10 font-sans">
      <input
        className="px-4 py-2 border border-[#d5ccbb] rounded text-sm text-[#38342f] focus:outline-none focus:border-[#9e7e62] min-w-[200px]"
        value={filters.search}
        placeholder="Buscar Lote (Ej. M1, L023)"
        onChange={e => onChange({ ...filters, search: e.target.value })}
      />
      <select
        className="px-4 py-2 border border-[#d5ccbb] rounded text-sm text-[#38342f] focus:outline-none focus:border-[#9e7e62] bg-white cursor-pointer"
        value={filters.blockId}
        onChange={e => onChange({ ...filters, blockId: e.target.value as any })}
      >
        <option value="all">Todas las Manzanas</option>
        {BLOCK_SPECS.map(b => <option key={b.id} value={b.id}>{b.id}</option>)}
      </select>
      <select
        className="px-4 py-2 border border-[#d5ccbb] rounded text-sm text-[#38342f] focus:outline-none focus:border-[#9e7e62] bg-white cursor-pointer"
        value={filters.status}
        onChange={e => onChange({ ...filters, status: e.target.value as any })}
      >
        <option value="all">Todos los estados</option>
        <option value="available">Disponible</option>
        <option value="offer">Oferta</option>
        <option value="sold">Vendido</option>
        <option value="blocked">Bloqueado</option>
      </select>
      <select
        className="px-4 py-2 border border-[#d5ccbb] rounded text-sm text-[#38342f] focus:outline-none focus:border-[#9e7e62] bg-white cursor-pointer"
        value={filters.typology}
        onChange={e => onChange({ ...filters, typology: e.target.value as any })}
      >
        <option value="all">Todos los tipos</option>
        <option value="standard">Estándar</option>
        <option value="premium">Premium</option>
        <option value="adjustment">Ajuste</option>
      </select>
    </div>
  );
}
