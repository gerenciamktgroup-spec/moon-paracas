import React from 'react';
import { motion } from 'motion/react';
import { Wind, Sun, Home, Compass } from 'lucide-react';

export const ParacasHistory = () => {
  const historySections = [
    {
      title: "Lectura del desierto antes de construir",
      description: "Nuestra propuesta no impone arquitectura; la integra. Entendimos la dinámica eólica y la topografía milenaria de Paracas para diseñar un refugio donde el confort es resultado directo de la sensatez estructural.",
      icon: <Wind className="w-8 h-8 text-amber-600" />,
      image: "/images/history/history-10.png",
      reverse: false
    },
    {
      title: "El criterio de la integración",
      description: "La materialidad (tonos terracota, ocres y madera) no es un capricho estético. Responde a la necesidad térmica del territorio, creando un hábitat que dialoga con el entorno en lugar de competir con él.",
      icon: <Compass className="w-8 h-8 text-amber-600" />,
      image: "/images/history/history-5.png",
      reverse: true
    },
    {
      title: "Estilo de Vida Off-Road Sostenible",
      description: "Explora la inmensidad árida en buggies y estaciona bajo pérgolas de eucalipto cubiertas por paneles solares. Un equilibrio perfecto entre la aventura en el desierto y el respeto absoluto por el medio ambiente.",
      icon: <Sun className="w-8 h-8 text-amber-600" />,
      image: "/images/history/history-2.png",
      reverse: false
    },
    {
      title: "Noches Místicas de Fuego y Piedra",
      description: "Bajo cielos despejados e inundados de estrellas, las áreas de fogata rodeadas de muros de piedra y paisajismo xerófilo se convierten en el centro de reunión para disfrutar de la serenidad nocturna del desierto.",
      icon: <Home className="w-8 h-8 text-amber-600" />,
      image: "/images/history/history-4.png",
      reverse: true
    }
  ];

  return (
    <div className="bg-[#fcfaf7] py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl font-serif text-slate-800 mb-6">El Origen y la Magia de Paracas</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Un diseño rústico de lujo nacido de la tierra, pensado para resistir el tiempo y conectarte con el paisaje más imponente de la costa peruana.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[1, 6, 8, 9].map((imgNum, idx) => (
             <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl overflow-hidden aspect-[4/3] shadow-lg"
              >
                <img src={`/images/history/history-${imgNum}.png`} alt="Concepto Paracas" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
             </motion.div>
          ))}
        </div>

        <div className="space-y-24">
          {historySections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col md:flex-row gap-12 items-center ${section.reverse ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="w-full md:w-1/2 space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-2">
                  {section.icon}
                </div>
                <h3 className="text-3xl font-serif text-slate-800">{section.title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed">{section.description}</p>
              </div>
              <div className="w-full md:w-1/2">
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img src={section.image} alt={section.title} className="w-full h-auto object-cover" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};
