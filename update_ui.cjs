const fs = require('fs');

// 1. UPDATE App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Update Hero height
app = app.replace(
  'min-h-[500px] sm:min-h-[600px]',
  'min-h-[350px] sm:min-h-[400px]'
);

// Fix broken Unsplash URL and add a good desert landscape
app = app.replace(
  'https://images.unsplash.com/photo-1682687982501-1e58f813f222?q=80&w=2600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2600&auto=format&fit=crop'
);

fs.writeFileSync('src/App.tsx', app);

// 2. UPDATE LotsLayer.tsx
let lots = fs.readFileSync('src/components/map/layers/LotsLayer.tsx', 'utf8');

lots = lots.replace(
  /available:\s*\{\s*fill:\s*"[^"]+",\s*stroke:\s*"[^"]+",\s*label:\s*"DISPONIBLE"\s*\}/,
  'available: { fill: "#748D70",  stroke: "#3A4D37", label: "DISPONIBLE" }'
);
lots = lots.replace(
  /offer:\s*\{\s*fill:\s*"[^"]+",\s*stroke:\s*"[^"]+",\s*label:\s*"EN OFERTA"\s*\}/,
  'offer:     { fill: "#8EA98A",  stroke: "#4A6B4A", label: "EN OFERTA"  }'
);
lots = lots.replace(
  /sold:\s*\{\s*fill:\s*"[^"]+",\s*stroke:\s*"[^"]+",\s*label:\s*"VENDIDO"\s*\}/,
  'sold:      { fill: "#D32F2F",  stroke: "#B71C1C", label: "VENDIDO"    }'
);
lots = lots.replace(
  /blocked:\s*\{\s*fill:\s*"[^"]+",\s*stroke:\s*"[^"]+",\s*label:\s*"RESERVADO"\s*\}/,
  'blocked:   { fill: "#F57C00",  stroke: "#E65100", label: "RESERVADO"  }'
);

// Update opacity to be highly visible
lots = lots.replace(
  'const fillOpacity = isParking ? (isSelected ? 0.7 : isHovered ? 0.6 : 0.4) : (isSelected ? 0.3 : isHovered ? 0.2 : 0.08);',
  'const fillOpacity = isParking ? (isSelected ? 0.8 : isHovered ? 0.7 : 0.5) : (isSelected ? 0.8 : isHovered ? 0.7 : 0.45);'
);

// Update stroke width
lots = lots.replace(
  'const strokeWidth = isSelected ? 2.5 : isHovered ? 1.5 : 0.8;',
  'const strokeWidth = isSelected ? 3.0 : isHovered ? 2.0 : 1.5;'
);

fs.writeFileSync('src/components/map/layers/LotsLayer.tsx', lots);
console.log('UI updated');
