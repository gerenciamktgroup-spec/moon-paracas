import React from "react";
import { Trees, Sun, Compass, ShieldCheck, Activity, Eye, Zap, Flame } from "lucide-react";

export const LifestyleAmenities: React.FC = () => {
  const features = [
    {
      title: "Energía Solar y Autoconsumo",
      desc: "Todas las parcelas están preparadas para la instalación de sistemas de paneles solares fotovoltaicos, logrando una autosuficiencia energética limpia en armonía con el microclima soleado de Paracas.",
      icon: <Sun className="h-6 w-6 text-amber-600" />,
      tag: "Solar-Ready"
    },
    {
      title: "Cero Emisiones Internas (Living Streets)",
      desc: "Nuestras vías internas de 6.0m de ancho están diseñadas para la circulación peatonal, bicicletas y buggies eléctricos silenciosos, eliminando la contaminación acústica y los gases de combustión.",
      icon: <Zap className="h-6 w-6 text-emerald-600" />,
      tag: "Eco-Movilidad"
    },
    {
      title: "Reciclaje Hídrico Integral (PTAR)",
      desc: "El condominio cuenta con una Planta de Tratamiento de Aguas Residuales (PTAR) biológica. El agua tratada se utiliza exclusivamente para el riego de áreas verdes y el xeripaisajismo.",
      icon: <Trees className="h-6 w-6 text-teal-600" />,
      tag: "Sostenibilidad"
    },
    {
      title: "Pórtico y Seguridad Controlada 24/7",
      desc: "Moon Paracas cuenta con un cerco perimetral de seguridad y un pórtico de control de accesos automatizado. Personal de vigilancia y monitoreo constante para tu total tranquilidad.",
      icon: <ShieldCheck className="h-6 w-6 text-stone-700" />,
      tag: "Privacidad"
    },
    {
      title: "Observación Astronómica Nocturna",
      desc: "Aprovecha la pureza del cielo del tablazo de Paracas, libre de contaminación lumínica. Disfruta de noches estrelladas únicas y observación de constelaciones desde nuestro Mirador Zen.",
      icon: <Eye className="h-6 w-6 text-indigo-600" />,
      tag: "Vistas del Cielo"
    },
    {
      title: "Aventura y Deportes de Desierto",
      desc: "Ubicación estratégica a minutos de la Bahía y la Reserva Nacional de Paracas. Perfecto para la práctica de Sandboard en las dunas, Kitesurf, Windsurf, paseos en tubular y trekking costero.",
      icon: <Activity className="h-6 w-6 text-[#E15A42]" />,
      tag: "Aventura"
    }
  ];

  return (
    <div id="lifestyle-amenities" className="rounded-none border border-stone-200 bg-white p-6 md:p-10 shadow-sm space-y-8 max-w-6xl mx-auto">
      {/* Title block */}
      <div className="border-b border-stone-200 pb-5 text-center lg:text-left">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#2D3339] flex items-center justify-center lg:justify-start gap-3">
          <Trees className="h-7 w-7 text-[#A3B18A]" />
          Eco-Vida y Amenidades Premium
        </h2>
        <p className="text-base text-stone-600 mt-2 max-w-3xl">
          Moon Paracas es una propuesta de desconexión y contacto con el desierto, construida bajo estándares de sostenibilidad, cero ruido vehicular y alta privacidad.
        </p>
      </div>

      {/* Grid of features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={i} className="border-2 border-[#2D3339] p-5 bg-stone-50 flex flex-col justify-between hover:translate-y-[-2px] transition-all shadow-[3px_3px_0px_#2D3339]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-white border border-stone-200 shadow-sm flex items-center justify-center">
                  {f.icon}
                </div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-stone-200/60 px-2 py-0.5">
                  {f.tag}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#2D3339] uppercase">
                {f.title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Highlight Section: The Oasis Experience */}
      <div className="border-4 border-[#2D3339] bg-stone-900 text-stone-100 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-none bg-[#A3B18A] px-3 py-1 text-xs font-bold text-[#2D3339]">
            <Flame className="h-3.5 w-3.5" /> Exclusividad Central
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight">
            La Experiencia Oasis y Club Moon
          </h3>
          <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
            Nuestros residentes disfrutan de un Oasis central con una **Piscina Oasis de 395 m²** y un **Espejo de Agua de 252 m²**, rodeados de áreas verdes nativas, terrazas de madera (Decks), zonas de Yoga y un Fogón Místico para disfrutar de atardeceres y noches mágicas bajo el cielo desértico de Ica.
          </p>
        </div>
        <div className="lg:col-span-4 bg-stone-800 border-2 border-stone-700 p-4 text-center space-y-2">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Áreas Recreativas Comunes</p>
          <div className="grid grid-cols-2 gap-2 text-stone-100">
            <div className="bg-stone-900/60 p-2.5 border border-stone-700">
              <p className="text-lg font-bold font-mono text-[#A3B18A]">395m²</p>
              <p className="text-[9px] text-stone-400 uppercase">Piscina Oasis</p>
            </div>
            <div className="bg-stone-900/60 p-2.5 border border-stone-700">
              <p className="text-lg font-bold font-mono text-[#A3B18A]">252m²</p>
              <p className="text-[9px] text-stone-400 uppercase">Espejo de Agua</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
