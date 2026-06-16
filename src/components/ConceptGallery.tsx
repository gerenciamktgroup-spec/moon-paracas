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
      title: "Pórtico y Alamedas Rústicas",
      tagline: "Ingreso Monumental en Piedra de Cantera y Eucalipto",
      description: "La primera impresión de exclusividad. Diseñado con muros macizos de piedra de cantera natural, vigas gruesas de eucalipto seco, cactus candelabro y majestuosos agaves ornamentales.",
      details: [
        "Control de accesos automatizado y seguridad 24/7.",
        "Caseta integrada camuflada con piedra del desierto.",
        "Alamedas peatonales y de buggies con sombreadores rústicos.",
        "Arquitectura bioclimática que repele ráfagas de viento y arena."
      ],
      vibe: "Xeripaisajismo y piedra natural",
      gradient: "from-amber-100 to-orange-100",
      icon: <Layers className="h-5 w-5 text-amber-800" />,
      imageUrl: "/gemini_generated_image_g13l4tg13l4tg13l.jpg",
      hotspots: [
        { name: "Vigas de Eucalipto", x: "25%", y: "40%", desc: "Troncos rústicos tratados para alta durabilidad frente al clima desértico." },
        { name: "Muros de Cantera", x: "75%", y: "65%", desc: "Piedra de la región apilada de forma artesanal respetando tonos áridos." },
        { name: "Xeripaisajismo", x: "45%", y: "80%", desc: "Matorrales xerófitos autóctonos como cactus y agaves que requieren mínimo riego." }
      ]
    },
    {
      id: "villas-dia",
      title: "Villas Rústicas de Lujo",
      tagline: "Arquitectura Integrada al Paisaje de Dunas",
      description: "Casas unifamiliares integradas en parcelas amplias. Fachadas en tonos terracota, cercos de pircas de piedra y techos transitables con pérgolas rústicas optimizados para paneles solares.",
      details: [
        "Preparación para energía solar privada e iluminación ecológica.",
        "Fachadas de color terracota/arena que se mimetizan con el entorno.",
        "Jardines secos privados y sistemas de reciclaje de agua.",
        "Estacionamientos rústicos con cargador para buggies eléctricos."
      ],
      vibe: "Elegancia natural en el desierto",
      gradient: "from-amber-50 to-emerald-50",
      icon: <Sun className="h-5 w-5 text-emerald-700" />,
      imageUrl: "/gemini_generated_image_6ba4496ba4496ba4_1.jpg",
      hotspots: [
        { name: "Techo Solar", x: "50%", y: "25%", desc: "Puntos de anclaje listos para sistemas fotovoltaicos de autoconsumo." },
        { name: "Cerco de Pirca", x: "80%", y: "70%", desc: "Muros bajos divisorios con piedra caliza dorada apilada a mano." },
        { name: "Materiales Nobles", x: "30%", y: "82%", desc: "Revestimientos rústicos de madera tratada y barro texturizado." }
      ]
    },
    {
      id: "oasis",
      title: "Club Oasis y Piscina de Piedra",
      tagline: "El Corazón Recreativo y Social del Proyecto",
      description: "Un oasis central con piscina construida con revestimiento de piedra de río y decks de madera natural, rodeado de vegetación nativa y un gran fogón para noches templadas.",
      details: [
        "Piscina oasis de 395m² y espejo de agua de 252m².",
        "Pérgolas rústicas de eucalipto con zonas de descanso.",
        "Fogón central (Fire Pit) integrado en piedra para reuniones sociales.",
        "Sendero Zen y áreas para yoga y meditación al aire libre."
      ],
      vibe: "Relajación absoluta bajo las estrellas",
      gradient: "from-blue-50 to-indigo-50",
      icon: <Moon className="h-5 w-5 text-indigo-700" />,
      imageUrl: "/gemini_generated_image_6ba4496ba4496ba4.jpg",
      hotspots: [
        { name: "Piscina de Piedra", x: "40%", y: "55%", desc: "Acabados de piedra natural que brindan frescura y mimetismo con el oasis." },
        { name: "Fogón Central", x: "70%", y: "75%", desc: "Anillo rústico para fogatas comunitarias bajo el cielo limpio de Ica." },
        { name: "Decks de Madera", x: "20%", y: "45%", desc: "Terrazas de madera natural tratada para tomar sol y descansar." }
      ]
    },
    {
      id: "sol-solar",
      title: "Xeripaisajismo y Huertos Orgánicos",
      tagline: "Respeto Absoluto a la Flora Nativa",
      description: "Diseño paisajístico enfocado en plantas de muy bajo consumo hídrico, combinado con un huerto orgánico común y caminos de tierra compactada para caminatas de desconexión.",
      details: [
        "Áreas comunes forestadas con Huarangos, Palmeras e Icacos.",
        "Huerto orgánico vecinal para cultivo de hierbas aromáticas y frutales.",
        "Sendero ecológico perimetral de arcilla compactada para caminatas.",
        "Reglamento estricto de paisajismo para conservar la armonía visual."
      ],
      vibe: "Sostenibilidad y vida orgánica",
      gradient: "from-amber-100 to-emerald-100",
      icon: <Trees className="h-5 w-5 text-amber-800" />,
      imageUrl: "/gemini_generated_image_6ba4496ba4496ba4_2.jpg",
      hotspots: [
        { name: "Huerto Común", x: "65%", y: "30%", desc: "Zona compartida para prácticas de agricultura urbana orgánica en el desierto." },
        { name: "Senderos Nativos", x: "35%", y: "72%", desc: "Caminos peatonales sombreados por huarangos y sauces de la zona." }
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
