const fs = require('fs');
let t = fs.readFileSync('src/components/map/MapCanvas.tsx', 'utf8');

// Remove viewBox and scaling from the SVG tag itself
t = t.replace(
  /<svg\s+ref=\{svgRef\}\s+viewBox="0 0 730 820"\s+className="w-full h-full pointer-events-auto drop-shadow-2xl"\s+preserveAspectRatio="xMidYMid meet"\s*>/,
  '<svg ref={svgRef} className="w-full h-full pointer-events-auto" style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}>\n<g id="masterplan-g">'
);

// Fallback in case the drop-shadow was already removed
t = t.replace(
  /<svg\s+ref=\{svgRef\}\s+viewBox="0 0 730 820"\s+className="w-full h-full pointer-events-auto "\s+preserveAspectRatio="xMidYMid meet"\s*>/,
  '<svg ref={svgRef} className="w-full h-full pointer-events-auto" style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}>\n<g id="masterplan-g">'
);

// Add closing </g> before </svg>
t = t.replace(
  /\s*<\/svg>\s*<\/CustomSVGOverlay>/,
  '\n</g>\n</svg>\n</CustomSVGOverlay>'
);

fs.writeFileSync('src/components/map/MapCanvas.tsx', t);
console.log('SVG updated for group transform');
