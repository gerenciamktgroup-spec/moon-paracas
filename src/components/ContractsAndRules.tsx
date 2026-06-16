import React, { useState } from "react";
import { Scale, FileText, Landmark, Clock, ArrowRight, ShieldAlert, Download } from "lucide-react";

interface DocSection {
  title: string;
  badge: string;
  articles: { num: string; name: string; content: string }[];
}

export const ContractsAndRules: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<"contrato" | "reglamento" | "anexo">("contrato");

  const documents: { [key: string]: DocSection } = {
    contrato: {
      title: "Contrato de Incorporación y Adjudización de Lote",
      badge: "Documento Legal Base",
      articles: [
        {
          num: "Clausula 1",
          name: "Objeto de la Incorporación",
          content: "El presente instrumento regula la incorporación del Asociado a la Asociación Civil de Propietarios Moon Paracas. El asociado adquiere un Derecho Exclusivo de Adjudicación para el lote seleccionado de la tiza catastral, el cual cuenta con linderos rústicos de baja densidad y derecho de concomitancia en áreas comunes (Oasis Central, vías internas, pórtico de ingreso y estacionamiento solar)."
        },
        {
          num: "Clausula 2",
          name: "Precio y Modalidad del Aporte Económico",
          content: "El aporte total se establece de acuerdo a la escala tarifaria del lote seleccionado. El asociado asume la obligación de aportar una cuota de ingreso inicial mínima correspondiente al 30% del valor del lote al momento de firma, dedonándose los S/ 1,000 otorgados en concepto de separación previa. El 70% saldo restante se financiará directamente en un calendario rígido de hasta 12 meses sin interés."
        },
        {
          num: "Clausula 3",
          name: "Mecanismo de Financiamiento y Garantías",
          content: "El financiamiento es otorgado de forma directa por la administración del fideicomiso promotor de Moon Paracas, sin requerimiento de intermediación bancaria tradicional. Los lotes se entregan en posesión provisional para obras una vez pagada la cuota inicial y firmado el reglamento. La minuta de adjudicación definitiva se elevará ante registro notarial una vez cancelado el 100% de la cuota comprometida."
        },
        {
          num: "Clausula 4",
          name: "Penalidades, Mora y Rescisión",
          content: "El retraso en el pago de 2 cuotas mensuales consecutivas facultará a la mesa de administración de la asociación a penalizar al asociado con un cargo diario del 0.1% del valor vencido, o alternativamente rescindir unilateralmente el contrato, restituyendo los aportes tras aplicar una retención administrativa correspondiente al 15% del total del lote por concepto de gastos comerciales."
        }
      ]
    },
    reglamento: {
      title: "Reglamento Interno de Edificación y Coexistencia",
      badge: "Anexo Técnico Obligatorio",
      articles: [
        {
          num: "Artículo 1",
          name: "Parámetros Urbanísticos y Alturas",
          content: "Bajo el principio de respeto y protección visual, la altura máxima de construcción autorizada para edificaciones privadas de vivienda unifamiliar es de 2 pisos más azotea transitable ligera (pérgola de madera, zona de sombra rústica). Queda estrictamente prohibido sobrepasar los 7.20 metros de altura desde la cota topográfica original del lote."
        },
        {
          num: "Artículo 2",
          name: "Alineación de Colores y Revestimientos",
          content: "Para preservar la armonía ecológica del desierto de Paracas, se prohíben fachadas de colores vívidos o brillantes. Solo se autorizan acabados texturados (microcemento, barro estabilizado, pintura látex mate) en escala de colores arena, terracota, siena, ocre desértico y beige. Los cercos frontales y linderos deben ejecutarse usando muros bajos de mampostería de piedra natural de canteras de Ica."
        },
        {
          num: "Artículo 3",
          name: "Energías Renovables y Saneamiento Hídrico",
          content: "Cada adjudicatario está obligado a instalar y dar mantenimiento a un sistema de generación fotovoltaica individual autoconsumible en su azotea para el suministro eléctrico. Asimismo, es requisito indispensable que toda villa cuente con un sistema de bio-digestor hermético homologado para tratamiento de aguas grises de riego, quedando terminantemente prohibido verter residuos líquidos directamente al subsuelo arenoso."
        },
        {
          num: "Artículo 4",
          name: "Silencio y Movilidad Ecoeficiente",
          content: "Con el objetivo de garantizar un ambiente de paz y el avistamiento de aves migratorias típicas de la reserva, queda prohibida la circulación interna de vehículos de combustión convencional (gasolina/diésel) en las vías internas. La movilidad condominal se restringe exclusivamente a buggies eléctricos, carritos de golf, bicicletas de montaña o caminata. Se establece un límite máximo de ruido de 40dB a partir de las 22:00 horas."
        }
      ]
    },
    anexo: {
      title: "Anexo de Obras, Plazos de Entrega y Hitos",
      badge: "Cronograma Vinculante",
      articles: [
        {
          num: "Fase 1",
          name: "Hito de Saneamiento y Vías Internas",
          content: "Ejecución del replanteo general de las 11.23 hectáreas basadas en la planimetría de linderos oficiales de Registros Públicos de Ica. Trazado, nivelación de senderos, afirmado de vías principales con mezcla de arcilla y cal, e identificación topográfica de cada lote del 1 al 250."
        },
        {
          num: "Fase 2",
          name: "Pórtico y Áreas de Control",
          content: "Edificación del pórtico monumental de eucalipto seco con caseta de vigilancia de doble ingreso, pozo séptico de contingencia y cerco frontal de piedra rústica. Plazo estimado de finalización: mes 12 del proyecto."
        },
        {
          num: "Fase 3",
          name: "El Oasis Central y Piscina de Piedra",
          content: "Construcción de la piscina oasis central de 395 m² revestida de piedra natural, junto con un espejo de agua de 252 m², terrazas (decks) de madera, fogón central y áreas verdes nativas."
        },
        {
          num: "Fase 4",
          name: "Entrega Catastral Física",
          content: "Suscripción progresiva de las Actas de Entrega de Tizas Catastrales de cada lote. El asociado puede iniciar obras físicas de su villa a partir de esta firma, siempre que el comité de arquitectura pre-apruebe los planos de obra según el reglamento interno."
        }
      ]
    }
  };

  const currentDoc = documents[selectedDoc];

  return (
    <div id="contracts" className="rounded-none border border-stone-200 bg-white p-6 md:p-10 shadow-sm space-y-8 max-w-6xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-5">
        <div className="space-y-2">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#2D3339] flex items-center gap-3">
            <Scale className="h-7 w-7 text-[#C4A484]" />
            Marco Legal y Contratos
          </h2>
          <p className="text-base text-stone-600">
            Transparencia legal de copropiedad para asociados fundadores del eco-condominio Moon Paracas.
          </p>
        </div>

        {/* Toggle selectors */}
        <div className="flex flex-wrap gap-2 bg-[#F4F4F1] border-2 border-[#2D3339] p-1.5 rounded-none shrink-0 border-b-4">
          <button
            onClick={() => setSelectedDoc("contrato")}
            className={`px-4 py-2 rounded-none text-sm font-bold flex items-center gap-2 transition-all ${
              selectedDoc === "contrato" ? "bg-[#2D3339] text-white" : "text-[#2D3339] hover:bg-stone-200"
            }`}
          >
            <FileText className="h-4 w-4" /> Compra
          </button>
          <button
            onClick={() => setSelectedDoc("reglamento")}
            className={`px-4 py-2 rounded-none text-sm font-bold flex items-center gap-2 transition-all ${
              selectedDoc === "reglamento" ? "bg-[#2D3339] text-white" : "text-[#2D3339] hover:bg-stone-200"
            }`}
          >
            <Scale className="h-4 w-4" /> Reglamento
          </button>
          <button
            onClick={() => setSelectedDoc("anexo")}
            className={`px-4 py-2 rounded-none text-sm font-bold flex items-center gap-2 transition-all ${
              selectedDoc === "anexo" ? "bg-[#2D3339] text-white" : "text-[#2D3339] hover:bg-stone-200"
            }`}
          >
            <Clock className="h-4 w-4" /> Anexo Obras
          </button>
        </div>
      </div>

      {/* Main Legal Content Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column info overview */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-none bg-[#F4F4F1] border-2 border-[#2D3339] p-5 space-y-4 border-b-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#2D3339] uppercase tracking-wider font-mono border-b-2 pb-2 border-[#2D3339]/10">
              <Landmark className="h-5 w-5 text-[#C4A484]" />
              {currentDoc.badge}
            </div>

            <p className="text-sm text-stone-700 leading-relaxed">
              Este instrumento de alta rigurosidad jurídica se entrega al concretar la separación del lote. Regula la coexistencia bioclimática y garantiza la preservación ecológica y plusvalía condominal.
            </p>

            <div className="rounded-none bg-white p-4 space-y-3 border-2 border-[#2D3339]/20">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D3339] font-mono uppercase">
                <ShieldAlert className="h-4 w-4 text-[#C4A484]" /> Puntos Críticos:
              </div>
              <ul className="text-xs leading-relaxed text-stone-700 pl-4 list-disc space-y-1.5 font-mono">
                <li>30% de Inicial firma con Notaría en Ica.</li>
                <li>Gamas arena, ocre, siena desérticas.</li>
                <li>Energía solar obligatoria individual.</li>
                <li>Prototipos de villas integradas listos.</li>
              </ul>
            </div>
          </div>

          <button className="w-full rounded-none bg-white border-2 border-[#2D3339] py-3.5 text-sm font-bold text-[#2D3339] transition-all hover:bg-[#F4F4F1] flex items-center justify-center gap-2 border-b-4 active:translate-y-0.5 active:border-b-2">
            <Download className="h-4 w-4 text-[#C4A484]" /> Descargar PDF
          </button>
        </div>

        {/* Right column: Clauses Accordions */}
        <div className="lg:col-span-8 space-y-4 max-h-[420px] overflow-y-auto pr-2">
          {currentDoc.articles.map((art) => (
            <div key={art.num} className="rounded-none border-2 border-[#2D3339] bg-white p-5 space-y-3 select-text shadow-sm border-l-4 border-l-[#C4A484]">
              <div className="flex items-center gap-3 text-sm border-b border-[#2D3339]/10 pb-2">
                <span className="rounded-none bg-[#2D3339] text-[#F4F4F1] font-mono text-xs font-bold px-2 py-1 uppercase tracking-wide">
                  {art.num}
                </span>
                <span className="font-display font-bold text-[#2D3339] text-base uppercase">
                  {art.name}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-stone-600">
                {art.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
