const fs = require('fs');
let headerCode = fs.readFileSync('src/components/Header.tsx', 'utf8');

// I will insert a new microcopy bar above the header content or inside it.
const startMarker = '<header className="border-b-4 border-[#2D3339] bg-[#2D3339] text-white sticky top-0 z-40 px-6 py-4">';
const replacement = `
<header className="sticky top-0 z-40 flex flex-col w-full">
  {/* Sticky Microcopy Bar (Low Anxiety) */}
  <div className="w-full bg-[#E5E5DF] border-b border-[#D5D5CF] text-center py-1.5 px-4">
    <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#5C6150]">
      Antes de cotizar, entiende qué sostiene el proyecto.
    </p>
  </div>
  
  {/* Main Header */}
  <div className="border-b-4 border-[#2D3339] bg-[#2D3339] text-white px-6 py-4">
`;

headerCode = headerCode.replace(startMarker, replacement);
headerCode = headerCode.replace('</header>', '  </div>\n</header>');

fs.writeFileSync('src/components/Header.tsx', headerCode);
console.log('Header updated');
