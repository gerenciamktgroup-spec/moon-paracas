import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  HardHat, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  Award, 
  ShieldCheck, 
  Trees, 
  Sun, 
  Layers, 
  Info,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  location: string;
  slogan: string;
  desc: string;
  metric: string;
  year: string;
  features: string[];
  ecoDesc: string;
  infraDesc: string;
  images: string[];
}

const pastProjects: Project[] = [
  {
    id: "bahias",
    name: "Las Bahías",
    location: "Cieneguilla, Lima",
    slogan: "La mayor habilitación off-grid y autosuficiente del país",
    desc: "Un hito indiscutible en desarrollo rural y ordenamiento territorial en Lima. Este megaproyecto privado abarca más de 500 hectáreas estructuradas en 7 etapas. Su diseño urbanístico pionero integra sistemas solares fotovoltaicos residenciales independientes y de uso común, una red de biodigestores autolimpiables que resuelven el saneamiento de forma autónoma y un plan forestal a gran escala que transformó la aridez de la meseta en un oasis verde.",
    metric: "+500 Hectáreas / 7 Etapas",
    year: "Habilitado y entregado desde 2018",
    features: ["Habilitación 100% Off-Grid", "Sistemas Biodigestores", "35% Áreas Libres y Verdes"],
    ecoDesc: "El proyecto opera al 100% de manera desconectada de la red eléctrica tradicional, utilizando autogeneración solar. El saneamiento se realiza a través de biodigestores biológicos autolimpiables que evitan la contaminación del subsuelo. Además, cuenta con un plan masivo de forestación con más de 12,000 especies nativas (molles, algarrobos, huarangos) regadas mediante microgoteo tecnificado.",
    infraDesc: "Vías afirmadas compactadas de 6.0m y 8.0m de ancho diseñadas para la circulación de buggies eléctricos y bicicletas. Pórtico de acceso monumental reforzado con seguridad física permanente 24/7 y cámaras de vigilancia CCTV integradas a un centro de monitoreo alimentado por paneles fotovoltaicos autónomos.",
    images: [
      "/media/experience/bahias 1.jpg",
      "/media/experience/bahias 2.jpg",
      "/media/experience/bahias 3.jpg",
      "/media/experience/bahias 4.jpg",
      "/media/experience/bahias 5.jpg",
      "/media/experience/bahias 6.jpg"
    ]
  },
  {
    id: "mar-y-bosques",
    name: "Mar y Bosques",
    location: "Punta Negra, Lima",
    slogan: "Integración orgánica entre la naturaleza y la vida de campo",
    desc: "Condominio ecológico premium que abarca 80 hectáreas en la zona alta, combinando la brisa del desierto con la topografía campestre. Diseñado exclusivamente para albergar residencias de campo de bajo impacto visual. Cuenta con un imponente pórtico monumental construido en piedra natural y troncos secos tratados, redes de servicios integradas y un club house multifuncional completamente operativo.",
    metric: "80 Hectáreas / 920 Lotes",
    year: "Obras culminadas y entregadas",
    features: ["Pórtico en Piedra y Eucalipto", "Áreas Deportivas Completas", "Club House Integrado"],
    ecoDesc: "Habilitación eco-amigable con restricciones estrictas de altura y materiales constructivos para preservar la geografía y la silueta de las colinas áridas. Riego tecnificado para cortinas forestales de casuarinas y agaves ornamentales utilizando agua reciclada, minimizando el impacto en recursos hídricos locales.",
    infraDesc: "Vías rústicas amplias y seguras. Pórtico de acceso monumental fabricado con troncos de eucalipto seco seleccionado de 10 pulgadas y pircas de piedra de cantera local. Club House equipado con terrazas, vestuarios, piscinas de piedra natural y zonas recreativas comunes plenamente operativas.",
    images: [
      "/media/experience/mar y bosques .jpg",
      "/media/experience/mar y bosques 2.jpg",
      "/media/experience/mar y bosques 3.jpg",
      "/media/experience/mar y bosques 4.jpg",
      "/media/experience/mar y bosques 5.jpg",
      "/media/experience/mar y bosques 6.jpg",
      "/media/experience/mar y bosques 7.jpg"
    ]
  },
  {
    id: "la-raya",
    name: "La Raya",
    location: "Cieneguilla, Lima",
    slogan: "Santuario rústico rodeado de un bosque de frutales maduro",
    desc: "Exclusivo condominio ecológico rústico de 200 hectáreas consolidado. El proyecto destaca por su concepto de coexistencia agrícola y residencial, albergando más de 30,000 árboles frutales en plena producción que rodean los lotes de los propietarios. Cuenta con un Club House central premium con piscinas, canchas profesionales de tenis y extensos senderos de caminata ecológicos.",
    metric: "200 Hectáreas / 700 Lotes",
    year: "100% Vendido y Entregado",
    features: ["30,000 Árboles Frutales", "Club House y Tenis", "Saneamiento Independiente"],
    ecoDesc: "Un bosque productivo autosuficiente que actúa como pulmón ecológico en la zona de Cieneguilla. Utiliza un sistema centralizado de bombeo y filtrado conectado a pozos con licencia, optimizado para alimentar por goteo automatizado plantaciones de palta, pecana y cítricos maduros.",
    infraDesc: "Pórtico de seguridad permanente y control electrónico de propietarios. Vías integradas que serpentean a través de las plantaciones frutales. Club House completo con restaurante, vestuarios, piscinas y 4 canchas reglamentarias de tenis de arcilla de uso exclusivo.",
    images: [
      "/media/experience/condominio la raya 1.jpg",
      "/media/experience/condominio la raya 2.jpg",
      "/media/experience/condominio la raya 5.jpg",
      "/media/experience/condomnio la raya 5.jpg"
    ]
  }
];

