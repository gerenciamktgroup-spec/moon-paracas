import React from "react";
import { motion } from "framer-motion";
import { Landmark, Mountain, Waves, Wind } from "lucide-react";

export const TechnicalLegacy: React.FC = () => {
  return (
    <section id="legado" className="w-full bg-[#2D3339] py-32 px-8 sm:px-12 scroll-mt-24 text-stone-300">
      <div className="max-w-6xl mx-auto space-y-24">
        
        {/* Section Header */}
        <div className="space-y-6 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-center gap-2"
          >
            <Landmark className="h-4 w-4 text-[#C4A484]" />
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#C4A484] uppercase">
              Memoria Técnica
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#F4F4F1] leading-[1.2]"
          >
            Decisiones basadas en el terreno.
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="text-lg leading-relaxed text-stone-400"
          >
            Nuestro equipo trae consigo la comprensión adquirida en desarrollos previos de costa y desierto. Ese conocimiento acumulado minimiza el riesgo de tu inversión.
          </motion.p>
        </div>

        {/* Legacy Archive Cards (Horizontal Scroll on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.3 }}
            className="group relative border border-stone-600/50 min-h-[320px] overflow-hidden flex flex-col justify-end p-8 shadow-lg"
          >
            <img src="/media/tech_rock.jpeg" alt="Asentamiento Estructural" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-stone-900/30 transition-opacity duration-300 group-hover:opacity-90" />
            
            <div className="relative z-10 flex flex-col space-y-6">
              <div className="p-3 bg-stone-900/50 backdrop-blur-sm border border-stone-600/50 w-fit rounded-sm">
                <Mountain className="h-6 w-6 text-[#C4A484] stroke-[1.5]" />
              </div>
              <div className="space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-display text-xl text-[#F4F4F1]">Asentamiento Estructural</h3>
                <p className="text-xs font-mono text-stone-300 leading-relaxed opacity-90">
                  Criterios probados en arena y topografías asimétricas para evitar hundimientos y consolidar terreno seguro.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.4 }}
            className="group relative border border-stone-600/50 min-h-[320px] overflow-hidden flex flex-col justify-end p-8 shadow-lg"
          >
            <img src="/media/tech_sand.jpeg" alt="Lectura del Viento" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-stone-900/30 transition-opacity duration-300 group-hover:opacity-90" />
            
            <div className="relative z-10 flex flex-col space-y-6">
              <div className="p-3 bg-stone-900/50 backdrop-blur-sm border border-stone-600/50 w-fit rounded-sm">
                <Wind className="h-6 w-6 text-[#C4A484] stroke-[1.5]" />
              </div>
              <div className="space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-display text-xl text-[#F4F4F1]">Lectura del Viento</h3>
                <p className="text-xs font-mono text-stone-300 leading-relaxed opacity-90">
                  Trazados eólicos empíricos aplicados para mitigar la fricción de la Paraca y proteger el espacio habitacional.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.5 }}
            className="group relative border border-stone-600/50 min-h-[320px] overflow-hidden flex flex-col justify-end p-8 shadow-lg"
          >
            <img src="/media/tech_water.jpeg" alt="Integración Operativa" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-stone-900/30 transition-opacity duration-300 group-hover:opacity-90" />
            
            <div className="relative z-10 flex flex-col space-y-6">
              <div className="p-3 bg-stone-900/50 backdrop-blur-sm border border-stone-600/50 w-fit rounded-sm">
                <Waves className="h-6 w-6 text-[#C4A484] stroke-[1.5]" />
              </div>
              <div className="space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-display text-xl text-[#F4F4F1]">Integración Operativa</h3>
                <p className="text-xs font-mono text-stone-300 leading-relaxed opacity-90">
                  Experiencia previa en saneamiento y viabilidad de servicios (agua y energía) en zonas áridas de la costa sur.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Vision Renewed Block */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.6 }}
          className="border-t border-stone-700 pt-16 mt-16 max-w-4xl space-y-8"
        >
          <h3 className="font-display text-2xl sm:text-3xl text-[#C4A484] italic font-light">
            "Una visión afinada por la experiencia."
          </h3>
          <p className="text-lg leading-relaxed text-stone-300">
            Tomamos los aprendizajes estructurales de proyectos anteriores y los refinamos bajo una nueva dirección. Esta evolución nos permite enfocarnos en entregarte no solo un lote, sino una comunidad donde la tranquilidad es el resultado de un proceso altamente estructurado.
          </p>
          <button 
            onClick={() => document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F4F4F1] hover:text-[#C4A484] transition-colors"
          >
            <span className="border-b-2 border-transparent group-hover:border-[#C4A484] pb-1 transition-colors">
              Entender el Contexto de Paracas
            </span>
            <span className="transform translate-x-0 group-hover:translate-x-2 transition-transform">→</span>
          </button>
        </motion.div>

      </div>
    </section>
  );
};
