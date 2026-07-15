import React from "react";
import { BarChart3, Lock, PackageSearch, ShieldCheck } from "lucide-react";
import { Lot } from "../types/map";
import {
  PARACAS_DOME_ADD_ONS,
  PARACAS_DOME_OFFERS,
  PARACAS_DOME_PROJECT,
  calculateOfferInternalCost,
  calculateOfferMargin,
  formatPen,
  getAddOnInternalCost,
  getAddOnPublicPrice
} from "../data/paracasDome";

interface ParacasDomeAdminProps {
  lots: Lot[];
}

export const ParacasDomeAdmin: React.FC<ParacasDomeAdminProps> = ({ lots }) => {
  const availableLots = lots.filter((lot) => lot.status === "available").length;
  const reservedLots = lots.filter((lot) => lot.status === "reserved").length;
  const soldLots = lots.filter((lot) => lot.status === "sold").length;
  const blockedLots = lots.filter((lot) => lot.status === "blocked").length;

  return (
    <div className="min-h-screen bg-[#0F120F] text-[#E4EAE4] px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col lg:flex-row justify-between gap-6 lg:items-end border-b border-[#C5A059]/15 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#C5A059]/30 bg-[#1A1D1A] px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#C5A059]">
              <Lock className="w-3.5 h-3.5" />
              Panel interno
            </div>
            <h1 className="font-display text-4xl font-black uppercase text-white mt-4">Paracas Dome Admin</h1>
            <p className="text-stone-400 text-sm mt-2 max-w-2xl">
              Costos, margen y sensibilidad para la etapa Founder/Comfort. Esta informacion no aparece en la vista publica.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["Disponibles", availableLots],
              ["Separados", reservedLots],
              ["Vendidos", soldLots],
              ["Bloqueados", blockedLots]
            ].map(([label, value]) => (
              <div key={label as string} className="bg-[#1A1D1A] border border-white/10 p-4 min-w-[120px]">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-500">{label as string}</span>
                <span className="block font-display text-2xl font-black text-white mt-1">{value as number}</span>
              </div>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <article className="lg:col-span-2 bg-[#1A1D1A]/80 border border-[#C5A059]/15 p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-5 h-5 text-[#C5A059]" />
              <h2 className="font-display text-xl font-black uppercase text-white">Margen por oferta</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-xs">
                <thead className="text-[#C5A059] uppercase tracking-[0.18em] text-[9px] border-b border-[#C5A059]/15">
                  <tr>
                    <th className="py-3 pr-3">Oferta</th>
                    <th className="py-3 pr-3 text-right">Precio</th>
                    <th className="py-3 pr-3 text-right">Costo total</th>
                    <th className="py-3 pr-3 text-right">Margen</th>
                    <th className="py-3 pr-3 text-right">Margen %</th>
                    <th className="py-3 text-right">50 lotes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-stone-300">
                  {PARACAS_DOME_OFFERS.map((offer) => {
                    const internalCost = calculateOfferInternalCost(offer);
                    const margin = calculateOfferMargin(offer);
                    const marginPercent = margin / offer.publicPrice;
                    return (
                      <tr key={offer.id}>
                        <td className="py-3 pr-3 font-bold text-white">{offer.shortName}</td>
                        <td className="py-3 pr-3 text-right">{formatPen(offer.publicPrice)}</td>
                        <td className="py-3 pr-3 text-right">{formatPen(internalCost)}</td>
                        <td className="py-3 pr-3 text-right text-[#C5A059] font-bold">{formatPen(margin)}</td>
                        <td className="py-3 pr-3 text-right">{(marginPercent * 100).toFixed(2)}%</td>
                        <td className="py-3 text-right">{formatPen(margin * PARACAS_DOME_PROJECT.lotCount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <article className="bg-[#1A1D1A]/80 border border-[#C5A059]/15 p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
              <h2 className="font-display text-xl font-black uppercase text-white">Control de formula</h2>
            </div>
            <div className="space-y-4 text-sm">
              <div className="border border-white/10 bg-black/20 p-4">
                <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-stone-500">Pago posesionario</span>
                <span className="block font-display text-2xl font-black text-[#C5A059] mt-1">S/ 5 por m²</span>
              </div>
              <div className="border border-white/10 bg-black/20 p-4">
                <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-stone-500">Carga por lote asignado</span>
                <span className="block font-display text-2xl font-black text-white mt-1">{formatPen(10000)}</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Formula actual: 2,000 m² asignados x S/ 5/m² = S/ 10,000 por lote comercial. No se calcula como porcentaje de ventas.
              </p>
            </div>
          </article>
        </section>

        <section className="bg-[#1A1D1A]/80 border border-[#C5A059]/15 p-6">
          <div className="flex items-center gap-2 mb-5">
            <PackageSearch className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-display text-xl font-black uppercase text-white">Margen por adicionales</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="text-[#C5A059] uppercase tracking-[0.18em] text-[9px] border-b border-[#C5A059]/15">
                <tr>
                  <th className="py-3 pr-3">Adicional</th>
                  <th className="py-3 pr-3">Categoria</th>
                  <th className="py-3 pr-3">Proveedor</th>
                  <th className="py-3 pr-3 text-right">Costo interno</th>
                  <th className="py-3 pr-3 text-right">Precio publico</th>
                  <th className="py-3 text-right">Margen ref.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {PARACAS_DOME_ADD_ONS.map((addOn) => {
                  const internalCost = getAddOnInternalCost(addOn);
                  const publicPrice = getAddOnPublicPrice(addOn);
                  return (
                    <tr key={addOn.id}>
                      <td className="py-3 pr-3 font-bold text-white">{addOn.name}</td>
                      <td className="py-3 pr-3">{addOn.category}</td>
                      <td className="py-3 pr-3">{addOn.supplierType}</td>
                      <td className="py-3 pr-3 text-right">{formatPen(internalCost)}</td>
                      <td className="py-3 pr-3 text-right">{formatPen(publicPrice)}</td>
                      <td className="py-3 text-right text-[#C5A059] font-bold">{formatPen(publicPrice - internalCost)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