// Single Project Showcase Component
const ProjectShowcase: React.FC<{ project: Project }> = ({ project }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Slideshow Autoplay (5 seconds interval)
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % project.images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPlaying, project.images.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + project.images.length) % project.images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % project.images.length);
  };

  return (
    <div className="glass-card rounded-none overflow-hidden flex flex-col lg:flex-row border border-[rgba(225,217,193,0.15)] bg-[#1D1714]/45 shadow-2xl transition-all duration-300 hover:border-[#E2725B]/30">
      
      {/* Widescreen Slideshow Section (Left/Top) */}
      <div 
        className="w-full lg:w-[45%] h-[300px] sm:h-[380px] lg:h-auto min-h-[380px] relative overflow-hidden bg-stone-950 flex flex-col justify-between p-4 group"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {/* Slideshow Images */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={project.images[currentSlide]}
              alt={`${project.name} view`}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55 }}
              className="absolute inset-0 w-full h-full object-cover filter brightness-[1.05] contrast-[1.02]"
            />
          </AnimatePresence>
          {/* Subtle Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/35 pointer-events-none" />
        </div>

        {/* Top Controls Overlay */}
        <div className="relative flex justify-between items-center z-10">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-black/50 backdrop-blur-md border border-white/10 text-white hover:text-[#E2725B] hover:border-[#E2725B]/40 transition-all rounded-full cursor-pointer"
            title={isPlaying ? "Pausar presentación" : "Iniciar presentación"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Center Navigation Arrows */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={handlePrev}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center cursor-pointer pointer-events-auto active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNext}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center cursor-pointer pointer-events-auto active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Instagram-style line indicators */}
        <div className="relative z-10 flex gap-1 w-full justify-center">
          {project.images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(false);
                setCurrentSlide(idx);
              }}
              className="h-1 flex-1 max-w-[40px] cursor-pointer transition-all duration-300 relative bg-white/20 overflow-hidden"
            >
              <div 
                className={`h-full bg-[#E2725B] transition-all duration-300 ${
                  currentSlide === idx ? "w-full" : "w-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Unified Dossier Copy Panel Section (Right/Bottom) */}
      <div className="w-full lg:w-[55%] p-6 sm:p-8 flex flex-col justify-between gap-6 font-sans text-left">
        <div className="space-y-6">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-start justify-between border-b border-white/10 pb-4 gap-4">
            <div>
              <h3 className="font-display text-3xl font-bold uppercase text-white tracking-wide mb-1.5">
                {project.name}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#E2725B] font-mono">
                <MapPin className="w-3.5 h-3.5" />
                <span>{project.location}</span>
              </div>
            </div>

            <div className="flex flex-col items-end text-[9px] font-bold uppercase tracking-wider text-stone-300 bg-stone-900/40 p-2 border border-white/5 font-mono">
              <div className="flex items-center gap-1.5 text-white">
                <HardHat className="w-3.5 h-3.5 text-[#E2725B]" />
                <span>{project.metric}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-stone-400">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>{project.year}</span>
              </div>
            </div>
          </div>

          {/* Slogan */}
          <p className="text-stone-300 font-serif italic text-sm tracking-wide border-l-2 border-[#E2725B] pl-3">
            "{project.slogan}"
          </p>

          {/* Project Details Description */}
          <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
            {project.desc}
          </p>

          {/* 3-Column Technical Grid - Replaces Clunky Internal Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10 text-[11px] sm:text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1">
                <Info className="w-3.5 h-3.5 text-[#E2725B]" /> Ficha de Obra
              </h4>
              <div className="flex flex-wrap gap-1">
                {project.features.map((f, i) => (
                  <span key={i} className="bg-stone-900/50 text-[#E1D9C1] border border-white/5 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1">
                <Trees className="w-3.5 h-3.5 text-[#E2725B]" /> Sostenibilidad
              </h4>
              <p className="text-stone-400 leading-normal font-light">
                {project.ecoDesc}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1">
                <Layers className="w-3.5 h-3.5 text-[#E2725B]" /> Habilitación
              </h4>
              <p className="text-stone-400 leading-normal font-light">
                {project.infraDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom confirmation tag */}
        <div className="flex items-center gap-2 text-[9px] font-bold text-white/90 uppercase tracking-widest border-t border-white/5 pt-4 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#E2725B]" />
          <span>Infraestructura Habilitada al 100% — Entregado</span>
        </div>
      </div>

    </div>
  );
};

export const Experience: React.FC = () => {
  return (
    <div className="relative min-h-[90vh] text-[#E1D9C1] py-12 px-4 sm:px-6 md:px-8 space-y-16 overflow-hidden">

      {/* Header section with neuromarketing storytelling copy */}
      <div className="text-center space-y-4 max-w-4xl mx-auto pt-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E2725B] px-3 py-1 bg-[#E2725B]/10 rounded-full border border-[#E2725B]/20">
          Solidez y Garantía Real
        </span>
        <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase text-white tracking-wide leading-tight">
          Nuestra Trayectoria de Ejecución
        </h2>
        <p className="text-stone-300 font-sans text-xs sm:text-sm font-light leading-relaxed max-w-3xl mx-auto">
          No vendemos maquetas sobre planos vacíos. La propuesta de <strong>Moon Paracas</strong> se respalda en la solidez de un equipo con más de <strong>780 hectáreas desarrolladas y entregadas con total éxito</strong> en el Perú. Conoce la calidad real de habilitación que ya hemos materializado en el campo.
        </p>
      </div>

      {/* Corporate Metrics Ribbon (Quiet Luxury styling) */}
      <section className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 border border-white/10 bg-[#1D1714]/30 backdrop-blur-md divide-y md:divide-y-0 md:divide-x divide-white/10 font-sans">
        
        <div className="p-8 flex flex-col justify-between min-h-[140px] text-left">
          <div className="flex items-center justify-between text-[#E2725B] mb-4">
            <Award className="w-7 h-7" />
            <span className="text-[8px] font-bold uppercase tracking-widest font-mono border border-[#E2725B]/30 px-2 py-0.5 rounded-sm">Escala</span>
          </div>
          <div>
            <h4 className="text-4xl font-light font-display text-white mb-1">780+ Has</h4>
            <p className="text-[10px] uppercase font-bold text-stone-300 tracking-wider">Hectáreas Habilitadas</p>
            <p className="text-[10px] text-stone-400 mt-1 font-light leading-relaxed">Desarrolladas de forma autónoma e integral en el Perú.</p>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-between min-h-[140px] text-left">
          <div className="flex items-center justify-between text-[#E2725B] mb-4">
            <ShieldCheck className="w-7 h-7" />
            <span className="text-[8px] font-bold uppercase tracking-widest font-mono border border-[#E2725B]/30 px-2 py-0.5 rounded-sm">Seguridad</span>
          </div>
          <div>
            <h4 className="text-4xl font-light font-display text-white mb-1">100%</h4>
            <p className="text-[10px] uppercase font-bold text-stone-300 tracking-wider">Inscrito en SUNARP</p>
            <p className="text-[10px] text-stone-400 mt-1 font-light leading-relaxed">Títulos independizados con posesión y legalidad garantizada.</p>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-between min-h-[140px] text-left">
          <div className="flex items-center justify-between text-[#E2725B] mb-4">
            <Trees className="w-7 h-7" />
            <span className="text-[8px] font-bold uppercase tracking-widest font-mono border border-[#E2725B]/30 px-2 py-0.5 rounded-sm">Impacto</span>
          </div>
          <div>
            <h4 className="text-4xl font-light font-display text-white mb-1">42,000+</h4>
            <p className="text-[10px] uppercase font-bold text-stone-300 tracking-wider">Especies Plantadas</p>
            <p className="text-[10px] text-stone-400 mt-1 font-light leading-relaxed">Forestación activa por goteo transformando entornos áridos.</p>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-between min-h-[140px] text-left">
          <div className="flex items-center justify-between text-[#E2725B] mb-4">
            <TrendingUp className="w-7 h-7" />
            <span className="text-[8px] font-bold uppercase tracking-widest font-mono border border-[#E2725B]/30 px-2 py-0.5 rounded-sm">Respaldo</span>
          </div>
          <div>
            <h4 className="text-4xl font-light font-display text-white mb-1">3,500+</h4>
            <p className="text-[10px] uppercase font-bold text-stone-300 tracking-wider">Familias Beneficiadas</p>
            <p className="text-[10px] text-stone-400 mt-1 font-light leading-relaxed">Propietarios con posesión efectiva de lotes entregados.</p>
          </div>
        </div>

      </section>

      {/* Title Divider */}
      <div className="max-w-[1200px] mx-auto border-t border-[rgba(225,217,193,0.15)] pt-12">
        <h3 className="font-display text-lg uppercase font-bold tracking-wider text-white mb-2 flex items-center gap-2">
          <Award className="text-[#E2725B] w-5 h-5" /> Proyectos Emblemáticos
        </h3>
        <p className="text-stone-300 font-sans text-xs font-light">
          Interactúa y examina los detalles técnicos, las fotos reales de obra y la infraestructura instalada de nuestras habilitaciones previas:
        </p>
      </div>

      {/* Projects Timeline List */}
      <div className="max-w-[1200px] mx-auto space-y-16">
        {pastProjects.map((project) => (
          <ProjectShowcase key={project.id} project={project} />
        ))}
      </div>

      {/* Quality commitment section (Certificate style) */}
      <section className="max-w-[1000px] mx-auto border-2 border-dashed border-[#E1D9C1]/20 bg-[#1D1714]/20 p-8 sm:p-12 font-sans space-y-8 text-stone-300 relative shadow-inner">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#E2725B]/5 blur-2xl rounded-full" />
        <h4 className="font-display text-2xl uppercase font-normal text-white text-center tracking-wider pb-3 flex items-center justify-center gap-3">
          <ShieldCheck className="text-[#E2725B] w-6 h-6" /> El Compromiso y Respaldo Moon Paracas
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-light leading-relaxed text-left divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B]" /> Ingeniería Off-Grid Real
            </h5>
            <p className="text-stone-400">
              Toda la infraestructura sostenible planteada para Moon Paracas (autoconsumo solar, reciclaje de aguas PTAR) ya ha sido implementada a gran escala y probada por años en Las Bahías.
            </p>
          </div>
          <div className="space-y-3 md:pl-6">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B]" /> Reforestación Activa
            </h5>
            <p className="text-stone-400">
              La creación de microclimas y forestación en zonas áridas es nuestra especialidad. Traeremos el mismo estándar de riego tecnificado que ha cubierto de vegetación Cieneguilla.
            </p>
          </div>
          <div className="space-y-3 md:pl-6">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B]" /> Transparencia Legal Registral
            </h5>
            <p className="text-stone-400">
              Garantizamos la independización física y registral de todos los lotes. Nuestro historial impecable en SUNARP respalda tu inversión desde el primer día con absoluta certeza.
            </p>
          </div>
        </div>
      </section>

      {/* CTA to return to main simulation funnel */}
      <div className="max-w-2xl mx-auto text-center space-y-4 pt-4 pb-8">
        <h4 className="font-display text-xl uppercase font-bold text-white">¿Listo para simular tu lote en Paracas?</h4>
        <p className="text-xs text-stone-300 font-light font-sans">
          Aplica este mismo estándar constructivo, paisajístico y ecológico en tu futuro lote privado de Moon Paracas.
        </p>
        <div className="pt-2">
          <Link
            to="/simulador"
            className="btn-primary px-8 py-4 uppercase tracking-widest text-xs font-bold inline-flex items-center gap-3 bg-[#E2725B] hover:bg-[#d85e45] text-white transition-all shadow-[0_0_15px_rgba(226,114,91,0.25)]"
          >
            <span>Ver Masterplan e Iniciar Simulación</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
