import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Map, Sparkles, Video, ArrowRight, CheckCircle2, Tent, Container, 
  Compass, Sun, Wind, Eye, ShieldAlert, Mountain, Droplet, CarFront, Star 
} from "lucide-react";
import { GlowCard } from "../components/GlowCard";

// Helper to provide modern WebM/VP9 video format support with MP4 fallback
const getSources = (src: string) => {
  if (src.endsWith(".mp4")) {
    const webmSrc = src.replace(/\.mp4$/, ".webm");
    return [
      { src: webmSrc, type: "video/webm; codecs=vp9" },
      { src: src, type: "video/mp4" }
    ];
  }
  return [{ src: src, type: undefined }];
};

// Optimized HoverVideo component to prevent video decoding saturation
const HoverVideo: React.FC<{ src: string; poster: string; className?: string }> = ({ 
  src, 
  poster, 
  className = "" 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    setIsPlaying(true);
    videoRef.current?.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    setIsPlaying(false);
    videoRef.current?.pause();
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      <video
        ref={videoRef}
        poster={poster}
        muted
        loop
        playsInline
        preload="none" // Lazy-load bytes only on hover
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-10 ${
          isPlaying ? "opacity-90" : "opacity-0 pointer-events-none"
        }`}
      >
        {getSources(src).map((source, i) => (
          <source key={i} src={source.src} type={source.type} />
        ))}
      </video>
      <img
        src={poster}
        alt="Cover poster"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-0 ${
          isPlaying ? "opacity-0" : "opacity-100"
        }`}
      />
      
      {/* Visual Hover invite indicator */}
      {!isPlaying && (
        <div className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur-md px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white border border-white/10 flex items-center gap-1.5 z-20 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B] animate-pulse" />
          Pasar cursor para video tour
        </div>
      )}
    </div>
  );
};

