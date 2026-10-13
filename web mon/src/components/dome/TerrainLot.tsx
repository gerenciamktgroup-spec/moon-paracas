import * as THREE from "three";
import { LotArea, LOT_SPECS_MAP, PALETTE, GroundTreatment } from "../../types/configurator";

// PRNG determinista para consistencia visual sin parpadeos entre re-renders
function createPseudoRandom(seed: number = 42) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Genera la geometría base de un bloque de piedra caliche con biseles y relieve orgánico
 */
function createCalicheStoneGeometry(): THREE.BufferGeometry {
  const baseGeo = new THREE.BoxGeometry(0.46, 0.15, 0.32, 2, 2, 2);
  const pos = baseGeo.attributes.position;
  const rand = createPseudoRandom(1337);

  // Perturbación sutil de vértices para dar efecto de cantería rústica / piedra tallada
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    // Desplazamiento máximo de ±1.8 cm en esquinas y aristas
    const dx = (rand() - 0.5) * 0.028;
    const dy = (rand() - 0.5) * 0.022;
    const dz = (rand() - 0.5) * 0.028;

    pos.setXYZ(i, x + dx, y + dy, z + dz);
  }

  baseGeo.computeVertexNormals();
  return baseGeo;
}

/**
 * Crea las pircas perimetrales mediante InstancedMesh con mampostería de piedra caliche
 */
function createCalichePircas(lotWidth: number, lotDepth: number): THREE.InstancedMesh {
  const halfW = lotWidth / 2;
  const halfD = lotDepth / 2;
  const rand = createPseudoRandom(999);

  // Paleta de tonos caliche para variación por bloque
  const stoneColors = [
    new THREE.Color(PALETTE.calicheBase),  // #C4A574
    new THREE.Color(PALETTE.calicheWarm),  // #B89A6A
    new THREE.Color(PALETTE.calicheOchre), // #AC8E5E
    new THREE.Color(PALETTE.calicheLight), // #D0B888
    new THREE.Color(0xbfa57b),
  ];

  const stoneGeo = createCalicheStoneGeometry();
  const stoneMat = new THREE.MeshStandardMaterial({
    color: PALETTE.calicheBase,
    roughness: 0.92,
    metalness: 0.02,
  });

  // Definición de tramos de muro con apertura frontal central de 1.40 m
  interface WallSegment {
    x1: number;
    z1: number;
    x2: number;
    z2: number;
    courses: number; // Número de capas de piedra
  }

  const segments: WallSegment[] = [
    // Frontal Izquierdo (h ≈ 0.45 m / 3 capas)
    { x1: -halfW + 0.16, z1: halfD, x2: -0.70, z2: halfD, courses: 3 },
    // Frontal Derecho (h ≈ 0.45 m / 3 capas)
    { x1: 0.70, z1: halfD, x2: halfW - 0.16, z2: halfD, courses: 3 },
    // Posterior (h ≈ 0.60 - 0.65 m / 4 capas)
    { x1: -halfW + 0.16, z1: -halfD, x2: halfW - 0.16, z2: -halfD, courses: 4 },
    // Lateral Izquierdo (h ≈ 0.55 m / 4 capas)
    { x1: -halfW, z1: -halfD + 0.16, x2: -halfW, z2: halfD - 0.16, courses: 4 },
    // Lateral Derecho (h ≈ 0.55 m / 4 capas)
    { x1: halfW, z1: -halfD + 0.16, x2: halfW, z2: halfD - 0.16, courses: 4 },
  ];

  // Cálculo de cantidad de instancias requeridas
  const blockLength = 0.44;
  const courseHeight = 0.145;
  let totalBlocks = 0;

  segments.forEach((seg) => {
    const len = Math.hypot(seg.x2 - seg.x1, seg.z2 - seg.z1);
    const blocksPerCourse = Math.ceil(len / blockLength);
    totalBlocks += blocksPerCourse * seg.courses;
  });

  const instancedPirca = new THREE.InstancedMesh(stoneGeo, stoneMat, totalBlocks);
  instancedPirca.castShadow = true;
  instancedPirca.receiveShadow = true;

  const dummy = new THREE.Object3D();
  let instanceIdx = 0;

  segments.forEach((seg) => {
    const dx = seg.x2 - seg.x1;
    const dz = seg.z2 - seg.z1;
    const len = Math.hypot(dx, dz);
    const dirX = dx / len;
    const dirZ = dz / len;
    const baseAngleY = Math.atan2(dx, dz) + Math.PI / 2; // Tangente al muro

    const blocksPerCourse = Math.ceil(len / blockLength);

    for (let c = 0; c < seg.courses; c++) {
      const courseY = (c + 0.5) * courseHeight + 0.02;
      const isOdd = c % 2 === 1;
      const offsetRatio = isOdd ? 0.5 : 0.0;

      for (let b = 0; b < blocksPerCourse; b++) {
        if (instanceIdx >= totalBlocks) break;

        const t = (b + 0.5 + offsetRatio * 0.5) / blocksPerCourse;
        if (t > 1.02) continue;

        // Posición a lo largo del tramo
        const baseX = seg.x1 + dirX * t * len;
        const baseZ = seg.z1 + dirZ * t * len;

        // Jitter orgánico en posición (±2.5 cm en X/Z)
        const jitterX = (rand() - 0.5) * 0.035;
        const jitterZ = (rand() - 0.5) * 0.035;
        const jitterY = (rand() - 0.5) * 0.012;

        dummy.position.set(baseX + jitterX, courseY + jitterY, baseZ + jitterZ);

        // Rotación aleatoria en Y (±8° ≈ ±0.14 rad) y sutil pitch/roll
        const rotY = baseAngleY + (rand() - 0.5) * 0.28;
        const rotX = (rand() - 0.5) * 0.04;
        const rotZ = (rand() - 0.5) * 0.04;
        dummy.rotation.set(rotX, rotY, rotZ);

        // Variación de escala por bloque (±12%)
        const scaleX = 0.88 + rand() * 0.24;
        const scaleY = 0.90 + rand() * 0.20;
        const scaleZ = 0.88 + rand() * 0.24;
        dummy.scale.set(scaleX, scaleY, scaleZ);

        dummy.updateMatrix();
        instancedPirca.setMatrixAt(instanceIdx, dummy.matrix);

        // Asignación de color aleatorio de la paleta caliche
        const colorIdx = Math.floor(rand() * stoneColors.length);
        instancedPirca.setColorAt(instanceIdx, stoneColors[colorIdx]);

        instanceIdx++;
      }
    }
  });

  instancedPirca.count = instanceIdx;
  instancedPirca.instanceMatrix.needsUpdate = true;
  if (instancedPirca.instanceColor) instancedPirca.instanceColor.needsUpdate = true;

  return instancedPirca;
}

