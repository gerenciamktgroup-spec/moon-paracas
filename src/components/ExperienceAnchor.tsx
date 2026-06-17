import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export const ExperienceAnchor: React.FC = () => {
  return (
    <section id="respaldo" className="w-full bg-[#F4F4F1] py-32 px-6 sm:px-12 scroll-mt-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        
        {/* Left Column - Title */}
        <div className="md:col-span-5 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4 text-[#C4A484]" />
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#C4A484] uppercase">
              Certeza Estructural
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#2D3339] leading-[1.1]"
          >
            La experiencia que ordena el paisaje.
          </motion.h2>
        </div>

        {/* Right Column - Copy */}
        <div className="md:col-span-7 space-y-8 md:pl-8 lg:pl-16 md:border-l border-stone-300">
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="text-stone-600 text-lg sm:text-xl leading-relaxed"
          >
            Moon Paracas no parte de cero. Está sustentado en el aprendizaje acumulado de un equipo directivo y técnico con trayectoria comprobable en el sur. Entender la geografía nos permite diseñar sin improvisar, asegurando que tu inversión descanse sobre una base de conocimiento real.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.3 }}
          >
            <button 
              onClick={() => document.getElementById('legado')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-widest text-[#2D3339] hover:text-[#C4A484] transition-colors"
            >
              <span className="border-b-2 border-[#2D3339] group-hover:border-[#C4A484] pb-1 transition-colors">
                Explorar el Respaldo Técnico
              </span>
              <span className="transform translate-x-0 group-hover:translate-x-2 transition-transform">→</span>
            </button>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
