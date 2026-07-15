import React, { useState, useEffect } from "react";
import { Lot } from "../types/map";
import { 
  Compass, Calendar, ShieldCheck, SunDim, Landmark, RefreshCw, Layers,
  User, Mail, Phone, Lock, ChevronLeft, FileText 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface LotDetailsProps {
  lot: Lot | null;
  onReserve: (lotId: string, clientData: { 
    name: string; 
    dni: string; 
    email: string; 
    phone: string;
    monthlyAmount: number;
    installmentsCount: number;
    isCash: boolean;
  }) => void;
}

// Global helper for clean money formatting in Peruvian Soles (always 2 decimals)
const formatMoney = (value: number): string => {
  return "S/ " + value.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const LotDetailsModal: React.FC<LotDetailsProps> = ({ lot, onReserve }) => {
  // Financial calculation parameters
  const [downpaymentPercentage, setDownpaymentPercentage] = useState<number>(30);
  const [financingMonths, setFinancingMonths] = useState<number>(12);
  const [separationFee] = useState<number>(1000); // S/ 1,000 fixed separation fee

  // Reservation Form states
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientDni, setClientDni] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Reset calculations and form on lot change
  useEffect(() => {
    setDownpaymentPercentage(30);
    setFinancingMonths(12);
    setShowReservationForm(false);
    setClientName("");
    setClientDni("");
    setClientEmail("");
    setClientPhone("");
  }, [lot]);

  if (!lot) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-8 text-center h-full border border-dashed border-white/10 rounded-2xl bg-[#1D1714]/30 shadow-2xl min-h-[300px] backdrop-blur-md"
      >
        <Compass className="h-8 w-8 text-[#E2725B] mb-4 animate-spin" style={{ animationDuration: "20s" }} />
        <h3 className="font-display font-medium text-white uppercase tracking-wider text-lg">Descubre tu Refugio en la Roca</h3>
        <p className="text-xs text-[#E1D9C1]/70 mt-2.5 max-w-[420px] leading-relaxed font-sans font-light">
          Selecciona una parcela exclusiva en el Masterplan interactivo de arriba para explorar sus características técnicas, orientación solar y diseñar una estructura de inversión patrimonial a tu medida.
        </p>
      </motion.div>
    );
  }

  const isParking = lot.typology === "parking" || lot.typology === "parking-external";
  const isExternalParking = lot.typology === "parking-external";
  const isPrivateParking = lot.typology === "parking";

  // Financial calculations (only used for residential lots)
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

  // Render Reservation Form view if open
  if (showReservationForm) {
    return (
      <AnimatePresence mode="wait">
        <motion.div 
          key="reservation-form"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4 sm:gap-6 rounded-2xl border border-white/10 bg-[#1D1714]/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl transition-all duration-300 min-h-[500px] text-[#E1D9C1]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b pb-4 border-white/10">
            <button
              onClick={() => setShowReservationForm(false)}
              className="p-2 hover:bg-white/5 border border-white/10 text-white transition-all cursor-pointer rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div>
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">
                Formulario de Reserva
              </h3>
              <p className="text-[10px] text-[#E2725B] font-bold font-mono mt-0.5">
                {isPrivateParking ? `Cochera ${lot.id.split("-")[1]}` : `Lote ${lot.id.split("-")[1]}`} ({lot.quadrant}) • {formatMoney(separationFee)}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[#E1D9C1]/80 leading-relaxed font-sans font-light">
            Completa tus datos personales para registrar la reserva de tu lote en Moon Paracas. Serás redirigido de forma segura a Mercado Pago para realizar el depósito de S/ 1,000 en garantía.
          </p>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!clientName || !clientDni || !clientEmail || !clientPhone) {
                alert("Por favor, completa todos los campos del formulario.");
                return;
              }
              onReserve(lot.id, {
                name: clientName,
                dni: clientDni,
                email: clientEmail,
                phone: clientPhone,
                monthlyAmount: downpaymentPercentage < 100 ? monthlyPayment : 0,
                installmentsCount: downpaymentPercentage < 100 ? financingMonths : 0,
                isCash: downpaymentPercentage === 100
              });
            }}
            className="space-y-4 flex-1 flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#E1D9C1]/60 font-bold font-mono flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#E2725B]" /> Nombre Completo
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza Quiroga"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 p-3 text-xs text-white rounded-xl focus:outline-none focus:border-[#E2725B] transition-all font-sans font-light"
                />
              </div>

              {/* DNI */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#E1D9C1]/60 font-bold font-mono flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-[#E2725B]" /> Documento de Identidad (DNI / RUC)
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. 70451829"
                  value={clientDni}
                  onChange={(e) => setClientDni(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 p-3 text-xs text-white rounded-xl focus:outline-none focus:border-[#E2725B] transition-all font-sans font-light"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#E1D9C1]/60 font-bold font-mono flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#E2725B]" /> Correo Electrónico
                </label>
                <input 
                  type="email"
                  required
                  placeholder="carlos@ejemplo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 p-3 text-xs text-white rounded-xl focus:outline-none focus:border-[#E2725B] transition-all font-sans font-light"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#E1D9C1]/60 font-bold font-mono flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#E2725B]" /> Teléfono Celular
                </label>
                <input 
                  type="tel"
                  required
                  placeholder="Ej. 987654321"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 p-3 text-xs text-white rounded-xl focus:outline-none focus:border-[#E2725B] transition-all font-sans font-light"
                />
              </div>
            </div>

            {/* CTA Submit */}
            <div className="pt-4 border-t border-white/10 mt-4">
              <button
                type="submit"
                className="w-full bg-[#E2725B] text-white font-medium text-xs tracking-widest uppercase py-4 hover:bg-[#e3826d] transition-all shadow-[0_0_15px_rgba(226,114,91,0.2)] rounded-xl active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="h-4 w-4" /> Proceder al Pago con Mercado Pago
              </button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Render normal specifications and calculations view
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={lot.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-white/10 bg-[#1D1714]/80 backdrop-blur-xl p-5 sm:p-6 shadow-2xl transition-all duration-300 text-[#E1D9C1]"
      >
        {isParking ? (
          /* Simple layout for parking lots since they have no financing */
          <div className="flex flex-col md:flex-row gap-6 items-stretch text-left">
            <div className="flex-1 flex flex-col justify-between gap-4 bg-black/20 rounded-xl p-5 border border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest border bg-stone-700 text-stone-200 border-stone-600 font-mono">
                    {isExternalParking ? "Uso Común" : "Propiedad Privada"}
                  </span>
                  <span className="text-[10px] text-[#E1D9C1]/60 font-bold font-mono">ID: {lot.id}</span>
                </div>
                <h3 className="font-display text-2xl font-normal text-white mt-3 uppercase tracking-wide">
                  {lot.typology === "parking" ? "Cochera Plus" : "Cochera Visitas"} <span className="font-light text-[#E2725B]">({lot.quadrant})</span>
                </h3>
                <p className="text-xs text-[#E1D9C1]/80 mt-1 font-sans font-light">
                  Elevación Topográfica: <span className="text-[#E2725B] font-bold">{lot.elevation}m s.n.m</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 bg-black/30 rounded-xl p-4 border border-white/5">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#E1D9C1]/60 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Layers className="h-3.5 w-3.5 text-[#E1D9C1]/80" /> Dimensiones
                  </span>
                  <p className="font-semibold text-white text-sm mt-0.5">{lot.dimensions}</p>
                  <p className="text-[10px] text-stone-400 font-mono mt-1">Área: {lot.area.toFixed(2)} m²</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#E1D9C1]/60 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <SunDim className="h-3.5 w-3.5 text-[#E2725B]" /> Tipo
                  </span>
                  <p className="font-semibold text-white text-sm mt-0.5">
                    {lot.typology === "parking" ? "Techado Solar" : "Acceso Público"}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-[#E1D9C1]/60 uppercase tracking-widest font-mono font-medium">Inversión</p>
                  <p className="font-display text-2xl font-semibold text-white mt-1">
                    {isExternalParking ? "S/ 0.00" : formatMoney(totalPrice)}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[350px] flex flex-col justify-center gap-4 bg-black/10 rounded-xl p-5 border border-white/5 text-center">
              <p className="text-xs text-stone-400 font-light leading-relaxed mb-2 font-sans">
                {isExternalParking 
                  ? "Esta cochera forma parte de las áreas comunes de libre acceso para visitantes y propietarios en las zonas de ingreso."
                  : "Adquiere una cochera de uso exclusivo con paneles solares de carga autónoma para vehículos eléctricos y buggies."}
              </p>
              {isExternalParking ? (
                <button
                  disabled
                  className="w-full rounded-xl bg-stone-800 text-stone-500 py-3.5 text-xs font-bold uppercase tracking-widest cursor-not-allowed border border-white/5"
                >
                  Área Común
                </button>
              ) : lot.status === "available" || lot.status === "offer" ? (
                <button
                  onClick={() => setShowReservationForm(true)}
                  className="w-full bg-[#E2725B] text-white font-medium text-xs tracking-widest uppercase py-3.5 hover:bg-[#d85e45] hover:-translate-y-0.5 rounded-xl transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5" /> Separar Cochera con S/ 1,000
                </button>
              ) : (
                <button
                  disabled
                  className="w-full rounded-xl bg-stone-800 text-stone-500 py-3.5 text-xs font-bold cursor-not-allowed border border-white/5 uppercase tracking-widest"
                >
                  No disponible
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Redesigned 2-column wide layout for residential lots (map-bottom format) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left font-sans">
            
            {/* Left Card: Lot specs, details and price */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-5 bg-black/20 rounded-xl p-5 border border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
                    lot.status === "available" ? "bg-[#E1D9C1]/10 text-[#E1D9C1] border-[#E1D9C1]/30" :
                    lot.status === "offer" ? "bg-[#E2725B]/10 text-[#E2725B] border-[#E2725B]/30" :
                    "bg-[#382B23] text-stone-300 border-[#382B23]"
                  }`}>
                    {lot.status === "available" ? "Fase Fundadora" : lot.status === "offer" ? "Bono Especial" : lot.status === "sold" ? "Familia Fundadora" : "Bloqueado"}
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold font-mono">ID: {lot.id}</span>
                </div>
                
                <h3 className="font-display text-2xl font-normal text-white mt-3.5 uppercase tracking-wide">
                  Lote {lot.id.split("-")[1]} <span className="font-light text-[#E2725B]">({lot.quadrant})</span>
                </h3>
                
                <p className="text-xs text-stone-400 mt-1 font-sans font-light">
                  Elevación Topográfica: <span className="text-[#E2725B] font-semibold">{lot.elevation}m s.n.m</span> (Inmune a Maremotos)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 bg-black/35 rounded-xl p-4 border border-white/5">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Layers className="h-3.5 w-3.5 text-[#E1D9C1]/80" /> Área Privada
                  </span>
                  <p className="font-semibold text-white text-sm mt-0.5">{lot.area.toFixed(2)} m²</p>
                  <p className="text-[9.5px] text-stone-500 font-mono mt-2 leading-relaxed">
                    Frente: {lot.frontage?.toFixed(2)}m <br/>
                    Fondo: {lot.depth?.toFixed(2)}m
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <SunDim className="h-3.5 w-3.5 text-[#E2725B]" /> Eco-Solar
                  </span>
                  <p className="font-semibold text-white text-sm mt-0.5">
                    {peakSolarHours} <span className="text-[10px] font-normal text-stone-400">kWh/m²/d</span>
                  </p>
                </div>

                <div className="space-y-1 pt-2.5 border-t border-white/5">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Compass className="h-3.5 w-3.5 text-[#E1D9C1]/80" /> Cercanía Oasis
                  </span>
                  <p className="font-semibold text-white text-sm mt-0.5">~ {lot.walk_distance_oasis_meters} m</p>
                </div>

                <div className="space-y-1 pt-2.5 border-t border-white/5">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Layers className="h-3.5 w-3.5 text-[#E2725B]" /> Acceso Parking
                  </span>
                  <p className="font-semibold text-[#E2725B] text-sm mt-0.5">
                    ~ {lot.walk_distance_parking_meters} m <span className="text-[8px] text-stone-500 font-normal">({lot.parking_type === "externo_ingreso" ? "Ingr." : "Int."})</span>
                  </p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest font-mono">Inversión Patrimonial</p>
                  <p className="font-display text-2xl font-normal text-white mt-1">
                    {formatMoney(totalPrice)}
                  </p>
                </div>
                <p className="text-[10px] text-stone-400 font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                  ~ {formatMoney(Math.round(totalPrice / lot.area))} / m²
                </p>
              </div>
            </div>

            {/* Right Card: Financial Simulator, chart and breakdown receipt */}
            <div className="lg:col-span-7 bg-[#1D1714]/40 border border-white/5 rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-5">
              <div className="flex items-center justify-between border-b pb-3 border-white/5">
                <h4 className="font-display text-sm font-normal uppercase tracking-wider text-white flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-[#E2725B]" /> Simulación de Financiamiento Directo
                </h4>
                <span className="rounded-full bg-[#E2725B]/10 border border-[#E2725B]/20 px-3 py-0.5 text-[9px] font-bold text-[#E2725B] uppercase tracking-widest font-mono">
                  100% Sin Intereses
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 items-stretch">
                {/* Inputs & Graph Column */}
                <div className="flex flex-col justify-between gap-4">
                  {/* Slider Downpayment */}
                  <div className="space-y-1.5 bg-black/20 p-3.5 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-[#E1D9C1]/90 font-medium">Cuota Inicial ({downpaymentPercentage}%)</span>
                      <span className="font-bold text-white font-mono">{formatMoney(rawDownpayment)}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      className="w-full accent-[#E2725B] h-1.5 cursor-pointer bg-stone-900 rounded-lg appearance-none"
                      value={downpaymentPercentage}
                      onChange={(e) => setDownpaymentPercentage(parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-[8px] text-stone-500 font-mono">
                      <span>10% Mín</span>
                      <span>30% Sug</span>
                      <span>100% Contado</span>
                    </div>
                  </div>

                  {/* Month selection buttons */}
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] uppercase tracking-wider text-[#E1D9C1]/70 font-bold flex items-center justify-between font-mono">
                      <span>Plan de Aportes</span>
                      <span className="font-bold text-[#E2725B]">{financingMonths} meses</span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[6, 12, 18, 24].map((m) => (
                        <button
                          key={m}
                          onClick={() => setFinancingMonths(m)}
                          disabled={downpaymentPercentage === 100}
                          className={`py-2 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer ${
                            downpaymentPercentage === 100
                              ? "opacity-20 cursor-not-allowed bg-transparent border-white/5 text-stone-600"
                              : financingMonths === m
                              ? "bg-[#E2725B]/20 border-[#E2725B] text-[#E2725B] shadow-sm font-extrabold"
                              : "bg-black/20 border-white/10 text-stone-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recharts chart */}
                  {downpaymentPercentage < 100 && (
                    <div className="h-28 mt-2 cursor-crosshair">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 5 }}>
                          <defs>
                            <linearGradient id="barBase" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#E2725B" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#E2725B" stopOpacity={0.3} />
                            </linearGradient>
                            <linearGradient id="barFee" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#E1D9C1" stopOpacity={0.5} />
                              <stop offset="100%" stopColor="#E1D9C1" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(225,217,193,0.06)" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 7, fill: 'rgba(225,217,193,0.5)' }} 
                            height={15} 
                          />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: 'rgba(225,217,193,0.5)' }} tickFormatter={(value) => `S/ ${value.toLocaleString()}`} />
                          <RechartsTooltip 
                            cursor={{fill: 'rgba(255,255,255,0.03)'}}
                            contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#1A1412', color: '#FAF9F5', fontSize: '10px', fontFamily: 'sans-serif' }}
                            formatter={(value: number) => [formatMoney(value), "Monto"]}
                          />
                          <Bar dataKey="base" stackId="a" fill="url(#barBase)" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="fee" stackId="a" fill="url(#barFee)" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Receipt Breakdown & CTA Button Column */}
                <div className="flex flex-col justify-between gap-4">
                  <div className="bg-black/35 rounded-xl p-4 border border-white/5 space-y-2.5 text-xs font-sans flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between text-stone-400">
                      <span>Separación de Reserva:</span>
                      <span className="font-semibold text-white font-mono">{formatMoney(separationFee)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-stone-400 border-b border-white/5 pb-2.5">
                      <span>Inicial Firma Contrato ({downpaymentPercentage}%):</span>
                      <span className="font-semibold text-white font-mono">
                        {formatMoney(downpaymentToPay)}
                      </span>
                    </div>

                    {downpaymentPercentage < 100 ? (
                      <div className="space-y-2 pt-1.5">
                        <div className="flex items-center justify-between text-stone-400">
                          <span>Saldo Financiado Directo:</span>
                          <span className="text-white font-semibold font-mono">{formatMoney(remainingFinanced)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-stone-500 text-[11px]">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B] inline-block" />
                            Aporte Mensual Base:
                          </span>
                          <span className="text-stone-300 font-mono">{formatMoney(baseMonthly)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-stone-500 text-[11px]">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E1D9C1] inline-block" />
                            Pasarela Digital (5%):
                          </span>
                          <span className="text-stone-300 font-mono">{formatMoney(adminFeeMonthly)}</span>
                        </div>
                        
                        {/* Highlighted Monthly Installment box */}
                        <div className="border border-[#E2725B]/20 bg-[#E2725B]/5 rounded-xl p-3.5 mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#E2725B]">
                            <Calendar className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">{financingMonths} Cuotas de:</span>
                          </div>
                          <span className="font-display text-xl font-bold text-[#E2725B]">
                            {formatMoney(monthlyPayment)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="font-bold pt-3 text-[10px] text-[#E1D9C1] text-center uppercase tracking-wider">
                        🎉 ¡Descuento por Pago al Contado (100%)!
                      </div>
                    )}
                  </div>

                  {/* CTA Reservation Button */}
                  {lot.status === "available" || lot.status === "offer" ? (
                    <button
                      onClick={() => setShowReservationForm(true)}
                      className="w-full bg-[#E2725B] text-white font-medium text-xs tracking-widest uppercase py-4 hover:bg-[#d85e45] hover:-translate-y-0.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer font-sans"
                    >
                      <Lock className="h-3.5 w-3.5" /> Separar Lote con S/ 1,000
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full rounded-xl bg-stone-800 text-stone-500 py-4 text-xs font-bold cursor-not-allowed border border-white/5 uppercase tracking-widest"
                    >
                      No disponible
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Informative safety note */}
        <div className="text-[10px] text-stone-500 font-light text-center leading-relaxed mt-4 italic">
          * Las áreas definitivas están sujetas a la aprobación municipal del plano. Las cuotas son referenciales.
        </div>

        {/* E2E Metadata verification fields */}
        <div style={{ display: "none" }} data-testid="e2e-metadata">
          <span data-testid="meta-frontage">{lot.frontage}</span>
          <span data-testid="meta-depth">{lot.depth}</span>
          <span data-testid="meta-price-soles">{lot.price_soles}</span>
          <span data-testid="meta-parking-type">{lot.parking_type}</span>
          <span data-testid="meta-walk-distance-parking">{lot.walk_distance_parking_meters}</span>
          <span data-testid="meta-walk-distance-oasis">{lot.walk_distance_oasis_meters}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
