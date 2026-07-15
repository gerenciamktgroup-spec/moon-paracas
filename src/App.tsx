import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Lot } from "./types/map";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ShieldCheck, Calculator } from "lucide-react";
import { StardustEffect } from "./components/StardustEffect";
import { auth, db } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, doc, writeBatch, updateDoc, getDocs, addDoc } from "firebase/firestore";

// Model imports
import { buildTerrainScene, getMeterToSvgScale } from "./lib/terrainModel";
import { buildBlocks } from "./lib/blockModel";
import { buildLots, buildParkingLots } from "./lib/lotModel";
import { buildAmenities } from "./lib/amenityModel";
import { buildRoads } from "./lib/roadModel";
import { roadToPolygon } from "./lib/geometry";
import { checkCollision } from "./lib/spatialAnalyzer";
import { buildDomeScene } from "./lib/domeModel";

// Pages
import { Home } from "./pages/Home";
import { Simulator } from "./pages/Simulator";
import { Technical } from "./pages/Technical";
import { Experience } from "./pages/Experience";
import { Gallery } from "./pages/Gallery";
import { ParacasDome } from "./pages/ParacasDome";
import { ParacasDomeAdmin } from "./pages/ParacasDomeAdmin";
import { Comisiones } from "./pages/Comisiones";

