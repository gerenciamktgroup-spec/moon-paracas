import React from "react";
import { motion } from "framer-motion";
import { FileCheck, Activity, LineChart } from "lucide-react";

export const ObjectionsBridge: React.FC = () => {
  return (
    <section id="transparencia" className="relative w-full py-16 px-6 sm:px-12 scroll-mt-24 overflow-hidden">
      {/* Background Image with Parallax effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-[2px] z-10" />
        <img 
          src="/media/legal_bg.jpeg" 
          alt="Desierto Paracas" 
          className="w-full h-[120%] object-cover object-center -translate-y-10" 
        />
      </div>

      <div className="relative z-20 max-w-6xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="inline-block px-3 py-1 border border-[#A3B18A]/50 bg-stone-900/50 backdrop-blur-sm font-mono text-[10px] font-bold tracking-[0.3em] text-[#A3B18A] uppercase"
          >
            TRANSPARENCIA TOTAL
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight drop-shadow-md"
          >
            Estructura legal y física consolidada.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2 }}
            className="font-mono text-sm text-stone-300 opacity-90 drop-shadow-sm max-w-lg mx-auto"
          >
            Decidir mejor empieza por ver el contexto completo. Un proyecto firme requiere cimientos reales.
          </motion.p>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-stone-200">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center text-center space-y-5 bg-stone-800/40 backdrop-blur-md p-8 border border-stone-700/50 hover:bg-stone-800/60 transition-colors"
          >
            <div className="h-16 w-16 rounded-none bg-stone-900/80 border border-[#A3B18A]/50 flex items-center justify-center text-[#A3B18A] shadow-inner">
              <FileCheck className="h-7 w-7 stroke-[1.5]" />
            </div>
            <h3 className="font-bold text-sm tracking-widest uppercase text-white">Seguridad Registral</h3>
            <p className="font-mono text-xs opacity-80 leading-relaxed max-w-xs text-stone-300">
              Títulos matrices saneados para un proceso sin demoras. Documentación auditable desde el día uno.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center text-center space-y-5 bg-stone-800/40 backdrop-blur-md p-8 border border-stone-700/50 hover:bg-stone-800/60 transition-colors"
          >
            <div className="h-16 w-16 rounded-none bg-stone-900/80 border border-[#A3B18A]/50 flex items-center justify-center text-[#A3B18A] shadow-inner">
              <Activity className="h-7 w-7 stroke-[1.5]" />
            </div>
            <h3 className="font-bold text-sm tracking-widest uppercase text-white">Viabilidad Física</h3>
            <p className="font-mono text-xs opacity-80 leading-relaxed max-w-xs text-stone-300">
              Estudios técnicos y topográficos aplicados al trazado del oasis. Criterio estructural, no solo estético.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center text-center space-y-5 bg-stone-800/40 backdrop-blur-md p-8 border border-stone-700/50 hover:bg-stone-800/60 transition-colors"
          >
            <div className="h-16 w-16 rounded-none bg-stone-900/80 border border-[#A3B18A]/50 flex items-center justify-center text-[#A3B18A] shadow-inner">
              <LineChart className="h-7 w-7 stroke-[1.5]" />
            </div>
            <h3 className="font-bold text-sm tracking-widest uppercase text-white">Proyección Financiera</h3>
            <p className="font-mono text-xs opacity-80 leading-relaxed max-w-xs text-stone-300">
              Condiciones directas documentadas. Sin variables ocultas ni tasas no declaradas en la simulación.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
