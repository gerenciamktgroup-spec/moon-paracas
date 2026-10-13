import React, { useState } from "react";
import {
  Ruler,
  ShieldCheck,
  Wind,
  Sun,
  Droplets,
  CheckCircle2,
  Layers,
  Sparkles,
  Compass,
  Box,
  FileText,
} from "lucide-react";
import { DomeConfigurator } from "../dome/DomeConfigurator";

export const DomeBlueprintSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"3d" | "planta" | "materiales">("3d");

  return (
    <section className="bg-white py-20 md:py-28 border-y border-[#E8E1D5] text-[#161311]">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        
        {/* Encabezado */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-[#E8E1D5] pb-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/40 bg-[#FAF7F2] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36]">
              <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
              Arquitectura 3D & Distribución · Domo Ø8m (50.26 m²)
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#161311]">
              Explora tu Domo en 3D interactivo.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#786F66] max-w-2xl">
              Gira en 360°, entra a la suite principal, regula la transparencia del techo y experimenta la terraza con plunge pool de piedra.
            </p>
          </div>

          {/* Selector de Modos */}
          <div className="flex rounded-full border border-[#E8E1D5] bg-[#FAF7F2] p-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab("3d")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "3d" ? "bg-[#161311] text-white shadow" : "text-[#786F66] hover:text-[#161311]"
              }`}
            >
              <Box className="h-4 w-4 text-[#C5A059]" />
              <span>Modelo 3D Interactivo</span>
            </button>
            <button
              onClick={() => setActiveTab("planta")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "planta" ? "bg-[#161311] text-white shadow" : "text-[#786F66] hover:text-[#161311]"
              }`}
            >
              <Ruler className="h-4 w-4" />
              <span>Plano 2D (CAD)</span>
            </button>
            <button
              onClick={() => setActiveTab("materiales")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "materiales" ? "bg-[#161311] text-white shadow" : "text-[#786F66] hover:text-[#161311]"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Materiales & Bioclimática</span>
            </button>
          </div>
        </div>

        {/* TAB 1: VISOR 3D INTERACTIVO */}
        {activeTab === "3d" && (
          <div className="mt-10">
            <DomeConfigurator />
            
            {/* Características del Modelo 3D */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-[#E8E1D5] bg-[#FAF7F2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36]">Escala 1:1</span>
                <h4 className="font-display text-lg font-bold text-[#161311] mt-1">Domo Geodésico Ø8m</h4>
                <p className="text-xs text-[#786F66] mt-1">50.26 m² de área útil interior con altura cenital de 4.20 m.</p>
              </div>
              <div className="p-5 rounded-2xl border border-[#E8E1D5] bg-[#FAF7F2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">Mobiliario Real</span>
                <h4 className="font-display text-lg font-bold text-[#161311] mt-1">Suite King & Baño</h4>
                <p className="text-xs text-[#786F66] mt-1">Cama King (2.00×2.00m), ducha española, inodoro y kitchenette integrada.</p>
              </div>
              <div className="p-5 rounded-2xl border border-[#E8E1D5] bg-[#FAF7F2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E6646]">Exterior & Agua</span>
                <h4 className="font-display text-lg font-bold text-[#161311] mt-1">Deck & Plunge Pool</h4>
                <p className="text-xs text-[#786F66] mt-1">25 m² de terraza teca con tina de hidromasaje en piedra y pérgola.</p>
              </div>
              <div className="p-5 rounded-2xl border border-[#E8E1D5] bg-[#FAF7F2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#161311]">Día & Noche</span>
                <h4 className="font-display text-lg font-bold text-[#161311] mt-1">Iluminación 2700K</h4>
                <p className="text-xs text-[#786F66] mt-1">Simula la luz solar dorada de Ica o el cielo estrellado astronómico.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLANO CAD 2D */}
        {activeTab === "planta" && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Blueprint Arquitectónico */}
            <div className="lg:col-span-7 rounded-[2.5rem] border border-[#E8E1D5] bg-[#FAF7F2] p-6 sm:p-10 relative overflow-hidden shadow-inner">
              <div className="flex justify-between items-center mb-6 text-[10px] font-bold uppercase tracking-wider text-[#786F66]">
                <span className="flex items-center gap-1.5"><Compass className="h-3.5 w-3.5 text-[#C5A059]" /> Escala 1:50 · Área Útil: 50.26 m²</span>
                <span className="text-[#A84F36]">Diámetro Exterior: 8.00 m</span>
              </div>

              {/* Plano CAD Vectorial de Ultra Lujo */}
              <svg viewBox="0 0 600 600" className="w-full h-auto select-none drop-shadow-md">
                <defs>
                  <pattern id="cad-grid-fine" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(28,22,18,0.035)" strokeWidth="0.5" />
                  </pattern>
                  <radialGradient id="pool-water-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4dd0e1" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#00acc1" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#006064" stopOpacity="1" />
                  </radialGradient>
                </defs>

                <rect width="600" height="600" fill="url(#cad-grid-fine)" />

                {/* Deck Exterior con listones de madera teca */}
                <path d="M 90 410 A 210 210 0 0 0 510 410 L 510 530 L 90 530 Z" fill="#EFE8DA" stroke="#D3C7B2" strokeWidth="1.5" />
                {[430, 450, 470, 490, 510].map((y) => (
                  <line key={y} x1="100" y1={y} x2="500" y2={y} stroke="#DDD1BC" strokeWidth="1" strokeDasharray="3 3" />
                ))}

                {/* Plunge Pool Circular en el Deck */}
                <circle cx="430" cy="470" r="44" fill="#D3C7B2" stroke="#161311" strokeWidth="2" />
                <circle cx="430" cy="470" r="38" fill="url(#pool-water-grad)" />
                <circle cx="430" cy="470" r="26" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <text x="430" y="474" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF" fontFamily="sans-serif">PLUNGE POOL</text>

                {/* Perímetro y Muro Doble del Domo Ø8m */}
                <circle cx="300" cy="270" r="210" fill="#FFFFFF" stroke="#161311" strokeWidth="4" />
                <circle cx="300" cy="270" r="198" fill="#FAF7F2" stroke="#C5A059" strokeWidth="1.5" strokeDasharray="6 4" />

                {/* Triangulación Geodésica Sutil de Techo */}
                {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;
                  const x = 300 + 198 * Math.cos(rad);
                  const y = 270 + 198 * Math.sin(rad);
                  return <line key={i} x1="300" y1="270" x2={x} y2={y} stroke="#E0D5C1" strokeWidth="0.8" strokeDasharray="4 4" />;
                })}

                {/* Ventanal Panorámico Curvo (Amanecer) */}
                <path d="M 160 125 A 210 210 0 0 1 440 125" fill="none" stroke="#C85B3E" strokeWidth="6" strokeLinecap="round" />
                <text x="300" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#C85B3E" fontFamily="sans-serif">▲ VENTANAL PANORÁMICO (VISTA AL AMANECER)</text>

                {/* Alfombra Circular de Yute */}
                <circle cx="300" cy="210" r="110" fill="#F4EFE6" stroke="#D9CDB8" strokeWidth="1" strokeDasharray="3 3" />

                {/* Cama King Size Detallada */}
                <rect x="220" y="140" width="160" height="150" rx="8" fill="#FFFFFF" stroke="#161311" strokeWidth="2" />
                <rect x="230" y="148" width="140" height="28" rx="4" fill="#E8E1D5" stroke="#C5A059" strokeWidth="1" />
                <rect x="235" y="152" width="60" height="20" rx="3" fill="#FFFFFF" stroke="#786F66" strokeWidth="1" />
                <rect x="305" y="152" width="60" height="20" rx="3" fill="#FFFFFF" stroke="#786F66" strokeWidth="1" />
                <line x1="220" y1="210" x2="380" y2="210" stroke="#E8E1D5" strokeWidth="1.5" />
                <text x="300" y="245" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#161311" fontFamily="sans-serif">CAMA KING</text>
                <text x="300" y="260" textAnchor="middle" fontSize="9" fill="#786F66" fontFamily="sans-serif">2.00 × 2.00 m</text>

                {/* Mesas de Noche */}
                <rect x="180" y="148" width="30" height="30" rx="4" fill="#F4EFE6" stroke="#161311" strokeWidth="1.5" />
                <circle cx="195" cy="163" r="5" fill="#C5A059" />
                <rect x="390" y="148" width="30" height="30" rx="4" fill="#F4EFE6" stroke="#161311" strokeWidth="1.5" />
                <circle cx="405" cy="163" r="5" fill="#C5A059" />

                {/* Baño Privado Completo */}
                <path d="M 130 320 L 250 320 L 250 445 A 210 210 0 0 1 130 320 Z" fill="#EAE2D2" stroke="#161311" strokeWidth="2" />
                <rect x="145" y="335" width="40" height="40" fill="#FFFFFF" stroke="#0E8B99" strokeWidth="1" />
                <circle cx="165" cy="355" r="8" fill="none" stroke="#0E8B99" strokeWidth="1.5" />
                <ellipse cx="220" cy="355" rx="10" ry="14" fill="#FFFFFF" stroke="#786F66" strokeWidth="1.5" />
                <rect x="210" y="335" width="20" height="8" rx="2" fill="#FFFFFF" stroke="#786F66" strokeWidth="1" />
                <ellipse cx="220" cy="405" rx="14" ry="10" fill="#FFFFFF" stroke="#161311" strokeWidth="1.5" />
                <text x="190" y="390" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#161311" fontFamily="sans-serif">BAÑO PRIVADO</text>

                {/* Kitchenette & Coffee Bar */}
                <rect x="330" y="330" width="130" height="45" rx="6" fill="#EAE2D2" stroke="#161311" strokeWidth="2" />
                <circle cx="355" cy="352" r="8" fill="#161311" />
                <circle cx="375" cy="352" r="6" fill="#161311" />
                <rect x="400" y="340" width="25" height="24" rx="3" fill="#FFFFFF" stroke="#786F66" strokeWidth="1" />
                <text x="395" y="395" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#161311" fontFamily="sans-serif">KITCHENETTE</text>

                {/* Sala de Estar / Sillones Lounge */}
                <circle cx="340" cy="275" r="16" fill="#FFFFFF" stroke="#C5A059" strokeWidth="1.5" />
                <circle cx="380" cy="275" r="16" fill="#FFFFFF" stroke="#C5A059" strokeWidth="1.5" />
                <circle cx="360" cy="275" r="8" fill="#EAE2D2" stroke="#161311" strokeWidth="1" />

                {/* Cotas Técnicas */}
                <line x1="90" y1="270" x2="510" y2="270" stroke="#786F66" strokeWidth="0.8" strokeDasharray="3 3" />
                <text x="520" y="273" fontSize="10" fontWeight="bold" fill="#786F66" fontFamily="sans-serif">Ø 8.00 m</text>
              </svg>
            </div>

            {/* Desglose de Espacios */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl border border-[#E8E1D5] bg-[#FAF7F2]">
                <h4 className="font-display text-lg font-bold text-[#161311]">1. Suite Principal (22.5 m²)</h4>
                <p className="text-xs text-[#786F66] mt-1 leading-relaxed">
                  Cama King Size, mesas de noche de madera tratada, alfombra de fibra natural y ventanal panorámico con vista al amanecer del desierto.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-[#E8E1D5] bg-[#FAF7F2]">
                <h4 className="font-display text-lg font-bold text-[#161311]">2. Baño Privado Completo (7.5 m²)</h4>
                <p className="text-xs text-[#786F66] mt-1 leading-relaxed">
                  Ducha española con mampara de vidrio templado, inodoro ecológico de bajo consumo y lavamanos sobre mesada de madera o piedra local.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-[#E8E1D5] bg-[#FAF7F2]">
                <h4 className="font-display text-lg font-bold text-[#161311]">3. Kitchenette & Sala Lounge (8.5 m²)</h4>
                <p className="text-xs text-[#786F66] mt-1 leading-relaxed">
                  Cocina de inducción, frigobar, lavadero de acero, mesada de cuarzo y sillones de descanso integrados.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-[#C5A059]/40 bg-[#F4EFE6]">
                <h4 className="font-display text-lg font-bold text-[#A84F36]">4. Deck Exterior & Plunge Pool (25 m²)</h4>
                <p className="text-xs text-[#786F66] mt-1 leading-relaxed">
                  Listones de madera teca tratada + tina circular de hidromasaje en piedra y pérgola de sombra en caña brava.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: MATERIALES & BIOCLIMÁTICA */}
        {activeTab === "materiales" && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-[#E8E1D5] bg-[#FAF7F2] p-7 flex flex-col justify-between">
              <div>
                <Layers className="h-7 w-7 text-[#A84F36] mb-4" />
                <h3 className="font-display text-xl font-bold text-[#161311]">Cubierta Tricapa Anti-UV</h3>
                <p className="text-xs text-[#786F66] mt-2 leading-relaxed">
                  Membrana arquitectónica de alta densidad con filtro UV50+. Bloquea el 85% de la radiación solar y conserva el calor interior durante la noche desértica.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#4E6646]">
                <CheckCircle2 className="h-4 w-4" /> Vida útil: 12-15 años
              </span>
            </div>

            <div className="rounded-3xl border border-[#E8E1D5] bg-[#FAF7F2] p-7 flex flex-col justify-between">
              <div>
                <Wind className="h-7 w-7 text-[#C5A059] mb-4" />
                <h3 className="font-display text-xl font-bold text-[#161311]">Estructura Geodésica</h3>
                <p className="text-xs text-[#786F66] mt-2 leading-relaxed">
                  Madera estructural curada contra sales e insectos. La geometría triangular distribuye las cargas de forma homogénea, resistiendo vientos de hasta 75 km/h.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#4E6646]">
                <CheckCircle2 className="h-4 w-4" /> Antisísmica y aerodinámica
              </span>
            </div>

            <div className="rounded-3xl border border-[#E8E1D5] bg-[#FAF7F2] p-7 flex flex-col justify-between">
              <div>
                <Droplets className="h-7 w-7 text-[#0E8B99] mb-4" />
                <h3 className="font-display text-xl font-bold text-[#161311]">Saneamiento Bio-Ecológico</h3>
                <p className="text-xs text-[#786F66] mt-2 leading-relaxed">
                  Biodigestor individual estanco de polietileno de alta resistencia. Procesa aguas residuales mediante digestión anaeróbica sin olores ni contacto con el suelo.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#4E6646]">
                <CheckCircle2 className="h-4 w-4" /> Cero impacto en el subsuelo
              </span>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
