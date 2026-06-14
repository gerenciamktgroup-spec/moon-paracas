import React, { useState, useEffect } from "react";
import { Lot } from "./types/map";
import { Header } from "./components/Header";
import MoonParacasMap from "./components/map/MoonParacasMap";
import { LotDetailsModal } from "./components/LotDetailsModal";
import { ConceptGallery } from "./components/ConceptGallery";
import { ContractsAndRules } from "./components/ContractsAndRules";
import { FinancialTimeline } from "./components/FinancialTimeline";
import { EngineeringSpecs } from "./components/EngineeringSpecs";
import { ShieldCheck, Trees, Sun, Phone, Mail, Map, Compass, HardHat, MessageSquare, Sparkles } from "lucide-react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, doc, writeBatch, updateDoc, getDocs, deleteDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { APIProvider } from "@vis.gl/react-google-maps";

const API_KEY =
  (typeof process !== 'undefined' && process.env && process.env.GOOGLE_MAPS_PLATFORM_KEY) ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<"masterplan" | "concept" | "caja-positiva" | "engineering">("masterplan");

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
    import("./lib/terrainModel").then(({ buildTerrainScene }) => {
      import("./lib/blockModel").then(({ buildBlocks }) => {
        import("./lib/lotModel").then(({ buildLots }) => {
          const terrainScene = buildTerrainScene();
          const blocks = buildBlocks(terrainScene.innerBuffer);
          const localLots = buildLots(blocks);
          
          setLots(localLots);
          setSelectedLot(localLots[0]);

          // Firebase sync bg
          getDocs(lotsCol).then(async (snap) => {
            try {
              const hasSeeded = localStorage.getItem("seeded-moon-v2");

              if (!hasSeeded || snap.empty || snap.docs.length < 100) {
                console.log("Re-seeding Firebase with Moon Paracas terrain lots...");
                const deleteBatch = writeBatch(db);
                snap.docs.forEach(d => deleteBatch.delete(d.ref));
                await deleteBatch.commit();

                const batch1 = writeBatch(db);
                const batch2 = writeBatch(db);
                localLots.forEach((lot, i) => {
                  const ref = doc(db, "lots", lot.id);
                  if (i < 200) batch1.set(ref, lot);
                  else batch2.set(ref, lot);
                });
                await batch1.commit();
                await batch2.commit();
                localStorage.setItem("seeded-moon-v2", "true");
                console.log("✅ Firebase seeded with", localLots.length, "lots.");
              } else {
                const dbLots = snap.docs.map(d => d.data() as Lot);
                if (isMounted && dbLots.length > 0) {
                  setLots(dbLots);
                  setSelectedLot(dbLots[0]);
                }
              }
            } catch (err) {}
          }).catch(() => {});
        });
      });
    });
    // Fallback sync logic inside the async chain above.

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
      // No mostramos toast — ya tenemos datos locales funcionando
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
        status: "oferta"
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
  const disponCount = lots.filter((l) => l.status === "disponible").length;

  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  if (!hasValidKey) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'sans-serif'}}>
        <div style={{textAlign:'center',maxWidth:520}}>
          <h2>Google Maps API Key Required</h2>
          <p><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener">Get an API Key</a></p>
          <p><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
          <ul style={{textAlign:'left',lineHeight:'1.8'}}>
            <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
            <li>Select <strong>Secrets</strong></li>
            <li>Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
            <li>Paste your API key as the value, press <strong>Enter</strong></li>
          </ul>
          <p>The app rebuilds automatically after you add the secret.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="min-h-screen bg-[#F4F4F1] font-sans selection:bg-[#C4A484] selection:text-[#2D3339] pb-16">
        
        {/* Premium Header */}
        <Header />

      {/* Main Container Wrapper */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 rounded-none bg-stone-900 px-5 py-4 text-sm text-white shadow-[4px_4px_0px_#C4A484] border-2 border-[#C4A484] flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#C4A484]" />
            <span className="font-bold tracking-wide">{toastMessage}</span>
          </div>
        )}

        {/* Hero Banner / Commercial Landing Title */}
        <div className="relative rounded-none border-4 border-stone-800 bg-stone-900 overflow-hidden min-h-[500px] flex items-center shadow-lg group">
          {/* Background image overlay - Elevated desert meeting the ocean */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105 opacity-80"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1682687982501-1e58f813f222?q=80&w=2600&auto=format&fit=crop")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/95 via-stone-900/80 to-transparent z-0" />
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-4xl p-8 sm:p-12 space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-none bg-[#A3B18A] border border-[#2D3339] px-4 py-2 text-xs font-bold text-[#2D3339] shadow-[2px_2px_0px_#2D3339] uppercase tracking-widest">
              <Sparkles className="h-4 w-4" /> Etapa Fundadora
            </div>
            
            <h2 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-stone-100 tracking-tighter leading-[1.05] uppercase drop-shadow-lg">
              Moon Paracas. <br className="hidden sm:block" />
              <span className="text-[#A3B18A] font-light tracking-tight">Tu refugio privado en lo alto del oasis.</span>
            </h2>
            
            <p className="text-sm md:text-lg text-stone-300 leading-relaxed max-w-2xl border-l-4 border-[#E15A42] pl-5 opacity-95">
              Un eco-condominio diseñado para la desconexión total sobre el tablazo de Paracas. <strong>Arquitectura sostenible, cero contaminación vehicular interna, y seguridad antisísmica comprobada.</strong> Descubre nuestro modelo de Caja Positiva.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setActiveTab("masterplan")}
                className="inline-flex items-center justify-center gap-2 bg-[#E15A42] hover:bg-[#c94d36] text-white border-2 border-transparent font-bold text-sm px-6 py-4 rounded-none uppercase tracking-widest shadow-[4px_4px_0px_#2D3339] active:translate-y-1 active:shadow-[0px_0px_0px_#2D3339] transition-all"
              >
                <Map className="h-5 w-5" /> Explorar Masterplan
              </button>
              <button 
                onClick={() => setActiveTab("caja-positiva")}
                className="inline-flex items-center justify-center gap-2 bg-stone-800/50 backdrop-blur-sm hover:bg-stone-800 text-[#EBEBE5] border-2 border-[#EBEBE5]/20 hover:border-[#EBEBE5] font-bold text-sm px-6 py-4 rounded-none uppercase tracking-widest transition-all"
              >
                <HardHat className="h-5 w-5" /> Ver Modelo Caja Positiva
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

        {/* Tab Navigation (To reduce vertical saturation) */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 border-b border-[#2D3339]/20 pb-0 mt-4 mb-8">
          <button
            onClick={() => setActiveTab("masterplan")}
            className={`px-5 py-4 font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors flex items-center gap-2 border-b-4 ${
              activeTab === "masterplan" 
                ? "text-[#2D3339] border-[#2D3339]" 
                : "text-stone-400 hover:text-stone-600 border-transparent"
            }`}
          >
            <Map className="h-4 w-4" /> Masterplan & Inventario
          </button>
          
          <button
            onClick={() => setActiveTab("caja-positiva")}
            className={`px-5 py-4 font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors flex items-center gap-2 border-b-4 ${
              activeTab === "caja-positiva" 
                ? "text-[#2D3339] border-[#2D3339]" 
                : "text-stone-400 hover:text-stone-600 border-transparent"
            }`}
          >
            <HardHat className="h-4 w-4" /> Modelo Caja Positiva
          </button>

          <button
            onClick={() => setActiveTab("engineering")}
            className={`px-5 py-4 font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors flex items-center gap-2 border-b-4 ${
              activeTab === "engineering" 
                ? "text-[#2D3339] border-[#2D3339]" 
                : "text-stone-400 hover:text-stone-600 border-transparent"
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Seguridad e Ingeniería
          </button>
          
          <button
            onClick={() => setActiveTab("concept")}
            className={`px-5 py-4 font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors flex items-center gap-2 border-b-4 ${
              activeTab === "concept" 
                ? "text-[#2D3339] border-[#2D3339]" 
                : "text-stone-400 hover:text-stone-600 border-transparent"
            }`}
          >
            <Sparkles className="h-4 w-4" /> Galería de Concepto
          </button>
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
                <MoonParacasMap />
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

          {activeTab === "caja-positiva" && (
            <motion.div
              key="caja-positiva-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <FinancialTimeline />
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
        </AnimatePresence>

        {/* CONTACT US FORM (Inspired directly by the reference website layout) */}
        <div id="contact-form" className="rounded-none border-4 border-[#2D3339] bg-white p-6 sm:p-8 shadow-lg space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-sans text-sm font-black tracking-widest text-[#8C905C] uppercase">
              COTIZA TU LOTE DE CAMPO Y PLAYA
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
                        ? `Lote ${selectedLot.number} - ${selectedLot.quadrant} (${selectedLot.area} m² - S/ ${selectedLot.price.toLocaleString()})`
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
    </APIProvider>
  );
}
