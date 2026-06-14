import React, { useState } from "react";
import { Trees, Sun, Moon, Sparkles, Navigation, Layers, CheckCircle2 } from "lucide-react";

interface Concept {
  id: string;
  title: string;
  tagline: string;
  description: string;
  details: string[];
  vibe: string;
  gradient: string;
  icon: React.ReactNode;
  imageUrl: string;
  hotspots: { name: string; x: string; y: string; desc: string }[];
}

export const ConceptGallery: React.FC = () => {
  const [activeConceptIdx, setActiveConceptIdx] = useState<number>(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const concepts: Concept[] = [
    {
      id: "portico",
      title: "Pórtico de Acceso Monumental",
      tagline: "Estructura Rústica Integrada al Entorno de Paracas",
      description: "La primera impresión de exclusividad. Diseñado con muros de piedra de cantera natural, vigas macizas de eucalipto seco, cactus candelabro y majestuosos agaves prehistóricos.",
      details: [
        "Control de accesos con seguridad inalámbrica 24/7.",
        "Caseta integrada camuflada con piedra del desierto.",
        "Boleto peatonal y de vehículos eléctricos en vías dobles.",
        "Arquitectura bioclimática que repele ráfagas de viento costeras."
      ],
      vibe: "Xeripaisajismo y piedra natural",
      gradient: "from-amber-100 to-orange-100",
      icon: <Layers className="h-5 w-5 text-amber-800" />,
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      hotspots: [
        { name: "Pórtico de Troncos", x: "25%", y: "40%", desc: "Troncos rústicos de alta durabilidad tratados contra la salinidad costera." },
        { name: "Muros de Cantera", x: "75%", y: "65%", desc: "Piedra de Paracas apilada de forma artesanal sin mortero visible." },
        { name: "Xeripaisajismo", x: "45%", y: "80%", desc: "Matorrales xerófitos autóctonos como cactus y agaves que requieren cero riego." }
      ]
    },
    {
      id: "villas-dia",
      title: "Villas Inteligentes con Estilo Desert Resort",
      tagline: "Viviendas Bioclimáticas con Confort Premium",
      description: "Casas unifamiliares integradas sobre parcelas de 250m². Techo plano optimizado con paneles solares monocristalinos y cercos perimetrales de piedra natural.",
      details: [
        "Soporte de energía solar privada para iluminación led y cargadores.",
        "Fachadas de color terracota/arena que evitan el sobrecalentamiento térmico.",
        "Jardines secos privados con bio-digestores para reciclaje hídrico.",
        "Estacionamientos techados individuales con cargador de buggy."
      ],
      vibe: "Confort bioclimático en el desierto",
      gradient: "from-amber-50 to-emerald-50",
      icon: <Sun className="h-5 w-5 text-emerald-700" />,
      imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      hotspots: [
        { name: "Techo Solar", x: "50%", y: "25%", desc: "Matriz fotovoltaica de 3.2kW para autoconsumo limpio e iluminación." },
        { name: "Cerco de Piedra", x: "80%", y: "70%", desc: "Muros bajos divisorios con piedra caliza dorada de la región." },
        { name: "Buggy Eléctrico", x: "30%", y: "82%", desc: "Buggy todoterreno 100% silencioso provisto para transporte interno." }
      ]
    },
    {
      id: "oasis",
      title: "El Oasis Recreativo & Laguna de Arena",
      tagline: "El Corazón Social y de Esparcimiento Central",
      description: "Una asombrosa laguna orgánica de agua cristalina rodeada de arena blanca y palmeras exóticas. El espacio perfecto para descansar, ejercitarse y convivir en la frescura del desierto.",
      details: [
        "Piscina lagoon con playa de arena clara suave al tacto.",
        "Pérgolas rústicas provistas de tumbonas y zonas de sombra.",
        "Fogón social central (Fire Pit) para asambleas y fogatas nocturnas.",
        "Baja densidad de ruido garantizada por reglamento interno."
      ],
      vibe: "Relajación absoluta bajo las estrellas",
      gradient: "from-blue-50 to-indigo-50",
      icon: <Moon className="h-5 w-5 text-indigo-700" />,
      imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80",
      hotspots: [
        { name: "Laguna de Arena", x: "40%", y: "55%", desc: "Piscina natural con lecho de arena compacta lavada antideslizante." },
        { name: "Área de Fogata", x: "70%", y: "75%", desc: "Anillo rústico para fogatas de comunidad bajo el cielo estrellado de Ica." },
        { name: "Iluminación Sumergible", x: "20%", y: "45%", desc: "Luminarias LED de bajo voltaje y color cian para un resplandor mágico." }
      ]
    },
    {
      id: "sol-solar",
      title: "Reserva de Energía & Movilidad Ecoeficiente",
      tagline: "Cero Emisiones y Máxima Sostenibilidad",
      description: "Implementación integral de zonas de carga solar colectiva. Todo el movimiento vehicular interno se restringe a buggies eléctricos o bicicletas de montaña para preservar el silencio.",
      details: [
        "Cero contaminación acústica dentro del master plan.",
        "Estaciones de carga rápida de buggies con sombrillas solares.",
        "Senderos peatonales de tierra compactada ideales para trotar.",
        "Áreas de reciclaje de residuos sólidos y compostera condominal."
      ],
      vibe: "Movilidad verde y renovable",
      gradient: "from-amber-100 to-emerald-100",
      icon: <Trees className="h-5 w-5 text-amber-800" />,
      imageUrl: "https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=800&q=80",
      hotspots: [
        { name: "Sombrillas Solares", x: "65%", y: "30%", desc: "Pérgolas fotovoltaicas de doble propósito: Sombra protectora y captación limpia." },
        { name: "Buggy Park", x: "35%", y: "72%", desc: "Bahía colectiva para vehículos eléctricos con tomas de carga rápida de 240V." }
      ]
    }
  ];

  const current = concepts[activeConceptIdx];

  return (
    <div id="design-concept" className="rounded-none border border-stone-200 bg-white p-6 md:p-10 shadow-sm space-y-8 max-w-6xl mx-auto">
      {/* Title block */}
      <div className="border-b border-stone-200 pb-5">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#2D3339] flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-[#C4A484]" />
          Concepto Arquitectónico
        </h2>
        <p className="text-base text-stone-600 mt-2 max-w-3xl">
          Contraste desértico entre las dunas doradas, cantera de piedra rústica, xerofitismo de agaves y eco-tecnologías.
        </p>
      </div>

      {/* Tabs list of concepts */}
      <div className="flex flex-wrap gap-2">
        {concepts.map((con, idx) => (
          <button
            key={con.id}
            onClick={() => {
              setActiveConceptIdx(idx);
              setActiveHotspot(null);
            }}
            className={`flex items-center gap-2 rounded-none px-4 py-2.5 text-sm font-bold border-2 transition-all ${
              activeConceptIdx === idx
                ? "bg-[#2D3339] border-[#2D3339] text-white"
                : "bg-white border-[#2D3339] text-[#2D3339] hover:bg-[#F4F4F1]"
            }`}
          >
            {con.icon}
            {con.title.split(" ")[0]} {con.title.split(" ")[1] || ""}
          </button>
        ))}
      </div>

      {/* Main interactive visualization block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Illustrative Map Hotspot Viewer */}
        <div className={`lg:col-span-6 rounded-none bg-gradient-to-br ${current.gradient} border-2 border-[#2D3339] p-6 flex flex-col justify-between relative overflow-hidden min-h-[360px] shadow-[4px_4px_0px_#2D3339]`}>
          
          {/* Subtle desert horizon curve background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#fff8dc_10%,transparent_70%)] opacity-30 pointer-events-none" />

          <div className="flex justify-between items-start z-10">
            <span className="rounded-none bg-[#2D3339] px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wider">
              Vista Esquematizada
            </span>
            <span className="text-xs text-stone-600 italic font-bold">{current.vibe}</span>
          </div>

          {/* Interactive hotspot map render simulation */}
          <div className="relative w-full h-[280px] my-5 border-2 border-[#2D3339] rounded-none bg-stone-200 shadow-md">
            
            <img 
              src={current.imageUrl} 
              alt={current.title}
              className="w-full h-full object-cover filter brightness-90 contrast-125"
              referrerPolicy="no-referrer"
            />
            
            {/* Dark overlay for better hotspot visibility */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Hotspots layer clickable */}
            {current.hotspots.map((hs, hidx) => {
              const isOpen = activeHotspot === hs.name;
              return (
                <div
                  key={`hs-${hidx}`}
                  className="absolute"
                  style={{ left: hs.x, top: hs.y }}
                >
                  <button
                    onClick={() => setActiveHotspot(isOpen ? null : hs.name)}
                    className={`h-8 w-8 rounded-none flex items-center justify-center font-bold text-sm border-2 border-[#2D3339] transition-all duration-300 ${
                      isOpen
                        ? "bg-[#C4A484] text-white scale-110"
                        : "bg-[#2D3339] text-[#F4F4F1] hover:scale-110 animate-bounce"
                    }`}
                    title={hs.name}
                  >
                    <Navigation className="h-4 w-4 transform rotate-45" />
                  </button>

                  {/* Hotspot tooltip content */}
                  {isOpen && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#2D3339] text-white text-xs p-3.5 rounded-none shadow-lg border border-white/20 w-[220px] z-30 leading-snug">
                      <p className="font-bold text-[#C4A484] uppercase tracking-wide">{hs.name}</p>
                      <p className="mt-1 opacity-90">{hs.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-stone-700 text-center">
            📌 Haz clic en los orientadores <Navigation className="inline h-3 w-3 rotate-45 text-[#C4A484]" /> para ver materiales y especificaciones de obra.
          </p>
        </div>

        {/* Right Side: Specifications and criteria */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#C4A484] uppercase tracking-widest">
              {current.tagline}
            </span>
            <h3 className="font-display text-3xl font-bold uppercase text-[#2D3339] leading-none">
              {current.title}
            </h3>
            <p className="text-base text-stone-600 leading-relaxed">
              {current.description}
            </p>
          </div>

          {/* Detailed requirements ticks */}
          <div className="space-y-4 bg-stone-50 rounded-none p-6 border-2 border-[#2D3339] shadow-[2px_2px_0px_#2D3339]">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest border-b border-[#2D3339]/10 pb-2">
              Requisitos Bioclimáticos de Obra
            </h4>
            
            <div className="grid grid-cols-1 gap-3.5 text-sm text-[#2D3339] font-medium">
              {current.details.map((spec, sIdx) => (
                <div key={`spec-${sIdx}`} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#6B8E23] mt-0 flex-shrink-0" />
                  <span className="leading-snug">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Note about construction norms */}
          <div className="p-4 border-l-4 border-[#C4A484] bg-stone-50 text-xs text-stone-600 leading-snug">
            * Todas las viviendas deben adherirse al <strong>Reglamento de Construcción del Propietario (Anexo B)</strong>, el cual promueve fachadas con revestimientos terrosos y cubiertas transitables con sombreadores de eucalipto.
          </div>
        </div>

      </div>
    </div>
  );
};