export const Home: React.FC<{
  activeVideoIdx: number;
  setActiveVideoIdx: (idx: number) => void;
  isBgPaused: boolean;
  setIsBgPaused: (paused: boolean) => void;
}> = ({ activeVideoIdx, setActiveVideoIdx, isBgPaused, setIsBgPaused }) => {
  const videos = [
    { 
      id: "celestial_fast", 
      src: "/media/water_mirror.mp4", 
      label: "Noche Estelar", 
      desc: "Reflejo del cielo estrellado sobre el espejo de agua central del club." 
    },
    { 
      id: "celestial_hi", 
      src: "/media/hero_bg.mp4", 
      label: "Vuelo Estelar HD", 
      desc: "Vista aérea cinemática compacta del condominio iluminado bajo las estrellas." 
    },
    { 
      id: "oasis", 
      src: "/media/pool_pan.mp4", 
      label: "El Oasis Central", 
      desc: "Desplazamiento cinemático fluido hacia la gran piscina de piedra natural y decks." 
    },
    { 
      id: "domos", 
      src: "/media/Desert_geodesic_domes_at_sunset_202606230037.mp4", 
      label: "Eco-Domos Sunset", 
      desc: "Los domos geodésicos integrados al paisaje durante el ocaso en Paracas." 
    },
    { 
      id: "suite", 
      src: "/media/sunrise_bed.mp4", 
      label: "Suite Estelar", 
      desc: "Vista interior de un refugio privado diseñado para contemplar el cosmos." 
    },
    { 
      id: "fogon", 
      src: "/media/firepit.mp4", 
      label: "Fogón Místico", 
      desc: "El crujido del fuego bajo la noche desértica." 
    }
  ];



  // Tab state for the Brand Attributes vs. Engineering Specs switcher
  const [activePillarTab, setActivePillarTab] = useState<"lifestyle" | "engineering">("lifestyle");

  // Tab state for the History & Storytelling module
  const [activeHistoryTab, setActiveHistoryTab] = useState(0);

  const brandAttributes = [
    { title: "Lujo Silencioso", desc: "Exclusividad rústica de alta gama sin ostentación, donde el silencio es el verdadero privilegio." },
    { title: "Arquitectura Arid", desc: "Propuestas modulares y geodésicas diseñadas para integrarse con la arena y el viento." },
    { title: "Tablazo Elevado", desc: "Vistas infinitas desde una meseta geológicamente sólida, libre de tsunamis e inundaciones." },
    { title: "Cielo Celestial", desc: "Noches despejadas e iluminadas por millones de estrellas, sin contaminación lumínica." },
    { title: "Eco-Autonomía", desc: "Habilitación verde off-grid basada en energía solar y saneamiento de cero impacto." }
  ];

  // Architectural options state (initialized to static images for fast rendering)
  const [activeDomoImg, setActiveDomoImg] = useState(1);
  const [activeContImg, setActiveContImg] = useState(1);

  const domoImages = [
    "/media/Desert_geodesic_domes_at_sunset_202606230037.mp4",
    "/images/domo_ext_1.png",
    "/images/domo_ext_2.png",
    "/images/domo_int_1.png",
    "/images/domo_int_2.png",
    "/media/estas_son_tomas_internas_de_.mp4"
  ];

  const containerImages = [
    "/media/Drone_pan_modern_desert_housing_202606230137.mp4",
    "/media/container_1.jpeg",
    "/media/container_2.jpeg",
    "/media/container_3.jpeg",
    "/media/container_4.jpeg"
  ];

  const historySections = [
    {
      title: "Lectura del desierto antes de construir",
      description: "No imponemos la arquitectura; la mimetizamos. Estudiamos las ráfagas alisias de la Paraca y la topografía milenaria del Tablazo para trazar vías sinuosas que mitigan el viento y protegen la privacidad de cada lote.",
      icon: <Wind className="w-6 h-6 text-[#E2725B]" />,
      video: "/media/Camera_past_stone_walls_cacti_202606170004_202606230136.mp4",
      image: "/images/history/history-10.png"
    },
    {
      title: "Materialidad noble y equilibrio térmico",
      description: "El uso de pircas de piedra natural de canteras de Ica, maderas rollizas de eucalipto seco y revestimientos terracota no es un capricho estético. Son barreras térmicas que mantienen las villas frescas en el día y retienen la calidez por la noche.",
      icon: <Compass className="w-6 h-6 text-[#E2725B]" />,
      image: "/images/history/history-5.png"
    },
    {
      title: "Estilo de vida libre y eco-responsable",
      description: "Explora las dunas vírgenes en buggies o bicicletas de montaña y regresa a un refugio alimentado 100% por energía solar. Moon Paracas ofrece el equilibrio perfecto entre la aventura off-road y el respeto absoluto por el ecosistema costero.",
      icon: <Sun className="w-6 h-6 text-[#E2725B]" />,
      video: "/media/Walking_down_sandy_road_at_202606170004_202606230136.mp4",
      image: "/images/history/history-2.png"
    },
    {
      title: "Fogones místicos bajo un cielo de estrellas",
      description: "Bajo la noche desértica libre de contaminación lumínica, los espacios sociales tallados en piedra natural alrededor de fogatas místicas se convierten en el punto de encuentro natural para disfrutar de la serenidad del tablazo.",
      icon: <Star className="w-6 h-6 text-[#E2725B]" />,
      video: "/media/firepit.mp4",
      image: "/images/history/history-4.png"
    }
  ];

  const engineeringSpecs = [
    {
      title: "Resiliencia Sísmica (Zona 4)",
      desc: "Uso obligatorio de plateas de cimentación continuas que distribuyen el peso uniformemente sobre el suelo desértico.",
      icon: <Mountain className="w-6 h-6 text-[#E2725B]" />
    },
    {
      title: "Protección anti-salitre Tipo V",
      desc: "Obligatoriedad de utilizar Cemento Tipo V en toda cimentación directa en contacto con el terreno desértico.",
      icon: <ShieldAlert className="w-6 h-6 text-[#E2725B]" />
    },
    {
      title: "Trazado vial corta-viento",
      desc: "Calles orgánicas sinuosas de 10m de sección con salmuera que frenan los vientos y evitan el polvo.",
      icon: <Wind className="w-6 h-6 text-[#E2725B]" />
    },
    {
      title: "Cota de Tablazo Segura",
      desc: "Ubicado a 108m s.n.m. en roca sedimentaria consolidada. Cero riesgo de tsunamis e inundaciones.",
      icon: <CheckCircle2 className="w-6 h-6 text-[#E2725B]" />
    },
    {
      title: "Saneamiento Ecológico PTAR",
      desc: "Cada lote requiere un bio-digestor autolimpiable que purifica el agua para riego xerófilo.",
      icon: <Droplet className="w-6 h-6 text-[#E2725B]" />
    },
    {
      title: "Cero Autos Internos",
      desc: "Tránsito interno 100% peatonal o de buggies eléctricos. Parqueo centralizado en 4 Hubs periféricos.",
      icon: <CarFront className="w-6 h-6 text-[#E2725B]" />
    }
  ];

  // Upgraded gallery integrating the new generated renders
  const galleryImages = [
    { src: "/media/interior_dome_sunrise.png", title: "Amanecer en el Domo", desc: "Interior rústico con claraboya estelar a dunas." },
    { src: "/media/plunge_pool_breakfast.png", title: "Desayuno Flotante", desc: "Piscina privada de pirca integrada en la arena." },
    { src: "/media/stargazing_deck_night.png", title: "Observatorio Privado", desc: "Deck de stargazing con telescopio y fogón nocturno." },
    { src: "/media/gallery_6.jpeg", title: "Piscina Oasis", desc: "Espejo de agua central rodeado de decks Shihuahuaco." },
    { src: "/media/gallery_9.jpeg", title: "Xeripaisajismo", desc: "Jardines ecológicos con agaves, cactus y buganvilias." },
    { src: "/media/gallery_10.jpeg", title: "Farolas Solares", desc: "Iluminación fotovoltaica inteligente de bajo impacto." }
  ];

  return (
    <div className="relative min-h-screen text-[#E1D9C1] overflow-hidden font-sans">
      
      {/* 2. MAIN CONTENT LAYER */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 py-12 md:py-20 flex flex-col space-y-24">
        
        {/* HERO SECTION */}
        <section className="min-h-[70vh] flex flex-col justify-end items-start gap-8 pt-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl space-y-5 text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E2725B]/20 backdrop-blur-md border border-[#E2725B]/40 px-4 py-1.5 text-[10px] font-bold text-white uppercase tracking-widest shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-[#E2725B]" /> Lanzamiento Exclusivo Fase Fundadora
            </div>
            
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-[#F5F2EB] tracking-tight leading-[1.05] uppercase">
              Refugio privado <br />
              <span className="text-[#D95D39] font-light italic">en Paracas.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-end mt-2">
            {/* Storytelling Conversion Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-7 glass-card p-6 sm:p-8 border-l-4 border-l-[#D95D39] text-left"
            >
              <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-light mb-6 font-sans">
                Moon Paracas es una propuesta residencial de lujo silencioso asentada sobre el tablazo de Paracas, a 108 m.s.n.m. Un santuario ecológico de bajísima densidad diseñado en perfecta sintonía con las formas del viento y la inmensidad del paisaje. Equipado con una piscina Oasis de piedra de cantera, fogones circulares bajo cielos estrellados y un ecosistema de eco-desarrollo 100% autónomo.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/simulador"
                  className="btn-primary px-8 py-4 uppercase tracking-widest text-xs font-bold inline-flex items-center gap-3 bg-[#D95D39] hover:bg-[#d85e45] text-white transition-all shadow-[0_0_15px_rgba(217,93,57,0.25)]"
                >
                  <span>Explorar Lotes Disponibles</span>
                  <Map className="h-4 w-4" />
                </Link>
                <Link 
                  to="/tecnica"
                  className="glass-pill px-8 py-4 uppercase tracking-widest text-xs font-bold inline-flex items-center gap-3 hover:bg-white/10 transition-colors border border-[#F5F2EB]/20"
                >
                  <span>Ver Especificaciones</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* Multimedia Control Bar (De-cluttered) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-5 glass-card p-5 rounded-2xl flex flex-col gap-3.5 bg-[#1D1714]/60 backdrop-blur-md text-left border border-white/10"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-[#E2725B]">
                  <Video className="w-3.5 h-3.5" /> Atmósfera del Desierto
                </div>
                <button
                  onClick={() => setIsBgPaused(!isBgPaused)}
                  className="px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider border border-white/20 hover:border-[#E2725B] transition-colors bg-white/5 text-[#E1D9C1] flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isBgPaused ? "bg-[#E2725B]" : "bg-emerald-500 animate-pulse"}`} />
                  {isBgPaused ? "Play Fondo" : "Pause Fondo"}
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-1.5">
                {videos.map((vid, idx) => (
                  <button
                    key={vid.id}
                    onClick={() => setActiveVideoIdx(idx)}
                    className={`py-2 text-center border text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
                      activeVideoIdx === idx
                        ? "border-[#E2725B] bg-[#E2725B]/20 text-white"
                        : "border-white/15 hover:border-white/30 text-[#E1D9C1]/70 hover:text-white"
                    }`}
                  >
                    Ambiente 0{idx + 1}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-300 italic font-light font-sans border-t border-white/5 pt-2">
                {videos[activeVideoIdx].label}: {videos[activeVideoIdx].desc}
              </p>
            </motion.div>
          </div>
        </section>

        {/* 3. INTERACTIVE PILLARS SWITCHER (De-cluttered Brand Attributes and Engineering Specs) */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-6 gap-4">
            <div className="text-left space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#E2725B]">Pilares de Moon Paracas</span>
              <h3 className="font-display text-3xl sm:text-4xl font-bold uppercase text-white tracking-wide">
                El Concepto y el Respaldo Técnico
              </h3>
            </div>
            
            {/* Elegant Switcher Buttons */}
            <div className="flex flex-col sm:flex-row bg-[#0A0807]/90 p-1 border border-white/10 rounded-xl shrink-0 w-full sm:w-auto overflow-hidden">
              <button
                onClick={() => setActivePillarTab("lifestyle")}
                className={`px-5 py-2.5 sm:py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 rounded-lg cursor-pointer w-full sm:w-auto text-center ${
                  activePillarTab === "lifestyle"
                    ? "bg-[#D95D39] text-white shadow-md"
                    : "text-[#E1D9C1]/65 hover:text-white"
                }`}
              >
                01. Estilo de Lujo Silencioso
              </button>
              <button
                onClick={() => setActivePillarTab("engineering")}
                className={`px-5 py-2.5 sm:py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 rounded-lg cursor-pointer w-full sm:w-auto text-center ${
                  activePillarTab === "engineering"
                    ? "bg-[#D95D39] text-white shadow-md"
                    : "text-[#E1D9C1]/65 hover:text-white"
                }`}
              >
                02. Especificaciones de Ingeniería
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activePillarTab === "lifestyle" ? (
              <motion.div
                key="lifestyle"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
              >
                {brandAttributes.map((val, idx) => (
                  <GlowCard 
                    key={idx} 
                    className="glass-card p-6 rounded-2xl border border-white/10 bg-[#1D1714]/40 text-left"
                    glowColor="rgba(226, 114, 91, 0.06)"
                    glowRadius={200}
                  >
                    <div className="flex flex-col gap-4 h-full justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-[#E2725B] uppercase tracking-widest block mb-2">Atributo / 0{idx+1}</span>
                        <h4 className="font-display text-xl font-bold uppercase text-white leading-tight">{val.title}</h4>
                      </div>
                      <p className="text-[11px] text-stone-300 font-light leading-relaxed font-sans">{val.desc}</p>
                    </div>
                  </GlowCard>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="engineering"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {engineeringSpecs.map((spec, idx) => (
                  <GlowCard 
                    key={idx}
                    className="glass-card p-6 border border-white/10 bg-[#1D1714]/30 rounded-2xl hover:border-white/20 transition-all duration-300 text-left font-sans"
                    glowColor="rgba(226, 114, 91, 0.06)"
                    glowRadius={240}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="w-10 h-10 bg-[#E2725B]/10 border border-[#E2725B]/20 flex items-center justify-center text-[#E2725B]">
                        {spec.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-display text-lg font-bold uppercase text-white tracking-wide">{spec.title}</h4>
                        <p className="text-xs text-stone-300 leading-relaxed font-light">{spec.desc}</p>
                      </div>
                    </div>
                  </GlowCard>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 4. INTERACTIVE HISTORICAL STORYTELLING (De-cluttered from a 4-section scroll stack to single elegant switcher) */}
        <section className="space-y-12">
          <div className="space-y-3 text-center max-w-3xl mx-auto">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#E2725B]">Mística del Desierto</span>
            <h3 className="font-display text-4xl font-bold uppercase tracking-wide text-white">
              Diseño Mimetizado con el Viento
            </h3>
            <p className="text-[#E1D9C1]/80 font-light text-sm leading-relaxed font-sans">
              Moon Paracas nace del respeto por las condiciones climáticas y la geología del tablazo. Selecciona un pilar a continuación para descubrir nuestra respuesta arquitectónica.
            </p>
          </div>

          {/* Interactive Navigation Timeline */}
          <div className="flex justify-start sm:justify-center overflow-x-auto whitespace-nowrap scrollbar-none gap-2 border-b border-white/5 pb-4 max-w-2xl mx-auto w-full px-4 sm:px-0">
            {historySections.map((sec, idx) => (
              <button
                key={idx}
                onClick={() => setActiveHistoryTab(idx)}
                className={`px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-wider transition-all duration-300 border-b-2 cursor-pointer shrink-0 ${
                  activeHistoryTab === idx
                    ? "border-[#E2725B] text-white bg-white/5"
                    : "border-transparent text-[#E1D9C1]/50 hover:text-white"
                }`}
              >
                0{idx + 1}. {sec.title.split(" ")[0]} {sec.title.split(" ")[1] || ""}
              </button>
            ))}
          </div>

          {/* Active Story Content Box */}
          <div className="glass-card p-6 sm:p-10 border border-white/10 bg-[#1D1714]/50 backdrop-blur-md rounded-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHistoryTab}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center"
              >
                {/* Left Side: Info */}
                <div className="w-full lg:w-1/2 space-y-5 text-left">
                  <div className="inline-flex p-3 bg-[#E2725B]/10 border border-[#E2725B]/20 text-[#E2725B] rounded-xl">
                    {historySections[activeHistoryTab].icon}
                  </div>
                  <h4 className="font-display text-2xl sm:text-3xl font-bold uppercase text-white tracking-wide">
                    {historySections[activeHistoryTab].title}
                  </h4>
                  <p className="text-sm text-stone-200 leading-relaxed font-light font-sans">
                    {historySections[activeHistoryTab].description}
                  </p>
                </div>

                {/* Right Side: Media Asset (HoverVideo optimized) */}
                <div className="w-full lg:w-1/2">
                  <div className="aspect-[16/10] overflow-hidden border border-white/15 relative bg-stone-950 shadow-inner rounded-xl">
                    {historySections[activeHistoryTab].video ? (
                      <HoverVideo 
                        src={historySections[activeHistoryTab].video} 
                        poster={historySections[activeHistoryTab].image} 
                        className="w-full h-full"
                      />
                    ) : (
                      <img 
                        src={historySections[activeHistoryTab].image} 
                        alt={historySections[activeHistoryTab].title} 
                        className="w-full h-full object-cover opacity-85 filter brightness-[1.02] contrast-[1.04]"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* 5. ARCHITECTURAL SUGGESTIONS (Geodesic Domes & Containers) */}
        <section className="space-y-12">
          <div className="space-y-3 text-center max-w-3xl mx-auto">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#E2725B]">Modelos de Edificación</span>
            <h3 className="font-display text-4xl font-bold uppercase tracking-wide text-white">
              Villas e Integración Modular
            </h3>
            <p className="text-[#E1D9C1]/80 font-light text-sm leading-relaxed font-sans">
              Arquitectura rápida, sostenible y de alta eficiencia térmica. Estructuras circulares y modulares diseñadas para convivir en equilibrio con la inmensidad árida del desierto de Paracas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Domo Geodésico Card */}
            <div className="glass-card p-6 border border-white/10 flex flex-col justify-between gap-6 bg-[#1D1714]/40 text-left">
              <div className="space-y-4">
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-stone-950 border border-white/5 shadow-md rounded-xl">
                  <AnimatePresence mode="wait">
                    {domoImages[activeDomoImg].endsWith(".mp4") ? (
                      <HoverVideo 
                        key={domoImages[activeDomoImg]}
                        src={domoImages[activeDomoImg]}
                        poster="/images/domo_ext_1.png"
                        className="absolute inset-0"
                      />
                    ) : (
                      <motion.img 
                        key={domoImages[activeDomoImg]}
                        src={domoImages[activeDomoImg]}
                        alt="Domo Geodésico"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 w-full h-full object-cover filter brightness-[1.03] contrast-[1.04]"
                      />
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Clean Thumbnails Row */}
                <div className="flex gap-1.5 justify-center">
                  {domoImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveDomoImg(idx)}
                      className={`w-9 h-9 border rounded-lg transition-all overflow-hidden relative flex items-center justify-center bg-stone-900 cursor-pointer ${
                        activeDomoImg === idx ? "border-[#E2725B] scale-105" : "border-white/10 opacity-40 hover:opacity-100"
                      }`}
                    >
                      {img.endsWith(".mp4") ? (
                        <div className="w-full h-full relative flex items-center justify-center text-[7px] font-bold text-white uppercase tracking-wider bg-[#E2725B]/20">
                          Vid
                        </div>
                      ) : (
                        <img src={img} alt="Domo thumbnail" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-[#E2725B] bg-[#E2725B]/10 px-3 py-1.5 rounded-full">
                    <Tent className="w-3.5 h-3.5" /> Aerodinámico y Estelar
                  </div>
                  <h4 className="font-display text-2xl font-bold uppercase text-white">Domo Geodésico Rústico</h4>
                  <p className="text-[12px] text-stone-300 leading-relaxed font-light font-sans">
                    Su diseño esférico ofrece una resistencia excepcional a las fuertes ráfagas de los vientos Alisios de Paracas. La geometría de domo maximiza la circulación térmica natural y permite claraboyas cenitales de gran formato para avistar las constelaciones desde la cama.
                  </p>
                </div>
              </div>

              <ul className="grid grid-cols-2 gap-2 text-[9.5px] uppercase font-bold text-[#E1D9C1]/85 border-t border-white/5 pt-4 font-sans">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#E2725B] shrink-0" /> Obra Limpia (60 Días)</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#E2725B] shrink-0" /> Control Térmico Natural</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#E2725B] shrink-0" /> Ventilación Aerodinámica</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#E2725B] shrink-0" /> Techo Cenital Vidriado</li>
              </ul>
            </div>

            {/* Casa Contenedor Card */}
            <div className="glass-card p-6 border border-white/10 flex flex-col justify-between gap-6 bg-[#1D1714]/40 text-left">
              <div className="space-y-4">
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-stone-950 border border-white/5 shadow-md rounded-xl">
                  <AnimatePresence mode="wait">
                    {containerImages[activeContImg].endsWith(".mp4") ? (
                      <HoverVideo 
                        key={containerImages[activeContImg]}
                        src={containerImages[activeContImg]}
                        poster="/media/container_1.jpeg"
                        className="absolute inset-0"
                      />
                    ) : (
                      <motion.img 
                        key={containerImages[activeContImg]}
                        src={containerImages[activeContImg]}
                        alt="Casa Contenedor Rústica"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 w-full h-full object-cover filter brightness-[1.03] contrast-[1.04]"
                      />
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Clean Thumbnails Row */}
                <div className="flex gap-1.5 justify-center">
                  {containerImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveContImg(idx)}
                      className={`w-9 h-9 border rounded-lg transition-all overflow-hidden relative flex items-center justify-center bg-stone-900 cursor-pointer ${
                        activeContImg === idx ? "border-[#E2725B] scale-105" : "border-white/10 opacity-40 hover:opacity-100"
                      }`}
                    >
                      {img.endsWith(".mp4") ? (
                        <div className="w-full h-full relative flex items-center justify-center text-[7px] font-bold text-white uppercase tracking-wider bg-[#E2725B]/20">
                          Vid
                        </div>
                      ) : (
                        <img src={img} alt="Container thumbnail" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-[#E2725B] bg-[#E2725B]/10 px-3 py-1.5 rounded-full">
                    <Container className="w-3.5 h-3.5" /> Sostenibilidad Modular
                  </div>
                  <h4 className="font-display text-2xl font-bold uppercase text-white">Villas de Contenedores Rústicos</h4>
                  <p className="text-[12px] text-stone-300 leading-relaxed font-light font-sans">
                    Módulos marítimos reutilizados con un alto estándar de aislamiento y revestimientos de madera y esteras ecológicas. Esta arquitectura modular permite ampliaciones progresivas a futuro y cuenta con techos planos rígidos ideales para albergar huertos solares individuales.
                  </p>
                </div>
              </div>

              <ul className="grid grid-cols-2 gap-2 text-[9.5px] uppercase font-bold text-[#E1D9C1]/85 border-t border-white/5 pt-4 font-sans">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#E2725B] shrink-0" /> Estructura Expandible</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#E2725B] shrink-0" /> Revestimiento Mineral</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#E2725B] shrink-0" /> Resistente al Salitre</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#E2725B] shrink-0" /> Apto para Huerto Solar</li>
              </ul>
            </div>

          </div>
        </section>

        {/* 6. PHOTO GALLERY (Upgraded with new generated renders) */}
        <section className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 text-left">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#E2725B]">Galería Digital</span>
              <h3 className="font-display text-4xl font-bold uppercase tracking-wide text-white">
                Inspiración Arquitectónica Moon
              </h3>
            </div>
            <p className="text-stone-300 font-light text-xs sm:text-sm max-w-md text-left lg:text-right font-sans">
              Renders y detalles paisajísticos de lujo que representan los acabados, alamedas y domos de tu futuro condominio desértico en Paracas.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {galleryImages.map((img, idx) => (
              <div 
                key={idx} 
                className="group relative h-[180px] bg-stone-900 overflow-hidden border border-white/5 cursor-pointer shadow-md rounded-xl"
              >
                <img 
                  src={img.src} 
                  alt={img.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 filter brightness-[1.02] contrast-[1.04]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-3.5 text-left">
                  <h5 className="font-display text-sm font-bold text-white uppercase tracking-wide leading-none mb-1">{img.title}</h5>
                  <p className="text-[9px] text-[#E1D9C1]/90 font-light leading-none font-sans">{img.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
      </div>
    </div>
  );
};
