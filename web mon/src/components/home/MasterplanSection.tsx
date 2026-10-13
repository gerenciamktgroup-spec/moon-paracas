import React, { useState } from "react";
import { ArrowUpRight, Compass, Check } from "lucide-react";
import { Link } from "react-router-dom";
import {
  LOT_PRICE_PER_M2_USD,
  MACRO_LOT_PRICE_PER_M2_USD,
  STANDARD_LOT_PRICE_USD,
  STANDARD_LOT_PRICE_PEN,
  DOUBLE_LOT_PRICE_USD,
  DOUBLE_LOT_PRICE_PEN,
  MACRO_LOT_PRICE_USD,
  MACRO_LOT_PRICE_PEN,
  STANDARD_LOT_AREA_M2,
  DOUBLE_LOT_AREA_M2,
  MACRO_LOT_AREA_M2,
} from "../../config/pricing";
import { trackEvent } from "../../lib/analytics";
import { PROJECT } from "../../config/project";
import { Lot } from "../../types/map";
import { MapCanvas, type MasterplanBasemap } from "../map/MapCanvas";

const oasisLabel = `${Math.round(PROJECT.oasisAreaM2).toLocaleString("es-PE")} m²`;

export const MasterplanSection: React.FC<{ lots?: Lot[] }> = () => {
  const [masterplanMode, setMasterplanMode] = useState<MasterplanBasemap>("architectural");

  return (
    <section id="masterplan" className="scroll-mt-24 bg-[#FAF7F2] py-24 md:py-32 text-[#161311] border-b border-[#E8E1D5]">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
        
        {/* Encabezado */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-[#E8E1D5] pb-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/40 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36]">
              <Compass className="h-3.5 w-3.5 text-[#C5A059]" />
              Masterplan · {PROJECT.areaLabel} · Oasis {oasisLabel}
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#161311]">
              El predio a tu alcance.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#786F66] max-w-2xl">
              Cuatro aldeas residenciales diseñadas alrededor del oasis central. Circulación vehicular perimetral y paseos peatonales interiores de arena compactada.
            </p>
          </div>

          <Link
            to="/simulador"
            onClick={() => trackEvent("view_lot", { source: "home_masterplan", action: "open_map" })}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#161311] px-6 py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow transition hover:bg-[#C85B3E]"
          >
            <span>Ver Mapa en Tiempo Real</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Masterplan interactivo con selector de Modo: Perímetro Real UTM 18S vs Satélite */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-[#E8E1D5] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#E8E1D5] bg-[#FAF8F5] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A84F36]">
                Georreferenciación Oficial · UTM Zona 18S · Lote Matriz
              </p>
              <p className="mt-0.5 text-xs text-[#786F66]">
                Polígono irregular real (112,591.80 m² · 11.26 ha) con vértices geodésicos oficiales A, B, C y D.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-full border border-[#E8E1D5] bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setMasterplanMode("architectural")}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                    masterplanMode === "architectural"
                      ? "bg-[#161311] text-white shadow"
                      : "text-[#786F66] hover:text-[#161311]"
                  }`}
                >
                  Plano 2D
                </button>
                <button
                  type="button"
                  onClick={() => setMasterplanMode("satellite")}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                    masterplanMode === "satellite"
                      ? "bg-[#A84F36] text-white shadow"
                      : "text-[#786F66] hover:text-[#161311]"
                  }`}
                >
                  Satélite UTM
                </button>
              </div>

              <Link
                to="/simulador"
                onClick={() => trackEvent("view_lot", { source: "home_masterplan_map", action: "open_simulator" })}
                className="hidden sm:inline-flex items-center gap-1.5 self-start rounded-full bg-[#161311] px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#C85B3E]"
              >
                Simulador
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="w-full">
            <MapCanvas basemap={masterplanMode} onBasemapChange={setMasterplanMode} />
          </div>
        </div>

        {/* 3 Tipologías Claras y Ordenadas */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: 120 m² */}
          <div className="rounded-3xl border border-[#C5A059]/40 bg-white p-8 flex flex-col justify-between shadow-sm hover:border-[#C5A059] transition-all">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">Lote Individual</span>
                <span className="rounded-full bg-[#4E6646]/10 px-2.5 py-1 text-[9px] font-bold text-[#4E6646]">${LOT_PRICE_PER_M2_USD} USD / m²</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-[#161311]">{STANDARD_LOT_AREA_M2} m² Residencial</h3>
              <p className="text-xs text-[#786F66] mt-1.5 leading-relaxed">
                Diseñado para domo geodésico Ø8m (50 m²) con kitchenette, baño completo y deck exterior privado.
              </p>

              <div className="mt-6 pt-5 border-t border-[#E8E1D5]">
                <span className="text-[9px] uppercase tracking-wider text-[#786F66] font-bold">Precio de Lanzamiento</span>
                <p className="text-3xl font-bold font-display text-[#161311] mt-0.5">
                  ${STANDARD_LOT_PRICE_USD.toLocaleString()} <span className="text-xs font-sans text-[#786F66]">USD</span>
                </p>
                <span className="text-xs font-semibold text-[#A84F36]">~S/ {STANDARD_LOT_PRICE_PEN.toLocaleString()} PEN</span>
              </div>

              <ul className="mt-6 space-y-2.5 text-xs text-[#38312B]">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#4E6646] shrink-0" />
                  <span>Acceso directo a Oasis {oasisLabel}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#4E6646] shrink-0" />
                  <span>Punto de agua y saneamiento ecológico</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#4E6646] shrink-0" />
                  <span>Financiamiento directo hasta en 36 cuotas</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-[#E8E1D5]">
              <Link
                to="/simulador"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C85B3E] py-3.5 text-xs font-bold text-white hover:bg-[#A84F36] transition shadow-sm"
              >
                <span>Ver Lotes de 120 m²</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: 240 m² */}
          <div className="rounded-3xl border border-[#C85B3E]/30 bg-gradient-to-b from-white to-[#FAF7F2] p-8 flex flex-col justify-between shadow-sm hover:border-[#C85B3E] transition-all">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36]">Lote Doble (2 juntos)</span>
                <span className="rounded-full bg-[#C85B3E]/10 px-2.5 py-1 text-[9px] font-bold text-[#C85B3E]">Mayor Amplitud</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-[#161311]">{DOUBLE_LOT_AREA_M2} m² Ampliado</h3>
              <p className="text-xs text-[#786F66] mt-1.5 leading-relaxed">
                Dos lotes contiguos integrados. Ideal para domo principal + plunge pool privada, pérgola y amplio jardín seco.
              </p>

              <div className="mt-6 pt-5 border-t border-[#E8E1D5]">
                <span className="text-[9px] uppercase tracking-wider text-[#786F66] font-bold">Precio de Lanzamiento</span>
                <p className="text-3xl font-bold font-display text-[#C85B3E] mt-0.5">
                  ${DOUBLE_LOT_PRICE_USD.toLocaleString()} <span className="text-xs font-sans text-[#786F66]">USD</span>
                </p>
                <span className="text-xs font-semibold text-[#161311]">~S/ {DOUBLE_LOT_PRICE_PEN.toLocaleString()} PEN</span>
              </div>

              <ul className="mt-6 space-y-2.5 text-xs text-[#38312B]">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#4E6646] shrink-0" />
                  <span>240 m² de terreno continuo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#4E6646] shrink-0" />
                  <span>Mayor privacidad y área de terraza</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#4E6646] shrink-0" />
                  <span>Membresía familiar completa a Moon Club</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-[#E8E1D5]">
              <Link
                to="/simulador"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#161311] py-3.5 text-xs font-bold text-white hover:bg-[#C85B3E] transition shadow-sm"
              >
                <span>Ver Lotes de 240 m²</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: Macrolotes > 2,000 m² */}
          <div className="rounded-3xl border border-[#E8E1D5] bg-white p-8 flex flex-col justify-between shadow-sm hover:border-[#161311] transition-all">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786F66]">Sector Campestre</span>
                <span className="rounded-full bg-[#161311]/10 px-2.5 py-1 text-[9px] font-bold text-[#161311]">${MACRO_LOT_PRICE_PER_M2_USD} USD / m²</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-[#161311]">&gt; {MACRO_LOT_AREA_M2.toLocaleString()} m² Rústico</h3>
              <p className="text-xs text-[#786F66] mt-1.5 leading-relaxed">
                Grandes parcelas rústicas fuera del condominio para huertos, viñedos o casas de campo independientes.
              </p>

              <div className="mt-6 pt-5 border-t border-[#E8E1D5]">
                <span className="text-[9px] uppercase tracking-wider text-[#786F66] font-bold">Desde</span>
                <p className="text-3xl font-bold font-display text-[#161311] mt-0.5">
                  ${MACRO_LOT_PRICE_USD.toLocaleString()} <span className="text-xs font-sans text-[#786F66]">USD</span>
                </p>
                <span className="text-xs font-semibold text-[#786F66]">~S/ {MACRO_LOT_PRICE_PEN.toLocaleString()} PEN (2,000 m²)</span>
              </div>

              <ul className="mt-6 space-y-2.5 text-xs text-[#38312B]">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#4E6646] shrink-0" />
                  <span>Grandes extensiones extramuros</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#4E6646] shrink-0" />
                  <span>Tarifa preferencial de $45 USD / m²</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#4E6646] shrink-0" />
                  <span>Libertad de diseño rústico</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-[#E8E1D5]">
              <Link
                to="/simulador"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8E1D5] bg-[#FAF7F2] py-3.5 text-xs font-bold text-[#161311] hover:bg-white transition"
              >
                <span>Consultar Macrolotes</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

