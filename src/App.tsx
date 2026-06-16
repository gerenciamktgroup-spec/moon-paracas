import React, { useState, useEffect } from "react";
import { Lot } from "./types/map";
import { Header } from "./components/Header";
import MoonParacasMap from "./components/map/MoonParacasMap";
import { LotDetailsModal } from "./components/LotDetailsModal";
import { ConceptGallery } from "./components/ConceptGallery";
import { LifestyleAmenities } from "./components/LifestyleAmenities";
import { EngineeringSpecs } from "./components/EngineeringSpecs";
import { ContractsSignature } from "./components/ContractsSignature";
import { ParacasHistory } from "./components/ParacasHistory";
import { ArchitecturalRecommendations } from "./components/ArchitecturalRecommendations";
import { ShieldCheck, Trees, Phone, Mail, Map, Compass, HardHat, MessageSquare, Sparkles, Lock, BookOpen, Home } from "lucide-react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, doc, writeBatch, updateDoc, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";

// Model imports
import { buildTerrainScene, getMeterToSvgScale } from "./lib/terrainModel";
import { buildBlocks } from "./lib/blockModel";
import { buildLots, buildParkingLots } from "./lib/lotModel";
import { buildAmenities } from "./lib/amenityModel";
import { buildRoads } from "./lib/roadModel";
import { roadToPolygon } from "./lib/geometry";
import { checkCollision } from "./lib/spatialAnalyzer";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<"masterplan" | "concept" | "lifestyle" | "engineering" | "signature" | "history" | "architecture">("masterplan");

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // We no longer block loading since it's a public web
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Initialize and sync lots with Firestore
  useEffect(() => {
    let isMounted = true;
    const lotsCol = collection(db, "lots");

    // ── PASO 1: Carga INMEDIATA desde el generador local ──────────────────
    const terrainScene = buildTerrainScene();
    const scale = getMeterToSvgScale();
    const blocks = buildBlocks(terrainScene.innerBuffer);
    const roads = buildRoads(terrainScene.innerBuffer);
    const amenities = buildAmenities(terrainScene.innerBuffer);
    
    // Convert roads to polygons for collision detection
    const roadPolys = roads.map(r => roadToPolygon(r.path, r.widthM, scale));
    
    const obstacles = [
      ...blocks.map((b: any) => b.polygon),
      ...amenities.map((a: any) => a.polygon),
      ...roadPolys
    ];
    
    // Build parking lots, avoiding blocks, amenities, and roads
    const parkings = buildParkingLots(terrainScene.innerBuffer, obstacles);
    const localLots = buildLots(blocks, parkings);
    
    // Filter out lots that overlap with buildings (exclude sand-plaza/Oasis)
    const activeBuildings = amenities
      .filter((a: any) => a.id !== "A_SAND" && a.kind !== "sand-plaza")
      .map((a: any) => a.polygon);
    const cleanLocalLots = localLots.filter(l => !checkCollision(l.polygon, activeBuildings, 0.1));
    
    const allLots = [...cleanLocalLots, ...parkings];
    
    setLots(allLots);
    setSelectedLot(allLots[0]);

    // Firebase sync bg
    getDocs(lotsCol).then(async (snap) => {
      try {
        const hasSeeded = localStorage.getItem("seeded-moon-v30");

        if (!hasSeeded || snap.empty || snap.docs.length < 100) {
          console.log("Re-seeding Firebase with Moon Paracas terrain lots...");
          const deleteBatch = writeBatch(db);
          snap.docs.forEach(d => deleteBatch.delete(d.ref));
          await deleteBatch.commit();

          const batch1 = writeBatch(db);
          const batch2 = writeBatch(db);
          allLots.forEach((lot, i) => {
            const ref = doc(db, "lots", lot.id);
            if (i < 250) batch1.set(ref, lot);
            else batch2.set(ref, lot);
          });
          await batch1.commit();
          await batch2.commit();
          localStorage.setItem("seeded-moon-v30", "true");
          console.log("✅ Firebase seeded with", allLots.length, "lots.");
        } else {
          const dbLots = snap.docs.map(d => d.data() as Lot);
          if (isMounted && dbLots.length > 0) {
            setLots(dbLots);
            setSelectedLot(prev => {
              const updated = dbLots.find(l => l.id === prev?.id);
              return updated ?? dbLots[0];
            });
          }
        }
      } catch (err) {}
    }).catch(() => {});

    // ── PASO 3: Escuchar cambios en tiempo real (reservas, estados) ───────
    const unsubscribe = onSnapshot(lotsCol, (snapshot) => {
      const dbLots = snapshot.docs.map(d => d.data() as Lot);
      if (isMounted && dbLots.length > 50) {
        // Sólo reemplazamos si Firebase tiene suficientes lotes
        setLots(dbLots);
        setSelectedLot(prev => {
          const updated = dbLots.find(l => l.id === prev?.id);
          return updated ?? dbLots[0];
        });
      }
    }, (error) => {
      console.warn("Firestore listener error:", error.message);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update lot status when user clicks "Reservar" (Firestore sync)
  const handleReserveLot = async (lotId: string) => {
    try {
      const lotRef = doc(db, "lots", lotId);
      await updateDoc(lotRef, {
        status: "offer"
      });
      setToastMessage(`¡Éxito! El lote ${lotId.split("-")[1]} ha sido pre-reservado con S/ 1,000 en garantía.`);
      setTimeout(() => {
        setToastMessage(null);
      }, 5500);
    } catch (e) {
      console.error(e);
      setToastMessage("Error al reservar el lote. Intenta nuevamente.");
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Helper metrics for overall dashboard counters
  const disponCount = lots.filter((l) => l.status === "available").length;

  return (
    <>
      <div className="min-h-[100dvh] bg-[#F4F4F1] font-sans selection:bg-[#C4A484] selection:text-[#2D3339] pb-16">
        
        {/* Premium Header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container Wrapper */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 rounded-none bg-stone-900 px-5 py-4 text-sm text-white shadow-[4px_4px_0px_#C4A484] border-2 border-[#C4A484] flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#C4A484]" />
            <span className="font-bold tracking-wide">{toastMessage}</span>
          </div>
        )}

        {/* Modern Luxury Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden min-h-[500px] sm:min-h-[600px] flex items-end shadow-2xl group mb-8 border border-stone-200/50">
          {/* Background image - fully visible */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1682687982501-1e58f813f222?q=80&w=2600&auto=format&fit=crop")' }}
          />
          {/* Elegant gradient overlay - dark at bottom for text readability, fully transparent at top */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent z-0" />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full p-6 sm:p-12 lg:p-16 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8"
          >
            {/* Title Section */}
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#C4A484]/20 backdrop-blur-md border border-[#C4A484]/50 px-4 py-1.5 text-xs font-bold text-[#F4F4F1] uppercase tracking-widest shadow-lg">
                <Sparkles className="h-4 w-4" /> Etapa Fundadora
              </div>
              
              <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tighter leading-[1.05] uppercase drop-shadow-md">
                Moon Paracas. <br />
                <span className="text-[#C4A484] font-light">Refugio en el oasis.</span>
              </h2>
            </div>

            {/* Glassmorphism Info Card */}
            <div className="max-w-md bg-stone-900/30 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl">
              <p className="text-sm sm:text-base text-stone-200 leading-relaxed mb-6 font-light">
                Un eco-condominio diseñado para la desconexión total sobre el tablazo de Paracas. <strong className="text-white font-medium">Arquitectura sostenible de adobe y terracota, cero contaminación vehicular, y seguridad absoluta.</strong>
              </p>
              
              <button 
                onClick={() => setActiveTab("masterplan")}
                className="group flex items-center justify-between w-full bg-white hover:bg-[#C4A484] text-stone-900 px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 shadow-md"
              >
                <span>Descubrir Masterplan</span>
                <Map className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Quick numbers tracker bar (Marketing style) */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-8 pb-4 text-center">
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#2D3339]">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Precios desde</p>
            <p className="font-display font-black text-[#2D3339] text-2xl sm:text-3xl">S/ 12,000</p>
          </div>
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#2D3339]">
            <p className="text-xs font-bold text-[#A3B18A] uppercase tracking-widest mb-1.5">Lotes Disponibles</p>
            <p className="font-display font-black text-[#A3B18A] text-2xl sm:text-3xl">{disponCount}</p>
          </div>
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#2D3339]">
            <p className="text-xs font-bold text-[#E0B084] uppercase tracking-widest mb-1.5">Fases en Preventa</p>
            <p className="font-display font-black text-[#E0B084] text-2xl sm:text-3xl">5</p>
          </div>
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#2D3339]">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Financiamiento Directo</p>
            <p className="font-display font-black text-[#2D3339] text-lg sm:text-xl">
              0% Interés - 18 Meses
            </p>
          </div>
        </div>



        {/* Dynamic Content based on tabs */}
        <AnimatePresence mode="wait">
          {activeTab === "masterplan" && (
            <motion.div
              key="masterplan-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-12"
            >
              <div className="w-full">
                <MoonParacasMap
                  lots={lots}
                  selectedLot={selectedLot}
                  onSelectLot={setSelectedLot}
                />
              </div>

              {/* Interactive Lot Details & Payment Simulator (Centered below) */}
              <div id="financial-model" className="w-full max-w-2xl mx-auto space-y-6 scroll-mt-24">
                <div className="text-center space-y-2 mb-4">
                   <h2 className="font-display text-2xl font-black text-[#2D3339] uppercase tracking-wider">Simulador de Financiamiento</h2>
                   <p className="text-stone-500 font-mono text-sm max-w-lg mx-auto">Verifica las cuotas y planes de pago directo del lote actualmente seleccionado en el masterplan superior.</p>
                </div>
                <LotDetailsModal
                  lot={selectedLot}
                  onReserve={handleReserveLot}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "concept" && (
            <motion.div
              key="concept-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Architectural Concept Hotspot gallery matching AI photos */}
              <ConceptGallery />
            </motion.div>
          )}

          {activeTab === "lifestyle" && (
            <motion.div
              key="lifestyle-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <LifestyleAmenities />
            </motion.div>
          )}

          {activeTab === "engineering" && (
            <motion.div
              key="engineering-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <EngineeringSpecs />
            </motion.div>
          )}

          {activeTab === "signature" && (
            <motion.div
              key="signature-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ContractsSignature 
                selectedLot={selectedLot}
                onSignatureSuccess={(msg) => {
                  setToastMessage(msg);
                  setTimeout(() => setToastMessage(null), 5500);
                }}
              />
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ParacasHistory />
            </motion.div>
          )}

          {activeTab === "architecture" && (
            <motion.div
              key="architecture-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ArchitecturalRecommendations />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTACT US FORM (Inspired directly by the reference website layout) */}
        <div id="contact-form" className="rounded-none border-4 border-[#2D3339] bg-white p-6 sm:p-8 shadow-lg space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-sans text-sm font-black tracking-widest text-[#8C905C] uppercase">
              COTIZA TU LOTE DE CAMPO RÚSTICO DE LUJO
            </h2>
            <h3 className="font-display text-3xl sm:text-4xl font-black text-[#2D3339] tracking-tight uppercase">
              CONTÁCTANOS
            </h3>
            <p className="text-sm text-stone-600">
              Déjanos tus datos y un asesor especializado de Moon Paracas se pondrá en contacto contigo lo más pronto posible para agendar una visita al desierto.
            </p>
          </div>

          {formSubmitted ? (
            <div className="border-4 border-dashed border-[#8C905C] bg-[#8C905C]/5 p-8 text-center space-y-4 max-w-xl mx-auto animate-fade-in font-mono">
              <span className="text-4xl text-[#8C905C]">🏜️</span>
              <h4 className="font-bold text-lg text-[#2D3339] uppercase tracking-wide">¡Solicitud Registrada con Éxito!</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Gracias, <strong>{contactName}</strong>. Hemos pre-registrado tu interés en el <strong>Lote {selectedLot?.id || "en consulta"}</strong>. Un arquitecto-promotor te enviará los planos catastrales oficiales y el reglamento por correo a <em>{contactEmail}</em> o vía WhatsApp al <em>{contactPhone}</em>.
              </p>
              <button
                onClick={() => {
                  setFormSubmitted(false);
                  setContactName("");
                  setContactEmail("");
                  setContactPhone("");
                  setContactMessage("");
                }}
                className="mt-2 rounded-none bg-[#2D3339] text-white border-2 border-[#2D3339] px-5 py-2 text-xs font-bold font-mono tracking-wider hover:bg-stone-800"
              >
                REGISTRAR OTRA CONSULTA
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!contactName || !contactPhone || !contactEmail) {
                  setToastMessage("Por favor rellena todos los campos obligatorios (*).");
                  setTimeout(() => setToastMessage(null), 3000);
                  return;
                }
                setFormSubmitted(true);
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto font-mono text-xs"
            >
              {/* Left Column Fields */}
              <div className="space-y-3 text-[#2D3339]">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-stone-500 tracking-wider flex justify-between">
                    <span>Nombre Completo *</span>
                    <span className="text-[9px] text-[#8C905C] italic">Requerido</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-none border-2 border-[#2D3339] px-3.5 py-2 hover:bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8C905C] transition-colors"
                    placeholder="Ej. Carlos Mendoza Quiroz"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-stone-500 tracking-wider flex justify-between">
                    <span>WhatsApp / Celular *</span>
                    <span className="text-[9px] text-[#8C905C]">Prefijo Perú: +51</span>
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full rounded-none border-2 border-[#2D3339] px-3.5 py-2 hover:bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8C905C] transition-colors"
                    placeholder="Ej. +51 987 654 321"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-stone-500 tracking-wider">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-none border-2 border-[#2D3339] px-3.5 py-2 hover:bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8C905C] transition-colors"
                    placeholder="Ej. carlos.mendoza@gmail.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column Fields */}
              <div className="space-y-3 flex flex-col justify-between text-[#2D3339]">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-stone-500 tracking-wider">Lote de Interés (Auto-seleccionado)</label>
                  <input
                    type="text"
                    disabled
                    className="w-full rounded-none border-2 border-[#2D3339] px-3.5 py-2 bg-[#F4F4F1] font-bold text-[#8C905C]"
                    value={
                      selectedLot 
                        ? `Lote ${selectedLot.number} - ${selectedLot.quadrant} (${selectedLot.area.toFixed(2)} m² - S/ ${selectedLot.price.toLocaleString('es-PE', {maximumFractionDigits: 0})})`
                        : "Ningún lote seleccionado en el plano"
                    }
                  />
                </div>

                <div className="space-y-1 flex-1 flex flex-col">
                  <label className="font-bold uppercase text-[10px] text-stone-500 tracking-wider">Mensaje de Consulta</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-none border-2 border-[#2D3339] px-3.5 py-2 hover:bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8C905C] flex-1 min-h-[90px] transition-colors text-[#2D3339]"
                    placeholder="Deseo coordinar una videollamada para revisar el cronograma de financiamiento de mi lote y verificar de áreas comunes..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </div>
              </div>

              {/* Form submit & secondary direct whatsapp trigger */}
              <div className="md:col-span-2 pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#8C905C] border-2 border-[#2D3339] text-white font-bold text-xs py-3.5 px-6 uppercase tracking-widest hover:bg-[#7a7e4e] transition-all shadow-[3px_3px_0px_#2D3339] active:translate-y-0.5 active:shadow-[1px_1px_0px_#2D3339]"
                >
                  ENVIAR SOLICITUD A LA ASOCIACIÓN
                </button>
                
                {selectedLot && (
                  <a
                    href={`https://wa.me/51987654321?text=Hola!%20Deseo%20cotizar%20el%20lote%20${selectedLot.id}%20con%20m2%20de%20${selectedLot.area}%20de%20área.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#00E676] hover:bg-[#00C853] text-[#2D3339] font-bold text-xs py-3.5 px-6 border-2 border-[#2D3339] flex items-center justify-center gap-2 transition-all shadow-[3px_3px_0px_#2D3339] active:translate-y-0.5 active:shadow-[1px_1px_0px_#2D3339]"
                  >
                    <MessageSquare className="h-4.5 w-4.5 fill-current" />
                    CHATEAR POR WHATSAPP AHORA
                  </a>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Technical Map references guide card */}
        <div className="rounded-none border-4 border-[#2D3339] bg-[#2D3339] p-6 text-stone-100 shadow-lg space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-[#C4A484]/10 to-transparent pointer-events-none rounded-none" />
          <div className="space-y-2">
            <h3 className="font-mono text-sm font-bold text-[#C4A484] uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-5 w-5 text-[#C4A484]" />
              Sustentación de Altura y Nivel Topográfico (PT-01)
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed font-mono max-w-4xl">
              El Lote Matriz del condominio reporta una gradiente altimétrica que oscila desde los <strong>106.5m s.n.m.</strong> en la zona sur (pórtico de ingreso Atardecer) hasta los <strong>113.5m s.n.m.</strong> en el extremo norte (Sectores altos de El Mirador). El diseño vial concéntrico del Oasis respeta a cabalidad las líneas naturales de contorno, evitando movimientos de tierra agresivos que alteren el ecosistema de dunas y asegurando que el 94% de los lotes retengan vistas despejadas horizontales.
            </p>
          </div>
        </div>

      </main>

      {/* Luxury Footer with contacts info mimicking real agency landing page */}
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 border-t-2 border-[#2D3339]/20 mt-16 pt-8 text-stone-500 text-xs font-mono">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trees className="h-5 w-5 text-[#6B8E23]" />
            <div>
              <p className="font-mono font-bold text-[#2D3339] uppercase">MOON PARACAS</p>
              <p className="text-[10px] text-stone-500">© 2026 Asociación Civil de Adjudicatarios Moon Paracas · Ica, Perú.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-stone-500 text-[11px]">
            <span className="flex items-center gap-1.5 hover:text-[#2D3339] cursor-pointer">
              <Phone className="h-3.5 w-3.5 text-[#C4A484]" /> +51 987 654 321
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#2D3339] cursor-pointer">
              <Mail className="h-3.5 w-3.5 text-[#C4A484]" /> info@moonparacas-eco.pe
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#2D3339] cursor-pointer">
              <Map className="h-3.5 w-3.5 text-[#6B8E23]" /> Paracas, Km 245 Panamericana Sur
            </span>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
