import React from "react";
import { motion } from "framer-motion";
import { FileCheck, Activity, LineChart } from "lucide-react";

export const ObjectionsBridge: React.FC = () => {
  return (
    <section id="transparencia" className="w-full bg-[#C4A484] py-24 px-6 sm:px-12 scroll-mt-24">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="font-mono text-xs font-bold tracking-[0.2em] text-[#2D3339] uppercase opacity-80"
          >
            TRANSPARENCIA TOTAL
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl text-[#2D3339] leading-tight"
          >
            Estructura legal y física consolidada.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2 }}
            className="font-mono text-sm text-[#2D3339] opacity-80"
          >
            Decidir mejor empieza por ver el contexto completo.
          </motion.p>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-[#2D3339]">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="h-12 w-12 rounded-full border border-[#2D3339] flex items-center justify-center">
              <FileCheck className="h-5 w-5 stroke-[1.5]" />
            </div>
            <h3 className="font-bold text-sm tracking-wider uppercase">Seguridad Registral</h3>
            <p className="font-mono text-xs opacity-80 leading-relaxed max-w-xs">
              Títulos matrices saneados para un proceso sin demoras. Documentación auditable desde el día uno.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="h-12 w-12 rounded-full border border-[#2D3339] flex items-center justify-center">
              <Activity className="h-5 w-5 stroke-[1.5]" />
            </div>
            <h3 className="font-bold text-sm tracking-wider uppercase">Viabilidad Física</h3>
            <p className="font-mono text-xs opacity-80 leading-relaxed max-w-xs">
              Estudios técnicos y topográficos aplicados al trazado del oasis. Criterio estructural, no solo estético.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="h-12 w-12 rounded-full border border-[#2D3339] flex items-center justify-center">
              <LineChart className="h-5 w-5 stroke-[1.5]" />
            </div>
            <h3 className="font-bold text-sm tracking-wider uppercase">Proyección Financiera</h3>
            <p className="font-mono text-xs opacity-80 leading-relaxed max-w-xs">
              Condiciones directas documentadas. Sin variables ocultas ni tasas no declaradas en la simulación.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
