const fs = require('fs');
let t = fs.readFileSync('src/components/map/MapCanvas.tsx', 'utf8');

// Strip ALL filters from defs
t = t.replace(/<filter\b[^>]*>[\s\S]*?<\/filter>/g, '');
// Strip ALL filter="url(...)" usages
t = t.replace(/filter="url\([^)]+\)"/g, '');
// Strip ALL style filter usages
t = t.replace(/filter:\s*'drop-shadow[^']+'/g, '');
t = t.replace(/filter: isGlowing \? "url\(#glow\)" : undefined/g, '');

fs.writeFileSync('src/components/map/MapCanvas.tsx', t);
console.log('Absolutely all filters removed from MapCanvas');
