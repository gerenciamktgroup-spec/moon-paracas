import React from 'react';
import { motion } from 'motion/react';
import { Tent, Container, CheckCircle2 } from 'lucide-react';

export const ArchitecturalRecommendations = () => {
  return (
    <div className="bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-serif text-slate-800 mb-6">Recomendaciones Arquitectónicas</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Descubre nuestras propuestas de construcción eco-amigables y modulares. Modelos ideales para mimetizarse con el entorno rústico del desierto, ofreciendo lujo, rapidez de instalación y eficiencia térmica.
          </p>
        </motion.div>

        <div className="space-y-24">
          
          {/* Domo Ecológico */}
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-200 rounded-xl aspect-[4/3] flex items-center justify-center overflow-hidden shadow-md">
                  <img src="/images/domo_ext_1.png" alt="Domo Exterior" className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-200 rounded-xl aspect-[4/3] flex items-center justify-center overflow-hidden shadow-md">
                  <img src="/images/domo_ext_2.png" alt="Domo Panorámico" className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-200 rounded-xl aspect-[4/3] flex items-center justify-center overflow-hidden shadow-md">
                  <img src="/images/domo_int_1.png" alt="Domo Interior Día" className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-200 rounded-xl aspect-[4/3] flex items-center justify-center overflow-hidden shadow-md">
                  <img src="/images/domo_int_2.png" alt="Domo Interior Noche" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-3 bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-medium text-sm">
                <Tent className="w-5 h-5" /> Opción 1: Domo Geodésico Rústico
              </div>
              <h3 className="text-3xl font-serif text-slate-800">Inmersión Absoluta en el Desierto</h3>
              <p className="text-lg text-slate-600">
                Los domos ofrecen una resistencia superior frente a "El Paracas" gracias a su aerodinámica. Su estructura permite un control térmico natural excelente, manteniéndose frescos en verano y cálidos en las frías noches del desierto.
              </p>
              <ul className="space-y-4 pt-4">
                {["Construcción rápida y limpia (menos de 60 días).", "Aislamiento térmico y acústico superior.", "Diseño panorámico para ver las estrellas.", "Materiales rústicos en el interior (madera, barro)."].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="h-px bg-slate-200 w-full"></div>

          {/* Casa Contenedor */}
          <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-200 rounded-xl aspect-[4/3] flex items-center justify-center overflow-hidden shadow-md group">
                    <img src={`/media/container_${i}.jpeg`} alt={`Casa Contenedor Rústica ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-3 bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-medium text-sm">
                <Container className="w-5 h-5" /> Opción 2: Casa Contenedor Rústica
              </div>
              <h3 className="text-3xl font-serif text-slate-800">Sostenibilidad Modular y Diseño Moderno</h3>
              <p className="text-lg text-slate-600">
                Reutilización inteligente de contenedores marítimos revestidos externamente con madera, esterilla y texturas de adobe para cumplir con el reglamento rústico. Una solución altamente resistente, ampliable y de lujo.
              </p>
              <ul className="space-y-4 pt-4">
                {["Estructura modular expandible a futuro.", "Revestimientos ecológicos que camuflan el metal.", "Alta resistencia a la corrosión y el clima extremo.", "Integración perfecta de techos planos con paneles solares."].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
