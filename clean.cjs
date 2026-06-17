const fs = require('fs');
let t = fs.readFileSync('src/components/map/MapCanvas.tsx', 'utf8');

// Replace imports
t = t.replace(
  /import \{ TransformWrapper, TransformComponent, useControls \} from "react-zoom-pan-pinch";/,
  'import { APIProvider, Map as GoogleMap, MapCameraChangedEvent } from "@vis.gl/react-google-maps";\nimport { CustomSVGOverlay } from "./CustomSVGOverlay";'
);

// Remove ZoomControls function
t = t.replace(/function ZoomControls\(\) \{[\s\S]*?\}\s*const AMENITY_LABEL_OFFSET/, 'const AMENITY_LABEL_OFFSET');

// Remove original static map layer
t = t.replace(/\{\/\* === Real World Terrain Background \(Google Maps JS API\) === \*\/\}[\s\S]*?<\/foreignObject>/, '');

// Replace TransformWrapper start with APIProvider
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

// Remove cursor: grab and make pointer-events-auto
t = t.replace(
  /className="w-full h-full"\s*preserveAspectRatio="xMidYMid meet"\s*style=\{\{ cursor: "grab" \}\}/,
  'className="w-full h-full pointer-events-auto drop-shadow-2xl"\n              preserveAspectRatio="xMidYMid meet"'
);

// Replace TransformWrapper end with APIProvider end
t = t.replace(
  /<\/TransformComponent>\s*<ZoomControls \/>\s*<\/>\s*<\/TransformWrapper>/,
  `</CustomSVGOverlay>\n      </APIProvider>`
);

fs.writeFileSync('src/components/map/MapCanvas.tsx', t);
console.log('Clean patch applied successfully');
