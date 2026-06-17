const fs = require('fs');
let t = fs.readFileSync('src/components/map/MapCanvas.tsx', 'utf8');

const correctHeader = `import React, { useRef, useState } from "react";
import { Lot, MasterplanScene } from "../../types/map";
import { pathFromPolygon, centroid } from "../../lib/geometry";
import { LotsLayer } from "./layers/LotsLayer";
import { APIProvider, Map as GoogleMap, MapCameraChangedEvent } from "@vis.gl/react-google-maps";
import { CustomSVGOverlay } from "./CustomSVGOverlay";

// Amenity fill colors
const FILL_COLORS: Record<string, string> = {
  "premium": "#d4af37",
  "standard": "#8FA88B",
  "zen": "#D4A373",`;

t = correctHeader + t.substring(t.indexOf('  "tiny-house":'));
fs.writeFileSync('src/components/map/MapCanvas.tsx', t);
console.log('Fixed imports');
