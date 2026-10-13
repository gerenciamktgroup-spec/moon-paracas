import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Building2,
  FileCheck,
  TrendingUp,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageCircle,
  Printer,
  Copy,
  Check,
  LogOut,
  Shield,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Sliders,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, query, orderBy, limit } from "firebase/firestore";
import {
  STANDARD_LOT_AREA_M2,
  STANDARD_LOT_PRICE_USD,
  STANDARD_LOT_PRICE_PEN,
  DOUBLE_LOT_AREA_M2,
  DOUBLE_LOT_PRICE_USD,
  LOT_PRICE_PER_M2_USD,
  USD_TO_PEN_RATE,
  formatUsdAmount,
  formatPenAmount,
  getDirectFinanceMonthlyUSD,
} from "../config/pricing";
import { REAL_MASTERPLAN_MODEL, RealUrbanLot } from "../lib/realUrbanMasterplanModel";
import { PROJECT } from "../config/project";

interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  selectedLotId?: string;
  projectInterest?: string;
  inquiryType?: string;
  contactWindow?: string;
  pipelineStage: "new" | "contacted" | "visit_scheduled" | "reservation_pending" | "closed_won" | "discarded";
  slaTargetMinutes?: number;
  channel?: string;
  attribution?: {
    source?: string;
    medium?: string;
    campaign?: string;
    landingPath?: string;
  };
  createdAt?: any;
  advisorNotes?: string;
}

const DEMO_LEADS: LeadData[] = [
  {
    id: "lead-01",
    name: "Carlos Mendoza Villarán",
    email: "cmendoza@inversioneslima.pe",
    phone: "+51 998 341 209",
    selectedLotId: "A1-12",
    projectInterest: "Moon Paracas",
    inquiryType: "reservation",
    contactWindow: "morning",
    pipelineStage: "new",
    slaTargetMinutes: 15,
    message: "Interesado en separar lote de 120m² para Casa Domo. Deseo financiamiento a 36 meses.",
    channel: "website-simulator",
    attribution: { source: "google", medium: "cpc", campaign: "lima-nse-a-paracas", landingPath: "/simulador" },
  },
  {
    id: "lead-02",
    name: "Valeria Roca-Rey Gómez",
    email: "v.rocarey@estudiojuridico.com",
    phone: "+51 984 112 556",
    selectedLotId: "A2-05",
    projectInterest: "Moon Paracas",
    inquiryType: "documents",
    contactWindow: "afternoon",
    pipelineStage: "contacted",
    slaTargetMinutes: 15,
    message: "Solicito el contrato de adjudicación y copia de la partida matriz de 11.26 ha para revisión.",
    channel: "website-vault",
    attribution: { source: "instagram", medium: "social", campaign: "dossier-legal", landingPath: "/documentos" },
  },
  {
    id: "lead-03",
    name: "Alejandro Graña Miró Quesada",
    email: "agrana@holding.pe",
    phone: "+51 971 889 432",
    selectedLotId: "A3-44",
    projectInterest: "Moon Paracas",
    inquiryType: "visit",
    contactWindow: "morning",
    pipelineStage: "visit_scheduled",
    slaTargetMinutes: 15,
    message: "Quiero coordinar visita presencial al predio en Paracas este sábado con mi familia.",
    channel: "website-footer",
    attribution: { source: "direct", medium: "none", campaign: "referido", landingPath: "/" },
  },
  {
    id: "lead-04",
    name: "Mariana Barnechea Silva",
    email: "mbarnechea@arq-studio.com",
    phone: "+51 965 220 981",
    selectedLotId: "A4-18",
    projectInterest: "Moon Paracas",
    inquiryType: "availability",
    contactWindow: "evening",
    pipelineStage: "reservation_pending",
    slaTargetMinutes: 15,
    message: "Transfiriendo S/ 1,000 de separación. Adjunto voucher por WhatsApp.",
    channel: "website-checkout",
    attribution: { source: "facebook", medium: "paid", campaign: "casa-domo-glamping", landingPath: "/paracas-dome" },
  },
];

