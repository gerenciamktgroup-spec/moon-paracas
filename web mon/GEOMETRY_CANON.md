# Moon Paracas — canon geométrico

Única fuente de verdad para el visor comercial en `web mon/`.

## Qué manda

| Capa | Fuente | Nota |
|---|---|---|
| Predio legal | Vértices UTM 18S A–B–C–D en `src/lib/realUrbanMasterplanModel.ts` | 112.591,80 m² · perímetro 1.357,21 ml |
| Programa de lotes | `REAL_MASTERPLAN_MODEL` (384 residenciales + 192 cocheras) | Congelado al importar el módulo |
| Inventario UI / simulador | `src/lib/commercialInventory.ts` | Convierte el modelo UTM al tipo `Lot` |
| Precios | `src/config/pricing.ts` | $120 USD/m² lanzamiento |
| Cifras públicas | `src/config/project.ts` | 384 lotes · oasis 20.662 m² · 11,26 ha |

## Qué no manda

- `public/1.svg` — gráfico Canva (logo + raster). No contiene polígonos de lote.
- `constellationModel` / `courtyardMasterplanModel` / `alignedLotGeometry` — motores procedurales previos.
- `INVENTARIO_MOON_PARACAS.csv` (282 lotes de áreas variables) — inventario de una versión anterior, no el programa vigente.
- Repos `moon-paracas` / `moonparacas` / clones hash en `C:\Users\LENOVO\antigravity`.

## Visor

Patrón Renacer: polígonos SVG estáticos sobre el perímetro real, pan/zoom 2D. Satélite Google es capa opcional georreferenciada (afín A–B–C–D), no el plano de venta.

Los lotes **no** se recalculan en el cliente por frame. Cualquier replanteo urbanístico se hace en el modelo, se verifica con `npm run verify:geometry` y se vuelve a publicar.
