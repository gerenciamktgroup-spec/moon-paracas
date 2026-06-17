const fs = require('fs');
const path = require('path');

const filesToInclude = [
  'src/App.tsx',
  'src/components/Header.tsx',
  'src/components/ParacasHistory.tsx',
  'src/components/ConceptGallery.tsx',
  'src/components/ArchitecturalRecommendations.tsx',
  'src/components/LifestyleAmenities.tsx',
  'src/components/EngineeringSpecs.tsx',
  'src/components/LotDetailsModal.tsx',
  'src/components/ContractsSignature.tsx',
  'src/lib/lotModel.ts'
];

let mdContent = `# Contexto del Proyecto Web: Moon Paracas

Este documento contiene el código fuente y los textos clave (copywriting) de la Landing Page del proyecto inmobiliario "Moon Paracas", un Eco-Condominio Rústico de Lujo en Paracas, Perú. 

Este archivo sirve para que una IA entienda de qué trata el proyecto, cuál es el tono de marca, qué amenidades tiene, cómo son las formas de pago y qué historia cuenta.

## Estructura de la Web
La web es una aplicación Single Page Application (SPA) en React (Vite + TailwindCSS) con una estructura de "Long-Scroll Storytelling" que guía al usuario por las siguientes secciones:

1. **Hero & Stats:** La portada con la propuesta de valor principal y contadores de escasez (lotes libres, reservados, etc.).
2. **Historia (ParacasHistory):** Conexión mística con la cultura Paracas y la naturaleza.
3. **Concepto (ConceptGallery):** Explicación del concepto arquitectónico.
4. **Casas (ArchitecturalRecommendations):** Guía de modelos de casas sugeridas.
5. **Estilo de Vida (LifestyleAmenities):** Áreas comunes y amenidades.
6. **Masterplan (App.tsx):** Mapa interactivo topográfico concéntrico.
7. **Simulador de Financiamiento (LotDetailsModal):** Calculadora de pagos sin intereses.
8. **Ingeniería (EngineeringSpecs):** Datos duros, sostenibilidad, muros rompevientos.
9. **Contratos (ContractsSignature):** Flujo de cierre y firma.

---

## Archivos de la Aplicación

`;

filesToInclude.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    mdContent += `### Archivo: \`${file}\`\n\`\`\`tsx\n${content}\n\`\`\`\n\n`;
  } catch (err) {
    console.warn(`Could not read ${file}`);
  }
});

fs.writeFileSync('moon_paracas_context.md', mdContent);
console.log('Context generated successfully!');
