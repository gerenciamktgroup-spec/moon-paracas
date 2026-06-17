const fs = require('fs');
let t = fs.readFileSync('src/components/map/CustomSVGOverlay.tsx', 'utf8');

t = t.replace(
  /this\.div\.style\.transform = `matrix\(\$\{a\}, \$\{b\}, \$\{c\}, \$\{d\}, \$\{tx\}, \$\{ty\}\)`;/g,
  `// Apply matrix directly to the SVG group element for infinite vector sharpness!
          const g = this.div.querySelector('#masterplan-g');
          if (g) {
            g.setAttribute('transform', \`matrix(\$\{a\}, \$\{b\}, \$\{c\}, \$\{d\}, \$\{tx\}, \$\{ty\})\`);
          }
          // Remove div transform if it was there
          this.div.style.transform = "none";`
);

t = t.replace(
  /this\.div\.style\.width = "730px";\s*this\.div\.style\.height = "820px";/,
  'this.div.style.width = "100%";\n        this.div.style.height = "100%";\n        this.div.style.overflow = "visible";'
);

fs.writeFileSync('src/components/map/CustomSVGOverlay.tsx', t);
console.log('CustomSVGOverlay updated for vector sharpness');
