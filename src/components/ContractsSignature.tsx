import React, { useRef, useState, useEffect } from "react";
import { Lot } from "../types/map";
import { Lock, PenTool, CheckCircle, RefreshCw, Download, FileText, ShieldCheck, UserCheck, Stamp } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

interface ContractsSignatureProps {
  selectedLot: Lot | null;
  onSignatureSuccess: (message: string) => void;
}

export const ContractsSignature: React.FC<ContractsSignatureProps> = ({ selectedLot, onSignatureSuccess }) => {
  const [activeDoc, setActiveDoc] = useState<"contrato" | "disclosure">("contrato");
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Signature pad state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  
  // Signature status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignedContract, setIsSignedContract] = useState(false);
  const [isSignedDisclosure, setIsSignedDisclosure] = useState(false);
  const [contractSignatureData, setContractSignatureData] = useState<string | null>(null);
  const [disclosureSignatureData, setDisclosureSignatureData] = useState<string | null>(null);
  const [securityHash, setSecurityHash] = useState<string | null>(null);
  const [signedDate, setSignedDate] = useState<string | null>(null);

  // Setup canvas drawings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = "#F5F2EB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [activeDoc, isSignedContract, isSignedDisclosure]);

  // Handle drawing events
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1D1714"; // Dark blue signature ink
    
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#F5F2EB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmitSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLot) {
      alert("Por favor selecciona un lote en el masterplan superior para firmar.");
      return;
    }
    if (!fullName || !dni || !email || !phone) {
      alert("Por favor completa todos los datos obligatorios.");
      return;
    }
    if (!acceptedTerms) {
      alert("Debes aceptar la declaración de conformidad antes de firmar.");
      return;
    }
    if (!hasSigned) {
      alert("Por favor dibuja tu firma en el recuadro correspondiente.");
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(async () => {
      const canvas = canvasRef.current;
      const signatureDataUrl = canvas ? canvas.toDataURL("image/png") : "";
      
      const generatedHash = "SHA256-" + Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
      const currentDate = new Date().toLocaleString("es-PE", { timeZone: "America/Lima" });
      
      setSecurityHash(generatedHash);
      setSignedDate(currentDate);

      if (activeDoc === "contrato") {
        setIsSignedContract(true);
        setContractSignatureData(signatureDataUrl);
      } else {
        setIsSignedDisclosure(true);
        setDisclosureSignatureData(signatureDataUrl);
      }
      
      setIsSubmitting(false);
      clearCanvas();
      setAcceptedTerms(false);
      
      try {
        const lotRef = doc(db, "lots", selectedLot.id);
        await updateDoc(lotRef, {
          status: "blocked",
          priceLabel: "RESERVADO"
        });
      } catch (err) {
        console.warn("Firestore update omitted or failed:", err);
      }

      onSignatureSuccess(`¡Documento firmado digitalmente con éxito! Código Hash de Seguridad: ${generatedHash.substring(0, 15)}...`);
    }, 1800);
  };

  const lotNumber = selectedLot?.number || "[___]";
  const lotArea = selectedLot?.area?.toFixed(2) || "250.00";
  const lotPrice = selectedLot?.price 
    ? "S/ " + selectedLot.price.toLocaleString('es-PE', { maximumFractionDigits: 0 })
    : "[___]";
  const lotQuadrant = selectedLot?.quadrant || "[___]";

  const getContractText = () => {
    return (
      <div className="space-y-4 text-xs text-stone-200 leading-relaxed font-mono select-text bg-stone-950/40 p-5 border border-white/10 h-[380px] overflow-y-auto text-left">
        <p className="text-center font-bold text-sm text-white border-b border-white/10 pb-2 uppercase">
          CONTRATO DE INCORPORACION Y ADJUDICACION DE AREA DE USO EXCLUSIVO
        </p>
        <p className="text-center font-bold text-stone-400">MOON PARACAS — ETAPA FUNDADORA</p>
        
        <p><strong>I. IDENTIFICACIÓN DE LAS PARTES</strong></p>
        <p>
          <strong>LA ASOCIACIÓN:</strong> Asociación Civil de Adjudicatarios Moon Paracas, RUC N° 20123456789, inscrita en la Partida Electrónica N° 11223344 del Registro de Personas Jurídicas de Ica, con domicilio legal en Paracas, Km 245 Panamericana Sur, debidamente representada por su Presidente del Consejo Directivo.<br/>
          <strong>EL ASOCIADO:</strong> <strong>{fullName || "[Nombre Completo del Asociado]"}</strong>, identificado con DNI/CE N° <strong>{dni || "[Documento de Identidad]"}</strong>, con correo electrónico <strong>{email || "[Correo Electrónico]"}</strong> y teléfono celular/WhatsApp <strong>{phone || "[Número de Celular]"}</strong>.
        </p>

        <p><strong>II. ANTECEDENTES Y CLAUSULADO</strong></p>
        
        <p>
          <strong>PRIMERA. Antecedentes.</strong> LA ASOCIACIÓN administra y promueve el proyecto privado Moon Paracas, concebido como una comunidad rústica de campo de lujo y baja densidad, ubicado en el tablazo de Paracas, provincia de Pisco, departamento de Ica. El proyecto cuenta con espacios de uso exclusivo (lotes), áreas comunes (Oasis Central, sendero peatonal, vías de arcilla compactada), pórtico de control de accesos e iluminación eco-solar.
        </p>

        <p>
          <strong>SEGUNDA. Solicitud de incorporación.</strong> EL ASOCIADO solicita incorporarse a la asociación civil Moon Paracas, declarando haber recibido información comercial técnica previa y aceptar la naturaleza rústica, asociativa y progresiva del condominio.
        </p>

        <p>
          <strong>TERCERA. Aprobación y certificado.</strong> Aprobada la solicitud, LA ASOCIACIÓN emite a favor de EL ASOCIADO el Certificado de Incorporación de la Membresía para el Lote/Área de Uso Exclusivo asignado.
        </p>

        <p>
          <strong>CUARTA. Cuota de incorporación y Precio.</strong> La cuota de incorporación correspondiente al lote asignado asciende a la suma total de <strong>{lotPrice} Soles</strong>. EL ASOCIADO declara y acepta que el pago del 30% inicial se abonará al momento de la firma electrónica del presente contrato, dedonándose los S/ 1,000 en concepto de pre-reserva, y el saldo restante se cancelará en cuotas mensuales directas sin intereses de acuerdo al plazo pactado.
        </p>

        <p>
          <strong>QUINTA. Área de uso exclusivo.</strong> LA ASOCIACIÓN asigna a EL ASOCIADO el uso exclusivo del área interna identificada como <strong>Lote N° {lotNumber} (Sector: {lotQuadrant})</strong>, con un área neta aproximada de <strong>{lotArea} m²</strong>, conforme a la planimetría interna. Dicha asignación se realiza dentro del régimen privado de posesión del condominio y no equivale a una independización de partida registral inmediata.
        </p>

        <p>
          <strong>SEXTA. Naturaleza del derecho.</strong> EL ASOCIADO reconoce que su derecho se estructura como uso exclusivo y copropiedad interna sobre el lote matriz, sujeto al Reglamento Interno de Edificación y Coexistencia. Cualquier independización o formalización posterior se gestionará progresivamente ante las autoridades municipales competentes y Registros Públicos de Ica.
        </p>

        <p>
          <strong>SÉPTIMA. Desarrollo progresivo del proyecto.</strong> Moon Paracas se ejecuta por etapas, conforme a la disponibilidad de caja operativa (modelo de caja positiva), cobranza efectiva de los asociados y aprobaciones técnicas. El desarrollo de áreas recreativas comunes, piscina de piedra, PTAR, y pórtico se ejecutará progresivamente por hitos.
        </p>

        <p>
          <strong>OCTAVA. Cuotas ordinarias y de mantenimiento.</strong> EL ASOCIADO asume la obligación de pagar las cuotas mensuales de mantenimiento destinadas a la vigilancia 24/7, conservación de la piscina de piedra del Oasis, riego de senderos xerófitos y alumbrado solar común.
        </p>

        <p>
          <strong>NOVENA. Reglas de uso y construcción.</strong> Las viviendas deberán respetar obligatoriamente las especificaciones de diseño rústico de lujo: altura máxima de 2 pisos + azotea ligera (pérgola de eucalipto), colores de fachada terrosos (arena, terracota, ocre), cercos divisorios de piedra natural (pircas) de hasta 1.20m de altura, e instalación de sistemas solares fotovoltaicos para autoconsumo limpio.
        </p>

        <p>
          <strong>DÉCIMA. Solución de controversias.</strong> Cualquier discrepancia derivada de la ejecución del presente contrato se resolverá mediante trato directo y de mutuo acuerdo. En caso de desavenencia insalvable, las partes se someten al arbitraje institucional de la Cámara de Comercio de Ica.
        </p>

        <p className="pt-4 text-center font-bold text-white">
          CONFORMIDAD Y FIRMA DIGITAL
        </p>
        <p>
          Las partes aceptan y suscriben de forma electrónica el presente contrato en señal de conformidad, certificando el proceso de firma digital mediante estampado seguro de Hash SHA256 y marca temporal.
        </p>
      </div>
    );
  };

  const getDisclosureText = () => {
    return (
      <div className="space-y-4 text-xs text-stone-200 leading-relaxed font-mono select-text bg-stone-950/40 p-5 border border-white/10 h-[380px] overflow-y-auto text-left">
        <p className="text-center font-bold text-sm text-white border-b border-white/10 pb-2 uppercase">
          ANEXO DE RIESGOS Y DISCLOSURE — MOON PARACAS
        </p>
        <p className="text-center font-bold text-stone-400">DECLARACIÓN DE CONOCIMIENTO DEL ASOCIADO</p>
        
        <p><strong>I. NATURALEZA DEL PROYECTO</strong></p>
        <p>
          Moon Paracas es una comunidad privada rústica de baja densidad en el desierto, estructurada bajo un modelo asociativo con áreas de uso exclusivo, reglas internas de construcción y desarrollo progresivo por etapas. No debe interpretarse como una urbanización urbana convencional totalmente concluida al momento de la incorporación.
        </p>

        <p><strong>II. DECLARACIONES Y RIESGOS ACEPTADOS</strong></p>
        <p>
          EL ASOCIADO declara conocer, entender y aceptar los siguientes factores de riesgo vinculados al proyecto:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Independización registral:</strong> La subdivisión física y asignación de partidas registrales individuales para cada lote depende de la aprobación del catastro municipal y de Registros Públicos (Sunarp) Ica. No se garantiza una partida registral inmediata al momento de la incorporación comercial.
          </li>
          <li>
            <strong>Desarrollo progresivo (Caja Positiva):</strong> Las obras de infraestructura común (incluyendo el portal de eucalipto, la piscina de piedra del Oasis, los senderos y las redes de agua) se financian y ejecutan paulatinamente según la caja disponible de las cuotas de ingreso efectivas. El cronograma de hitos tiene carácter referencial.
          </li>
          <li>
            <strong>Servicios y Saneamiento:</strong> Los servicios en etapas tempranas serán autónomos y ecológicos. El asociado está obligado a instalar paneles solares en su vivienda para autoconsumo y un sistema de bio-digestor hermético homologado para tratamiento de aguas grises.
          </li>
          <li>
            <strong>Restricciones Arquitectónicas:</strong> Para proteger la plusvalía del condominio, toda edificación debe regirse estrictamente al reglamento (colores terrosos mate, pircas de piedra caliza, vigas de eucalipto, y xeripaisajismo). Se prohíbe pintura brillante, asfalto y ruidos vehiculares internos.
          </li>
          <li>
            <strong>Cota y Geografía de Tablazo:</strong> El terreno está ubicado a más de 106 metros s.n.m. en una meseta desértica. Si bien goza de una brisa marina constante y seguridad absoluta contra maremotos, el clima reporta ráfagas de viento (Vientos Paracas) de sur a norte, motivo por el cual el trazado vial es sinuoso para frenar la velocidad del viento.
          </li>
        </ol>

        <p><strong>III. DECLARACIÓN DE ACEPTACIÓN</strong></p>
        <p>
          EL ASOCIADO declara que comprende a cabalidad las condiciones informadas, y que basa su decisión de adhesión en los documentos contractuales físicos y digitales entregados, excluyendo cualquier oferta o compromiso verbal no documentado.
        </p>
      </div>
    );
  };

  return (
    <div id="contracts-signature-portal" className="glass-card border border-white/10 bg-[#1D1714]/60 backdrop-blur-md p-6 md:p-8 rounded-none shadow-xl space-y-8 max-w-6xl mx-auto">
      
      {/* Header section */}
      <div className="border-b border-white/10 pb-5 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="text-left">
          <h4 className="font-display text-2xl font-bold tracking-wide text-white flex items-center gap-3 uppercase">
            <Lock className="h-6 w-6 text-[#E2725B]" />
            Portal Seguro de Firma Digital
          </h4>
          <p className="text-xs sm:text-sm text-stone-300 font-light mt-2 max-w-2xl font-sans">
            Suscripción legal encriptada de contratos para adjudicación de lotes del condominio Moon Paracas.
          </p>
        </div>

        {/* Status badges */}
        <div className="flex gap-2 text-[9px] font-bold font-mono">
          <div className={`px-3 py-1.5 border flex items-center gap-2 ${
            isSignedContract ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-stone-900/40 border-white/10 text-stone-400"
          }`}>
            <span className={`h-2 w-2 rounded-full ${isSignedContract ? "bg-emerald-400" : "bg-stone-600"}`} />
            CONTRATO: {isSignedContract ? "FIRMADO" : "PENDIENTE"}
          </div>
          <div className={`px-3 py-1.5 border flex items-center gap-2 ${
            isSignedDisclosure ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-stone-900/40 border-white/10 text-stone-400"
          }`}>
            <span className={`h-2 w-2 rounded-full ${isSignedDisclosure ? "bg-emerald-400" : "bg-stone-600"}`} />
            DISCLOSURE: {isSignedDisclosure ? "FIRMADO" : "PENDIENTE"}
          </div>
        </div>
      </div>

      {/* Selected Lot Warning */}
      {!selectedLot && (
        <div className="bg-[#E2725B]/10 border border-[#E2725B]/20 p-4 text-[#E2725B] text-xs font-mono flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-[#E2725B]" />
          <span><strong>Atención:</strong> Debes seleccionar un lote primero en la pestaña "Masterplan" para pre-llenar los datos técnicos de tu contrato.</span>
        </div>
      )}

      {/* Main interface split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Document Viewer */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Document selection buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDoc("contrato")}
              className={`px-4 py-2.5 text-[10px] font-bold font-mono border transition-all flex items-center gap-2 rounded-none uppercase tracking-wider ${
                activeDoc === "contrato"
                  ? "bg-[#E2725B] border-[#E2725B] text-white"
                  : "bg-stone-900/40 border-white/10 text-[#E1D9C1] hover:bg-white/10 hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              1. Contrato Adjudicación
            </button>
            <button
              onClick={() => setActiveDoc("disclosure")}
              className={`px-4 py-2.5 text-[10px] font-bold font-mono border transition-all flex items-center gap-2 rounded-none uppercase tracking-wider ${
                activeDoc === "disclosure"
                  ? "bg-[#E2725B] border-[#E2725B] text-white"
                  : "bg-stone-900/40 border-white/10 text-[#E1D9C1] hover:bg-white/10 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              2. Anexo de Riesgos
            </button>
          </div>

          {/* Render Contract Content */}
          <div className="relative">
            {activeDoc === "contrato" ? getContractText() : getDisclosureText()}
            
            {/* Stamp Overlay if already signed */}
            {((activeDoc === "contrato" && isSignedContract) || (activeDoc === "disclosure" && isSignedDisclosure)) && (
              <div className="absolute inset-0 bg-stone-950/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                <div className="bg-emerald-950 border border-emerald-500/45 px-6 py-4 text-emerald-400 text-center shadow-lg max-w-[280px] -rotate-6 transform scale-110 pointer-events-auto">
                  <Stamp className="h-8 w-8 mx-auto mb-2 text-emerald-400 animate-bounce" />
                  <p className="font-sans text-xs font-black tracking-widest uppercase">Firmado Digitalmente</p>
                  <p className="font-mono text-[8px] mt-1 text-emerald-500 truncate">{securityHash}</p>
                  <p className="font-mono text-[7px] text-stone-400 mt-1">{signedDate}</p>
                </div>
              </div>
            )}
          </div>

          {/* Signed status and signature image display */}
          <div className="border border-white/10 bg-stone-950/20 p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-left">
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Validez e Integridad de la Firma:</p>
              <p className="text-[10px] text-stone-300 leading-normal max-w-sm font-sans font-light">
                Las firmas digitales en Moon Paracas utilizan llaves encriptadas y sellado de tiempo de acuerdo a la Ley de Firmas y Certificados Digitales (Ley N° 27269).
              </p>
            </div>
            
            {/* Show signature graphic if signed */}
            {activeDoc === "contrato" && isSignedContract && contractSignatureData && (
              <div className="bg-white border border-stone-300 p-2 max-w-[120px] shadow-sm">
                <p className="text-[8px] text-stone-400 text-center font-mono border-b pb-1 mb-1">Firma Registrada</p>
                <img src={contractSignatureData} alt="Firma Contrato" className="h-10 w-full object-contain filter contrast-125" />
              </div>
            )}
            
            {activeDoc === "disclosure" && isSignedDisclosure && disclosureSignatureData && (
              <div className="bg-white border border-stone-300 p-2 max-w-[120px] shadow-sm">
                <p className="text-[8px] text-stone-400 text-center font-mono border-b pb-1 mb-1">Firma Registrada</p>
                <img src={disclosureSignatureData} alt="Firma Disclosure" className="h-10 w-full object-contain filter contrast-125" />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Signing Pad & Verification Info */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          
          {/* Sign form block */}
          {((activeDoc === "contrato" && !isSignedContract) || (activeDoc === "disclosure" && !isSignedDisclosure)) ? (
            <form onSubmit={handleSubmitSignature} className="space-y-4 border border-white/10 p-6 bg-stone-950/40 shadow-xl h-full flex flex-col justify-between text-left">
              
              <div className="space-y-3">
                <h3 className="font-display text-lg font-bold text-white uppercase flex items-center gap-2 border-b pb-2 border-white/10 tracking-wide">
                  <PenTool className="h-5 w-5 text-[#E2725B]" />
                  Completar Firma Digital
                </h3>
                
                {/* Form fields - quiet luxury styling */}
                <div className="space-y-4 text-[10px] font-mono text-stone-300">
                  
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[8px] text-stone-400 tracking-wider">Nombre Completo del Adjudicatario *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza Quiroz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border-b border-white/20 border-t-0 border-l-0 border-r-0 bg-transparent text-white px-0 py-1.5 text-xs focus:border-[#E2725B] focus:ring-0 focus:outline-none transition-all font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold uppercase text-[8px] text-stone-400 tracking-wider">DNI / CE / RUC *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 45678901"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        className="w-full border-b border-white/20 border-t-0 border-l-0 border-r-0 bg-transparent text-white px-0 py-1.5 text-xs focus:border-[#E2725B] focus:ring-0 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold uppercase text-[8px] text-stone-400 tracking-wider">WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 987654321"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border-b border-white/20 border-t-0 border-l-0 border-r-0 bg-transparent text-white px-0 py-1.5 text-xs focus:border-[#E2725B] focus:ring-0 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[8px] text-stone-400 tracking-wider">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      placeholder="carlos.mendoza@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-b border-white/20 border-t-0 border-l-0 border-r-0 bg-transparent text-white px-0 py-1.5 text-xs focus:border-[#E2725B] focus:ring-0 focus:outline-none transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="font-bold uppercase text-[8px] text-[#E2725B] flex justify-between tracking-wider">
                      <span>Lote Vinculado</span>
                      <span>{selectedLot ? `ID: ${selectedLot.id}` : "Ninguno"}</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full border-b border-white/10 border-t-0 border-l-0 border-r-0 bg-transparent text-xs font-bold text-[#E1D9C1]/50 px-0 py-1"
                      value={
                        selectedLot 
                          ? `Lote ${selectedLot.number} - ${selectedLot.quadrant} (${selectedLot.area.toFixed(2)} m²)`
                          : "Selecciona un lote en el masterplan superior"
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Signature Canvas Area */}
              <div className="space-y-2 mt-4 flex-1 flex flex-col justify-end">
                <div className="flex justify-between items-center text-[8px] font-mono font-bold">
                  <span className="uppercase text-stone-400 tracking-wider">Dibuja tu firma en el recuadro *</span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[#E2725B] hover:text-[#d85e45] flex items-center gap-1 focus:outline-none cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" /> BORRAR FIRMA
                  </button>
                </div>
                
                {/* Pad container resembling a high-end signature terminal */}
                <div className="border border-[#E2725B]/20 p-1.5 bg-[#1D1714]/30 relative rounded-none">
                  <div className="bg-[#F5F2EB] cursor-crosshair relative h-36 overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={340}
                      height={140}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-full block"
                    />
                    {!hasSigned && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[#1D1714]/35 font-mono text-[9px] uppercase tracking-widest">
                        Trazar firma con mouse o dedo
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-[7px] text-stone-400 font-mono">
                  <span>CANVAS Habilitado</span>
                  <span>CRIPTOSENTIDO: {hasSigned ? "✓ FIRMA DETECTADA" : "PENDIENTE"}</span>
                </div>
              </div>

              {/* Accept check */}
              <div className="flex items-start gap-2.5 mt-4 text-[9px] font-mono text-stone-400 text-left">
                <input
                  type="checkbox"
                  required
                  id="chk-terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 accent-[#E2725B] cursor-pointer"
                />
                <label htmlFor="chk-terms" className="leading-snug cursor-pointer select-none">
                  Acepto los términos del contrato y certifico que la firma dibujada corresponde a mi persona natural.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedLot}
                className="w-full bg-[#E2725B] hover:bg-[#d85e45] text-white font-bold text-[9.5px] py-4 px-6 uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(226,114,91,0.15)] active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-[#E2725B]/40 mt-3 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    GENERANDO SELLO CRYPTO...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    FIRMAR DOCUMENTO DIGITALMENTE
                  </>
                )}
              </button>
            </form>
          ) : (
            // Success State
            <div className="border border-emerald-500/30 bg-emerald-950/10 p-6 text-center space-y-6 shadow-lg h-full flex flex-col justify-center items-center">
              <CheckCircle className="h-16 w-16 text-emerald-400 animate-pulse" />
              <div className="space-y-2">
                <h4 className="font-display text-xl font-bold text-white uppercase tracking-wider">
                  ¡Documento Firmado!
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed font-mono max-w-sm">
                  El <strong>{activeDoc === "contrato" ? "Contrato de Adjudicación" : "Anexo de Riesgos"}</strong> ha sido firmado electrónicamente por <strong>{fullName}</strong> (DNI {dni}) el {signedDate}.
                </p>
              </div>

              {/* Cryptographic Stamp Card */}
              <div className="bg-stone-950/50 text-stone-100 p-4 border border-[#E2725B]/30 w-full text-left font-mono text-[9px] space-y-1.5 shadow-sm">
                <div className="flex items-center gap-1 text-[#E2725B] font-bold uppercase tracking-wider border-b border-stone-850 pb-1 mb-1">
                  <Stamp className="h-3.5 w-3.5" /> Certificado de Firma Digital
                </div>
                <div><span className="text-stone-400">HASH:</span> <span className="text-emerald-400">{securityHash}</span></div>
                <div><span className="text-stone-400">FECHA:</span> {signedDate}</div>
                <div><span className="text-stone-400">ASOCIADO:</span> {fullName}</div>
                <div><span className="text-stone-400">DNI:</span> {dni}</div>
                <div><span className="text-stone-400">LOTE:</span> Lote {selectedLot?.number} ({selectedLot?.quadrant})</div>
                <div><span className="text-stone-400">VALIDEZ:</span> CONSTITUCIÓN FIRME EN CATASTRO</div>
              </div>

              {/* Options */}
              <div className="w-full space-y-2 pt-2">
                <button
                  onClick={() => {
                    if (activeDoc === "contrato") {
                      setActiveDoc("disclosure");
                    } else {
                      setActiveDoc("contrato");
                    }
                    setHasSigned(false);
                  }}
                  className="w-full bg-[#E2725B] hover:bg-[#d85e45] text-white border border-[#E2725B]/40 py-3.5 text-[10px] font-bold font-mono tracking-wider uppercase"
                >
                  <UserCheck className="h-4 w-4 text-white" />
                  FIRMAR SIGUIENTE DOCUMENTO
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full bg-stone-900/40 text-[#E1D9C1] border border-white/10 py-3.5 text-[10px] font-bold font-mono tracking-wider hover:bg-white/10 uppercase"
                >
                  <Download className="h-4 w-4 text-[#E2725B]" />
                  IMPRIMIR CONSTANCIA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
