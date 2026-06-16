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
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [activeDoc, isSignedContract, isSignedDisclosure]);

  // Handle drawing events
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch or mouse
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
    ctx.strokeStyle = "#2D3339"; // dark slate ink
    
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
    ctx.fillStyle = "#FFFFFF";
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
    
    // Simulate network delay for secure signature creation
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
      
      // Update Firestore if needed to block/reserve the lot under this name
      try {
        const lotRef = doc(db, "lots", selectedLot.id);
        await updateDoc(lotRef, {
          status: "blocked", // Lock the lot on successful signature
          priceLabel: "RESERVADO"
        });
      } catch (err) {
        console.warn("Firestore update omitted or failed:", err);
      }

      onSignatureSuccess(`¡Documento firmado digitalmente con éxito! Código Hash de Seguridad: ${generatedHash.substring(0, 15)}...`);
    }, 1800);
  };

  // Personalized Contract text
  const lotNumber = selectedLot?.number || "[___]";
  const lotArea = selectedLot?.area?.toFixed(2) || "250.00";
  const lotPrice = selectedLot?.price 
    ? "S/ " + selectedLot.price.toLocaleString('es-PE', { maximumFractionDigits: 0 })
    : "[___]";
  const lotQuadrant = selectedLot?.quadrant || "[___]";

  const getContractText = () => {
    return (
      <div className="space-y-4 text-xs text-stone-700 leading-relaxed font-mono select-text bg-stone-50 p-5 border border-stone-200 h-[380px] overflow-y-auto">
        <p className="text-center font-bold text-sm text-[#2D3339] border-b pb-2 uppercase">
          CONTRATO DE INCORPORACION Y ADJUDICACION DE AREA DE USO EXCLUSIVO
        </p>
        <p className="text-center font-bold">MOON PARACAS — ETAPA FUNDADORA</p>
        
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

        <p className="pt-4 text-center font-bold">
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
      <div className="space-y-4 text-xs text-stone-700 leading-relaxed font-mono select-text bg-stone-50 p-5 border border-stone-200 h-[380px] overflow-y-auto">
        <p className="text-center font-bold text-sm text-[#2D3339] border-b pb-2 uppercase">
          ANEXO DE RIESGOS Y DISCLOSURE — MOON PARACAS
        </p>
        <p className="text-center font-bold">DECLARACIÓN DE CONOCIMIENTO DEL ASOCIADO</p>
        
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
    <div id="contracts-signature-portal" className="rounded-none border border-stone-200 bg-white p-6 md:p-10 shadow-sm space-y-8 max-w-6xl mx-auto">
      
      {/* Header section */}
      <div className="border-b border-stone-200 pb-5 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#2D3339] flex items-center justify-center lg:justify-start gap-3">
            <Lock className="h-7 w-7 text-[#C4A484]" />
            Portal Seguro de Firma Digital
          </h2>
          <p className="text-base text-stone-600 mt-2 max-w-2xl">
            Suscripción legal encriptada de contratos para adjudicación de lotes del condominio Moon Paracas.
          </p>
        </div>

        {/* Status badges */}
        <div className="flex gap-3 text-[11px] font-bold font-mono">
          <div className={`px-3 py-1.5 border flex items-center gap-2 ${
            isSignedContract ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-stone-50 border-stone-300 text-stone-500"
          }`}>
            <span className={`h-2.5 w-2.5 rounded-full ${isSignedContract ? "bg-emerald-500" : "bg-stone-300"}`} />
            CONTRATO: {isSignedContract ? "FIRMADO" : "PENDIENTE"}
          </div>
          <div className={`px-3 py-1.5 border flex items-center gap-2 ${
            isSignedDisclosure ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-stone-50 border-stone-300 text-stone-500"
          }`}>
            <span className={`h-2.5 w-2.5 rounded-full ${isSignedDisclosure ? "bg-emerald-500" : "bg-stone-300"}`} />
            DISCLOSURE: {isSignedDisclosure ? "FIRMADO" : "PENDIENTE"}
          </div>
        </div>
      </div>

      {/* Selected Lot Warning */}
      {!selectedLot && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 text-amber-800 text-xs font-mono flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-600" />
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
              className={`px-4 py-2 text-xs font-bold font-mono border-2 transition-all flex items-center gap-2 ${
                activeDoc === "contrato"
                  ? "bg-[#2D3339] border-[#2D3339] text-white"
                  : "bg-white border-[#2D3339] text-[#2D3339] hover:bg-[#F4F4F1]"
              }`}
            >
              <FileText className="h-4 w-4" />
              1. Contrato Adjudicación
            </button>
            <button
              onClick={() => setActiveDoc("disclosure")}
              className={`px-4 py-2 text-xs font-bold font-mono border-2 transition-all flex items-center gap-2 ${
                activeDoc === "disclosure"
                  ? "bg-[#2D3339] border-[#2D3339] text-white"
                  : "bg-white border-[#2D3339] text-[#2D3339] hover:bg-[#F4F4F1]"
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
              <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                <div className="bg-emerald-50 border-4 border-emerald-500 px-6 py-4 text-emerald-800 text-center shadow-lg max-w-[280px] -rotate-6 transform scale-110 pointer-events-auto">
                  <Stamp className="h-8 w-8 mx-auto mb-2 text-emerald-600 animate-bounce" />
                  <p className="font-sans text-sm font-black tracking-widest uppercase">Firmado Digitalmente</p>
                  <p className="font-mono text-[9px] mt-1 text-emerald-600 truncate">{securityHash}</p>
                  <p className="font-mono text-[8px] text-stone-500 mt-1">{signedDate}</p>
                </div>
              </div>
            )}
          </div>

          {/* Signed status and signature image display */}
          <div className="border border-stone-200 bg-stone-50 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-xs font-bold text-[#2D3339]">Validez e Integridad de la Firma:</p>
              <p className="text-[10px] text-stone-500 leading-normal max-w-sm">
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
            <form onSubmit={handleSubmitSignature} className="space-y-4 border-2 border-[#2D3339] p-5 bg-stone-50 shadow-[4px_4px_0px_#2D3339] h-full flex flex-col justify-between">
              
              <div className="space-y-3">
                <h3 className="font-display text-lg font-black text-[#2D3339] uppercase flex items-center gap-2 border-b pb-2 border-[#2D3339]/10">
                  <PenTool className="h-5 w-5 text-[#C4A484]" />
                  Completar Firma Digital
                </h3>
                
                {/* Form fields */}
                <div className="space-y-2 text-[10px] font-mono text-[#2D3339]">
                  
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[9px] text-stone-500">Nombre Completo del Adjudicatario *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza Quiroz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-none border border-[#2D3339] px-2.5 py-1.5 text-xs hover:bg-stone-100 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold uppercase text-[9px] text-stone-500">DNI / CE / RUC *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 45678901"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        className="w-full rounded-none border border-[#2D3339] px-2.5 py-1.5 text-xs hover:bg-stone-100 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold uppercase text-[9px] text-stone-500">WhatsApp / Celular *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. +51 987 654 321"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-none border border-[#2D3339] px-2.5 py-1.5 text-xs hover:bg-stone-100 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[9px] text-stone-500">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      placeholder="carlos.mendoza@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-none border border-[#2D3339] px-2.5 py-1.5 text-xs hover:bg-stone-100 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="font-bold uppercase text-[9px] text-[#C4A484] flex justify-between">
                      <span>Lote Vinculado</span>
                      <span>{selectedLot ? `ID: ${selectedLot.id}` : "Ninguno"}</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full rounded-none border border-[#2D3339] px-2.5 py-1.5 text-xs bg-stone-200 font-bold text-stone-600"
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
              <div className="space-y-2 mt-3 flex-1 flex flex-col justify-end">
                <div className="flex justify-between items-center text-[9px] font-mono text-[#2D3339] font-bold">
                  <span className="uppercase text-stone-500">Dibuja tu firma aquí abajo *</span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 focus:outline-none"
                  >
                    <RefreshCw className="h-3 w-3" /> BORRAR FIRMA
                  </button>
                </div>
                
                <div className="border-2 border-[#2D3339] bg-white cursor-crosshair relative h-36">
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
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-stone-300 font-mono text-[11px] uppercase tracking-widest">
                      Firmar con el mouse/dedo
                    </div>
                  )}
                </div>
              </div>

              {/* Accept check */}
              <div className="flex items-start gap-2.5 mt-4 text-[10px] font-mono text-stone-600">
                <input
                  type="checkbox"
                  required
                  id="chk-terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 accent-[#C4A484] cursor-pointer"
                />
                <label htmlFor="chk-terms" className="leading-snug cursor-pointer select-none">
                  Acepto los términos del contrato y certifico que la firma dibujada corresponde a mi persona natural.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedLot}
                className="w-full bg-[#C4A484] border-2 border-[#2D3339] text-white font-bold text-xs py-3.5 px-6 uppercase tracking-widest hover:bg-[#b08e6e] transition-all shadow-[3px_3px_0px_#2D3339] active:translate-y-0.5 active:shadow-[1px_1px_0px_#2D3339] mt-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <div className="border-4 border-[#8C905C] bg-[#8C905C]/5 p-6 text-center space-y-6 shadow-lg h-full flex flex-col justify-center items-center">
              <CheckCircle className="h-16 w-16 text-[#8C905C] animate-pulse" />
              <div className="space-y-2">
                <h4 className="font-display text-xl font-black text-[#2D3339] uppercase tracking-wider">
                  ¡Documento Firmado!
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-mono max-w-sm">
                  El <strong>{activeDoc === "contrato" ? "Contrato de Adjudicación" : "Anexo de Riesgos"}</strong> ha sido firmado electrónicamente por <strong>{fullName}</strong> (DNI {dni}) el {signedDate}.
                </p>
              </div>

              {/* Cryptographic Stamp Card */}
              <div className="bg-[#2D3339] text-stone-100 p-4 border-2 border-[#C4A484] w-full text-left font-mono text-[9px] space-y-1.5 shadow-sm">
                <div className="flex items-center gap-1 text-[#C4A484] font-bold uppercase tracking-wider border-b border-stone-700 pb-1 mb-1">
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
                    // Reset signature to let them sign the other document
                    if (activeDoc === "contrato") {
                      setActiveDoc("disclosure");
                    } else {
                      setActiveDoc("contrato");
                    }
                    setHasSigned(false);
                  }}
                  className="w-full bg-[#2D3339] text-white border-2 border-[#2D3339] py-3 text-xs font-bold font-mono tracking-wider hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="h-4 w-4 text-[#C4A484]" />
                  FIRMAR SIGUIENTE DOCUMENTO
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full bg-white text-[#2D3339] border-2 border-[#2D3339] py-3 text-xs font-bold font-mono tracking-wider hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4 text-[#C4A484]" />
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
