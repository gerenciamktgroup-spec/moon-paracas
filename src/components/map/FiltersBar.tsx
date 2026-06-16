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
    <div className="bg-white border-b border-[var(--color-desert-taupe)] py-4 px-8 flex flex-wrap gap-5 items-center shadow-sm relative z-10 font-sans">
      <input
        className="px-4 py-2 border border-[var(--color-desert-taupe)] rounded-sm text-sm text-[var(--color-desert-charcoal)] focus:outline-none focus:border-[var(--color-desert-bronze)] min-w-[220px] bg-[var(--color-desert-sand)] placeholder:text-[var(--color-desert-slate)] font-light"
        value={filters.search}
        placeholder="Buscar Lote (Ej. M1, 01)"
        onChange={e => onChange({ ...filters, search: e.target.value })}
      />
      <select
        className="px-4 py-2 border border-[var(--color-desert-taupe)] rounded-sm text-sm text-[var(--color-desert-charcoal)] focus:outline-none focus:border-[var(--color-desert-bronze)] bg-transparent cursor-pointer font-light"
        value={filters.blockId}
        onChange={e => onChange({ ...filters, blockId: e.target.value as any })}
      >
        <option value="all">Todas las Manzanas</option>
        {BLOCK_SPECS.map(b => <option key={b.id} value={b.id}>{b.id}</option>)}
      </select>
      <select
        className="px-4 py-2 border border-[var(--color-desert-taupe)] rounded-sm text-sm text-[var(--color-desert-charcoal)] focus:outline-none focus:border-[var(--color-desert-bronze)] bg-transparent cursor-pointer font-light"
        value={filters.status}
        onChange={e => onChange({ ...filters, status: e.target.value as any })}
      >
        <option value="all">Todos los estados</option>
        <option value="available">Disponible</option>
        <option value="offer">En Oferta</option>
        <option value="sold">Vendido</option>
        <option value="blocked">Reservado</option>
      </select>
      <select
        className="px-4 py-2 border border-[var(--color-desert-taupe)] rounded-sm text-sm text-[var(--color-desert-charcoal)] focus:outline-none focus:border-[var(--color-desert-bronze)] bg-transparent cursor-pointer font-light"
        value={filters.typology}
        onChange={e => onChange({ ...filters, typology: e.target.value as any })}
      >
        <option value="all">Todos los tipos</option>
        <option value="standard">Estándar</option>
        <option value="premium">Premium</option>
        <option value="adjustment">Ajuste / Esquina</option>
      </select>
    </div>
  );
}