/**
 * Genera la geometría procedural completa de una roseta de Agave Americana (11 hojas curvadas)
 */
function createAgaveRosetteGeometry(): THREE.BufferGeometry {
  const leafGeometries: THREE.BufferGeometry[] = [];
  const segments = 6;

  // Función helper para construir una hoja de agave curvada y acanalada
  const createCurvedLeaf = (length: number, maxWidth: number, curveTilt: number, yawAngle: number) => {
    const vertices: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Curvatura botánica parabólica hacia afuera
      const y = Math.sin(t * (Math.PI / 2.2)) * length;
      const forward = (1 - Math.cos(t * (Math.PI / 2.0))) * (length * curveTilt);

      // Tapering de ancho (base moderada -> centro ancho -> punta afilada)
      const widthFactor = t < 0.35 ? 0.4 + t * 1.7 : (1 - t) * 1.5;
      const w = maxWidth * Math.max(0.01, widthFactor);

      // V-Crease central (acanaladura carnosa de la hoja de agave)
      const creaseDepth = maxWidth * 0.25 * (1 - t);

      // Vértice Izquierdo
      const xl = -w / 2;
      const yl = y;
      const zl = forward;

      // Vértice Centro (lomo/nervadura inferior)
      const xc = 0;
      const yc = y - creaseDepth * 0.5;
      const zc = forward + creaseDepth;

      // Vértice Derecho
      const xr = w / 2;
      const yr = y;
      const zr = forward;

      // Aplicar rotación yaw
      const cosA = Math.cos(yawAngle);
      const sinA = Math.sin(yawAngle);

      vertices.push(
        xl * cosA - zl * sinA, yl, xl * sinA + zl * cosA,
        xc * cosA - zc * sinA, yc, xc * sinA + zc * cosA,
        xr * cosA - zr * sinA, yr, xr * sinA + zr * cosA
      );

      if (i > 0) {
        const base = (i - 1) * 3;
        const next = i * 3;
        // Cara izquierda
        indices.push(base, next, base + 1);
        indices.push(base + 1, next, next + 1);
        // Cara derecha
        indices.push(base + 1, next + 1, base + 2);
        indices.push(base + 2, next + 1, next + 2);
        // Doble cara para visualización correcta de sombras
        indices.push(base + 1, next, base);
        indices.push(next + 1, next, base + 1);
        indices.push(base + 2, next + 1, base + 1);
        indices.push(next + 2, next + 1, base + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  // 1. Verticilo exterior (7 hojas adultas con curvatura pronunciada)
  const outerCount = 7;
  for (let o = 0; o < outerCount; o++) {
    const angle = (o * Math.PI * 2) / outerCount + 0.15;
    leafGeometries.push(createCurvedLeaf(0.68, 0.14, 0.65, angle));
  }

  // 2. Verticilo interior (5 hojas jóvenes erguidas hacia el centro)
  const innerCount = 5;
  for (let n = 0; n < innerCount; n++) {
    const angle = (n * Math.PI * 2) / innerCount + (Math.PI / outerCount);
    leafGeometries.push(createCurvedLeaf(0.48, 0.10, 0.35, angle));
  }

  // Mergear todas las hojas de una roseta en una sola geometría estática
  // usando combinación directa de buffers para evitar dependencias pesadas
  let totalVerts = 0;
  let totalIndices = 0;
  leafGeometries.forEach((g) => {
    totalVerts += g.attributes.position.count;
    totalIndices += g.index ? g.index.count : 0;
  });

  const mergedPositions = new Float32Array(totalVerts * 3);
  const mergedIndices = new Uint32Array(totalIndices);
  let vertOffset = 0;
  let indexOffset = 0;
  let indexShift = 0;

  leafGeometries.forEach((g) => {
    const pos = g.attributes.position;
    mergedPositions.set(pos.array as Float32Array, vertOffset * 3);

    if (g.index) {
      const idx = g.index.array;
      for (let j = 0; j < idx.length; j++) {
        mergedIndices[indexOffset + j] = idx[j] + indexShift;
      }
      indexOffset += idx.length;
    }
    indexShift += pos.count;
    vertOffset += pos.count;
    g.dispose();
  });

  const finalGeo = new THREE.BufferGeometry();
  finalGeo.setAttribute("position", new THREE.BufferAttribute(mergedPositions, 3));
  finalGeo.setIndex(new THREE.BufferAttribute(mergedIndices, 1));
  finalGeo.computeVertexNormals();

  return finalGeo;
}

/**
 * Genera la geometría de un cactus columnar acanalado con costillas verticales (Fluted Ribs)
 */
function createFlutedCactusGeometry(height: number = 1.0, radius: number = 0.13, ribs: number = 8): THREE.BufferGeometry {
  const radialSegments = ribs * 4;
  const heightSegments = 12;
  const vertices: number[] = [];
  const indices: number[] = [];

  for (let yIdx = 0; yIdx <= heightSegments; yIdx++) {
    const v = yIdx / heightSegments;
    const y = v * height;

    // Tapering superior abovedado
    let rScale = 1.0;
    if (v > 0.85) {
      const domeT = (v - 0.85) / 0.15;
      rScale = Math.sqrt(Math.max(0, 1 - domeT * domeT));
    } else if (v < 0.08) {
      rScale = 0.85 + (v / 0.08) * 0.15; // Base ligeramente cónica
    }

    for (let rIdx = 0; rIdx < radialSegments; rIdx++) {
      const u = rIdx / radialSegments;
      const angle = u * Math.PI * 2;

      // Ondulación acanalada de costillas (Fluting)
      const ribWave = Math.cos(angle * ribs) * 0.022;
      const effRadius = Math.max(0.01, (radius + ribWave) * rScale);

      const x = Math.cos(angle) * effRadius;
      const z = Math.sin(angle) * effRadius;

      vertices.push(x, y, z);
    }
  }

  // Indices de quads para el cuerpo cilíndrico acanalado
  for (let yIdx = 0; yIdx < heightSegments; yIdx++) {
    for (let rIdx = 0; rIdx < radialSegments; rIdx++) {
      const nextR = (rIdx + 1) % radialSegments;
      const row1 = yIdx * radialSegments;
      const row2 = (yIdx + 1) * radialSegments;

      const a = row1 + rIdx;
      const b = row2 + rIdx;
      const c = row2 + nextR;
      const d = row1 + nextR;

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // Tapa superior
  const topCenterIdx = vertices.length / 3;
  vertices.push(0, height + 0.02, 0);
  const lastRow = heightSegments * radialSegments;
  for (let rIdx = 0; rIdx < radialSegments; rIdx++) {
    const nextR = (rIdx + 1) % radialSegments;
    indices.push(lastRow + rIdx, topCenterIdx, lastRow + nextR);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

/**
 * Genera la vegetación xerófila botánica de Paracas (Agaves, Cactus Columnares y Candelabros)
 */
function createBotanicalLandscape(lotWidth: number, lotDepth: number): THREE.Group {
  const halfW = lotWidth / 2;
  const halfD = lotDepth / 2;
  const plantGroup = new THREE.Group();
  const rand = createPseudoRandom(2026);

  // 1. AGAVES COSTEROS EN INSTANCEDMESH (1 Draw Call)
  const agaveGeo = createAgaveRosetteGeometry();
  const agaveMat = new THREE.MeshStandardMaterial({
    color: 0x5a7a66, // Verde-azulado desértico con lino ceroso
    roughness: 0.68,
    metalness: 0.02,
  });

  // Puntos estratégicos en zonas libres respetando retiros y accesos
  const agaveLocations = [
    // Esquina frontal izquierda
    [-halfW + 1.25, halfD - 1.35, 1.15],
    [-halfW + 2.10, halfD - 1.10, 0.85],
    // Esquina frontal derecha
    [halfW - 1.25, halfD - 1.35, 1.10],
    [halfW - 2.10, halfD - 1.10, 0.80],
    // Retiro lateral izquierdo
    [-halfW + 1.10, -0.60, 1.05],
    [-halfW + 1.35, 2.40, 0.90],
    // Retiro lateral derecho
    [halfW - 1.10, -0.60, 1.00],
    [halfW - 1.35, 2.40, 0.90],
    // Fondo posterior
    [-halfW + 1.30, -halfD + 1.40, 1.10],
    [halfW - 1.30, -halfD + 1.40, 1.05],
    [0.0, -halfD + 1.20, 0.88],
  ];

  const agaveInstanced = new THREE.InstancedMesh(agaveGeo, agaveMat, agaveLocations.length);
  agaveInstanced.castShadow = true;
  agaveInstanced.receiveShadow = true;

  const dummy = new THREE.Object3D();
  agaveLocations.forEach(([ax, az, baseScale], idx) => {
    dummy.position.set(ax + (rand() - 0.5) * 0.15, 0.015, az + (rand() - 0.5) * 0.15);
    dummy.rotation.set((rand() - 0.5) * 0.08, rand() * Math.PI * 2, (rand() - 0.5) * 0.08);
    const s = baseScale * (0.92 + rand() * 0.18);
    dummy.scale.set(s, s * (0.95 + rand() * 0.15), s);
    dummy.updateMatrix();
    agaveInstanced.setMatrixAt(idx, dummy.matrix);
  });
  agaveInstanced.instanceMatrix.needsUpdate = true;
  plantGroup.add(agaveInstanced);

  // 2. CACTUS COLUMNARES Y CANDELABROS
  const cactusGeo = createFlutedCactusGeometry(1.20, 0.12, 8);
  const cactusMat = new THREE.MeshStandardMaterial({
    color: 0x44633e, // Verde oliva desértico maduro
    roughness: 0.78,
    metalness: 0.02,
  });

  const cactusLocations = [
    // Flanco lateral izquierdo
    [-halfW + 0.95, 1.10, 1.25],
    [-halfW + 0.90, -2.80, 0.95],
    // Flanco lateral derecho (cerca de la zona posterior)
    [halfW - 0.95, -2.40, 1.40],
    [halfW - 0.90, 1.80, 0.90],
    // Esquina posterior
    [-halfW + 0.95, -halfD + 2.2, 1.10],
  ];

  const cactusInstanced = new THREE.InstancedMesh(cactusGeo, cactusMat, cactusLocations.length);
  cactusInstanced.castShadow = true;
  cactusInstanced.receiveShadow = true;

  cactusLocations.forEach(([cx, cz, baseH], idx) => {
    dummy.position.set(cx + (rand() - 0.5) * 0.1, 0.01, cz + (rand() - 0.5) * 0.1);
    dummy.rotation.set((rand() - 0.5) * 0.04, rand() * Math.PI * 2, (rand() - 0.5) * 0.04);
    const scaleY = baseH / 1.20;
    const scaleXZ = 0.90 + rand() * 0.25;
    dummy.scale.set(scaleXZ, scaleY, scaleXZ);
    dummy.updateMatrix();
    cactusInstanced.setMatrixAt(idx, dummy.matrix);
  });
  cactusInstanced.instanceMatrix.needsUpdate = true;
  plantGroup.add(cactusInstanced);

  // 3. BRAZOS DE CANDELABRO (para el cactus más prominente)
  const armGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.45, 8);
  const armMesh1 = new THREE.Mesh(armGeo, cactusMat);
  armMesh1.rotation.z = Math.PI / 2.8;
  armMesh1.position.set(halfW - 0.82, 0.68, -2.40);
  armMesh1.castShadow = true;
  plantGroup.add(armMesh1);

  const armTipGeo = new THREE.CylinderGeometry(0.065, 0.07, 0.35, 8);
  const armTip1 = new THREE.Mesh(armTipGeo, cactusMat);
  armTip1.position.set(halfW - 0.65, 0.90, -2.40);
  armTip1.castShadow = true;
  plantGroup.add(armTip1);

  // 4. GUIJARROS Y PIEDRAS DESÉRTICAS BASALES (Aclimatación del paisaje)
  const pebbleGeo = new THREE.DodecahedronGeometry(0.12, 1);
  const pebbleMat = new THREE.MeshStandardMaterial({
    color: PALETTE.calicheOchre,
    roughness: 0.90,
  });
  const pebbleCount = 18;
  const pebbleInstanced = new THREE.InstancedMesh(pebbleGeo, pebbleMat, pebbleCount);
  pebbleInstanced.castShadow = true;
  pebbleInstanced.receiveShadow = true;

  for (let p = 0; p < pebbleCount; p++) {
    // Agrupar piedras en las bases de los agaves frontales y esquinas
    const anchor = agaveLocations[p % agaveLocations.length];
    const px = anchor[0] + (rand() - 0.5) * 0.65;
    const pz = anchor[1] + (rand() - 0.5) * 0.65;
    const ps = 0.45 + rand() * 0.70;

    dummy.position.set(px, ps * 0.05, pz);
    dummy.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    dummy.scale.set(ps * (0.8 + rand() * 0.4), ps * 0.5, ps * (0.8 + rand() * 0.4));
    dummy.updateMatrix();
    pebbleInstanced.setMatrixAt(p, dummy.matrix);
  }
  pebbleInstanced.instanceMatrix.needsUpdate = true;
  plantGroup.add(pebbleInstanced);

  return plantGroup;
}

/**
 * Componente de Terreno y Lote con mampostería caliche, micro-relieve, tratamiento de suelo y vegetación
 */
export function createTerrainLot(
  lotArea: LotArea,
  groundTreatment: GroundTreatment,
  includeGarden: boolean
): THREE.Group {
  const specs = LOT_SPECS_MAP[lotArea];
  const lotWidth = specs.width;
  const lotDepth = specs.depth;
  const halfW = lotWidth / 2;
  const halfD = lotDepth / 2;

  const lotGroup = new THREE.Group();

  // 1. Ground Plane Base (Pampa de Paracas externa)
  const groundGeo = new THREE.PlaneGeometry(60, 60);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xdfd5c4, roughness: 0.95 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.015;
  ground.receiveShadow = true;
  lotGroup.add(ground);

  // 2. Superficie de Arena del Lote con Micro-Relieve (max ±0.035 m)
  const lotSurfaceGeo = new THREE.PlaneGeometry(lotWidth, lotDepth, 36, 36);
  const posAttr = lotSurfaceGeo.attributes.position;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i); // En PlaneGeometry horizontal antes de rotar, Y representa Z en mundo

    // Ondulación de arena / dunas de Paracas
    const wave1 = Math.sin(x * 0.85 + y * 0.6) * 0.018;
    const wave2 = Math.cos(x * 1.3 - y * 0.75) * 0.014;
    const wave3 = Math.sin(x * 2.8 + y * 2.1) * 0.006;
    let displacement = wave1 + wave2 + wave3;

    // Atenuación suave alrededor de la zona habitable central (domo, deck y plunge pool)
    const distCenter = Math.hypot(x, y - 0.4);
    const dampFactor = THREE.MathUtils.clamp((distCenter - 2.6) / 2.2, 0, 1);
    displacement *= dampFactor;

    posAttr.setZ(i, displacement);
  }
  lotSurfaceGeo.computeVertexNormals();

  const lotSurfaceMat = new THREE.MeshStandardMaterial({
    color: 0xe8dfd0,
    roughness: 0.90,
  });
  const lotSurface = new THREE.Mesh(lotSurfaceGeo, lotSurfaceMat);
  lotSurface.rotation.x = -Math.PI / 2;
  lotSurface.position.set(0, 0.005, 0);
  lotSurface.receiveShadow = true;
  lotGroup.add(lotSurface);

  // 3. ZONA DE CÉSPED / PASTO HABITABLE Y BORDES DE PIEDRA (Si groundTreatment es lawn o mixed)
  if (groundTreatment === "lawn" || groundTreatment === "mixed") {
    const lawnWidth = groundTreatment === "lawn" ? lotWidth - 1.2 : 7.2;
    const lawnDepth = groundTreatment === "lawn" ? lotDepth - 2.0 : 5.8;
    const lawnGeo = new THREE.PlaneGeometry(lawnWidth, lawnDepth, 16, 16);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x5a7d3a, // Verde pradera costera viva
      roughness: 0.84,
      metalness: 0.02,
    });
    const lawnMesh = new THREE.Mesh(lawnGeo, lawnMat);
    lawnMesh.rotation.x = -Math.PI / 2;
    lawnMesh.position.set(0, 0.012, 1.4);
    lawnMesh.receiveShadow = true;
    lotGroup.add(lawnMesh);

    // Borde de contención de piedra caliche y grava perimetral (evita cortes duros)
    const edgeStoneGeo = new THREE.DodecahedronGeometry(0.08, 1);
    const edgeStoneMat = new THREE.MeshStandardMaterial({ color: 0xb8a488, roughness: 0.90 });
    const edgeStoneCount = 44;
    const edgeMesh = new THREE.InstancedMesh(edgeStoneGeo, edgeStoneMat, edgeStoneCount);
    edgeMesh.receiveShadow = true;
    edgeMesh.castShadow = true;

    const dummy = new THREE.Object3D();
    const halfLW = lawnWidth / 2;
    const halfLD = lawnDepth / 2;

    let stoneIdx = 0;
    // Perímetro frontal y trasero del césped
    for (let x = -halfLW; x <= halfLW && stoneIdx < edgeStoneCount; x += lawnWidth / 12) {
      dummy.position.set(x, 0.02, 1.4 - halfLD);
      dummy.rotation.set(Math.random(), Math.random(), Math.random());
      dummy.scale.set(1.2 + Math.random() * 0.4, 0.6, 1.0 + Math.random() * 0.4);
      dummy.updateMatrix();
      edgeMesh.setMatrixAt(stoneIdx++, dummy.matrix);

      if (stoneIdx < edgeStoneCount) {
        dummy.position.set(x, 0.02, 1.4 + halfLD);
        dummy.rotation.set(Math.random(), Math.random(), Math.random());
        dummy.scale.set(1.2 + Math.random() * 0.4, 0.6, 1.0 + Math.random() * 0.4);
        dummy.updateMatrix();
        edgeMesh.setMatrixAt(stoneIdx++, dummy.matrix);
      }
    }
    // Perímetro lateral
    for (let z = -halfLD; z <= halfLD && stoneIdx < edgeStoneCount; z += lawnDepth / 10) {
      dummy.position.set(-halfLW, 0.02, 1.4 + z);
      dummy.rotation.set(Math.random(), Math.random(), Math.random());
      dummy.scale.set(1.0 + Math.random() * 0.4, 0.6, 1.2 + Math.random() * 0.4);
      dummy.updateMatrix();
      edgeMesh.setMatrixAt(stoneIdx++, dummy.matrix);

      if (stoneIdx < edgeStoneCount) {
        dummy.position.set(halfLW, 0.02, 1.4 + z);
        dummy.rotation.set(Math.random(), Math.random(), Math.random());
        dummy.scale.set(1.0 + Math.random() * 0.4, 0.6, 1.2 + Math.random() * 0.4);
        dummy.updateMatrix();
        edgeMesh.setMatrixAt(stoneIdx++, dummy.matrix);
      }
    }
    edgeMesh.instanceMatrix.needsUpdate = true;
    lotGroup.add(edgeMesh);
  }

  // 4. BLOCK 6 — SENDEROS ORGÁNICOS DE LAJAS DE PIEDRA (Flagstone Pavers)
  const paverGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.04, 8);
  const paverMat = new THREE.MeshStandardMaterial({
    color: 0xc8b69b, // Piedra caliche laja
    roughness: 0.88,
  });
  const paverLocations = [
    // Acceso principal desde el frente hacia la terraza
    [0.0, halfD - 0.8],
    [0.05, halfD - 1.5],
    [-0.05, halfD - 2.2],
    [0.0, halfD - 2.9],
    [0.08, halfD - 3.6],
    // Ramal hacia zona de agua / jacuzzi derecha
    [0.85, 3.2],
    [1.65, 3.3],
    [2.45, 3.4],
    // Ramal hacia zona de baño exterior izquierda
    [-0.85, 2.6],
    [-1.65, 2.1],
    [-2.45, 1.4],
    [-2.95, 0.5],
  ];

  const paverMesh = new THREE.InstancedMesh(paverGeo, paverMat, paverLocations.length);
  paverMesh.receiveShadow = true;
  paverMesh.castShadow = true;

  const paverDummy = new THREE.Object3D();
  paverLocations.forEach(([px, pz], idx) => {
    paverDummy.position.set(px, 0.02, pz);
    paverDummy.rotation.set(0, Math.random() * Math.PI, 0);
    const s = 0.9 + Math.random() * 0.25;
    paverDummy.scale.set(s, 1.0, s * (0.9 + Math.random() * 0.2));
    paverDummy.updateMatrix();
    paverMesh.setMatrixAt(idx, paverDummy.matrix);
  });
  paverMesh.instanceMatrix.needsUpdate = true;
  lotGroup.add(paverMesh);

  // 5. Límites Perimétricos Legales del Lote (Línea Terracota fina)
  const lotBorderGeo = new THREE.BufferGeometry();
  const borderPoints = new Float32Array([
    -halfW, 0.035, -halfD,   halfW, 0.035, -halfD,
     halfW, 0.035, -halfD,   halfW, 0.035,  halfD,
     halfW, 0.035,  halfD,  -halfW, 0.035,  halfD,
    -halfW, 0.035,  halfD,  -halfW, 0.035, -halfD,
  ]);
  lotBorderGeo.setAttribute("position", new THREE.BufferAttribute(borderPoints, 3));
  const lotBorderMat = new THREE.LineBasicMaterial({ color: PALETTE.terracotta, linewidth: 2 });
  lotGroup.add(new THREE.LineSegments(lotBorderGeo, lotBorderMat));

  // 6. Pircas Orgánicas de Piedra Caliche (Instanced Mesh de alta fidelidad)
  const pircasMesh = createCalichePircas(lotWidth, lotDepth);
  lotGroup.add(pircasMesh);

  // 7. Paisajismo Botánico Xerófilo de Paracas (Agaves, Cactus Columnares y Rocas)
  if (includeGarden && (groundTreatment === "xeriscape" || groundTreatment === "mixed")) {
    const botanicalGarden = createBotanicalLandscape(lotWidth, lotDepth);
    lotGroup.add(botanicalGarden);
  }

  return lotGroup;
}
