const fs = require('fs');
let headerCode = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Replace sticky bar text
headerCode = headerCode.replace(
  'Antes de cotizar, entiende qué sostiene el proyecto.',
  'Arquitectura, paisaje y estructura: el privilegio de la baja densidad.'
);

// Replace nav links labels
headerCode = headerCode.replace('label: "Masterplan"', 'label: "Territorio"');
headerCode = headerCode.replace('label: "Casos"', 'label: "Legado"');
headerCode = headerCode.replace('label: "Cotizador"', 'label: "Inversión"');

fs.writeFileSync('src/components/Header.tsx', headerCode);
console.log('Header.tsx Updated!');
