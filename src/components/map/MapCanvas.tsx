import React, { useRef, useState, useEffect } from "react";
import { Lot, MasterplanScene } from "../../types/map";
import { buildBlockLabels, buildAmenityLabels } from "../../lib/labels";
import { pathFromPolygon } from "../../lib/geometry";
import { LotsLayer } from "./layers/LotsLayer";
import { APIProvider, Map as GoogleMap } from "@vis.gl/react-google-maps";
import { CustomSVGOverlay } from "./CustomSVGOverlay";


export function MapCanvas({
  scene,
  visibleLots,
  selectedLot,
  onSelectLot
}: {
  scene: MasterplanScene;
  visibleLots: Lot[];
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot) => void;
}) {
  const blockLabels = buildBlockLabels(scene.blocks);
  const amenityLabels = buildAmenityLabels(scene.amenities);
  
  // Basic pan/zoom state for interactive map
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState("0 0 1200 820");

  return (
    <div className="relative w-full h-full bg-[#EAE8E2] overflow-hidden cursor-move touch-none">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
      >
        <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
          <svg 
            ref={svgRef}
            viewBox={viewBox} 
            className="w-full h-full drop-shadow-2xl"
            preserveAspectRatio="xMidYMid slice"
          >
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.05" />
          </filter>
        </defs>

        {/* Real Masterplan Background */}
        <image 
          href="/1.svg" 
          x="-15%" y="-15%" width="130%" height="130%" 
          preserveAspectRatio="xMidYMid slice"
          opacity="1"
        />

        {/* Outer Terrain Boundary */}
        <path d={pathFromPolygon(scene.terrain)} fill="rgba(255,255,255,0.03)" stroke="#ffffff" strokeWidth={3} strokeDasharray="10 5" />
        
        {/* Inner Buffer Line */}
        <path d={pathFromPolygon(scene.innerBuffer)} fill="rgba(213,204,187,0.15)" stroke="#9e7e62" strokeDasharray="5 5" strokeWidth={1.5} />
        
        {/* Roads */}
        {scene.roads.map(r => (
          <path
            key={r.id}
            d={`M ${r.path[0].x} ${r.path[0].y} ` + r.path.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")}
            fill="none"
            stroke={r.kind === "primary" ? "#e6dccd" : "#d5ccbb"}
            strokeWidth={r.kind === "primary" ? 12 : 8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Amenities (Oasis, Parking, etc) */}
        {scene.amenities.map(a => (
          <path
            key={a.id}
            d={pathFromPolygon(a.polygon)}
            fill={
              a.kind === "pool" ? "#78b3c4" :
              a.kind === "clubhouse" ? "#5f7857" :
              a.kind === "deck" ? "#b28b63" :
              a.kind === "firepit" ? "#915438" :
              a.kind === "sand-plaza" ? "#d6c6a2" :
              a.kind === "entry-plaza" ? "#dac7a8" :
              "#bfb8ab"
            }
            stroke="#ffffff"
            strokeWidth={1.2}
            opacity={0.95}
            filter="url(#shadow)"
          />
        ))}

        {/* Block Backgrounds */}
        {scene.blocks.map(block => (
          <path
            key={block.id}
            d={pathFromPolygon(block.polygon)}
            fill="rgba(255, 255, 255, 0.15)"
            stroke="none"
          />
        ))}

        {/* Parametric Lots */}
        <LotsLayer lots={visibleLots} selectedLotId={selectedLot?.id} onSelect={onSelectLot} />

        {/* Block Labels */}
        {blockLabels.map(label => (
          <text
            key={`bl-${label.id}`}
            x={label.point.x}
            y={label.point.y}
            textAnchor="middle"
            fontSize="18"
            fontWeight="900"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fill="#38342f"
            opacity="0.8"
            pointerEvents="none"
          >
            {label.text}
          </text>
        ))}

        {/* Amenity Labels */}
        {amenityLabels.map(label => (
          <text
            key={`al-${label.id}`}
            x={label.point.x}
            y={label.point.y + 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fill="#ffffff"
            letterSpacing="0.1em"
            className="uppercase"
            pointerEvents="none"
          >
            {label.text.replace("-", " ")}
          </text>
        ))}
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
