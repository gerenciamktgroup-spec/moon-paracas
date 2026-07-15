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
  images: string[];
}

export const ConceptGallery: React.FC = () => {
  const [activeConceptIdx, setActiveConceptIdx] = useState<number>(0);

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
      images: [
        "/media/concept_portico_1.jpeg",
        "/media/concept_portico_2.jpeg",
        "/media/concept_portico_3.jpeg"
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
      images: [
        "/media/concept_villas_1.jpeg",
        "/media/concept_villas_2.jpeg",
        "/media/concept_villas_3.jpeg"
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
      images: [
        "/media/concept_oasis_1.jpeg",
        "/media/concept_oasis_2.jpeg",
        "/media/concept_oasis_3.jpeg"
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
      images: [
        "/media/concept_xeri_1.jpeg",
        "/media/concept_xeri_2.jpeg",
        "/media/concept_xeri_3.jpeg"
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
          Explora los lineamientos visuales y materiales que definen el ecosistema premium de Moon Paracas.
        </p>
      </div>

      {/* Tabs list of concepts */}
      <div className="flex flex-wrap gap-2">
        {concepts.map((con, idx) => (
          <button
            key={con.id}
            onClick={() => setActiveConceptIdx(idx)}
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

      {/* Main visual & text block */}
      <div className="space-y-8">
        
        {/* Horizontal Scroll Gallery */}
        <div className="relative w-full">
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar">
            {current.images.map((img, iIdx) => (
              <div 
                key={iIdx} 
                className="flex-shrink-0 w-full sm:w-[80%] md:w-[60%] lg:w-[45%] snap-center rounded-none border-2 border-[#2D3339] overflow-hidden shadow-[4px_4px_0px_#2D3339] group"
              >
                <div className="aspect-[4/3] w-full relative">
                  <img 
                    src={img} 
                    alt={`${current.title} - Toma ${iIdx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-300" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-stone-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-2">
            <Navigation className="h-3 w-3 -rotate-90" />
            Desliza para explorar la galería
          </div>
        </div>

        {/* Text and Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-gradient-to-br from-stone-50 to-stone-100 p-8 border-2 border-[#2D3339] shadow-[4px_4px_0px_#2D3339]">
          
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <span className="text-xs font-bold text-[#C4A484] uppercase tracking-widest bg-white border border-[#C4A484]/30 px-3 py-1 w-fit">
              {current.tagline}
            </span>
            <h3 className="font-display text-3xl font-bold uppercase text-[#2D3339] leading-tight">
              {current.title}
            </h3>
            <p className="text-base text-stone-600 leading-relaxed max-w-xl">
              {current.description}
            </p>
          </div>

          {/* Detailed requirements ticks */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-sm font-bold text-stone-800 uppercase tracking-widest border-b border-[#2D3339]/20 pb-2">
              Características Clave
            </h4>
            
            <div className="grid grid-cols-1 gap-3.5 text-sm text-stone-700 font-medium">
              {current.details.map((spec, sIdx) => (
                <div key={`spec-${sIdx}`} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C4A484] mt-0 flex-shrink-0" />
                  <span className="leading-snug">{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};
