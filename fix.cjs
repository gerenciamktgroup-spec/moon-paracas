const fs = require('fs');

let t = fs.readFileSync('src/components/map/MapCanvas.tsx', 'utf8');

// 1. Replace imports
t = t.replace(
  /import \{ TransformWrapper, TransformComponent, useControls \} from "react-zoom-pan-pinch";\s*import \{ APIProvider, Map as GoogleMap \} from "@vis\.gl\/react-google-maps";/,
  'import { APIProvider, Map as GoogleMap } from "@vis.gl/react-google-maps";\nimport { CustomSVGOverlay } from "./CustomSVGOverlay";'
);

// 2. Remove ZoomControls
t = t.replace(/function ZoomControls\(\) \{[\s\S]*?\}\s*const AMENITY_LABEL_OFFSET/, 'const AMENITY_LABEL_OFFSET');

// 3. Replace container start
t = t.replace(
  /<div className="relative w-full h-full bg-transparent overflow-hidden touch-none select-none">\s*<TransformWrapper[\s\S]*?<svg/,
  `<div className="relative w-full h-full bg-[#EAE8E2] overflow-hidden touch-none select-none">
      <APIProvider apiKey={(import.meta as any).env.VITE_GOOGLE_MAPS_PLATFORM_KEY || ""}>
        <GoogleMap
          defaultCenter={{ lat: -13.92385, lng: -76.16017 }}
          defaultZoom={17}
          mapTypeId="satellite"
          disableDefaultUI={false}
          gestureHandling="greedy"
          mapTypeControl={false}
          streetViewControl={false}
        />
        <CustomSVGOverlay terrainSvgPoints={scene.terrain}>
          <svg`
);

// 4. Update SVG class and remove cursor: grab
t = t.replace(
  /className="w-full h-full"\s*preserveAspectRatio="xMidYMid meet"\s*style=\{\{ cursor: "grab" \}\}/,
  'className="w-full h-full pointer-events-auto drop-shadow-2xl"\n            preserveAspectRatio="xMidYMid meet"'
);

// 5. Remove original Static/Map foreignObject
t = t.replace(/\{\/\* === Real World Terrain Background.*?<\/foreignObject>/s, '');

// 6. Replace container end
t = t.replace(
  /<\/svg>\s*<\/TransformComponent>\s*<ZoomControls \/>\s*<\/>\s*<\/TransformWrapper>/,
  `</svg>
        </CustomSVGOverlay>
      </APIProvider>`
);

fs.writeFileSync('src/components/map/MapCanvas.tsx', t);
console.log('MapCanvas replaced successfully');
