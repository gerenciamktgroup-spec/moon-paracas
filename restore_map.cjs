const fs = require('fs');
let t = fs.readFileSync('src/components/map/MapCanvas.tsx', 'utf8');

// Remove the <g id="masterplan-g"> wrapper
t = t.replace(
  /<svg ref=\{svgRef\} className="w-full h-full pointer-events-auto" style=\{\{ position: "absolute", top: 0, left: 0, overflow: "visible" \}\}>\n<g id="masterplan-g">/,
  '<svg ref={svgRef} viewBox="0 0 730 820" className="w-full h-full pointer-events-auto">'
);

// Remove the closing </g>
t = t.replace(
  /\n<\/g>\n<\/svg>/,
  '\n</svg>'
);

fs.writeFileSync('src/components/map/MapCanvas.tsx', t);
console.log('Restored MapCanvas SVG tag');
