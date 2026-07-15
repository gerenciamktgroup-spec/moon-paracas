import React from "react";
import { ShieldAlert, Wind, Mountain, CheckCircle, Droplet, CarFront } from "lucide-react";

export const EngineeringSpecs: React.FC = () => {
  const specs = [
    {
      title: "Cimentación Antisísmica Monolítica sobre Roca Sólida",
      icon: <Mountain className="h-6 w-6 text-[#E2725B]" />,
      num: "01",
      content: "Construir sobre la meseta geológica del Tablazo de Paracas es tu mayor garantía de seguridad. Al ser roca sedimentaria consolidada, se elimina totalmente el riesgo de licuación de suelo (común en zonas arenosas). El Masterplan exige plateas de cimentación rígidas y continuas que anclan de forma indestructible cada villa a la roca madre, garantizando un patrimonio eterno e imperturbable ante sismos."
    },
    {
      title: "Cemento Tipo V contra la Erosión y Salitre",
      icon: <ShieldAlert className="h-6 w-6 text-[#E2725B]" />,
      num: "02",
      content: "El aire costero y la salinidad natural del desierto pueden degradar el concreto estándar en pocos años. Para garantizar que tu villa sea heredable por generaciones, Moon Paracas obliga al uso exclusivo de Cemento Tipo V (alta resistencia a sulfatos y cloruros) en todos los cimientos expuestos al terreno, bloqueando la corrosión y protegiendo el acero estructural."
    },
    {
      title: "Urbanismo Sinuoso: Mitigación del Viento Alisio",
      icon: <Wind className="h-6 w-6 text-[#E2725B]" />,
      num: "03",
      content: "Nuestras calles no siguen líneas rectas rígidas, sino un trazado curvo y orgánico diseñado para quebrar la aceleración de los vientos alisios que soplan del sur. Las vías secundarias cuentan con una sección total de 10 metros: 6m de calzada tratada con salmuera (cero polvo) y 4m de bermas con xeropaisajismo nativo (agaves y cactus autóctonos) que frena las corrientes."
    },
    {
      title: "Cota 108m: Inmunidad contra Maremotos e Inundaciones",
      icon: <CheckCircle className="h-6 w-6 text-[#E2725B]" />,
      num: "04",
      content: "Ubicado en la cúspide de una meseta de roca natural a más de 108 metros sobre el nivel del mar, Moon Paracas ofrece una seguridad geográfica insuperable. Esta altitud colosal elimina al 100% cualquier riesgo de tsunamis, desbordes fluviales o aumento del nivel marino. Una fortaleza natural elevada que resguarda tu vida y tu inversión."
    },
    {
      title: "Eco-Autonomía Hídrica y Biodigestión de Impacto Cero",
      icon: <Droplet className="h-6 w-6 text-[#E2725B]" />,
      num: "05",
      content: "Preservamos la pureza ecológica de nuestro subsuelo rocoso mediante tecnología avanzada. Cada lote está obligado a contar con un sistema de biodigestión autolimpiable hermético homologado. Este procesa biológicamente las aguas residuales sin filtraciones nocivas al subsuelo, permitiendo recuperar el agua clarificada exclusivamente para el riego del xeropaisajismo privado."
    },
    {
      title: "Santuario Peatonal: Silencio Absoluto y Aire Puro",
      icon: <CarFront className="h-6 w-6 text-[#E2725B]" />,
      num: "06",
      content: "El lujo del silencio es nuestro mayor privilegio. Hemos eliminado por completo el ruido, el smog y el peligro de los autos convencionales del interior del condominio. Los residentes estacionan en los 4 Hubs periféricos (con 438 cocheras y drop-offs de carga), abriendo paso a calles secundarias seguras e internas transitadas exclusivamente a pie, en bicicleta o buggies eléctricos."
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-10">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <h3 className="font-display text-3xl sm:text-4xl font-bold text-white uppercase tracking-wide">
          Seguridad, Paisajismo <span className="text-[#E2725B] font-light">e Ingeniería</span>
        </h3>
        <p className="text-stone-300 max-w-2xl mx-auto text-xs sm:text-sm font-light leading-relaxed">
          Parámetros técnicos obligatorios de alta ingeniería y sostenibilidad, diseñados para blindar tu patrimonio y garantizar la plusvalía de Moon Paracas de forma permanente.
        </p>
      </div>

      {/* Grid structure replacing the vertical accordions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specs.map((spec, index) => (
          <div 
            key={index} 
            className="group relative border border-white/10 hover:border-[#E2725B]/40 bg-[#1D1714]/25 p-6 rounded-none flex flex-col justify-between min-h-[250px] transition-all duration-300 hover:translate-y-[-4px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[#E2725B]/5"
          >
            {/* Elegant Number overlay on top-right */}
            <span className="absolute top-4 right-6 text-6xl font-display font-black text-[#E1D9C1]/5 select-none pointer-events-none transition-colors group-hover:text-[#E2725B]/10">
              {spec.num}
            </span>

            <div className="space-y-4">
              <div className="p-3 bg-stone-900/40 border border-white/5 inline-flex items-center justify-center rounded-none text-[#E2725B] transition-colors group-hover:bg-[#E2725B]/10">
                {spec.icon}
              </div>
              <h4 className="font-display text-base font-bold text-white uppercase tracking-wide leading-tight group-hover:text-[#E2725B] transition-colors text-left">
                {spec.title}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed font-light font-sans text-left">
                {spec.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
