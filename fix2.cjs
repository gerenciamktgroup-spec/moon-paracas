const fs = require('fs');
let t = fs.readFileSync('src/components/map/MapCanvas.tsx', 'utf8');

t = t.replace(/import \{ TransformWrapper, TransformComponent \} from "react-zoom-pan-pinch";/, '');
t = t.replace(/import \{ TransformWrapper, TransformComponent, useControls \} from "react-zoom-pan-pinch";/, '');

if (!t.includes('import { APIProvider, Map as GoogleMap }')) {
  t = t.replace(
    /import \{ LotsLayer \} from "\.\/layers\/LotsLayer";/,
    'import { LotsLayer } from "./layers/LotsLayer";\nimport { APIProvider, Map as GoogleMap } from "@vis.gl/react-google-maps";\nimport { CustomSVGOverlay } from "./CustomSVGOverlay";'
  );
}

fs.writeFileSync('src/components/map/MapCanvas.tsx', t);
console.log('Fixed imports');
