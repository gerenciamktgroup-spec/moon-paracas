import React, { useState } from "react";
import { Scale, FileText, Landmark, Clock, ShieldAlert, Download } from "lucide-react";

interface DocSection {
  title: string;
  badge: string;
  articles: { num: string; name: string; content: string }[];
}

export const ContractsAndRules: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<"contrato" | "reglamento" | "anexo">("contrato");

  const documents: { [key: string]: DocSection } = {
    contrato: {
      title: "Contrato de Adjudicación Directa y Derechos Exclusivos",
      badge: "Garantía de Adjudicación Directa",
      articles: [
        {
          num: "Clausula 1",
          name: "Objeto de la Adjudicación",
          content: "El presente instrumento regula la incorporación del Asociado y le concede un Derecho Exclusivo de Adjudicación sobre el lote seleccionado. Este derecho asegura la posesión definitiva y propiedad exclusiva del terreno dentro del masterplan catastral, facultando al asociado al codiseño en áreas comunes (Oasis Central de piedra, senderos peatonales, pórtico de control de acceso y estacionamiento fotovoltaico centralizado)."
        },
        {
          num: "Clausula 2",
          name: "Inversión Flexible sin Intereses",
          content: "La cuota de ingreso correspondiente al lote seleccionado se establece según la lista de precios oficial de preventa. El asociado se compromete a abonar un aporte inicial correspondiente al 30% del valor total de adjudicación al momento de la firma, deduciéndose los S/ 1,000 abonados en concepto de separación previa. El saldo restante (70%) se financiará directamente en aportes mensuales sin intereses."
        },
        {
          num: "Clausula 3",
          name: "Garantías de Entrega y Escrituración Pública",
          content: "El financiamiento es directo, sin evaluación bancaria ni costos financieros adicionales. La posesión física del lote para iniciar obras arquitectónicas se otorga una vez completada la cuota inicial y suscrito el reglamento interno. La elevación a Escritura Pública notarial de adjudicación definitiva se realiza tras la cancelación del 100% del aporte comprometido."
        },
        {
          num: "Clausula 4",
          name: "Protección y Rescisión Comercial",
          content: "El retraso fortuito o reiterado de 2 aportes mensuales consecutivos otorgará un plazo de subsanación de 15 días calendario. De no regularizarse, la administración podrá aplicar una penalidad diaria del 0.1% sobre el saldo vencido, o en su defecto rescindir la adjudicación restituyendo los aportes recibidos tras una deducción del 15% del total del lote por gastos administrativos y comerciales."
        }
      ]
    },
    reglamento: {
      title: "Reglamento de Coexistencia: Protección de tu Plusvalía",
      badge: "Protección de Plusvalía y Estilo de Vida",
      articles: [
        {
          num: "Artículo 1",
          name: "Garantía de Vistas Libres y Alturas",
          content: "Con el fin de resguardar el paisaje infinito de la meseta y asegurar luz natural para cada lote, la altura máxima de construcción autorizada es de 2 pisos más azotea transitable ligera (pérgola de eucalipto seco, zona Zen). Queda terminantemente prohibido superar los 7.20 metros de altura desde la cota original de la roca en cada parcela."
        },
        {
          num: "Artículo 2",
          name: "Armonía Estética y Materiales Nobles",
          content: "Para preservar el estatus estético de Moon Paracas, se prohíbe el uso de colores brillantes o sintéticos en fachadas. Se autorizan acabados rústicos y texturados en colores tierra (arena, terracota, siena, ocre y beige). Los límites y divisiones frontales de las parcelas deben ejecutarse usando muros bajos (pircas) de piedra natural caliza."
        },
        {
          num: "Artículo 3",
          name: "Eco-Autonomía Solar y Saneamiento",
          content: "Para mantener un condominio 100% libre de cables aéreos y contaminación, cada residencia debe instalar paneles solares fotovoltaicos en su azotea para el suministro de energía limpia. Asimismo, cada vivienda requiere equipar un bio-digestor autolimpiable hermético homologado para tratamiento de aguas residuales, quedando prohibida la infiltración al subsuelo."
        },
        {
          num: "Artículo 4",
          name: "Santuario de Silencio y Aire Limpio",
          content: "Para garantizar la paz acústica y la fauna local, no se permite el tránsito de vehículos de combustión interna (gasolina/diésel) dentro de los caminos condominales. Toda movilidad interna se realizará a pie, en bicicleta o en buggies eléctricos silenciosos. Se establece un límite de ruido de 40dB a partir de las 22:00 horas."
        }
      ]
    },
    anexo: {
      title: "Compromiso de Hitos de Obra y Cronograma",
      badge: "Cronograma de Infraestructura",
      articles: [
        {
          num: "Fase 1",
          name: "Replanteo Catastral y Vías de Arcilla",
          content: "Replanteo geográfico de las 11.23 hectáreas sobre roca sedimentaria consolidada. Trazado, nivelación de senderos, afirmado de vías principales con salmuera (cero polvo) e hitos topográficos de demarcación para cada lote."
        },
        {
          num: "Fase 2",
          name: "Seguridad y Pórtico Monumental",
          content: "Edificación del pórtico de seguridad de doble ingreso (residentes y visitas) con caseta de vigilancia construida en piedra caliza rústica y vigas de eucalipto seco, operativo con personal permanente 24/7."
        },
        {
          num: "Fase 3",
          name: "El Oasis Central de 395m²",
          content: "Construcción de la gran piscina de pirca de piedra natural (395m²), el espejo de agua central (252m²), decks comunes de madera Shihuahuaco, zonas Zen de meditación y fogones para atardeceres."
        },
        {
          num: "Fase 4",
          name: "Entrega Física e Inicio de Construcción",
          content: "Suscripción de Actas de Entrega física de los lotes. El propietario podrá iniciar la edificación de su villa una vez que el comité de arquitectura valide que los planos cumplen con el reglamento estético."
        }
      ]
    }
  };

  const currentDoc = documents[selectedDoc];

  return (
    <div id="contracts" className="glass-card border border-white/10 bg-[#1D1714]/60 backdrop-blur-md p-6 md:p-8 rounded-none shadow-xl space-y-8 max-w-6xl mx-auto">
      
      {/* Title & Document Selection Index */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-5 text-left">
        <div className="space-y-1.5">
          <h4 className="font-display text-2xl font-bold tracking-wide text-white uppercase flex items-center gap-3">
            <Scale className="h-6 w-6 text-[#E2725B]" />
            Certeza Jurídica y Respaldo
          </h4>
          <p className="text-xs text-stone-300 font-light font-sans">
            Expediente legal completo de copropiedad e integración para la adquisición segura de parcelas en Moon Paracas.
          </p>
        </div>

        {/* Index tab bar resembling luxury binder tabs */}
        <div className="flex flex-wrap gap-1 bg-stone-950/65 border border-white/15 p-1 rounded-none shrink-0 font-mono">
          <button
            onClick={() => setSelectedDoc("contrato")}
            className={`px-4 py-2 rounded-none text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              selectedDoc === "contrato" 
                ? "bg-[#E2725B] text-white shadow-[0_2px_8px_rgba(226,114,91,0.25)]" 
                : "text-[#E1D9C1]/80 hover:bg-white/5 hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> Adjudicación Directa
          </button>
          <button
            onClick={() => setSelectedDoc("reglamento")}
            className={`px-4 py-2 rounded-none text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              selectedDoc === "reglamento" 
                ? "bg-[#E2725B] text-white shadow-[0_2px_8px_rgba(226,114,91,0.25)]" 
                : "text-[#E1D9C1]/80 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Scale className="h-3.5 w-3.5" /> Reglamento de Plusvalía
          </button>
          <button
            onClick={() => setSelectedDoc("anexo")}
            className={`px-4 py-2 rounded-none text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              selectedDoc === "anexo" 
                ? "bg-[#E2725B] text-white shadow-[0_2px_8px_rgba(226,114,91,0.25)]" 
                : "text-[#E1D9C1]/80 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Compromiso de Hitos
          </button>
        </div>
      </div>

      {/* Main Legal Content Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left Column: Certified Binder Meta Card */}
        <div className="space-y-5 lg:col-span-4 flex flex-col justify-between">
          <div className="rounded-none bg-stone-950/45 border border-[#E2725B]/20 p-6 space-y-6 relative overflow-hidden shadow-inner flex-1">
            {/* Holographic style light reflection decoration */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#E2725B]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-2 text-[9px] font-bold text-[#E2725B] uppercase tracking-widest font-mono">
                <Landmark className="h-4 w-4" />
                {currentDoc.badge}
              </span>
              <span className="text-[7.5px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded-sm">
                Copia Certificada
              </span>
            </div>

            <p className="text-[11.5px] text-stone-300 leading-relaxed font-sans font-light">
              Expediente legal constitutivo oficial del eco-condominio Moon Paracas, registrado ante Sunarp. Regula la coexistencia comunal y resguarda la plusvalía del proyecto.
            </p>

            {/* Official Registry Details Table */}
            <div className="border-t border-white/5 pt-4 space-y-2.5 font-mono text-[9px] uppercase tracking-wider">
              <div className="flex justify-between text-stone-400">
                <span>Registros Públicos:</span>
                <span className="text-white font-bold">SUNARP ICA</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Partida Registral:</span>
                <span className="text-white font-bold">N° 11223344</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Notaría Asignada:</span>
                <span className="text-[#E2725B] font-bold">Ica / Pisco</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Fideicomiso:</span>
                <span className="text-white font-bold">Caja Positiva</span>
              </div>
            </div>

            {/* Summary List */}
            <div className="bg-[#1D1714]/30 p-4 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-[9.5px] font-bold text-[#E1D9C1] font-mono uppercase tracking-wider">
                <ShieldAlert className="h-3.5 w-3.5 text-[#E2725B]" /> Garantías Clave:
              </div>
              <ul className="text-[9.5px] leading-relaxed text-stone-400 pl-4 list-disc space-y-1 font-sans font-light">
                <li>Financiamiento directo 100% sin intereses bancarios.</li>
                <li>Garantía de uniformidad estética en tonos desierto y pircas.</li>
                <li>Independencia con paneles solares y PTAR ecológica.</li>
                <li>Historial Sunarp impecable con posesión garantizada.</li>
              </ul>
            </div>
          </div>

          <button className="w-full rounded-none bg-[#E2725B] hover:bg-[#d85e45] text-white py-3.5 text-[9.5px] font-bold uppercase tracking-widest transition-all border border-[#E2725B]/40 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(226,114,91,0.15)] active:translate-y-0.5 cursor-pointer">
            <Download className="h-4 w-4" /> Descargar Expediente PDF
          </button>
        </div>

        {/* Right Column: Clean Article Visor */}
        <div className="lg:col-span-8 space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar bg-stone-950/20 border border-white/5 p-4 sm:p-5 shadow-inner">
          {currentDoc.articles.map((art) => (
            <div key={art.num} className="rounded-none border border-white/10 bg-[#1D1714]/10 p-5 space-y-3.5 select-text hover:border-[#E2725B]/30 hover:bg-[#1D1714]/20 transition-all duration-300 border-l-4 border-l-[#E2725B] shadow-sm">
              <div className="flex items-center gap-3 text-sm border-b border-white/5 pb-2">
                <span className="rounded-none bg-stone-900 text-[#E1D9C1] font-mono text-[9px] font-bold px-2.5 py-0.5 uppercase tracking-wider border border-white/10">
                  {art.num}
                </span>
                <span className="font-display font-bold text-white text-sm uppercase tracking-wide">
                  {art.name}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-300 font-sans font-light">
                {art.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
