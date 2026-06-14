import React from "react";
import { CheckCircle2, ChevronRight, HardHat, Pickaxe, Map as MapIcon, Landmark, Key } from "lucide-react";

export const FinancialTimeline: React.FC = () => {
  const steps = [
    {
      id: "Fase 0",
      title: "Caja Positiva (Etapa Fundadora)",
      description: "Recaudación inicial en fideicomiso. El capital está 100% blindado y no se toca hasta alcanzar el umbral operativo.",
      icon: <Landmark className="h-6 w-6" />,
      status: "current",
    },
    {
      id: "Hito 1",
      title: "Ordenamiento y Topografía",
      description: "Levantamiento topográfico de precisión, trazado de lotes y delimitación del terreno en el tablazo de Paracas.",
      icon: <MapIcon className="h-6 w-6" />,
      status: "upcoming",
    },
    {
      id: "Hito 2",
      title: "Accesos y Seguridad",
      description: "Pórtico de ingreso rústico monumental, caseta de vigilancia y cerco perimétrico de piedra natural.",
      icon: <CheckCircle2 className="h-6 w-6" />,
      status: "upcoming",
    },
    {
      id: "Hito 3",
      title: "Consolidación de Vías y Oasis",
      description: "Afirmado de vías con cloruro de magnesio y excavación en seco de la piscina natural (El Oasis).",
      icon: <Pickaxe className="h-6 w-6" />,
      status: "upcoming",
    },
    {
      id: "Hito 4",
      title: "Entrega Final y Operación",
      description: "Sistemas de energía listos y entrega formal de los lotes para el inicio de construcción de viviendas.",
      icon: <Key className="h-6 w-6" />,
      status: "upcoming",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-white border-4 border-stone-800 p-8 shadow-lg">
      <div className="text-center space-y-3 mb-10">
        <h2 className="font-display text-3xl font-black text-stone-900 uppercase tracking-tight">
          El Modelo <span className="text-[#A3B18A]">Caja Positiva</span>
        </h2>
        <p className="text-stone-600 max-w-2xl mx-auto">
          Cero apalancamiento bancario. El dinero de tus aportes ingresa directamente a un fideicomiso, garantizando que la infraestructura se construya progresivamente sin riesgo financiero.
        </p>
      </div>

      <div className="relative border-l-4 border-stone-200 ml-4 md:ml-0 md:border-l-0">
        {/* For desktop: horizontal line */}
        <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-stone-200 z-0"></div>

        <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4 relative z-10">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-row md:flex-col items-start md:items-center relative w-full group ml-8 md:ml-0">
              {/* Connector line for mobile (replaces the main border-l) */}
              <div className="md:hidden absolute -left-[38px] top-8 bottom-[-40px] w-1 bg-stone-200 group-last:hidden"></div>

              {/* Icon Circle */}
              <div
                className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full border-4 border-white shadow-md transition-colors ${
                  step.status === "current"
                    ? "bg-[#E15A42] text-white"
                    : "bg-stone-200 text-stone-500 group-hover:bg-stone-300"
                } absolute -left-[48px] md:static`}
              >
                {step.icon}
              </div>

              {/* Content */}
              <div className="md:text-center mt-2 md:mt-4 md:px-2">
                <p className={`font-mono text-xs font-bold uppercase tracking-widest ${
                  step.status === "current" ? "text-[#E15A42]" : "text-[#A3B18A]"
                }`}>
                  {step.id}
                </p>
                <h3 className="font-bold text-stone-900 mb-1">{step.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed hidden md:block">
                  {step.description}
                </p>
                {/* Mobile description */}
                <p className="text-xs text-stone-500 leading-relaxed md:hidden mt-1 pb-6">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