// Auth Screen placeholder for Admin path
import { AuthScreen } from "./components/AuthScreen";

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Moon Paracas Lot state
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  
  // Paracas Dome Lot state
  const [domeLots, setDomeLots] = useState<Lot[]>([]);
  const [selectedDomeLot, setSelectedDomeLot] = useState<Lot | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Background atmospheres videos state for Home Page
  const [activeVideoIdx, setActiveVideoIdx] = useState(1); // default index 1: Vuelo Estelar HD
  const [isBgPaused, setIsBgPaused] = useState(false);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  const videos = [
    { id: "celestial_fast", src: "/media/water_mirror.mp4", label: "Noche Estelar" },
    { id: "celestial_hi", src: "/media/hero_bg.mp4", label: "Vuelo Estelar HD" },
    { id: "oasis", src: "/media/pool_pan.mp4", label: "El Oasis Central" },
    { id: "domos", src: "/media/Desert_geodesic_domes_at_sunset_202606230037.mp4", label: "Eco-Domos Sunset" },
    { id: "suite", src: "/media/sunrise_bed.mp4", label: "Suite Estelar" },
    { id: "fogon", src: "/media/firepit.mp4", label: "Fogón Místico" }
  ];

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync and seed Moon Paracas lots
  useEffect(() => {
    let isMounted = true;
    const lotsCol = collection(db, "lots");

    // 1. Local generation for instant UI responsiveness
    const terrainScene = buildTerrainScene();
    const scale = getMeterToSvgScale();
    const blocks = buildBlocks(terrainScene.innerBuffer);
    const roads = buildRoads(terrainScene.innerBuffer);
    const amenities = buildAmenities(terrainScene.innerBuffer);
    const roadPolys = roads.map(r => roadToPolygon(r.path, r.widthM, scale));
    
    // Cul de sacs
    function circleToPolygon(center: { x: number; y: number }, radiusM: number, scale: number): any[] {
      const poly: any[] = [];
      const points = 12;
      const r = radiusM * scale;
      for (let i = 0; i < points; i++) {
        const angle = (i * 2 * Math.PI) / points;
        poly.push({
          x: center.x + r * Math.cos(angle),
          y: center.y + r * Math.sin(angle)
        });
      }
      return poly;
    }
    const culDeSacs: any[][] = [];
    roads.forEach(r => {
      if (r.id.startsWith("LINEAR_ROAD")) {
        culDeSacs.push(circleToPolygon(r.path[0], 6.0, scale));
      }
    });

    const activeBuildings = [
      ...amenities
        .filter((a: any) => a.id !== "A_SAND" && a.kind !== "sand-plaza")
        .map((a: any) => a.polygon),
      ...culDeSacs,
      ...roadPolys
    ];
    
    const parkings = buildParkingLots(terrainScene.innerBuffer, activeBuildings);
    const cleanLocalLots = buildLots(blocks, parkings, roadPolys, activeBuildings);
    const allLots = [...cleanLocalLots, ...parkings];

    if (isMounted) {
      setLots(allLots);
      setSelectedLot(allLots[0]);
    }

    // 2. Firebase seeding & real-time sync
    getDocs(lotsCol).then(async (snap) => {
      try {
        const hasSeeded = localStorage.getItem("seeded-moon-v36");
        if (!hasSeeded || snap.empty || snap.docs.length < 100) {
          const deleteBatch = writeBatch(db);
          snap.docs.forEach(d => deleteBatch.delete(d.ref));
          await deleteBatch.commit();

          const batch1 = writeBatch(db);
          const batch2 = writeBatch(db);
          const batch3 = writeBatch(db);
          
          allLots.forEach((lot, i) => {
            const ref = doc(db, "lots", lot.id);
            if (i < 150) batch1.set(ref, lot);
            else if (i < 300) batch2.set(ref, lot);
            else batch3.set(ref, lot);
          });
          await batch1.commit();
          await batch2.commit();
          await batch3.commit();
          localStorage.setItem("seeded-moon-v36", "true");
          console.log("Firebase seeded successfully with Moon Paracas lots");
        } else {
          const dbLots = snap.docs.map(d => d.data() as Lot);
          if (isMounted && dbLots.length > 0) {
            setLots(dbLots);
            setSelectedLot(prev => dbLots.find(l => l.id === prev?.id) || dbLots[0]);
          }
        }
      } catch (err) {
        console.error("Error seeding Moon Paracas:", err);
      }
    }).catch(console.error);

    const unsubscribe = onSnapshot(lotsCol, (snapshot) => {
      const dbLots = snapshot.docs.map(d => d.data() as Lot);
      if (isMounted && dbLots.length > 50) {
        setLots(dbLots);
        setSelectedLot(prev => dbLots.find(l => l.id === prev?.id) || dbLots[0]);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sync and seed Paracas Dome lots
  useEffect(() => {
    let isMounted = true;
    const domeLotsCol = collection(db, "dome_lots");

    // 1. Build Dome lots locally
    const domeScene = buildDomeScene();
    if (isMounted) {
      setDomeLots(domeScene.lots);
      setSelectedDomeLot(domeScene.lots[0]);
    }

    // 2. Firebase seeding & real-time sync
    getDocs(domeLotsCol).then(async (snap) => {
      try {
        const hasSeeded = localStorage.getItem("seeded-dome-v3");
        if (!hasSeeded || snap.empty || snap.docs.length < 30) {
          const deleteBatch = writeBatch(db);
          snap.docs.forEach(d => deleteBatch.delete(d.ref));
          await deleteBatch.commit();

          const batch = writeBatch(db);
          domeScene.lots.forEach((lot) => {
            const ref = doc(db, "dome_lots", lot.id);
            batch.set(ref, lot);
          });
          await batch.commit();
          localStorage.setItem("seeded-dome-v3", "true");
          console.log("Firebase seeded successfully with Paracas Dome lots");
        } else {
          const dbLots = snap.docs.map(d => d.data() as Lot);
          if (isMounted && dbLots.length > 0) {
            setDomeLots(dbLots);
            setSelectedDomeLot(prev => dbLots.find(l => l.id === prev?.id) || dbLots[0]);
          }
        }
      } catch (err) {
        console.error("Error seeding Dome Lots:", err);
      }
    }).catch(console.error);

    const unsubscribe = onSnapshot(domeLotsCol, (snapshot) => {
      const dbLots = snapshot.docs.map(d => d.data() as Lot);
      if (isMounted && dbLots.length > 10) {
        setDomeLots(dbLots);
        setSelectedDomeLot(prev => dbLots.find(l => l.id === prev?.id) || dbLots[0]);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // MercadoPago Checkout / Reservation handler
  const handleReserveLot = async (
    lotId: string, 
    clientData?: { 
      name: string; 
      dni: string; 
      email: string; 
      phone: string;
      monthlyAmount: number;
      installmentsCount: number;
      isCash: boolean;
      offerId?: string;
      offerName?: string;
      totalPrice?: number;
      addOnsTotal?: number;
      addOnIds?: string[];
      downPaymentPercent?: number;
    }
  ) => {
    try {
      if (!clientData) {
        // Direct pre-reservation block
        const isDome = lotId.startsWith("D-");
        const lotRef = doc(db, isDome ? "dome_lots" : "lots", lotId);
        await updateDoc(lotRef, { status: "offer" });
        setToastMessage(`¡Éxito! El lote ${lotId} ha sido bloqueado provisionalmente.`);
        setTimeout(() => setToastMessage(null), 5000);
        return;
      }

      // Real MP Payment integration
      const reservationId = "RES-" + Math.random().toString(36).substr(2, 9).toUpperCase();

      // Create modal container
      const overlay = document.createElement("div");
      overlay.id = "mp-payment-overlay";
      overlay.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-[#0A0807]/90 backdrop-blur-md p-4";
      
      const container = document.createElement("div");
      container.className = "w-full max-w-md bg-[#16110F] border border-[#F5F2EB]/15 p-6 rounded-2xl shadow-2xl relative font-sans text-center text-[#F5F2EB]";
      
      const title = document.createElement("h3");
      title.className = "font-display text-2xl font-bold text-white mb-2 uppercase tracking-wider";
      title.innerText = "Garantía de Reserva";
      
      const desc = document.createElement("p");
      desc.className = "text-xs text-stone-400 mb-6 leading-relaxed";
      desc.innerText = `Paga S/ 1,000 de forma segura para reservar el lote ${lotId.replace("D-", "Dome ").replace("LOTE-", "")}`;
      
      const closeBtn = document.createElement("button");
      closeBtn.className = "absolute top-4 right-4 text-stone-500 hover:text-white cursor-pointer text-xl font-bold transition-colors";
      closeBtn.innerHTML = "&times;";
      closeBtn.onclick = () => {
        overlay.remove();
      };
      
      const brickDiv = document.createElement("div");
      brickDiv.id = "paymentCardBrick_container";
      
      container.appendChild(closeBtn);
      container.appendChild(title);
      container.appendChild(desc);
      container.appendChild(brickDiv);
      overlay.appendChild(container);
      document.body.appendChild(overlay);

      // Initialize MercadoPago
      // @ts-ignore
      const mp = new window.MercadoPago("APP_USR-efc7d7c6-7a9b-432d-8b0f-870bfb0fefb8"); // sandbox public key
      const bricksBuilder = mp.bricks();
      
      await bricksBuilder.create("cardPayment", "paymentCardBrick_container", {
        initialization: {
          amount: 1000,
          payer: {
            email: clientData.email,
          },
        },
        customization: {
          visual: {
            style: {
              theme: "dark",
            },
          },
        },
        callbacks: {
          onReady: () => {
            console.log("Card Brick ready");
          },
          onSubmit: async (formData: any) => {
            try {
              if (formData.payer) {
                formData.payer.first_name = clientData.name.split(" ")[0];
                formData.payer.last_name = clientData.name.split(" ").slice(1).join(" ") || clientData.name;
                formData.payer.email = clientData.email;
                if (!formData.payer.identification) {
                  formData.payer.identification = {};
                }
                formData.payer.identification.type = "DNI";
                formData.payer.identification.number = clientData.dni;
              }

              const payResponse = await fetch("/api/process-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Idempotency-Key": reservationId },
                body: JSON.stringify({
                  paymentData: formData,
                  reservationId,
                  lotId,
                  clientName: clientData.name
                })
              });
              
              const payData = await payResponse.json();
              
              if (payData.status === "approved") {
                overlay.remove();
                
                // Update Firestore
                const isDome = lotId.startsWith("D-");
                const lotRef = doc(db, isDome ? "dome_lots" : "lots", lotId);
                await updateDoc(lotRef, { status: "reserved" });
                
                // Save Reservation log
                await addDoc(collection(db, "reservations"), {
                  lotId,
                  proyecto: isDome ? "Paracas Dome" : "Moon Paracas",
                  clienteName: clientData.name,
                  montoSeparacion: 1000,
                  fecha: new Date().toISOString(),
                  status: "paid",
                  originalEstado: "Disponible",
                  clientDni: clientData.dni,
                  clientEmail: clientData.email,
                  clientPhone: clientData.phone,
                  monthlyAmount: clientData.monthlyAmount,
                  installmentsCount: clientData.installmentsCount,
                  isCash: clientData.isCash,
                  offerId: clientData.offerId || "",
                  offerName: clientData.offerName || "",
                  totalPrice: clientData.totalPrice || 0,
                  addOnsTotal: clientData.addOnsTotal || 0,
                  addOnIds: clientData.addOnIds || [],
                  downPaymentPercent: clientData.downPaymentPercent || 0,
                  mpPaymentId: payData.id
                });
                
                const lotLabel = isDome ? lotId.replace("D-", "Dome ") : lotId.replace("LOTE-", "");
                setToastMessage(`✅ ¡Reserva Exitosa! El Lote ${lotLabel} ha sido adjudicado.`);
                setTimeout(() => setToastMessage(null), 8000);
              } else {
                throw new Error(payData.status_detail || "Pago rechazado. Intenta con otra tarjeta.");
              }
            } catch (err: any) {
              console.error("Payment error:", err);
              alert("Error de pago: " + (err.message || err));
            }
          },
          onError: (error: any) => {
            console.error("Card Brick error:", error);
          }
        }
      });
    } catch (e: any) {
      console.error(e);
      setToastMessage(e.message || "Error al inicializar la pasarela de reservas.");
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-[100dvh] font-sans selection:bg-[#D95D39] selection:text-white flex flex-col relative overflow-hidden bg-[#0A0807]">
        
        {/* Global Dynamic Background Video Layer */}
        <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
          <video
            ref={bgVideoRef}
            key={activeVideoIdx}
            src={videos[activeVideoIdx].src}
            className="absolute inset-0 w-full h-full object-cover opacity-[0.32] transition-opacity duration-700"
            autoPlay={!isBgPaused}
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0807] via-transparent to-[#0A0807] opacity-90 z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3A2E26]/30 via-[#0A0807]/75 to-[#0A0807] opacity-95 z-0" />
        </div>

        {/* Interactive Stardust Cursor Trail */}
        <StardustEffect />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-stone-900 px-5 py-4 text-sm text-white border border-[#F5F2EB]/15 flex items-center gap-3 shadow-2xl animate-fade-in">
              <ShieldCheck className="h-5 w-5 text-[#D95D39]" />
              <span className="font-bold tracking-wide">{toastMessage}</span>
            </div>
          )}

          <main className="flex-1 relative z-10">
            <Routes>
              <Route path="/" element={
                <Home 
                  activeVideoIdx={activeVideoIdx} 
                  setActiveVideoIdx={setActiveVideoIdx} 
                  isBgPaused={isBgPaused} 
                  setIsBgPaused={setIsBgPaused} 
                />
              } />
              
              <Route path="/simulador" element={
                <Simulator 
                  lots={lots} 
                  selectedLot={selectedLot} 
                  setSelectedLot={setSelectedLot} 
                  handleReserveLot={handleReserveLot} 
                />
              } />
              
              <Route path="/paracas-dome/*" element={
                <ParacasDome 
                  lots={domeLots} 
                  selectedLot={selectedDomeLot} 
                  setSelectedLot={setSelectedDomeLot} 
                  handleReserveLot={handleReserveLot} 
                />
              } />
              
              <Route path="/admin/paracas-dome/*" element={
                loading ? (
                  <div className="min-h-[70vh] flex items-center justify-center text-[#F5F2EB] font-bold uppercase tracking-widest text-xs">
                    Cargando panel interno...
                  </div>
                ) : user ? (
                  <ParacasDomeAdmin lots={domeLots} />
                ) : (
                  <AuthScreen />
                )
              } />
              
              <Route path="/comisiones" element={<Comisiones />} />
              <Route path="/galeria" element={<Gallery />} />
              <Route path="/experiencia" element={<Experience />} />
              <Route path="/tecnica" element={
                <Technical 
                  selectedLot={selectedLot} 
                  onSignatureSuccess={(msg) => {
                    setToastMessage(msg);
                    setTimeout(() => setToastMessage(null), 5500);
                  }} 
                />
              } />
            </Routes>
          </main>

          {/* Global Footer (Contáctanos) */}
          <Footer selectedLot={selectedLot} />
        </div>
      </div>
    </BrowserRouter>
  );
}
