const fs = require('fs');

// Read as utf16le because PowerShell 'out-file' or '>' writes in UTF-16LE
let t = fs.readFileSync('temp_mapcanvas.txt', 'utf16le');

// Remove BOM and custom line numbers that I added when creating temp_mapcanvas.txt
t = t.replace(/^\uFEFF/g, '');
t = t.replace(/^\d+:/gm, '');

// Apply the clean patches
t = t.replace(
  /import \{ TransformWrapper, TransformComponent, useControls \} from "react-zoom-pan-pinch";/,
  'import { APIProvider, Map as GoogleMap, MapCameraChangedEvent } from "@vis.gl/react-google-maps";\nimport { CustomSVGOverlay } from "./CustomSVGOverlay";'
);

t = t.replace(/function ZoomControls\(\) \{[\s\S]*?\}\s*const AMENITY_LABEL_OFFSET/, 'const AMENITY_LABEL_OFFSET');

t = t.replace(/\{\/\* === Real World Terrain Background \(Google Maps JS API\) === \*\/\}[\s\S]*?<\/foreignObject>/, '');

t = t.replace(
  /<TransformWrapper[\s\S]*?<TransformComponent[^>]*>/,
  `<APIProvider apiKey={(import.meta as any).env.VITE_GOOGLE_MAPS_PLATFORM_KEY || ""}>
        <GoogleMap
          defaultCenter={{ lat: -13.92385, lng: -76.16017 }}
          defaultZoom={17}
          mapTypeId="satellite"
          disableDefaultUI={false}
          gestureHandling="greedy"
          mapTypeControl={false}
          streetViewControl={false}
        />
        <CustomSVGOverlay terrainSvgPoints={scene.terrain}>`
);

t = t.replace(
  /className="w-full h-full"\s*preserveAspectRatio="xMidYMid meet"\s*style=\{\{ cursor: "grab" \}\}/,
  'className="w-full h-full pointer-events-auto drop-shadow-2xl"\n              preserveAspectRatio="xMidYMid meet"'
);

t = t.replace(
  /<\/TransformComponent>\s*<ZoomControls \/>\s*<\/>\s*<\/TransformWrapper>/,
  `</CustomSVGOverlay>\n      </APIProvider>`
);

// Save as pure UTF-8
fs.writeFileSync('src/components/map/MapCanvas.tsx', t, 'utf8');
console.log('Restored and patched successfully');
