import React, { useState, useEffect } from "react";
import { Lot } from "../types/map";
import { Compass, Calendar, ShieldCheck, SunDim, Landmark, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface LotDetailsProps {
  lot: Lot | null;
  onReserve: (lotId: string) => void;
}

export const LotDetailsModal: React.FC<LotDetailsProps> = ({ lot, onReserve }) => {
  // Financial calculation parameters
  const [downpaymentPercentage, setDownpaymentPercentage] = useState<number>(30);
  const [financingMonths, setFinancingMonths] = useState<number>(12);
  const [separationFee] = useState<number>(1000); // S/ 1,000 fixed separation fee

  // Reset calculations on lot change
  useEffect(() => {
    setDownpaymentPercentage(30);
    setFinancingMonths(12);
  }, [lot]);

  if (!lot) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-center justify-center p-8 text-center h-full border-2 border-dashed border-stone-300 rounded-none bg-stone-50 shadow-sm min-h-[580px]"
      >
        <Compass className="h-10 w-10 text-[#C4A484] mb-3 animate-spin" style={{ animationDuration: "14s" }} />
        <h3 className="font-display font-bold text-[#2D3339] uppercase tracking-wider text-xl mt-3">Selecciona un lote</h3>
        <p className="text-sm text-stone-600 mt-2 max-w-[280px] leading-relaxed">
          Haz clic en cualquier parcela del máster plan interactivo para inspeccionar sus características técnicas, elevación y calcular sus cuotas de financiamiento.
        </p>
      </motion.div>
    );
  }

  // Financial calculations
  const totalPrice = lot.price;
  const rawDownpayment = (totalPrice * downpaymentPercentage) / 100;
  const downpaymentToPay = Math.max(0, rawDownpayment - separationFee);
  const remainingFinanced = totalPrice - rawDownpayment;
  
  // Base payment plus 5% monthly administrative fee (pasarela de pagos)
  const baseMonthly = remainingFinanced / financingMonths;
  const adminFeeMonthly = baseMonthly * 0.05; 
  const monthlyPayment = baseMonthly + adminFeeMonthly;

  // Simulate solar parameter
  const numVal = typeof lot.number === 'number' ? lot.number : (parseInt(lot.number.replace(/\D/g, ""), 10) || 0);
  const peakSolarHours = (5.8 + (numVal % 3) * 0.4).toFixed(1);

  // Generate Recharts Data
  const chartData = Array.from({ length: financingMonths }).map((_, i) => ({
    name: `M${i + 1}`,
    base: baseMonthly,
    fee: adminFeeMonthly,
  }));

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={lot.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6 rounded-none border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 min-h-[580px]"
      >
        {/* Target Lot Title & Sector Info */}
        <div className="flex items-start justify-between border-b pb-4 border-[#2D3339]/10">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-block rounded-none px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                lot.status === "available" ? "bg-[#A3B18A] text-[#2D3339] border-[#7C8D65]" :
                lot.status === "offer" ? "bg-[#E0B084] text-[#2D3339] border-[#BF8D61]" :
                "bg-[#F2ECE4] text-[#2D3339] border-[#D4CCB8]"
              }`}>
                {lot.status}
              </span>
              <span className="text-sm text-stone-500 font-bold">ID: {lot.id}</span>
            </div>
            <h3 className="font-display text-2xl font-black text-[#2D3339] mt-2 uppercase">
              Lote {lot.id.split("-")[1]} <span className="font-light text-[#C4A484]">({lot.quadrant})</span>
            </h3>
            <p className="text-sm text-stone-600 mt-0.5">
              Elevación Topo: <span className="text-[#C4A484] font-bold">{lot.elevation}m s.n.m</span>
            </p>
          </div>

          {/* Price tag */}
          <div className="text-right">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Precio Adjudicado</p>
            <p className="font-display text-2xl font-black text-[#2D3339]">
              S/ {totalPrice.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
            <p className="text-xs text-stone-500 mt-1">~ S/ {Math.round(totalPrice / lot.area).toLocaleString('es-PE')} / m²</p>
          </div>
        </div>

        {/* Technical Specifications Block (Architect/Engineer details) */}
        <div className="grid grid-cols-2 gap-4 bg-stone-50 rounded-none p-4 border border-stone-200">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
              <Layers className="h-4 w-4 text-[#2D3339]" /> Área Lote
            </span>
            <p className="font-bold text-[#2D3339] text-base">{lot.area.toFixed(2)} m²</p>
            {lot.dimensions ? (
              <p className="text-[11px] text-stone-500 font-mono mt-2.5 leading-relaxed">
                Frente: {lot.dimensions.split(" x ")[0]} <br/>
                Fondo: {lot.dimensions.split(" x ")[1]}
              </p>
            ) : (
              <p className="text-[11px] text-stone-500 font-mono mt-2.5 leading-relaxed">
                Frente: 10.00m <br/>
                Fondo: {(lot.area / 10).toFixed(2)}m
              </p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
              <SunDim className="h-4 w-4 text-[#C4A484]" /> Radiación Solar
            </span>
            <p className="font-bold text-[#2D3339] text-base">
              {peakSolarHours} <span className="text-xs font-normal">kWh/m²/día</span>
            </p>
          </div>

          <div className="space-y-1 pt-2 border-t border-stone-200">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
              <Compass className="h-4 w-4 text-[#A3B18A]" /> Oasis Central
            </span>
            <p className="font-bold text-[#2D3339] text-base">~ {lot.distanceToPool} m</p>
          </div>

          <div className="space-y-1 pt-2 border-t border-stone-200">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
              <Layers className="h-4 w-4 text-[#E15A42]" /> Estacionamiento
            </span>
            <p className="font-bold text-[#E15A42] text-base">
              ~ {lot.hubDistance} m <span className="text-xs text-stone-500 font-normal">({Math.round(lot.hubDistance / 72)} min a pie)</span>
            </p>
          </div>
        </div>

        {/* Interactive Financial Simulator */}
        <div className="border border-stone-200 bg-white rounded-none p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b pb-3 border-stone-100">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[#2D3339] flex items-center gap-2">
              <Landmark className="h-5 w-5 text-[#C4A484]" /> Simulador de Financiamiento
            </h4>
            <span className="rounded-none bg-[#6B8E23] px-2 py-0.5 text-xs font-bold text-white uppercase tracking-widest">
              Sin Intereses
            </span>
          </div>

          {/* Input: Downpayment % slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600 font-bold leading-relaxed">Cuota Inicial ({downpaymentPercentage}%)</span>
              <span className="font-bold text-[#2D3339]">S/ {rawDownpayment.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              className="w-full accent-[#C4A484] h-2.5 cursor-pointer bg-stone-200 mt-2"
              value={downpaymentPercentage}
              onChange={(e) => setDownpaymentPercentage(parseInt(e.target.value))}
            />
            <div className="flex justify-between text-[11px] text-stone-500 pt-1 px-1">
              <span>10% (Mínimo)</span>
              <span>30% (Sugerido)</span>
              <span>100% (Contado)</span>
            </div>
          </div>

          {/* Input: Financing Months select */}
          <div className="space-y-1.5 font-mono">
            <label className="text-xs text-stone-600 font-bold flex items-center justify-between">
              <span>Plazo Mensual</span>
              <span className="font-bold text-[#C4A484]">{financingMonths} meses</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[6, 12, 18].map((m) => (
                <button
                  key={m}
                  onClick={() => setFinancingMonths(m)}
                  disabled={downpaymentPercentage === 100}
                  className={`py-1.5 rounded-none text-xs font-bold font-mono border-2 transition-all ${
                    downpaymentPercentage === 100
                      ? "opacity-30 cursor-not-allowed bg-stone-100 border-stone-200 text-stone-400"
                      : financingMonths === m
                      ? "bg-[#2D3339] border-[#2D3339] text-white"
                      : "bg-white border-[#2D3339] text-[#2D3339] hover:bg-[#F4F4F1]"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Visualization */}
          {downpaymentPercentage < 100 && (
            <div className="h-32 mt-4 cursor-crosshair">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 8, fill: '#888' }} 
                    height={20} 
                    angle={-30} 
                    textAnchor="end" 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#888' }} width={80} tickMargin={8} tickFormatter={(value) => `S/ ${value.toLocaleString()}`} />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '0px', border: '2px solid #2D3339', fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}
                    formatter={(value: number) => `S/ ${value.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                  />
                  <Bar dataKey="base" stackId="a" fill="#C4A484" />
                  <Bar dataKey="fee" stackId="a" fill="#2D3339" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Financial Projection Output */}
          <div className="bg-[#F4F4F1] rounded-none p-3 border-2 border-dashed border-[#2D3339]/40 space-y-2 text-xs">
            <div className="flex items-center justify-between text-stone-700">
              <span>Separación hoy:</span>
              <span className="font-bold">S/ {separationFee.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="flex items-center justify-between text-stone-700">
              <span>Inicial firma contrato:</span>
              <span className="font-bold text-[#2D3339]">
                S/ {downpaymentToPay.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
            </div>
            {downpaymentPercentage < 100 ? (
              <>
                <div className="flex items-center justify-between text-stone-700">
                  <span>Monto a financiar:</span>
                  <span className="text-[#2D3339] font-bold">S/ {remainingFinanced.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 pt-2 border-t border-[#2D3339]/10">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#C4A484]" />Cuota base mensual:</span>
                  <span>S/ {baseMonthly.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 pb-2">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#2D3339]" />Gastos admin. (5% Pasarela):</span>
                  <span>S/ {adminFeeMonthly.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <p className="text-[11px] text-stone-600 font-medium italic pb-1.5 text-center leading-relaxed">
                  *El gasto adm. del 5% cubre las comisiones de la pasarela de pagos (tarjetas crédito/débito) para la suscripción de cobro recurrente.
                </p>
                <div className="flex items-center justify-between font-bold border-t border-dashed border-[#2D3339]/20 pt-3 text-sm text-[#2D3339]">
                  <span className="flex items-center gap-1.5 uppercase tracking-wide">
                    <Calendar className="h-5 w-5 text-[#C4A484]" /> {financingMonths} Cuotas de:
                  </span>
                  <span className="font-display font-black text-xl text-[#2D3339]">
                    S/ {monthlyPayment.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
              </>
            ) : (
              <div className="font-bold border-t border-dashed border-[#2D3339]/20 pt-3 text-sm text-[#6B8E23] text-center uppercase tracking-wider">
                🎉 ¡Bono de Pago al Contado (100%) Aplicado!
              </div>
            )}
          </div>
        </div>

        {/* CTA Reservation Button */}
        {lot.status === "available" ? (
          <button
            onClick={() => onReserve(lot.id)}
            className="w-full rounded-none bg-[#C4A484] border-2 border-[#2D3339] py-4 text-sm font-bold text-[#2D3339] hover:bg-white transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-[4px_4px_0px_#2D3339] active:translate-y-1 active:shadow-[0px_0px_0px_#2D3339]"
          >
            <Landmark className="h-5 w-5" /> Separar Lote con S/ 1,000
          </button>
        ) : (
          <button
            disabled
            className="w-full rounded-none bg-stone-200 text-stone-400 py-4 text-sm font-bold cursor-not-allowed border-2 border-stone-300 uppercase tracking-widest"
          >
            No disponible para separación
          </button>
        )}

        {/* Informative safety note */}
        <div className="text-[11px] text-stone-600 font-medium text-center leading-relaxed mt-2 italic">
          * Las áreas definitivas están sujetas a la aprobación municipal del plano. Las cuotas son referenciales.
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
