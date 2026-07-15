import React from "react";
import { Landmark, FileCheck2, Mountain, Route, CarFront, Shield } from "lucide-react";
import { motion } from "framer-motion";

export const FinancialTimeline: React.FC = () => {
  const steps = [
    {
      id: "Fase 0",
      title: "Etapa Fundadora (Caja Positiva)",
      description: "Recaudación inicial en fideicomiso cerrado de administración. Tu capital está 100% blindado y solo se libera al alcanzar el umbral de viabilidad comercial.",
      icon: <Landmark className="h-6 w-6" />,
      status: "current",
    },
    {
      id: "Hito 1",
      title: "Saneamiento Físico-Legal",
      description: "Delimitación perimétrica final, inscripción consolidada en Registros Públicos (SUNARP) y visación municipal de planos del Masterplan.",
      icon: <FileCheck2 className="h-6 w-6" />,
      status: "upcoming",
    },
    {
      id: "Hito 2",
      title: "Movimiento de Tierras e Hitos",
      description: "Nivelación de plataformas de terreno sobre la meseta del tablazo a 108m de elevación y colocación de hitos demarcatorios de concreto para los 292 lotes.",
      icon: <Mountain className="h-6 w-6" />,
      status: "upcoming",
    },
    {
      id: "Hito 3",
      title: "Vías de 10 metros y Sinuosas",
      description: "Compactación de calzadas de 6m tratadas con salmuera (anti-polvo) y conformación de 4m de bermas peatonales con cactus y agaves.",
      icon: <Route className="h-6 w-6" />,
      status: "upcoming",
    },
    {
      id: "Hito 4",
      title: "Hubs de Estacionamiento (438 Plazas)",
      description: "Estructuras de estacionamiento periféricas en las 4 esquinas del proyecto con drop-offs de emergencia y bases para paneles solares.",
      icon: <CarFront className="h-6 w-6" />,
      status: "upcoming",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 bg-[#FAF9F5] border-4 border-stone-900 p-8 sm:p-10 shadow-xl rounded-2xl">
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-stone-900 text-[#FAF9F5] px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
          <Shield className="h-3.5 w-3.5 text-[#C4A484]" /> Infraestructura Autofinanciada
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-black text-stone-900 uppercase tracking-tight">
          Hitos Constructivos <span className="text-[#C4A484] font-light">Caja Positiva</span>
        </h2>
        <p className="text-stone-600 max-w-2xl mx-auto text-sm sm:text-base font-light">
          Cero deudas. El dinero de los aportes de los socios fundadores se administra mediante cuentas escindidas de avance, asegurando que cada etapa se autofinancie y valorice tu lote sin riesgos de paralización.
        </p>
      </div>

      <div className="relative border-l-4 border-stone-300 ml-4 md:ml-0 md:border-l-0">
        {/* Horizontal Connector Line for Desktop */}
        <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-stone-200 z-0"></div>

        <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4 relative z-10">
          {steps.map((step, idx) => (
            <motion.div 
              key={step.id} 
              className="flex flex-row md:flex-col items-start md:items-center relative w-full group ml-8 md:ml-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              {/* Connector line for mobile */}
              <div className="md:hidden absolute -left-[38px] top-8 bottom-[-40px] w-1 bg-stone-300 group-last:hidden"></div>

              {/* Icon Circle */}
              <div
                className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full border-4 border-stone-900 shadow-md transition-colors duration-300 ${
                  step.status === "current"
                    ? "bg-[#C4A484] text-stone-950 font-bold"
                    : "bg-stone-100 text-stone-500 group-hover:bg-[#FAF9F5] group-hover:text-stone-900"
                } absolute -left-[48px] md:static z-10`}
              >
                {step.icon}
              </div>

              {/* Content */}
              <div className="md:text-center mt-2 md:mt-4 md:px-2">
                <p className={`font-mono text-[10px] font-bold uppercase tracking-widest ${
                  step.status === "current" ? "text-stone-900" : "text-stone-500"
                }`}>
                  {step.id}
                </p>
                <h3 className="font-bold text-stone-900 text-base mb-1.5">{step.title}</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light hidden md:block">
                  {step.description}
                </p>
                {/* Mobile description */}
                <p className="text-xs text-stone-600 leading-relaxed md:hidden mt-1 pb-6 font-light">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
