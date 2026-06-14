import React, { useState } from "react";
import { ShieldAlert, Wind, Mountain, ChevronDown, CheckCircle } from "lucide-react";

export const EngineeringSpecs: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const specs = [
    {
      title: "Resiliencia Sísmica (Zona 4) y Plateas de Cimentación",
      icon: <Mountain className="h-5 w-5 text-[#E15A42]" />,
      content: "Ubicados en la Zona Sísmica 4, el reglamento exige el máximo nivel de seguridad estructural. Hemos adoptado el uso obligatorio de plateas de cimentación rígidas para cada vivienda, distribuyendo el peso uniformemente sobre la arena compactada del tablazo y evitando asentamientos diferenciales en caso de sismos severos."
    },
    {
      title: "Cemento Tipo V: Protección contra Sulfatos",
      icon: <ShieldAlert className="h-5 w-5 text-[#E15A42]" />,
      content: "El desierto salitroso y la proximidad marina presentan altos niveles de sulfatos que degradan el concreto normal. El Masterplan exige el uso de Cemento Tipo V en todas las cimentaciones, garantizando una alta resistencia a la corrosión y prolongando la vida útil estructural de tu inversión a más de 50 años."
    },
    {
      title: "Trazado Vial Anti-Viento Paracas",
      icon: <Wind className="h-5 w-5 text-[#E15A42]" />,
      content: "En lugar de la clásica cuadrícula que crea túneles de viento, nuestras calles tienen un diseño sinuoso y orgánico. Esto rompe la velocidad de los vientos predominantes (Sur a Norte), protegiendo la habitabilidad exterior, reduciendo el polvo y mejorando el confort térmico dentro de los clusters."
    },
    {
      title: "Geografía de Tablazo (Cero Riesgo de Maremoto)",
      icon: <CheckCircle className="h-5 w-5 text-[#E15A42]" />,
      content: "Al asentar el proyecto sobre el tablazo a más de 106 metros sobre el nivel del mar, Moon Paracas ofrece la vista del Océano Pacífico pero con absoluta seguridad frente a maremotos o subidas de marea, combinando lo mejor del desierto y la brisa marina."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-white border-4 border-[#2D3339] p-8 shadow-lg">
      <div className="text-center space-y-3 mb-8">
        <h2 className="font-display text-3xl font-black text-[#2D3339] uppercase tracking-tight">
          Seguridad e <span className="text-[#A3B18A]">Ingeniería</span>
        </h2>
        <p className="text-stone-600 max-w-2xl mx-auto">
          Conoce los parámetros constructivos obligatorios que protegen tu inversión frente a las condiciones reales de Paracas.
        </p>
      </div>

      <div className="space-y-4">
        {specs.map((spec, index) => (
          <div key={index} className="border-2 border-stone-200 hover:border-[#A3B18A] transition-colors">
            <button
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              className="w-full flex items-center justify-between p-4 bg-stone-50 text-left"
            >
              <div className="flex items-center gap-3">
                {spec.icon}
                <span className="font-bold text-[#2D3339]">{spec.title}</span>
              </div>
              <ChevronDown 
                className={`h-5 w-5 text-stone-500 transition-transform ${openIndex === index ? "rotate-180" : ""}`} 
              />
            </button>
            {openIndex === index && (
              <div className="p-4 bg-white border-t-2 border-stone-100 text-stone-600 text-sm leading-relaxed">
                {spec.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
