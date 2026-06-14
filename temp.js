"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectMilestones = exports.suppositions = exports.getContourLines = exports.getGeneratedLots = exports.HUBS = void 0;
exports.HUBS = [
    { id: "HUB-NW", x: 20, y: 20 },
    { id: "HUB-NE", x: 270, y: 20 },
    { id: "HUB-SW", x: 20, y: 285 },
    { id: "HUB-SE", x: 270, y: 285 },
];
var getGeneratedLots = function () {
    var lots = [];
    // ─── GEOMETRÍA ORIGINAL COMPROBADA ─────────────────────────────────
    // Grid de 14 manzanas (bloques) en 5 filas × 3 columnas.
    // La fila 2 columna 1 (centro) es la zona de Amenidades/Oasis.
    // 21 lotes por bloque × 14 bloques = 294, cortamos en 292.
    var lotWidth = 10;
    var streetWidth = 6;
    var streetHeight = 6;
    var startX = 4;
    var startY = 22;
    var getPhaseCoords = function (row, col) {
        var x = startX + col * (90 + streetWidth) + 45;
        var y = startY + row * (51.5 + streetHeight) + 25.75;
        return { x: x, y: y };
    };
    // ─── FASE POR NÚMERO DE LOTE ───────────────────────────────────────
    // Fila 0 (top/alta elevación) → Moon, Fila 4 (bottom/entrada) → Founder
    // 62 + 80 + 40 + 80 + 30 = 292
    var getPhaseConfig = function (n) {
        if (n <= 62)
            return { name: "Fase 4 - Moon", area: 260, price: 45000, lotH: 26 };
        if (n <= 142)
            return { name: "Fase 3 - Central", area: 240, price: 38000, lotH: 24 };
        if (n <= 182)
            return { name: "Fase 2 - Oasis", area: 260, price: 28000, lotH: 26 };
        if (n <= 262)
            return { name: "Fase 1 - Desert", area: 240, price: 20000, lotH: 24 };
        return { name: "Fase 0 - Founder", area: 220, price: 12000, lotH: 22 };
    };
    // 14 manzanas en la grilla probada
    var blocks = [
        __assign({ id: 1 }, getPhaseCoords(0, 0)),
        __assign({ id: 2 }, getPhaseCoords(0, 1)),
        __assign({ id: 3 }, getPhaseCoords(0, 2)),
        __assign({ id: 4 }, getPhaseCoords(1, 0)),
        __assign({ id: 5 }, getPhaseCoords(1, 1)),
        __assign({ id: 6 }, getPhaseCoords(1, 2)),
        __assign({ id: 7 }, getPhaseCoords(2, 0)),
        __assign({ id: 8 }, getPhaseCoords(2, 2)),
        __assign({ id: 9 }, getPhaseCoords(3, 0)),
        __assign({ id: 10 }, getPhaseCoords(3, 1)),
        __assign({ id: 11 }, getPhaseCoords(3, 2)),
        __assign({ id: 12 }, getPhaseCoords(4, 0)),
        __assign({ id: 13 }, getPhaseCoords(4, 1)),
        __assign({ id: 14 }, getPhaseCoords(4, 2)),
    ];
    var n = 1;
    for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
        var block = blocks_1[_i];
        for (var i = 0; i < 21; i++) {
            if (n > 292)
                break;
            var isTopRow = i >= 11;
            var colIdx = isTopRow ? i - 11 : i;
            var pc = getPhaseConfig(n);
            // Curvatura sinusoidal antiviento (desfase sutil en X)
            var curveOffset = Math.sin(block.y * 0.04) * 3;
            var localX = (colIdx - 5) * lotWidth;
            var localY = isTopRow ? -13.25 : 13.25;
            var x = Number((block.x + localX + curveOffset).toFixed(2));
            var y = Number((block.y + localY).toFixed(2));
            var minHubDist = Infinity;
            for (var _a = 0, HUBS_1 = exports.HUBS; _a < HUBS_1.length; _a++) {
                var hub = HUBS_1[_a];
                var dist = Math.sqrt(Math.pow((x - hub.x), 2) + Math.pow((y - hub.y), 2));
                if (dist < minHubDist)
                    minHubDist = dist;
            }
            lots.push({
                id: "".concat(pc.name.split(" ")[0], "-").concat(String(n).padStart(3, "0")),
                number: n,
                area: pc.area,
                price: pc.price,
                status: "disponible",
                elevation: parseFloat((106.5 + ((310 - y) / 310) * 7).toFixed(2)),
                quadrant: pc.name,
                x: x,
                y: y,
                rotation: 0,
                width: lotWidth,
                height: pc.lotH,
                row: isTopRow ? 1 : 2,
                hasSolarOpt: Math.sin(n * 45.3) > -0.5,
                distanceToPool: Math.round(Math.sqrt(Math.pow((x - 145), 2) + Math.pow((y - 162.75), 2))),
                hubDistance: Math.round(minHubDist),
            });
            n++;
        }
    }
    return lots;
};
exports.getGeneratedLots = getGeneratedLots;
// Curvas de nivel topográficas para dibujar en el fondo del plano
var getContourLines = function () {
    return [
        { label: "106.5m", path: "M -20,250 Q 150,300 300,310", color: "#e5d3b3" },
        { label: "107.0m", path: "M -20,180 Q 150,250 300,280", color: "#e5d3b3" },
        { label: "107.5m", path: "M -20,130 Q 150,190 300,220", color: "#dbcaad" },
        { label: "108.0m", path: "M -20,80 Q 150,140 300,180", color: "#dbcaad" },
        { label: "108.5m", path: "M 30,30 Q 150,90 300,120", color: "#d1bf9f" },
    ];
};
exports.getContourLines = getContourLines;
exports.suppositions = [
    { variable: "Total de lotes del inventario", valor: 292, unidad: "lotes", nota: "Inventario comercial optimizado a 5 fases" },
    { variable: "Lotes área e standar", valor: "220-260", unidad: "m²", nota: "Dimensiones orgánicas 10x22, 10x24, 10x26m" },
    { variable: "Venta mensual estimada", valor: 12, unidad: "lotes/mes", nota: "Ritmo base de absorción comercial" },
    { variable: "Meses de venta estimados", valor: 24, unidad: "meses", nota: "Lotes totales divididos entre venta mensual" },
    { variable: "Recaudación contractual objetivo", valor: 8500000, unidad: "Soles", nota: "Escalera de precios promedio" },
    { variable: "Porcentaje de cuota inicial", valor: 30, unidad: "%", nota: "Pago de separación o enganche al firmar" },
    { variable: "Porcentaje financiado", valor: 70, unidad: "%", nota: "Saldo financiado directamente sin bancos" },
    { variable: "Cuotas mensuales de financiamiento", valor: 12, unidad: "meses", nota: "Financiamiento comercial directo sin intereses" },
    { variable: "Inversión Preobra Fase 0", valor: 95000, unidad: "Soles", nota: "Legal, contratos, marca, renders, oficina y plano" },
    { variable: "Duración de la preobra", valor: 6, unidad: "meses", nota: "Plazo de preventa y trámites iniciales" },
    { variable: "Inicio de obras físicas", valor: "Desde el lote 40", unidad: "lote vendido", nota: "Estrategia para garantizar caja positiva antes de edificar" },
    { variable: "Presupuesto de obras físicas", valor: 2850000, unidad: "Soles", nota: "CAPEX de habilitación progresiva, pórtico, piscina, muros" },
    { variable: "Techo máximo operativo", valor: 3000000, unidad: "Soles", nota: "Límite presupuestal estricto de obras y contingencias" },
    { variable: "Reserva mínima de caja", valor: 50000, unidad: "Soles", nota: "Gate financiero de seguridad en cuenta" },
    { variable: "Gastos fijos de operación", valor: 6000, unidad: "Soles/mes", nota: "Administración, vigilancia inicial, marketing" },
    { variable: "Gasto variable comercial", valor: 8.0, unidad: "%", nota: "Comisiones de asesores, CRM, publicidad dirigida" },
    { variable: "Valorización del terreno (Aporte)", valor: 3933713, unidad: "Soles", nota: "112,391.80 m² valorizados a S/ 35/m²" },
    { variable: "Porcentaje de aporte en efectivo", valor: 60, unidad: "%", nota: "Sujeto a pagos periódicos según cajas disponibles" },
    { variable: "Aporte en efectivo a pagar", valor: 2360228, unidad: "Soles", nota: "Dinero líquido a transferir a propietarios iniciales" },
    { variable: "Aporte en lotes o derechos", valor: 1573485, unidad: "Soles", nota: "40% pagado en adjudicación de lotes del proyecto" },
    { variable: "Mes de inicio del pago de aporte", valor: 7, unidad: "mes", nota: "Comienza justo al iniciar la fase constructiva" },
];
exports.projectMilestones = [
    {
        id: 1,
        title: "Hito 1 - Ordenamiento inicial",
        scope: "Levantamiento de información, topografía de precisión, delimitación base, señalización inicial y expediente legal interno.",
        activation: "Caja operativa y aprobación interna de fundadores.",
        evidence: "Acta de replanteo, fotos del terreno delimitado, plano de linderos aprobado.",
        phase: "Preobra / Meses 1-6"
    },
    {
        id: 2,
        title: "Hito 2 - Acceso y experiencia de llegada",
        scope: "Pórtico de ingreso rústico monumental, caseta de vigilancia, cercado perimétrico de piedra natural de Paracas, paisajismo rústico de bienvenida y ruta de visitas.",
        activation: "Cobranza de los primeros 10-30 lotes y prioridad comercial.",
        evidence: "Reporte fotográfico, estructura del pórtico terminada, caseta funcional.",
        phase: "Etapa de Consolidación"
    },
    {
        id: 3,
        title: "Hito 3 - Trazado y circulación interna (Diseño Orgánico Anti-Viento)",
        scope: "Estabilización de vías con cloruro de magnesio sobre arena afirmada (No Asfalto). Demarcación de vías curvadas de 10m de sección para vehículos eléctricos y senderos de piedra.",
        activation: "Caja acumulada positiva tras superar el lote 40 vendido.",
        evidence: "Planos de replanteo de vías y estabilización química completada.",
        phase: "Construcción Core"
    },
    {
        id: 4,
        title: "Hito 4 - Área común inicial (El Oasis y Club Parking)",
        scope: "Laguna orgánica de arena clara recreativa, zonas de sombra tipo pérgola, fogón central y techado de los Hubs de estacionamiento con paneles solares.",
        activation: "Superación del lote 100 vendido, factibilidad técnica y caja de reserva.",
        evidence: "Laguna operativa y cocheras con energía solar instaladas.",
        phase: "Infraestructura Premium"
    },
    {
        id: 5,
        title: "Hito 5 - Consolidación progresiva",
        scope: "Estaciones de energía de soporte, mejoras en el sistema de seguridad inalámbrico, mantenimiento de senderos y mampostería local.",
        activation: "Ventas superiores al 90% del master plan.",
        evidence: "Rendición de cuentas anual y acta de asamblea de asociados.",
        phase: "Entrega Final"
    }
];
