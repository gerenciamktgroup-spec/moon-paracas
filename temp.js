"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BAND_BLOCKS = exports.BAND_OFFSETS = exports.globalOasisBoundary = void 0;
exports.getMaxTForD = getMaxTForD;
exports.getBandPoint = getBandPoint;
exports.buildBlocks = buildBlocks;
var terrainModel_1 = require("./terrainModel");
exports.globalOasisBoundary = [];
// Offsets in meters from the Northwest boundary of innerBuffer
exports.BAND_OFFSETS = [
    { low: 0, high: 20 }, // Band 1: M1, M2, M3
    { low: 26, high: 46 }, // Band 2: M4, M5, M6
    { low: 52, high: 72 }, // Band 3: M7, M8, M9
    { low: 78, high: 98 }, // Band 4: M10, M11, M12
    // Oasis: 98 to 133 (35m wide)
    { low: 133, high: 153 }, // Band 5: M13, M14, M15
    { low: 159, high: 179 }, // Band 6: M16, M17, M18
    { low: 185, high: 205 }, // Band 7: M19, M20, M21
    { low: 211, high: 231 } // Band 8: M22, M23, M24
];
exports.BAND_BLOCKS = [
    ["M1", "M2", "M3"],
    ["M4", "M5", "M6"],
    ["M7", "M8", "M9"],
    ["M10", "M11", "M12"],
    ["M13", "M14", "M15"],
    ["M16", "M17", "M18"],
    ["M19", "M20", "M21"],
    ["M22", "M23", "M24"]
];
var BLOCK_LOT_COUNTS = {
    M1: 10, M2: 10, M3: 10,
    M4: 10, M5: 10, M6: 11,
    M7: 10, M8: 11, M9: 10,
    M10: 11, M11: 10, M12: 10,
    M13: 10, M14: 10, M15: 11,
    M16: 10, M17: 11, M18: 10,
    M19: 11, M20: 10, M21: 10,
    M22: 10, M23: 10, M24: 12
};
function getMaxTForD(d) {
    // Pure diagonal from edges to the center entry
    // Center is at d = 115.5
    // Left side: d = 0 to 98
    if (d <= 98) {
        return 0.145 - (0.145 - 0.035) * (d / 98);
    }
    // Center access gap: d = 98 to 133
    if (d > 98 && d < 133) {
        return 0.035;
    }
    // Right side: d = 133 to 231
    if (d >= 133) {
        return 0.035 + (0.145 - 0.035) * ((d - 133) / (231 - 133));
    }
    return 0;
}
function getBandPoint(innerBuffer, t, dMeters, scale) {
    if (innerBuffer.length < 4) {
        return { x: 0, y: 0 };
    }
    // NW boundary is B' -> C' (from t=0 to t=1)
    var B = innerBuffer[1];
    var C = innerBuffer[2];
    var pNW = {
        x: B.x + t * (C.x - B.x),
        y: B.y + t * (C.y - B.y)
    };
    // SE boundary is A' -> D' (from t=0 to t=1)
    var A = innerBuffer[0];
    var D = innerBuffer[3];
    var pSE = {
        x: A.x + t * (D.x - A.x),
        y: A.y + t * (D.y - A.y)
    };
    // Vector from NW to SE
    var dx = pSE.x - pNW.x;
    var dy = pSE.y - pNW.y;
    var distPixels = Math.sqrt(dx * dx + dy * dy);
    var distMeters = distPixels / scale;
    // Map dMeters (0..231) proportionally to the dynamic width distMeters
    var f = Math.max(0, Math.min(1, dMeters / 231));
    var shiftMeters = f * distMeters;
    // Unit vector
    var ux = dx / (distPixels || 1);
    var uy = dy / (distPixels || 1);
    return {
        x: pNW.x + ux * shiftMeters * scale,
        y: pNW.y + uy * shiftMeters * scale
    };
}
function buildBlocks(innerBuffer) {
    var scale = (0, terrainModel_1.getMeterToSvgScale)();
    var blocks = [];
    if (innerBuffer.length < 4)
        return [];
    // Generate the central Oasis boundary polygon (curved crater shape)
    var oasisPoly = [];
    var steps = 60;
    for (var i = 0; i <= steps; i++) {
        var t = i / steps;
        // 3 crater-like bulges
        var scallop = 14 * Math.sin(3 * Math.PI * t);
        var d_low = 103 - Math.max(0, scallop);
        oasisPoly.push(getBandPoint(innerBuffer, t, d_low, scale));
    }
    for (var i = steps; i >= 0; i--) {
        var t = i / steps;
        var scallop = 14 * Math.sin(3 * Math.PI * t);
        var d_high = 128 + Math.max(0, scallop);
        oasisPoly.push(getBandPoint(innerBuffer, t, d_high, scale));
    }
    exports.globalOasisBoundary = oasisPoly;
    // Optimized t intervals to maximize land use and eliminate dead space
    var tRanges = [
        { start: 0.02, end: 0.32 }, // Block 0 
        { start: 0.34, end: 0.64 }, // Block 1 
        { start: 0.66, end: 0.98 } // Block 2 
    ];
    // Now build the blocks for each band
    for (var b = 0; b < 8; b++) {
        var blockIds = exports.BAND_BLOCKS[b];
        var offsets = exports.BAND_OFFSETS[b];
        for (var i = 0; i < blockIds.length; i++) {
            var id = blockIds[i];
            var _a = tRanges[i], tStart = _a.start, tEnd = _a.end;
            var d_low_start = offsets.low;
            var d_low_end = offsets.low;
            var d_high_start = offsets.high;
            var d_high_end = offsets.high;
            var t1 = tStart;
            var t2 = tStart;
            // Implement Red Line (Mega Parking) cut on the first row of blocks
            if (i === 0) {
                // Continuous diagonal curve matching the parking boundary + 6m gap (0.015)
                t1 = Math.max(tStart, getMaxTForD(d_low_start) + 0.015);
                t2 = Math.max(tStart, getMaxTForD(offsets.high) + 0.015);
                tStart = Math.max(t1, t2);
            }
            // Band 4 (M10-M12) borders the NW side of the Oasis
            if (b === 3) {
                var scallopStart = 14 * Math.sin(3 * Math.PI * tStart);
                var scallopEnd = 14 * Math.sin(3 * Math.PI * tEnd);
                d_high_start = 103 - Math.max(0, scallopStart);
                d_high_end = 103 - Math.max(0, scallopEnd);
            }
            // Band 5 (M13-M15) borders the SE side of the Oasis
            if (b === 4) {
                var scallopStart = 14 * Math.sin(3 * Math.PI * tStart);
                var scallopEnd = 14 * Math.sin(3 * Math.PI * tEnd);
                d_low_start = 128 + Math.max(0, scallopStart);
                d_low_end = 128 + Math.max(0, scallopEnd);
            }
            var c1 = getBandPoint(innerBuffer, t1, d_low_start, scale);
            var c2 = getBandPoint(innerBuffer, tEnd, d_low_end, scale);
            var c3 = getBandPoint(innerBuffer, tEnd, d_high_end, scale);
            var c4 = getBandPoint(innerBuffer, t2, d_high_start, scale);
            var blockPoly = [c1, c2, c3, c4];
            var blockCenterD = [10, 36, 62, 88, 143, 169, 195, 221][b];
            var tCenter = (tStart + tEnd) / 2;
            // Shift block labels slightly along the shared roads to prevent 100% overlap
            if (b === 0) {
                tCenter -= 0.05;
            }
            else if (b === 1) {
                tCenter += 0.05;
            }
            else if (b === 6) {
                tCenter -= 0.05;
            }
            else if (b === 7) {
                tCenter += 0.05;
            }
            var labelD = b < 4 ? blockCenterD - 6.5 : blockCenterD + 6.5;
            var labelPoint = getBandPoint(innerBuffer, tCenter, labelD, scale);
            var role = "outer-ring";
            if (["M1", "M2", "M3", "M4"].includes(id)) {
                role = "inner-oasis";
            }
            else if (["M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"].includes(id)) {
                role = "middle-ring";
            }
            else if (["M20", "M21"].includes(id)) {
                role = "north-reserve";
            }
            blocks.push({
                id: id,
                role: role,
                polygon: blockPoly,
                labelPoint: labelPoint,
                ringData: {
                    innerPoly: [],
                    outerPoly: [],
                    t_start: tStart, // logical start for calculating dt
                    t_end: tEnd,
                    t_start_low: t1,
                    t_start_high: t2,
                    isFirstRow: i === 0
                }
            });
        }
    }
    return blocks;
}
