const fs = require('fs');
let t = fs.readFileSync('src/components/map/MapCanvas.tsx', 'utf8');

// Remove filters and effects that cause rasterization
t = t.replace(/filter="url\(#shadow\)"/g, '');
t = t.replace(/<filter id="shadow">[\s\S]*?<\/filter>/g, '');
t = t.replace(/<filter id="terrain-tex"[\s\S]*?<\/filter>/g, '');
t = t.replace(/filter="url\(#terrain-tex\)"/g, '');

fs.writeFileSync('src/components/map/MapCanvas.tsx', t);
console.log('Filters removed');
