const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove AnimatePresence and motion imports
app = app.replace(/import \{ motion, AnimatePresence \} from "framer-motion";\n/, 'import { motion } from "framer-motion";\n');

// 2. We need to replace the entire dynamic content block.
const startMarker = "{/* Dynamic Content based on tabs */}";
const endMarker = "</AnimatePresence>";

const startIndex = app.indexOf(startMarker);
const endIndex = app.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find markers");
    process.exit(1);
}

const newContent = `
        {/* =========================================
            LONG-SCROLL STORYTELLING CONTENT 
            ========================================= */}
        <div className="flex flex-col space-y-32 mt-16">
          
          {/* 1. HISTORY & CONCEPT */}
          <section id="history" className="scroll-mt-24 space-y-24">
            <ParacasHistory />
          </section>

          <section id="concept" className="scroll-mt-24">
            <ConceptGallery />
          </section>

          <section id="architecture" className="scroll-mt-24">
            <ArchitecturalRecommendations />
          </section>

          {/* 2. LIFESTYLE & AMENITIES */}
          <section id="lifestyle" className="scroll-mt-24">
            <LifestyleAmenities />
          </section>

          {/* 3. PRODUCT: MASTERPLAN */}
          <section id="masterplan" className="scroll-mt-24">
             <div className="text-center space-y-4 mb-8">
               <h2 className="font-display text-4xl sm:text-5xl font-black text-[#2D3339] uppercase tracking-wider">
                 Masterplan Interactivo
               </h2>
               <p className="text-stone-600 font-mono text-sm max-w-2xl mx-auto">
                 Explora el diseño concéntrico de Moon Paracas. Haz zoom, selecciona parcelas y verifica disponibilidad en tiempo real.
               </p>
             </div>
             <div className="w-full">
                <MoonParacasMap
                  lots={lots}
                  selectedLot={selectedLot}
                  onSelectLot={setSelectedLot}
                />
             </div>
          </section>

          {/* 4. FINANCIAL SIMULATOR */}
          <section id="financiamiento" className="scroll-mt-24 w-full max-w-2xl mx-auto">
            <div className="text-center space-y-2 mb-6">
               <h2 className="font-display text-3xl font-black text-[#2D3339] uppercase tracking-wider">
                 Cotizador en Tiempo Real
               </h2>
               <p className="text-stone-500 font-mono text-sm max-w-lg mx-auto">
                 Verifica las cuotas y planes de financiamiento directo a 18 meses con 0% de interés del lote seleccionado.
               </p>
            </div>
            <LotDetailsModal
              lot={selectedLot}
              onReserve={handleReserveLot}
            />
          </section>

          {/* 5. ENGINEERING SPECS */}
          <section id="engineering" className="scroll-mt-24">
            <EngineeringSpecs />
          </section>

          {/* 6. CONTRACTS & SIGNATURE */}
          <section id="signature" className="scroll-mt-24">
            <ContractsSignature 
              selectedLot={selectedLot}
              onSignatureSuccess={(msg) => {
                setToastMessage(msg);
                setTimeout(() => setToastMessage(null), 5500);
              }}
            />
          </section>

        </div>
`;

app = app.substring(0, startIndex) + newContent + app.substring(endIndex + endMarker.length);

// We need to also remove activeTab from the state.
app = app.replace(/const \[activeTab, setActiveTab\] = useState<[^>]+>\("masterplan"\);\n/, '');
app = app.replace(/<Header activeTab=\{activeTab\} setActiveTab=\{setActiveTab\} \/>/, '<Header />');

fs.writeFileSync('src/App.tsx', app);
console.log("App.tsx refactored successfully.");
