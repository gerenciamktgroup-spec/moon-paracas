const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add imports
const importStatements = `
import { ExperienceAnchor } from "./components/ExperienceAnchor";
import { TechnicalLegacy } from "./components/TechnicalLegacy";
import { ObjectionsBridge } from "./components/ObjectionsBridge";
`;
app = app.replace('import { ContractsSignature } from "./components/ContractsSignature";', 'import { ContractsSignature } from "./components/ContractsSignature";\n' + importStatements);

// 2. Adjust the vertical layout
// Replace history section completely with the new structure down to the Masterplan
const startMarker = '{/* 1. HISTORY & CONCEPT */}';
const endMarker = '{/* 3. PRODUCT: MASTERPLAN */}';

const newStructure = `
          {/* 1. LEGITIMIDAD Y EXPERIENCIA (NUEVO) */}
          <ExperienceAnchor />
          <TechnicalLegacy />

          {/* 2. HISTORIA & CONCEPTO */}
          <section id="history" className="scroll-mt-24 space-y-24">
            <div className="text-center mt-12 mb-[-4rem]">
               <span className="font-mono text-[10px] uppercase tracking-widest text-[#C4A484] border border-[#C4A484] px-3 py-1 rounded-full">
                 La suma de este aprendizaje se refleja en
               </span>
            </div>
            <ParacasHistory />
          </section>

          <section id="concept" className="scroll-mt-24">
            <ConceptGallery />
          </section>

          <section id="architecture" className="scroll-mt-24">
            <ArchitecturalRecommendations />
          </section>

          {/* 3. LIFESTYLE & AMENITIES */}
          <section id="lifestyle" className="scroll-mt-24">
            <div className="text-center mt-12 mb-[-4rem]">
               <span className="font-mono text-[10px] uppercase tracking-widest text-stone-400 border border-stone-300 px-3 py-1 rounded-full">
                 Habiendo validado la viabilidad, proponemos
               </span>
            </div>
            <LifestyleAmenities />
          </section>

          {/* 4. PUENTE DE OBJECIONES ANTES DEL MAPA */}
          <ObjectionsBridge />

          {/* 5. PRODUCT: MASTERPLAN */}
`;

app = app.substring(0, app.indexOf(startMarker)) + newStructure + app.substring(app.indexOf(endMarker) + endMarker.length);

// 3. Adjust wording in Masterplan and Financials
app = app.replace(
  'Masterplan Interactivo',
  'Explora la lógica del desarrollo'
);
app = app.replace(
  'Explora el diseño concéntrico de Moon Paracas. Haz zoom, selecciona parcelas y verifica disponibilidad en tiempo real.',
  'Aquí el valor del lote depende también del conjunto. Trazados eólicos empíricos aplicados para mitigar la fricción de la Paraca y proteger el espacio habitacional.'
);
app = app.replace(
  'Cotizador en Tiempo Real',
  'Calcula tu cronograma'
);
app = app.replace(
  'Verifica las cuotas y planes de financiamiento directo a 18 meses con 0% de interés del lote seleccionado.',
  'Sin intermediarios bancarios, con una estructura de crédito directo diseñada para proteger tu flujo de caja mientras la obra avanza.'
);

fs.writeFileSync('src/App.tsx', app);
console.log('App.tsx refactored');
