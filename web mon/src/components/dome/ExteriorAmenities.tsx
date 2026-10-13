import * as THREE from "three";
import {
  DomeDiameter,
  DOME_SPECS_MAP,
  FIXED_EXTERIOR,
  PALETTE,
  WaterFeature,
  BathLocation,
} from "../../types/configurator";

export function createExteriorAmenities(
  diameter: DomeDiameter,
  amenities: {
    deck: boolean;
    firepit: boolean;
    path: boolean;
    scaleRod: boolean;
  },
  waterFeature: WaterFeature,
  bathLocation: BathLocation,
  lotDepth: number
): THREE.Group {
  const specs = DOME_SPECS_MAP[diameter];
  const radius = specs.radius;
  const halfD = lotDepth / 2;
  const deckCenterZ = radius * 0.75 + 1.6;

  const exteriorGroup = new THREE.Group();

  // =========================================================================
  // 1. BLOCK 4 — DECK, PÉRGOLA DE CAÑA BRAVA Y LIVING OUTDOOR ZONE
  // =========================================================================
  if (amenities.deck) {
    const deckWoodMat = new THREE.MeshStandardMaterial({
      color: PALETTE.teakDeck,
      roughness: 0.75,
    });

    // Base circular bajo el domo
    const baseDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(radius + 0.35, radius + 0.35, 0.20, 48),
      deckWoodMat
    );
    baseDisc.position.set(0, 0.10, -0.4);
    baseDisc.receiveShadow = true;
    exteriorGroup.add(baseDisc);

    // Terraza frontal de madera de teca (6.00m ancho × 3.20m profundidad)
    const frontDeck = new THREE.Mesh(
      new THREE.BoxGeometry(
        FIXED_EXTERIOR.deck.width,
        FIXED_EXTERIOR.deck.height,
        FIXED_EXTERIOR.deck.depth
      ),
      deckWoodMat
    );
    frontDeck.position.set(0, 0.10, deckCenterZ);
    frontDeck.receiveShadow = true;
    exteriorGroup.add(frontDeck);

    // Pérgola arquitectónica de sombra
    const timberMat = new THREE.MeshStandardMaterial({
      color: PALETTE.warmWood,
      roughness: 0.78,
    });
    const pergolaGroup = new THREE.Group();
    pergolaGroup.position.set(0, 0, deckCenterZ);
    exteriorGroup.add(pergolaGroup);

    // 4 Postes estructurales macizos (0.12 × 0.12 m)
    [
      [-2.75, -1.35],
      [-2.75, 1.35],
      [2.75, -1.35],
      [2.75, 1.35],
    ].forEach(([px, pz]) => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, FIXED_EXTERIOR.pergola.height, 0.12),
        timberMat
      );
      post.position.set(px, FIXED_EXTERIOR.pergola.height / 2, pz);
      post.castShadow = true;
      post.receiveShadow = true;
      pergolaGroup.add(post);
    });

    // Vigas maestras perimetrales
    const beamMat = timberMat;
    const beamFront = new THREE.Mesh(new THREE.BoxGeometry(5.80, 0.14, 0.08), beamMat);
    beamFront.position.set(0, FIXED_EXTERIOR.pergola.height - 0.07, 1.35);
    beamFront.castShadow = true;
    pergolaGroup.add(beamFront);

    const beamBack = new THREE.Mesh(new THREE.BoxGeometry(5.80, 0.14, 0.08), beamMat);
    beamBack.position.set(0, FIXED_EXTERIOR.pergola.height - 0.07, -1.35);
    beamBack.castShadow = true;
    pergolaGroup.add(beamBack);

    // Techumbre de varas de caña brava tupidas (proyecta sombras estriadas hiperrealistas)
    const reedMat = new THREE.MeshStandardMaterial({
      color: 0xc49d68, // Caña brava ocre seca
      roughness: 0.88,
    });
    const reedCount = 28;
    const reedSpacing = 2.70 / reedCount;
    for (let r = 0; r <= reedCount; r++) {
      const reed = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 5.75, 8),
        reedMat
      );
      reed.rotation.z = Math.PI / 2;
      reed.position.set(0, FIXED_EXTERIOR.pergola.height + 0.02, -1.35 + r * reedSpacing);
      reed.castShadow = true;
      pergolaGroup.add(reed);
    }

    // -----------------------------------------------------------------------
    // MOBILIARIO DE LIVING EXTERIOR / DAYBED & LOUNGERS
    // -----------------------------------------------------------------------
    const outdoorLivingGroup = new THREE.Group();
    outdoorLivingGroup.position.set(-1.20, 0.20, deckCenterZ);
    exteriorGroup.add(outdoorLivingGroup);

    const loungerWoodMat = new THREE.MeshStandardMaterial({ color: 0x5a3e28, roughness: 0.74 });
    const linenCushionMat = new THREE.MeshStandardMaterial({ color: 0xf2ece1, roughness: 0.90 });
    const terracottaPillowMat = new THREE.MeshStandardMaterial({ color: 0xa84f36, roughness: 0.94 });
    const stoneTableMat = new THREE.MeshStandardMaterial({ color: 0xb89a6a, roughness: 0.82 });

    // Daybed doble de teca con colchoneta de lino
    const daybedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.90, 0.22, 1.40), loungerWoodMat);
    daybedFrame.position.set(0, 0.11, 0);
    daybedFrame.castShadow = true;
    daybedFrame.receiveShadow = true;
    outdoorLivingGroup.add(daybedFrame);

    const daybedCushion = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.14, 1.32), linenCushionMat);
    daybedCushion.position.set(0, 0.29, 0);
    daybedCushion.castShadow = true;
    daybedCushion.receiveShadow = true;
    outdoorLivingGroup.add(daybedCushion);

    // Respaldos reclinados con almohadas decorativas en terracota
    const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.22, 0.35), terracottaPillowMat);
    pillow1.position.set(0, 0.45, -0.45);
    pillow1.rotation.x = -Math.PI / 8;
    pillow1.castShadow = true;
    outdoorLivingGroup.add(pillow1);

    const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.22, 0.35), linenCushionMat);
    pillow2.position.set(0, 0.45, 0.45);
    pillow2.rotation.x = Math.PI / 8;
    pillow2.castShadow = true;
    outdoorLivingGroup.add(pillow2);

    // Mesa de centro baja de piedra caliche y madera
    const coffeeTable = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.42, 0.26, 24), stoneTableMat);
    coffeeTable.position.set(1.40, 0.13, 0);
    coffeeTable.castShadow = true;
    coffeeTable.receiveShadow = true;
    outdoorLivingGroup.add(coffeeTable);

    // Bandeja y copas de refresco en la mesa exterior
    const trayGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.02, 16);
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.6 });
    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.position.set(1.40, 0.27, 0);
    outdoorLivingGroup.add(tray);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      roughness: 0.05,
      ior: 1.5,
      transparent: true,
      opacity: 0.85,
    });
    for (let g = 0; g < 2; g++) {
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.10, 12), glassMat);
      glass.position.set(1.36 + g * 0.08, 0.33, (g - 0.5) * 0.06);
      outdoorLivingGroup.add(glass);
    }
  }

  // =========================================================================
  // 2. BLOCK 2 — REALISTIC LUXURY JACUZZI SPA (vs Plunge Pool vs None)
  // =========================================================================
  if (waterFeature === "jacuzzi") {
    // Jacuzzi de Hidromasaje Circular Luxury (Ø 2.15 m)
    const jacuzziGroup = new THREE.Group();
    // Integrado adyacente a la terraza frontal
    jacuzziGroup.position.set(3.35, 0, deckCenterZ);
    exteriorGroup.add(jacuzziGroup);

    const cedarStaveMat = new THREE.MeshStandardMaterial({
      color: 0x482f1d, // Cedro oscuro termotratado
      roughness: 0.68,
      metalness: 0.04,
    });
    const stoneRimMat = new THREE.MeshStandardMaterial({
      color: PALETTE.calicheBase, // Brocal de piedra caliche suave
      roughness: 0.85,
    });
    const bronzeHoopMat = new THREE.MeshStandardMaterial({
      color: 0x2b1c11,
      roughness: 0.4,
      metalness: 0.8,
    });

    // Cuba principal de duelas de cedro (H = 0.90 m, Ø = 2.15 m)
    const tubGeo = new THREE.CylinderGeometry(1.08, 1.04, 0.90, 36);
    const tubMesh = new THREE.Mesh(tubGeo, cedarStaveMat);
    tubMesh.position.y = 0.45;
    tubMesh.castShadow = true;
    tubMesh.receiveShadow = true;
    jacuzziGroup.add(tubMesh);

    // Flejes metálicos de tensión en bronce oscuro
    [0.22, 0.68].forEach((hy) => {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.065, 0.015, 8, 36), bronzeHoopMat);
      hoop.rotation.x = Math.PI / 2;
      hoop.position.y = hy;
      jacuzziGroup.add(hoop);
    });

    // Brocal superior amplio de piedra caliche para sentarse
    const stoneRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.08, 0.10, 10, 36),
      stoneRimMat
    );
    stoneRim.rotation.x = Math.PI / 2;
    stoneRim.position.y = 0.90;
    stoneRim.castShadow = true;
    jacuzziGroup.add(stoneRim);

    // Banco interior sumergido para usuarios
    const benchInside = new THREE.Mesh(
      new THREE.CylinderGeometry(0.96, 0.96, 0.40, 24, 1, true),
      cedarStaveMat
    );
    benchInside.position.y = 0.25;
    jacuzziGroup.add(benchInside);

    // Escalera doble de acceso en madera de teca conectada a la terraza
    const stepMat = new THREE.MeshStandardMaterial({ color: PALETTE.teakDeck, roughness: 0.75 });
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.25, 0.45), stepMat);
    step1.position.set(-1.18, 0.125, 0);
    step1.castShadow = true;
    jacuzziGroup.add(step1);

    const step2 = new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.50, 0.40), stepMat);
    step2.position.set(-1.18, 0.25, 0.35);
    step2.castShadow = true;
    jacuzziGroup.add(step2);

    // Agua termal translúcida con tonalidad esmeralda/turquesa y reflejos
    const thermalWaterMat = new THREE.MeshPhysicalMaterial({
      color: 0x2bb8a6,
      transmission: 0.90,
      roughness: 0.04,
      ior: 1.333,
      thickness: 0.9,
      transparent: true,
      opacity: 0.92,
    });
    const waterSurface = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.82, 32), thermalWaterMat);
    waterSurface.position.y = 0.46;
    jacuzziGroup.add(waterSurface);

  } else if (waterFeature === "plunge") {
    // Plunge Pool rectangular de piedra caliche (2.50 × 2.50 m)
    const poolGroup = new THREE.Group();
    poolGroup.position.set(3.4, 0, deckCenterZ);
    exteriorGroup.add(poolGroup);

    const poolRimMat = new THREE.MeshStandardMaterial({
      color: PALETTE.calicheStone,
      roughness: 0.85,
    });
    const poolRim = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.30, FIXED_EXTERIOR.plungePool.height, 32),
      poolRimMat
    );
    poolRim.position.y = FIXED_EXTERIOR.plungePool.height / 2;
    poolRim.castShadow = true;
    poolGroup.add(poolRim);

    const waterMat = new THREE.MeshPhysicalMaterial({
      color: PALETTE.oasisWater,
      transmission: 0.88,
      roughness: 0.05,
      ior: 1.333,
      thickness: 0.8,
      transparent: true,
      opacity: 0.95,
    });
    const poolWater = new THREE.Mesh(
      new THREE.CylinderGeometry(1.10, 1.10, FIXED_EXTERIOR.plungePool.height - 0.05, 32),
      waterMat
    );
    poolWater.position.y = FIXED_EXTERIOR.plungePool.height / 2 + 0.02;
    poolGroup.add(poolWater);
  }

  // =========================================================================
  // 3. BLOCK 3 — LEGIBLE LUXURY OUTDOOR BATHROOM (2.20 × 1.80 m)
  // =========================================================================
  if (bathLocation === "outside") {
    const outdoorBathGroup = new THREE.Group();
    outdoorBathGroup.position.set(-radius - 0.55, 0, -0.40);
    exteriorGroup.add(outdoorBathGroup);

    const timberLouverMat = new THREE.MeshStandardMaterial({
      color: 0x422d1d, // Duelas de teca / cedro
      roughness: 0.75,
    });
    const deckBathMat = new THREE.MeshStandardMaterial({
      color: PALETTE.teakDeck,
      roughness: 0.72,
    });
    const brassFixturesMat = new THREE.MeshStandardMaterial({
      color: 0xc5a059, // Latón cepillado artesanal
      roughness: 0.35,
      metalness: 0.85,
    });
    const stoneWashMat = new THREE.MeshStandardMaterial({
      color: 0x8a7a66, // Piedra volcánica / caliche tallada
      roughness: 0.88,
    });
    const waffleTowelMat = new THREE.MeshStandardMaterial({
      color: 0xf5eee4, // Toalla waffle algodón natural
      roughness: 0.95,
    });

    // 1. Tarima de madera ranurada con zona de ducha de guijarros
    const floorDeck = new THREE.Mesh(new THREE.BoxGeometry(2.10, 0.14, 1.80), deckBathMat);
    floorDeck.position.set(0, 0.07, 0);
    floorDeck.receiveShadow = true;
    outdoorBathGroup.add(floorDeck);

    // Plato de ducha empotrado en piedra de río
    const showerTray = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.03, 0.95),
      new THREE.MeshStandardMaterial({ color: 0x5a5046, roughness: 0.9 })
    );
    showerTray.position.set(0.50, 0.15, -0.35);
    showerTray.receiveShadow = true;
    outdoorBathGroup.add(showerTray);

    // Desagüe de latón en el centro de la ducha
    const drainMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.01, 16),
      brassFixturesMat
    );
    drainMesh.position.set(0.50, 0.16, -0.35);
    outdoorBathGroup.add(drainMesh);

    // 2. Celosías de privacidad en lamas horizontales de madera
    // Muro posterior
    const backWallHeight = 2.25;
    const louverCount = 16;
    const louverSpacing = backWallHeight / louverCount;
    for (let l = 0; l < louverCount; l++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(2.10, 0.09, 0.025), timberLouverMat);
      slat.position.set(0, 0.20 + l * louverSpacing, -0.88);
      slat.castShadow = true;
      outdoorBathGroup.add(slat);
    }

    // Muro lateral de privacidad
    for (let l = 0; l < louverCount; l++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.09, 1.76), timberLouverMat);
      slat.position.set(-1.02, 0.20 + l * louverSpacing, 0);
      slat.castShadow = true;
      outdoorBathGroup.add(slat);
    }

    // Postes esquineros del baño exterior
    [
      [-1.02, -0.88],
      [-1.02, 0.88],
      [1.02, -0.88],
    ].forEach(([cx, cz]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.09, backWallHeight + 0.1, 0.09), timberLouverMat);
      col.position.set(cx, (backWallHeight + 0.1) / 2 + 0.14, cz);
      col.castShadow = true;
      outdoorBathGroup.add(col);
    });

    // Techumbre de sombra semi-cubierta en varas de madera
    for (let r = -0.85; r <= 0.85; r += 0.18) {
      const roofSlat = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.035, 0.06), timberLouverMat);
      roofSlat.position.set(0, backWallHeight + 0.22, r);
      roofSlat.castShadow = true;
      outdoorBathGroup.add(roofSlat);
    }

    // 3. Columna de Ducha Exterior Expuesta en Latón Cepillado
    const showerRiser = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 2.10, 12),
      brassFixturesMat
    );
    showerRiser.position.set(0.85, 1.15, -0.80);
    showerRiser.castShadow = true;
    outdoorBathGroup.add(showerRiser);

    // Brazo curvo superior
    const showerArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.45, 12),
      brassFixturesMat
    );
    showerArm.rotation.x = Math.PI / 2;
    showerArm.position.set(0.85, 2.20, -0.58);
    showerArm.castShadow = true;
    outdoorBathGroup.add(showerArm);

    // Rociador de lluvia circular tipo campana (Ø 0.25 m)
    const showerHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.125, 0.03, 24),
      brassFixturesMat
    );
    showerHead.position.set(0.85, 2.16, -0.38);
    showerHead.castShadow = true;
    outdoorBathGroup.add(showerHead);

    // Grifería monomando con manecillas de cruceta
    const showerValve = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.08), brassFixturesMat);
    showerValve.position.set(0.85, 1.05, -0.80);
    outdoorBathGroup.add(showerValve);

    // 4. Mueble de Tocador de Teca con Bacha Escultórica de Piedra
    const vanityBlock = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.72, 0.48), timberLouverMat);
    vanityBlock.position.set(-0.50, 0.44, 0.45);
    vanityBlock.castShadow = true;
    vanityBlock.receiveShadow = true;
    outdoorBathGroup.add(vanityBlock);

    const stoneSink = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.15, 0.14, 20),
      stoneWashMat
    );
    stoneSink.position.set(-0.50, 0.87, 0.45);
    stoneSink.castShadow = true;
    outdoorBathGroup.add(stoneSink);

    const basinFaucet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.25, 12),
      brassFixturesMat
    );
    basinFaucet.position.set(-0.50, 0.98, 0.32);
    outdoorBathGroup.add(basinFaucet);

    // Espejo circular con marco de madera suspendido
    const mirrorGlassMat = new THREE.MeshStandardMaterial({
      color: 0xebf4f5,
      roughness: 0.02,
      metalness: 0.95,
    });
    const mirrorMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 32), mirrorGlassMat);
    mirrorMesh.rotation.x = Math.PI / 2;
    mirrorMesh.position.set(-0.50, 1.45, 0.84);
    outdoorBathGroup.add(mirrorMesh);

    const mirrorFrame = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.02, 8, 32), timberLouverMat);
    mirrorFrame.position.set(-0.50, 1.45, 0.84);
    mirrorFrame.castShadow = true;
    outdoorBathGroup.add(mirrorFrame);

    // 5. Toallero de latón con toalla waffle colgando
    const towelRail = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.45, 8), brassFixturesMat);
    towelRail.rotation.z = Math.PI / 2;
    towelRail.position.set(-0.50, 0.70, 0.72);
    outdoorBathGroup.add(towelRail);

    const hangingTowel = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 0.04), waffleTowelMat);
    hangingTowel.position.set(-0.50, 0.52, 0.72);
    hangingTowel.castShadow = true;
    outdoorBathGroup.add(hangingTowel);

    // 6. Pasarela / Conexión de madera y piedra hacia el acceso lateral del domo
    const walkBridge = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.08, 0.75), deckBathMat);
    walkBridge.position.set(0.45, 0.06, 1.15);
    walkBridge.receiveShadow = true;
    outdoorBathGroup.add(walkBridge);
  }

  // =========================================================================
  // 4. FIREPIT ZEN (Ø 1.20 m)
  // =========================================================================
  if (amenities.firepit) {
    const fireGroup = new THREE.Group();
    fireGroup.position.set(-3.4, 0, deckCenterZ);
    exteriorGroup.add(fireGroup);

    const stoneMat = new THREE.MeshStandardMaterial({
      color: PALETTE.calicheStone,
      roughness: 0.85,
    });
    const fireRing = new THREE.Mesh(
      new THREE.TorusGeometry(FIXED_EXTERIOR.firepit.diameter / 2, 0.15, 8, 24),
      stoneMat
    );
    fireRing.rotation.x = Math.PI / 2;
    fireRing.position.y = 0.20;
    fireRing.castShadow = true;
    fireGroup.add(fireRing);
  }

  // =========================================================================
  // 5. ACCESO PEATONAL (Path de 0.90m)
  // =========================================================================
  if (amenities.path) {
    const pathLength = halfD - 3.5;
    const pathGeo = new THREE.PlaneGeometry(FIXED_EXTERIOR.path.width, pathLength);
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xd3c7b2, roughness: 0.92 });
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    pathMesh.rotation.x = -Math.PI / 2;
    pathMesh.position.set(0, 0.015, halfD - pathLength / 2);
    pathMesh.receiveShadow = true;
    exteriorGroup.add(pathMesh);
  }

  // =========================================================================
  // 6. VARA DE ESCALA DE 1.00 METRO EXACTO
  // =========================================================================
  if (amenities.scaleRod) {
    const rodGroup = new THREE.Group();
    rodGroup.position.set(-2.0, 0.20, deckCenterZ + 1.0);
    exteriorGroup.add(rodGroup);

    const rodMat = new THREE.MeshStandardMaterial({
      color: PALETTE.scaleOrange,
      roughness: 0.3,
    });
    const rodMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(
        FIXED_EXTERIOR.scaleRod.diameter / 2,
        FIXED_EXTERIOR.scaleRod.diameter / 2,
        FIXED_EXTERIOR.scaleRod.height,
        16
      ),
      rodMat
    );
    rodMesh.position.y = FIXED_EXTERIOR.scaleRod.height / 2;
    rodMesh.castShadow = true;
    rodGroup.add(rodMesh);

    const ringMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const ring05 = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.01, 8, 16), ringMat);
    ring05.rotation.x = Math.PI / 2;
    ring05.position.y = 0.50;
    rodGroup.add(ring05);

    const rodBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16), ringMat);
    rodBase.position.y = 0.015;
    rodGroup.add(rodBase);
  }

  return exteriorGroup;
}