export function CrmIntranet() {
  // Autenticación de Asesor
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("moon_crm_auth") === "true";
  });
  const [accessPin, setAccessPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [advisorName, setAdvisorName] = useState(() => {
    return sessionStorage.getItem("moon_advisor_name") || "Asesor Comercial Senior";
  });

  // Tab actual: "pipeline" | "inventory" | "proforma" | "commissions"
  const [activeTab, setActiveTab] = useState<"pipeline" | "inventory" | "proforma" | "commissions">("pipeline");

  // Leads state
  const [leads, setLeads] = useState<LeadData[]>(DEMO_LEADS);
  const [searchLead, setSearchLead] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  // Inventario interactivo de lotes
  const [lotStatusOverrides, setLotStatusOverrides] = useState<Record<string, "available" | "reserved" | "sold">>(() => {
    const saved = localStorage.getItem("moon_lot_status_overrides");
    return saved ? JSON.parse(saved) : {};
  });
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryAldeaFilter, setInventoryAldeaFilter] = useState<number | "all">("all");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<string>("all");

  // Cotizador Express / Proforma
  const [proformaClientName, setProformaClientName] = useState("Doctor Carlos Mendoza Villarán");
  const [proformaClientDni, setProformaClientDni] = useState("43892150");
  const [proformaClientPhone, setProformaClientPhone] = useState("+51 998 341 209");
  const [proformaLotId, setProformaLotId] = useState("A1-12");
  const [proformaDownRatio, setProformaDownRatio] = useState(0.3); // 30% inicial
  const [proformaMonths, setProformaMonths] = useState(36);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Escuchar Leads en tiempo real si Firestore está activo
  useEffect(() => {
    try {
      const leadsCol = collection(db, "leads");
      const q = query(leadsCol, orderBy("createdAt", "desc"), limit(50));
      const unsub = onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            const fetched: LeadData[] = snap.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as any),
            }));
            // Merge con demos para que nunca esté vacío
            setLeads((prev) => {
              const ids = new Set(fetched.map((f) => f.id));
              const nonDuplicatedDemo = DEMO_LEADS.filter((d) => !ids.has(d.id));
              return [...fetched, ...nonDuplicatedDemo];
            });
          }
        },
        () => {
          // Silencioso: se usan leads locales
        }
      );
      return () => unsub();
    } catch {
      // Offline fallback
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Clave de acceso autorizada: moon2026 o paracas
    if (accessPin === "moon2026" || accessPin === "paracas" || accessPin === "2026") {
      sessionStorage.setItem("moon_crm_auth", "true");
      sessionStorage.setItem("moon_advisor_name", advisorName);
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("moon_crm_auth");
    setIsAuthenticated(false);
  };

  // Actualizar etapa de pipeline de un lead
  const updateLeadStage = async (leadId: string, newStage: LeadData["pipelineStage"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, pipelineStage: newStage } : l))
    );
    try {
      const docRef = doc(db, "leads", leadId);
      await updateDoc(docRef, { pipelineStage: newStage });
    } catch {
      // Actualizado en estado local
    }
  };

  // Actualizar estado de un lote
  const toggleLotStatus = (lotId: string, newStatus: "available" | "reserved" | "sold") => {
    const updated = { ...lotStatusOverrides, [lotId]: newStatus };
    setLotStatusOverrides(updated);
    localStorage.setItem("moon_lot_status_overrides", JSON.stringify(updated));
  };

  // Lotes combinados con overrides
  const allLots = useMemo(() => {
    return REAL_MASTERPLAN_MODEL.lots.map((lot) => ({
      ...lot,
      effectiveStatus: lotStatusOverrides[lot.id] || (lot.status === "reservado" ? "reserved" : lot.status === "vendido" ? "sold" : "available"),
    }));
  }, [lotStatusOverrides]);

  // Cálculos de KPIs
  const kpis = useMemo(() => {
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.pipelineStage === "new").length;
    const totalLotsCount = allLots.length;
    const soldLotsCount = allLots.filter((l) => l.effectiveStatus === "sold").length;
    const reservedLotsCount = allLots.filter((l) => l.effectiveStatus === "reserved").length;
    const availableLotsCount = totalLotsCount - soldLotsCount - reservedLotsCount;
    const pipelineUsd = leads.filter((l) => l.pipelineStage !== "discarded").length * STANDARD_LOT_PRICE_USD;

    return {
      totalLeads,
      newLeads,
      totalLotsCount,
      soldLotsCount,
      reservedLotsCount,
      availableLotsCount,
      pipelineUsd,
    };
  }, [leads, allLots]);

  // Filtrado de Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchLead.toLowerCase()) ||
        lead.phone.includes(searchLead) ||
        (lead.selectedLotId && lead.selectedLotId.toLowerCase().includes(searchLead.toLowerCase()));
      const matchesStage = stageFilter === "all" || lead.pipelineStage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [leads, searchLead, stageFilter]);

  // Filtrado de Inventario
  const filteredInventory = useMemo(() => {
    return allLots.filter((lot) => {
      const matchesSearch = lot.id.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesAldea = inventoryAldeaFilter === "all" || lot.aldea === inventoryAldeaFilter;
      const matchesStatus = inventoryStatusFilter === "all" || lot.effectiveStatus === inventoryStatusFilter;
      return matchesSearch && matchesAldea && matchesStatus;
    });
  }, [allLots, inventorySearch, inventoryAldeaFilter, inventoryStatusFilter]);

  // Cálculos de la Proforma seleccionada
  const selectedProformaLot = useMemo(() => {
    return allLots.find((l) => l.id === proformaLotId) || allLots[0];
  }, [allLots, proformaLotId]);

  const proformaCalculations = useMemo(() => {
    const isDouble = selectedProformaLot.areaM2 === 240;
    const priceUsd = isDouble ? DOUBLE_LOT_PRICE_USD : STANDARD_LOT_PRICE_USD;
    const pricePen = priceUsd * USD_TO_PEN_RATE;
    const downPaymentUsd = Math.round(priceUsd * proformaDownRatio);
    const downPaymentPen = Math.round(downPaymentUsd * USD_TO_PEN_RATE);
    const financedUsd = priceUsd - downPaymentUsd;
    const monthlyInstallmentUsd = Math.round(financedUsd / proformaMonths);
    const monthlyInstallmentPen = Math.round(monthlyInstallmentUsd * USD_TO_PEN_RATE);
    const reservationPen = 1000;
    const reservationUsd = Math.round(reservationPen / USD_TO_PEN_RATE);

    return {
      isDouble,
      priceUsd,
      pricePen,
      downPaymentUsd,
      downPaymentPen,
      financedUsd,
      monthlyInstallmentUsd,
      monthlyInstallmentPen,
      reservationPen,
      reservationUsd,
    };
  }, [selectedProformaLot, proformaDownRatio, proformaMonths]);

  // Copiar resumen de proforma para WhatsApp
  const handleCopyQuoteToClipboard = () => {
    const text = `🌕 *COTIZACIÓN OFICIAL — MOON PARACAS* 🌴
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${proformaClientName}
📍 *Lote Adjudicado:* ${selectedProformaLot.id} (${selectedProformaLot.aldeaName})
📐 *Área:* ${selectedProformaLot.areaM2} m² (${selectedProformaLot.widthM}m frente × ${selectedProformaLot.depthM}m fondo)
🏠 *Tipología:* Casa Domo (${selectedProformaLot.compatibleDomes.join("m / ")}m compatible)
💰 *Precio Total de Preventa:* $${proformaCalculations.priceUsd.toLocaleString()} USD (S/ ${proformaCalculations.pricePen.toLocaleString()})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 *PLAN DE FINANCIAMIENTO DIRECTO:*
• *Separación Notarial:* S/ ${proformaCalculations.reservationPen} PEN ($${proformaCalculations.reservationUsd} USD)
• *Inicial (${Math.round(proformaDownRatio * 100)}%):* $${proformaCalculations.downPaymentUsd.toLocaleString()} USD
• *Saldo Financiado:* $${proformaCalculations.financedUsd.toLocaleString()} USD
• *Cuotas Mensuales (${proformaMonths} meses sin intereses):* *$${proformaCalculations.monthlyInstallmentUsd} USD / mes* (Aprox. S/ ${proformaCalculations.monthlyInstallmentPen} PEN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *Seguridad Jurídica:* Asociación & Adjudicación Notarial de Área de Uso Exclusivo. Predio matriz 11.26 ha con coordenadas UTM 18S.
📲 *Asesor Responsable:* ${advisorName} · Moon Paracas`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 3000);
  };

  // ── PANTALLA DE ACCESO (GATEWAY) ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#161310] flex items-center justify-center p-4 selection:bg-[#C85B3E] selection:text-white">
        <div className="w-full max-w-md rounded-3xl border border-[#C5A059]/40 bg-[#1F1B17] p-8 shadow-2xl text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C85B3E] font-display text-2xl font-bold text-white shadow-lg">
              M
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">Intranet Comercial</p>
              <h1 className="font-display text-2xl font-bold">Moon Paracas CRM</h1>
            </div>
          </div>

          <p className="mt-4 text-xs text-white/60 leading-relaxed">
            Portal exclusivo para asesores comerciales, jefatura de ventas y control de adjudicaciones del Eco-Resort Paracas.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                Identidad del Asesor
              </label>
              <select
                value={advisorName}
                onChange={(e) => setAdvisorName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161310] px-4 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
              >
                <option value="Diego Sullivan (Jefatura Comercial)">Diego Sullivan (Jefatura Comercial)</option>
                <option value="Asesor Comercial Senior (Lima)">Asesor Comercial Senior (Lima)</option>
                <option value="Coordinador de Ventas Paracas">Coordinador de Ventas Paracas</option>
                <option value="Mesa de Control & Adjudicaciones">Mesa de Control & Adjudicaciones</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                PIN de Seguridad
              </label>
              <input
                type="password"
                placeholder="Ingresa clave autorizada (ej. moon2026)"
                value={accessPin}
                onChange={(e) => {
                  setAccessPin(e.target.value);
                  setPinError(false);
                }}
                className={`w-full rounded-xl border px-4 py-2.5 text-xs text-white outline-none transition ${
                  pinError
                    ? "border-red-500 bg-red-950/20"
                    : "border-white/10 bg-[#161310] focus:border-[#C5A059]"
                }`}
                autoFocus
              />
              {pinError && (
                <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Clave incorrecta. Usa: moon2026
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#C85B3E] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#C85B3E]/30 transition hover:bg-[#A84F36] cursor-pointer"
            >
              Acceder al CRM Comercial
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <Link to="/" className="text-[11px] text-white/50 hover:text-white transition">
              ← Volver al sitio web comercial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── INTRANET PRINCIPAL ──
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#161310] font-sans">
      {/* ── TOP NAV BAR DEL CRM ── */}
      <header className="sticky top-0 z-40 border-b border-[#E8E1D5] bg-white/95 backdrop-blur-md px-5 py-3.5 shadow-sm">
        <div className="mx-auto max-w-[1440px] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#161310] font-display text-lg font-bold text-white shadow">
              M
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-[#161310]">Moon Paracas</span>
                <span className="rounded-full bg-[#4E6646]/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#4E6646]">
                  CRM v2.4 Live
                </span>
              </div>
              <p className="text-[11px] text-[#786F66]">
                Conectado como: <strong className="text-[#161310]">{advisorName}</strong>
              </p>
            </div>
          </div>

          {/* Selector de Pestañas */}
          <nav className="flex items-center rounded-2xl border border-[#E8E1D5] bg-[#F4EFE6] p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition cursor-pointer ${
                activeTab === "pipeline"
                  ? "bg-[#161310] text-white shadow"
                  : "text-[#786F66] hover:text-[#161310]"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Pipeline Leads ({kpis.totalLeads})</span>
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition cursor-pointer ${
                activeTab === "inventory"
                  ? "bg-[#161310] text-white shadow"
                  : "text-[#786F66] hover:text-[#161310]"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Inventario Lotes ({kpis.availableLotsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("proforma")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition cursor-pointer ${
                activeTab === "proforma"
                  ? "bg-[#161310] text-white shadow"
                  : "text-[#786F66] hover:text-[#161310]"
              }`}
            >
              <FileCheck className="h-4 w-4" />
              <span>Cotizador Proforma</span>
            </button>

            <button
              onClick={() => setActiveTab("commissions")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition cursor-pointer ${
                activeTab === "commissions"
                  ? "bg-[#161310] text-white shadow"
                  : "text-[#786F66] hover:text-[#161310]"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Comisiones</span>
            </button>
          </nav>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2">
            <Link
              to="/simulador"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E1D5] bg-white px-3 py-1.5 text-xs font-bold text-[#161310] hover:bg-[#FAF8F5] transition"
            >
              <span>Ver Masterplan 3D</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── KPI METRICS CARDS (BARRA DE CONTROL) ── */}
      <section className="border-b border-[#E8E1D5] bg-[#F4EFE6] px-5 py-6">
        <div className="mx-auto max-w-[1440px] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-[#E8E1D5] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#786F66]">Leads Totales</span>
              <Users className="h-4 w-4 text-[#A84F36]" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#161310]">{kpis.totalLeads}</p>
            <p className="text-[10px] text-[#4E6646] font-semibold">100% capturados web</p>
          </div>

          <div className="rounded-2xl border border-[#C85B3E]/30 bg-[#C85B3E]/5 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36]">Nuevos (SLA 15m)</span>
              <Clock className="h-4 w-4 text-[#C85B3E]" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#C85B3E]">{kpis.newLeads}</p>
            <p className="text-[10px] text-[#A84F36]">Atención prioritaria</p>
          </div>

          <div className="rounded-2xl border border-[#4E6646]/30 bg-[#4E6646]/5 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E6646]">Disponibles</span>
              <Building2 className="h-4 w-4 text-[#4E6646]" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#4E6646]">{kpis.availableLotsCount}</p>
            <p className="text-[10px] text-[#786F66]">De 384 lotes totales</p>
          </div>

          <div className="rounded-2xl border border-[#C5A059]/40 bg-[#C5A059]/10 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36]">Separados</span>
              <Sparkles className="h-4 w-4 text-[#C5A059]" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#A84F36]">{kpis.reservedLotsCount}</p>
            <p className="text-[10px] text-[#786F66]">S/ 1,000 en validación</p>
          </div>

          <div className="rounded-2xl border border-[#161310]/20 bg-[#161310]/5 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#161310]">Vendidos / Firma</span>
              <CheckCircle2 className="h-4 w-4 text-[#161310]" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#161310]">{kpis.soldLotsCount}</p>
            <p className="text-[10px] text-[#786F66]">Contrato formalizado</p>
          </div>

          <div className="rounded-2xl border border-[#C5A059]/40 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">Pipeline Proyectado</span>
              <DollarSign className="h-4 w-4 text-[#C5A059]" />
            </div>
            <p className="mt-2 font-display text-xl font-bold text-[#161310]">${kpis.pipelineUsd.toLocaleString()}</p>
            <p className="text-[10px] text-[#786F66]">USD cartera activa</p>
          </div>
        </div>
      </section>

      {/* ── CUERPO PRINCIPAL SEGÚN PESTAÑA ACTIVA ── */}
      <main className="mx-auto max-w-[1440px] px-5 py-8">
        
        {/* ══════════ PESTAÑA 1: PIPELINE DE LEADS (CRM) ══════════ */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#161310]">Embudo Comercial & Gestión de Leads</h2>
                <p className="text-xs text-[#786F66]">
                  Monitorea a los prospectos de Lima A/B, revisa su intención de compra y contáctalos por WhatsApp en menos de 15 minutos.
                </p>
              </div>

              {/* Filtros y Buscador */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 rounded-xl border border-[#E8E1D5] bg-white px-3 py-1.5 shadow-sm text-xs w-full sm:w-64">
                  <Search className="h-3.5 w-3.5 text-[#786F66]" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, teléfono o lote..."
                    value={searchLead}
                    onChange={(e) => setSearchLead(e.target.value)}
                    className="w-full bg-transparent outline-none text-[#161310] placeholder-[#786F66]"
                  />
                </div>

                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="rounded-xl border border-[#E8E1D5] bg-white px-3 py-2 text-xs font-semibold text-[#161310] outline-none"
                >
                  <option value="all">Todas las Etapas</option>
                  <option value="new">Nuevo (SLA 15m)</option>
                  <option value="contacted">Contactado</option>
                  <option value="visit_scheduled">Visita Agendada</option>
                  <option value="reservation_pending">Separación en Trámite</option>
                  <option value="closed_won">Cierre Ganado</option>
                  <option value="discarded">Descartado</option>
                </select>
              </div>
            </div>

            {/* Listado de Tarjetas de Leads */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeads.map((lead) => {
                const waMessage = `Hola ${lead.name.split(" ")[0]}! Te saluda ${advisorName} de Moon Paracas. Recibimos tu interés sobre el ${lead.selectedLotId ? `Lote ${lead.selectedLotId}` : "proyecto Moon Paracas"}. ¿En qué momento te resulta más cómodo conversar sobre la disponibilidad y facilidades de pago?`;
                const waUrl = `https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`;

                return (
                  <div
                    key={lead.id}
                    className="flex flex-col justify-between rounded-3xl border border-[#E8E1D5] bg-white p-5 shadow-sm hover:shadow-md transition"
                  >
                    <div>
                      {/* Cabecera del Lead */}
                      <div className="flex items-start justify-between gap-2 border-b border-[#E8E1D5] pb-3">
                        <div>
                          <span className="font-mono text-[10px] text-[#786F66]">ID: {lead.id}</span>
                          <h3 className="font-display text-base font-bold text-[#161310] mt-0.5">{lead.name}</h3>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            lead.pipelineStage === "new"
                              ? "bg-red-100 text-red-700 animate-pulse"
                              : lead.pipelineStage === "reservation_pending"
                              ? "bg-[#C5A059]/20 text-[#A84F36]"
                              : lead.pipelineStage === "closed_won"
                              ? "bg-[#4E6646]/20 text-[#4E6646]"
                              : "bg-[#F4EFE6] text-[#786F66]"
                          }`}
                        >
                          {lead.pipelineStage === "new" && "Nuevo · SLA 15m"}
                          {lead.pipelineStage === "contacted" && "Contactado"}
                          {lead.pipelineStage === "visit_scheduled" && "Visita Agendada"}
                          {lead.pipelineStage === "reservation_pending" && "Separación"}
                          {lead.pipelineStage === "closed_won" && "Ganado"}
                          {lead.pipelineStage === "discarded" && "Descartado"}
                        </span>
                      </div>

                      {/* Datos de Contacto */}
                      <div className="mt-3 space-y-1.5 text-xs text-[#524941]">
                        <p className="flex items-center gap-2 font-mono">
                          <Phone className="h-3.5 w-3.5 text-[#A84F36]" />
                          <span>{lead.phone}</span>
                        </p>
                        <p className="flex items-center gap-2 font-mono truncate">
                          <Mail className="h-3.5 w-3.5 text-[#A84F36]" />
                          <span className="truncate">{lead.email}</span>
                        </p>
                        {lead.selectedLotId && (
                          <p className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-[#C5A059]" />
                            <span>Lote de Interés: <strong className="text-[#161310] font-mono">{lead.selectedLotId}</strong></span>
                          </p>
                        )}
                        {lead.contactWindow && (
                          <p className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-[#786F66]" />
                            <span>Ventana preferida: {lead.contactWindow === "morning" ? "Mañana (9-12h)" : lead.contactWindow === "afternoon" ? "Tarde (14-18h)" : "Noche"}</span>
                          </p>
                        )}
                      </div>

                      {/* Mensaje del Cliente */}
                      {lead.message && (
                        <div className="mt-3 rounded-xl border border-[#E8E1D5] bg-[#FAF8F5] p-2.5 text-xs text-[#3D352E] italic">
                          "{lead.message}"
                        </div>
                      )}

                      {/* Atribución UTM */}
                      {lead.attribution && (
                        <div className="mt-2.5 flex flex-wrap gap-1 text-[9px] font-mono text-[#786F66]">
                          <span className="rounded bg-[#F4EFE6] px-1.5 py-0.5">Fuente: {lead.attribution.source || "web"}</span>
                          {lead.attribution.campaign && (
                            <span className="rounded bg-[#F4EFE6] px-1.5 py-0.5">Camp: {lead.attribution.campaign}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Acciones del Asesor */}
                    <div className="mt-5 border-t border-[#E8E1D5] pt-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => updateLeadStage(lead.id, "contacted")}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#4E6646] py-2 text-xs font-bold text-white shadow-sm hover:bg-[#3D5237] transition"
                        >
                          <MessageCircle className="h-3.5 w-3.5 fill-current" />
                          <span>WhatsApp Asesor</span>
                        </a>

                        <button
                          onClick={() => {
                            if (lead.selectedLotId) setProformaLotId(lead.selectedLotId);
                            setProformaClientName(lead.name);
                            setProformaClientPhone(lead.phone);
                            setActiveTab("proforma");
                          }}
                          className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#C5A059] bg-[#FAF7F2] px-3 py-2 text-xs font-bold text-[#A84F36] hover:bg-[#F4EFE6] transition cursor-pointer"
                          title="Generar Proforma Oficial para este cliente"
                        >
                          <FileCheck className="h-3.5 w-3.5" />
                          <span>Cotizar</span>
                        </button>
                      </div>

                      {/* Selector Rápido de Etapa */}
                      <div className="flex items-center justify-between text-[11px] text-[#786F66]">
                        <span>Etapa:</span>
                        <select
                          value={lead.pipelineStage}
                          onChange={(e) => updateLeadStage(lead.id, e.target.value as any)}
                          className="rounded-lg border border-[#E8E1D5] bg-white px-2 py-1 text-[11px] font-semibold text-[#161310] outline-none"
                        >
                          <option value="new">Nuevo (SLA 15m)</option>
                          <option value="contacted">Contactado</option>
                          <option value="visit_scheduled">Visita Agendada</option>
                          <option value="reservation_pending">Separación</option>
                          <option value="closed_won">Ganado / Cerrado</option>
                          <option value="discarded">Descartado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ PESTAÑA 2: CONTROL DE INVENTARIO (384 LOTES) ══════════ */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#161310]">Inventario Maestro de Lotes en Tiempo Real</h2>
                <p className="text-xs text-[#786F66]">
                  Control administrativo de 384 lotes (4 Aldeas × 96 lotes). Cambia el estado a Reservado o Vendido con un solo clic.
                </p>
              </div>

              {/* Filtros de Inventario */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-[#E8E1D5] bg-white px-3 py-1.5 shadow-sm text-xs">
                  <Search className="h-3.5 w-3.5 text-[#786F66]" />
                  <input
                    type="text"
                    placeholder="Filtrar por ID (ej. A1-05)..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-36 bg-transparent outline-none text-[#161310]"
                  />
                </div>

                <select
                  value={inventoryAldeaFilter}
                  onChange={(e) => setInventoryAldeaFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="rounded-xl border border-[#E8E1D5] bg-white px-3 py-2 text-xs font-semibold text-[#161310] outline-none"
                >
                  <option value="all">Todas las Aldeas</option>
                  <option value={1}>Aldea 1 (Oeste)</option>
                  <option value={2}>Aldea 2 (Norte)</option>
                  <option value={3}>Aldea 3 (Este)</option>
                  <option value={4}>Aldea 4 (Sur)</option>
                </select>

                <select
                  value={inventoryStatusFilter}
                  onChange={(e) => setInventoryStatusFilter(e.target.value)}
                  className="rounded-xl border border-[#E8E1D5] bg-white px-3 py-2 text-xs font-semibold text-[#161310] outline-none"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="available">Disponible</option>
                  <option value="reserved">Reservado</option>
                  <option value="sold">Vendido</option>
                </select>
              </div>
            </div>

            {/* Tabla de Inventario */}
            <div className="overflow-x-auto rounded-3xl border border-[#E8E1D5] bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E8E1D5] bg-[#F4EFE6] text-[10px] font-bold uppercase tracking-wider text-[#786F66]">
                  <tr>
                    <th className="px-5 py-3.5">ID Lote</th>
                    <th className="px-4 py-3.5">Sector / Aldea</th>
                    <th className="px-4 py-3.5">Área (m²)</th>
                    <th className="px-4 py-3.5">Dimensiones</th>
                    <th className="px-4 py-3.5">Precio ($ USD)</th>
                    <th className="px-4 py-3.5">Inicial 30%</th>
                    <th className="px-4 py-3.5">Cuota 36m</th>
                    <th className="px-4 py-3.5">Estado en Vivo</th>
                    <th className="px-5 py-3.5 text-right">Acción Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1D5]">
                  {filteredInventory.slice(0, 100).map((lot) => {
                    const isDouble = lot.areaM2 === 240;
                    const price = isDouble ? DOUBLE_LOT_PRICE_USD : STANDARD_LOT_PRICE_USD;
                    const down = Math.round(price * 0.3);
                    const monthly = getDirectFinanceMonthlyUSD(price, 0.3, 36);

                    return (
                      <tr key={lot.id} className="hover:bg-[#FAF8F5] transition">
                        <td className="px-5 py-3 font-mono font-bold text-[#161310]">{lot.id}</td>
                        <td className="px-4 py-3 text-[#524941]">{lot.aldeaName}</td>
                        <td className="px-4 py-3 font-mono font-bold">
                          {lot.areaM2} m²
                          {isDouble && <span className="ml-1 text-[9px] text-[#A84F36]">(Doble)</span>}
                        </td>
                        <td className="px-4 py-3 font-mono text-[#786F66]">{lot.widthM}m × {lot.depthM}m</td>
                        <td className="px-4 py-3 font-mono font-bold text-[#161310]">${price.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-[#786F66]">${down.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-[#4E6646] font-semibold">${monthly} / mes</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              lot.effectiveStatus === "available"
                                ? "bg-[#4E6646]/10 text-[#4E6646]"
                                : lot.effectiveStatus === "reserved"
                                ? "bg-[#C5A059]/20 text-[#A84F36]"
                                : "bg-[#161310] text-white"
                            }`}
                          >
                            {lot.effectiveStatus === "available" && "Disponible"}
                            {lot.effectiveStatus === "reserved" && "Reservado"}
                            {lot.effectiveStatus === "sold" && "Vendido"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="inline-flex rounded-lg border border-[#E8E1D5] bg-white p-0.5 shadow-xs">
                            <button
                              onClick={() => toggleLotStatus(lot.id, "available")}
                              title="Marcar como Disponible"
                              className={`rounded px-2 py-0.5 text-[9px] font-bold cursor-pointer transition ${
                                lot.effectiveStatus === "available" ? "bg-[#4E6646] text-white" : "text-[#786F66] hover:bg-[#FAF8F5]"
                              }`}
                            >
                              Disp
                            </button>
                            <button
                              onClick={() => toggleLotStatus(lot.id, "reserved")}
                              title="Marcar como Reservado"
                              className={`rounded px-2 py-0.5 text-[9px] font-bold cursor-pointer transition ${
                                lot.effectiveStatus === "reserved" ? "bg-[#C5A059] text-[#161310]" : "text-[#786F66] hover:bg-[#FAF8F5]"
                              }`}
                            >
                              Res
                            </button>
                            <button
                              onClick={() => toggleLotStatus(lot.id, "sold")}
                              title="Marcar como Vendido"
                              className={`rounded px-2 py-0.5 text-[9px] font-bold cursor-pointer transition ${
                                lot.effectiveStatus === "sold" ? "bg-[#161310] text-white" : "text-[#786F66] hover:bg-[#FAF8F5]"
                              }`}
                            >
                              Ven
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredInventory.length > 100 && (
                <div className="border-t border-[#E8E1D5] bg-[#FAF8F5] p-3 text-center text-xs text-[#786F66]">
                  Mostrando los primeros 100 de {filteredInventory.length} lotes. Usa los filtros para acotar.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════ PESTAÑA 3: COTIZADOR PROFORMA EXPRESS ══════════ */}
        {activeTab === "proforma" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Formulario de Parámetros */}
            <div className="lg:col-span-5 rounded-3xl border border-[#E8E1D5] bg-white p-6 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36]">Generador de Cotización</span>
                <h2 className="font-display text-xl font-bold text-[#161310]">Datos del Inversionista</h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#786F66] mb-1">Nombre Completo del Cliente</label>
                <input
                  type="text"
                  value={proformaClientName}
                  onChange={(e) => setProformaClientName(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E1D5] px-3.5 py-2 text-xs font-semibold text-[#161310] outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#786F66] mb-1">DNI / CE</label>
                  <input
                    type="text"
                    value={proformaClientDni}
                    onChange={(e) => setProformaClientDni(e.target.value)}
                    className="w-full rounded-xl border border-[#E8E1D5] px-3.5 py-2 text-xs font-mono font-semibold text-[#161310] outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#786F66] mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    value={proformaClientPhone}
                    onChange={(e) => setProformaClientPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#E8E1D5] px-3.5 py-2 text-xs font-mono font-semibold text-[#161310] outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#786F66] mb-1">Seleccionar Lote de la Matriz</label>
                <select
                  value={proformaLotId}
                  onChange={(e) => setProformaLotId(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E1D5] px-3.5 py-2 text-xs font-bold text-[#161310] outline-none focus:border-[#C5A059]"
                >
                  {allLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.id} · {lot.aldeaName} ({lot.areaM2} m²) — ${lot.areaM2 === 240 ? DOUBLE_LOT_PRICE_USD.toLocaleString() : STANDARD_LOT_PRICE_USD.toLocaleString()} USD
                    </option>
                  ))}
                </select>
              </div>

              {/* Parámetros Financieros */}
              <div className="border-t border-[#E8E1D5] pt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#786F66] mb-1">
                    <span>Cuota Inicial</span>
                    <span className="text-[#A84F36]">{Math.round(proformaDownRatio * 100)}% (${proformaCalculations.downPaymentUsd.toLocaleString()} USD)</span>
                  </div>
                  <div className="flex gap-2">
                    {[0.2, 0.3, 0.4, 0.5].map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setProformaDownRatio(ratio)}
                        className={`flex-1 rounded-xl py-1.5 text-xs font-bold cursor-pointer transition ${
                          proformaDownRatio === ratio
                            ? "bg-[#161310] text-white shadow-sm"
                            : "border border-[#E8E1D5] bg-white text-[#786F66] hover:bg-[#FAF8F5]"
                        }`}
                      >
                        {Math.round(ratio * 100)}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-[#786F66] mb-1">
                    <span>Plazo de Financiamiento</span>
                    <span className="text-[#4E6646]">{proformaMonths} meses sin intereses</span>
                  </div>
                  <div className="flex gap-2">
                    {[12, 18, 24, 36].map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setProformaMonths(months)}
                        className={`flex-1 rounded-xl py-1.5 text-xs font-bold cursor-pointer transition ${
                          proformaMonths === months
                            ? "bg-[#C85B3E] text-white shadow-sm"
                            : "border border-[#E8E1D5] bg-white text-[#786F66] hover:bg-[#FAF8F5]"
                        }`}
                      >
                        {months}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botones de Compartir */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleCopyQuoteToClipboard}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4E6646] py-3 text-xs font-bold text-white shadow-sm hover:bg-[#3D5237] transition cursor-pointer"
                >
                  {copiedQuote ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedQuote ? "¡Copiado al Portapapeles!" : "Copiar Texto para WhatsApp"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#161310] bg-white py-2.5 text-xs font-bold text-[#161310] hover:bg-[#FAF8F5] transition cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir / Exportar PDF</span>
                </button>
              </div>
            </div>

            {/* Vista Previa de la Proforma Oficial (Estilo Documento de Lujo) */}
            <div className="lg:col-span-7 rounded-3xl border border-[#C5A059]/40 bg-white p-8 sm:p-10 shadow-lg print:border-none print:shadow-none print:m-0 print:p-0">
              {/* Header de la Proforma */}
              <div className="flex items-start justify-between border-b border-[#E8E1D5] pb-6">
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-[#161310]">
                    MOON <span className="font-serif italic font-normal text-[#C85B3E]">PARACAS</span>
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#786F66] mt-0.5">
                    Eco-Resort & Club Privado · Paracas, Ica
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-[#C5A059]/15 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#A84F36]">
                    Proforma Oficial 2026
                  </span>
                  <p className="mt-1 font-mono text-[10px] text-[#786F66]">
                    Fecha: {new Date().toLocaleDateString("es-PE")}
                  </p>
                </div>
              </div>

              {/* Destinatario */}
              <div className="mt-6 rounded-2xl bg-[#FAF8F5] p-4 text-xs border border-[#E8E1D5]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#786F66]">Titular Solicitante</p>
                <p className="mt-1 font-display text-base font-bold text-[#161310]">{proformaClientName}</p>
                <div className="mt-1 flex flex-wrap gap-4 text-xs text-[#524941]">
                  <span>DNI/CE: <strong className="font-mono">{proformaClientDni}</strong></span>
                  <span>Móvil: <strong className="font-mono">{proformaClientPhone}</strong></span>
                  <span>Asesor: <strong>{advisorName}</strong></span>
                </div>
              </div>

              {/* Detalle del Lote */}
              <div className="mt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36] mb-3">
                  Especificación de la Adjudicación
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl border border-[#E8E1D5] p-3">
                    <span className="text-[9px] text-[#786F66] block">Lote N°</span>
                    <span className="font-display text-lg font-bold text-[#161310]">{selectedProformaLot.id}</span>
                  </div>
                  <div className="rounded-xl border border-[#E8E1D5] p-3">
                    <span className="text-[9px] text-[#786F66] block">Sector</span>
                    <span className="font-display text-xs font-bold text-[#161310]">{selectedProformaLot.aldeaName}</span>
                  </div>
                  <div className="rounded-xl border border-[#E8E1D5] p-3">
                    <span className="text-[9px] text-[#786F66] block">Área Total</span>
                    <span className="font-display text-lg font-bold text-[#161310]">{selectedProformaLot.areaM2} m²</span>
                  </div>
                  <div className="rounded-xl border border-[#E8E1D5] p-3">
                    <span className="text-[9px] text-[#786F66] block">Medidas</span>
                    <span className="font-mono text-xs font-bold text-[#161310]">{selectedProformaLot.widthM}m × {selectedProformaLot.depthM}m</span>
                  </div>
                </div>
              </div>

              {/* Desglose Económico */}
              <div className="mt-6 border-t border-[#E8E1D5] pt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36] mb-3">
                  Resumen de Inversión y Financiamiento
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#E8E1D5]">
                    <span className="text-[#524941]">Precio de Lista de Preventa ($120 USD/m²)</span>
                    <span className="font-mono font-bold text-[#161310]">${proformaCalculations.priceUsd.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E8E1D5]">
                    <span className="text-[#524941]">Monto de Separación Notarial (Deducible)</span>
                    <span className="font-mono font-bold text-[#4E6646]">S/ {proformaCalculations.reservationPen} PEN (~${proformaCalculations.reservationUsd} USD)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E8E1D5]">
                    <span className="text-[#524941]">Cuota Inicial Pactada ({Math.round(proformaDownRatio * 100)}%)</span>
                    <span className="font-mono font-bold text-[#161310]">${proformaCalculations.downPaymentUsd.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E8E1D5]">
                    <span className="text-[#524941]">Saldo a Financiar Directamente</span>
                    <span className="font-mono font-bold text-[#786F66]">${proformaCalculations.financedUsd.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-[#FAF8F5] rounded-xl px-4 border border-[#C5A059]/40 mt-3">
                    <div>
                      <span className="block font-bold text-xs text-[#161310]">Cuota Mensual Fija ({proformaMonths} meses)</span>
                      <span className="text-[10px] text-[#4E6646]">0% Interés bancario directo</span>
                    </div>
                    <span className="font-display text-2xl font-bold text-[#A84F36]">
                      ${proformaCalculations.monthlyInstallmentUsd} <span className="text-xs font-sans text-[#786F66]">USD / mes</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Términos y Validez */}
              <div className="mt-8 border-t border-[#E8E1D5] pt-4 text-[10px] text-[#786F66] leading-relaxed">
                <p>
                  * Esta cotización tiene una vigencia de 7 días calendario. La reserva formal del lote se asegura mediante depósito de S/ 1,000 en la cuenta recaudadora autorizada de la Asociación y suscripción de la Constancia de Adjudicación. Predio matriz georreferenciado con coordenadas oficiales UTM 18S.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ══════════ PESTAÑA 4: CALCULADORA DE COMISIONES ══════════ */}
        {activeTab === "commissions" && (
          <div className="max-w-3xl mx-auto rounded-3xl border border-[#E8E1D5] bg-white p-8 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36]">Plan de Incentivos Comerciales</span>
              <h2 className="font-display text-2xl font-bold text-[#161310]">Calculadora de Comisiones de Asesor</h2>
              <p className="text-xs text-[#786F66] mt-1">
                Herramienta interna para proyectar comisiones por volumen de ventas y cumplimiento de cuota mensual.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] p-5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#786F66]">Lote 120m² ($14,400)</span>
                <p className="font-display text-2xl font-bold text-[#4E6646] mt-1">$576 USD</p>
                <p className="text-[10px] text-[#786F66]">Comisión Base 4.0%</p>
              </div>

              <div className="rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] p-5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#786F66]">Lote Doble 240m² ($28,800)</span>
                <p className="font-display text-2xl font-bold text-[#4E6646] mt-1">$1,152 USD</p>
                <p className="text-[10px] text-[#786F66]">Comisión Base 4.0%</p>
              </div>

              <div className="rounded-2xl border border-[#C5A059]/40 bg-[#C5A059]/10 p-5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36]">Bono por 5 Cierres</span>
                <p className="font-display text-2xl font-bold text-[#A84F36] mt-1">+$1,000 USD</p>
                <p className="text-[10px] text-[#A84F36]">Acelerador de Meta</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8E1D5] p-5 bg-white space-y-3">
              <h4 className="text-xs font-bold text-[#161310] flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#C5A059]" /> Reglas de Desembolso de Comisiones
              </h4>
              <ul className="text-xs text-[#524941] space-y-2 list-disc pl-5">
                <li>El 50% de la comisión se libera al abonarse el total de la Cuota Inicial (30%).</li>
                <li>El 50% restante se liquida tras la firma notarial del Contrato de Incorporación y Adjudicación.</li>
                <li>Los bonos por acelerador se liquidan al cierre de mes contable (días 30 de cada mes).</li>
              </ul>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
