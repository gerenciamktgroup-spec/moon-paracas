import * as THREE from "three";
import { DomeDiameter, DOME_SPECS_MAP, FIXED_FURNITURE, PALETTE, BathLocation } from "../../types/configurator";

export function createInteriorFurniture(
  diameter: DomeDiameter,
  bathLocation: BathLocation,
  clipPlane: THREE.Plane
): THREE.Group {
  const specs = DOME_SPECS_MAP[diameter];
  const radius = specs.radius;

  const furnGroup = new THREE.Group();
  furnGroup.position.set(0, 0.20, -0.4);

  // =========================================================================
  // 1. MATERIALES PBR QUIET LUXURY DESERT
  // =========================================================================
  const bedBaseMat = new THREE.MeshStandardMaterial({
    color: PALETTE.warmWood,
    roughness: 0.72,
    clippingPlanes: [clipPlane],
  });
  const mattressMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.85,
    clippingPlanes: [clipPlane],
  });
  const linenDuvetMat = new THREE.MeshStandardMaterial({
    color: 0xf5efe6, // Lino desértico suave
    roughness: 0.92,
    clippingPlanes: [clipPlane],
  });
  const alpacaThrowMat = new THREE.MeshStandardMaterial({
    color: 0xb85d38, // Terracota cálido de lana de alpaca
    roughness: 0.95,
    clippingPlanes: [clipPlane],
  });
  const ochreCushionMat = new THREE.MeshStandardMaterial({
    color: 0xc2955a, // Ocre desértico artesanal
    roughness: 0.90,
    clippingPlanes: [clipPlane],
  });
  const pillowMat = new THREE.MeshStandardMaterial({
    color: 0xfaf6ee,
    roughness: 0.88,
    clippingPlanes: [clipPlane],
  });
  const headboardMat = new THREE.MeshStandardMaterial({
    color: 0xe8dfd1,
    roughness: 0.82,
    clippingPlanes: [clipPlane],
  });
  const juteRugMat = new THREE.MeshStandardMaterial({
    color: 0xb49a78, // Yute natural trenzado
    roughness: 0.94,
    clippingPlanes: [clipPlane],
  });
  const juteBasketMat = new THREE.MeshStandardMaterial({
    color: 0xbd9e73, // Canasta de paja/yute
    roughness: 0.88,
    clippingPlanes: [clipPlane],
  });
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x8b5a2b, // Cuero natural silla mariposa
    roughness: 0.58,
    metalness: 0.02,
    clippingPlanes: [clipPlane],
  });
  const metalFrameMat = new THREE.MeshStandardMaterial({
    color: 0x221f1d,
    roughness: 0.45,
    metalness: 0.85,
    clippingPlanes: [clipPlane],
  });
  const ceramicMat = new THREE.MeshStandardMaterial({
    color: 0xded5c7, // Cerámica artesanal Paracas
    roughness: 0.42,
    clippingPlanes: [clipPlane],
  });
  const bookPageMat = new THREE.MeshStandardMaterial({
    color: 0xfbf9f4,
    roughness: 0.95,
    clippingPlanes: [clipPlane],
  });
  const bookCoverMat = new THREE.MeshStandardMaterial({
    color: 0x4a3525,
    roughness: 0.60,
    clippingPlanes: [clipPlane],
  });
  const towelMat = new THREE.MeshStandardMaterial({
    color: 0xede6dc, // Toalla waffle cream
    roughness: 0.85,
    clippingPlanes: [clipPlane],
  });
  const stoneSinkMat = new THREE.MeshStandardMaterial({
    color: 0x8c7d6b, // Piedra tallada
    roughness: 0.82,
    clippingPlanes: [clipPlane],
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xc5a059, // Latón cepillado
    roughness: 0.35,
    metalness: 0.80,
    clippingPlanes: [clipPlane],
  });
  const bathWallMat = new THREE.MeshStandardMaterial({
    color: 0xd9cdb8,
    roughness: 0.75,
    clippingPlanes: [clipPlane],
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: PALETTE.glassCyan,
    transmission: 0.9,
    roughness: 0.12,
    transparent: true,
    opacity: 0.85,
    clippingPlanes: [clipPlane],
  });
  const terracottaUrnMat = new THREE.MeshStandardMaterial({
    color: 0xa8583b,
    roughness: 0.88,
    clippingPlanes: [clipPlane],
  });
  const plantLeafMat = new THREE.MeshStandardMaterial({
    color: 0x3f5e3b,
    roughness: 0.75,
    clippingPlanes: [clipPlane],
  });
  const rattanMat = new THREE.MeshStandardMaterial({
    color: 0xc9a473, // Ratán / mimbre tejido
    roughness: 0.85,
    clippingPlanes: [clipPlane],
  });
  const lampLinenMat = new THREE.MeshStandardMaterial({
    color: 0xfbf6ee, // Pantalla de lino traslúcida
    roughness: 0.80,
    clippingPlanes: [clipPlane],
  });

  // =========================================================================
  // 2. ALFOMBRA CIRCULAR DE YUTE TRENZADO (Ø 2.30 m)
  // =========================================================================
  const rugGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.015, 32);
  const rug = new THREE.Mesh(rugGeo, juteRugMat);
  rug.position.set(0, 0.008, -0.65);
  rug.receiveShadow = true;
  furnGroup.add(rug);

  // =========================================================================
  // 3. CAMA KING SIZE FIJA (2.20 × 2.20 × 0.55 m)
  // =========================================================================
  const bedGroup = new THREE.Group();
  bedGroup.position.set(0, 0, -1.10);
  furnGroup.add(bedGroup);

  // Base de madera suspendida / tarima
  const bedBase = new THREE.Mesh(
    new THREE.BoxGeometry(
      FIXED_FURNITURE.kingBed.width + 0.1,
      0.22,
      FIXED_FURNITURE.kingBed.depth + 0.1
    ),
    bedBaseMat
  );
  bedBase.position.y = 0.11;
  bedBase.castShadow = true;
  bedBase.receiveShadow = true;
  bedGroup.add(bedBase);

  // Colchón King
  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(
      FIXED_FURNITURE.kingBed.width,
      0.25,
      FIXED_FURNITURE.kingBed.depth
    ),
    mattressMat
  );
  mattress.position.y = 0.345;
  mattress.castShadow = true;
  bedGroup.add(mattress);

  // Edredón de lino mullido
  const duvet = new THREE.Mesh(
    new THREE.BoxGeometry(
      FIXED_FURNITURE.kingBed.width - 0.04,
      0.14,
      FIXED_FURNITURE.kingBed.depth * 0.72
    ),
    linenDuvetMat
  );
  duvet.position.set(0, 0.46, 0.30);
  duvet.castShadow = true;
  bedGroup.add(duvet);

  // Manta de lana de alpaca en terracota a los pies de la cama
  const throwBlanket = new THREE.Mesh(
    new THREE.BoxGeometry(
      FIXED_FURNITURE.kingBed.width - 0.02,
      0.06,
      0.65
    ),
    alpacaThrowMat
  );
  throwBlanket.position.set(0, 0.53, 0.72);
  throwBlanket.castShadow = true;
  bedGroup.add(throwBlanket);

  // Cabecera tapizada minimalista
  const headboard = new THREE.Mesh(
    new THREE.BoxGeometry(FIXED_FURNITURE.kingBed.width + 0.3, 0.95, 0.12),
    headboardMat
  );
  headboard.position.set(0, 0.55, -FIXED_FURNITURE.kingBed.depth / 2 - 0.04);
  headboard.castShadow = true;
  bedGroup.add(headboard);

  // Almohadas King (4 unidades)
  for (let row = 0; row < 2; row++) {
    for (let side = -1; side <= 1; side += 2) {
      const pillow = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.16, 0.45),
        pillowMat
      );
      pillow.rotation.x = 0.18;
      pillow.position.set(
        side * 0.55,
        0.52 + row * 0.08,
        -FIXED_FURNITURE.kingBed.depth / 2 + 0.35 + row * 0.28
      );
      pillow.castShadow = true;
      bedGroup.add(pillow);
    }
  }

  // Cojines decorativos de ocre
  for (let side = -1; side <= 1; side += 2) {
    const accentCushion = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.32, 0.12),
      ochreCushionMat
    );
    accentCushion.rotation.x = 0.32;
    accentCushion.position.set(side * 0.45, 0.60, -FIXED_FURNITURE.kingBed.depth / 2 + 0.82);
    accentCushion.castShadow = true;
    bedGroup.add(accentCushion);
  }

  // =========================================================================
  // 4. BLOCK 5 — VELADORES CON LÁMPARAS DE DISEÑO Y DETALLES HUMANOS
  // =========================================================================
  [-1, 1].forEach((side) => {
    const nsGroup = new THREE.Group();
    nsGroup.position.set(
      side * (FIXED_FURNITURE.kingBed.width / 2 + 0.35),
      0,
      -1.10 - FIXED_FURNITURE.kingBed.depth / 2 + 0.45
    );
    furnGroup.add(nsGroup);

    // Mesita de noche cilíndrica de teca
    const table = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.45, 20),
      bedBaseMat
    );
    table.position.y = 0.225;
    table.castShadow = true;
    table.receiveShadow = true;
    nsGroup.add(table);

    // Lámpara de noche escultural (Base cerámica + Pantalla lino)
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.16, 16), ceramicMat);
    lampBase.position.y = 0.53;
    lampBase.castShadow = true;
    nsGroup.add(lampBase);

    const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.16, 16), lampLinenMat);
    lampShade.position.y = 0.66;
    lampShade.castShadow = true;
    nsGroup.add(lampShade);

    // Objetos humanos en el velador izquierdo
    if (side === -1) {
      // Libro abierto
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.14), bookPageMat);
      book.position.set(0.05, 0.46, 0.08);
      book.rotation.y = 0.25;
      nsGroup.add(book);

      // Taza de cerámica
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.07, 12), ceramicMat);
      mug.position.set(-0.08, 0.485, -0.06);
      nsGroup.add(mug);
    }
  });

  // =========================================================================
  // 5. BLOCK 5 — LÁMPARA COLGANTE DE DISEÑO EN RATÁN ORGÁNICO
  // =========================================================================
  const pendantGroup = new THREE.Group();
  pendantGroup.position.set(0, 2.15, -0.65);
  furnGroup.add(pendantGroup);

  // Cable de suspensión de latón
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.60, 8), brassMat);
  cord.position.y = 0.30;
  pendantGroup.add(cord);

  // Pantalla de ratán tejido en forma de cúpula cóncava
  const pendantShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.28, 20, 1, true),
    rattanMat
  );
  pendantShade.position.y = 0;
  pendantShade.castShadow = true;
  pendantGroup.add(pendantShade);

  // Foco cálido interior
  const bulbMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xfff0d0, clippingPlanes: [clipPlane] })
  );
  bulbMesh.position.y = -0.05;
  pendantGroup.add(bulbMesh);

  // =========================================================================
  // 6. BLOCK 5 — MACETERO ARTESANAL DE TERRACOTA CON PLANTA INTERIOR
  // =========================================================================
  const planterGroup = new THREE.Group();
  planterGroup.position.set(radius * 0.70, 0, -0.10);
  furnGroup.add(planterGroup);

  // Maceta de terracota cónica
  const potMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.20, 0.14, 0.40, 20),
    terracottaUrnMat
  );
  potMesh.position.y = 0.20;
  potMesh.castShadow = true;
  potMesh.receiveShadow = true;
  planterGroup.add(potMesh);

  // Hojas escultóricas de Sansevieria / planta interior
  for (let leaf = 0; leaf < 6; leaf++) {
    const leafMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.55, 0.015), plantLeafMat);
    leafMesh.position.set(
      (Math.random() - 0.5) * 0.12,
      0.55 + leaf * 0.03,
      (Math.random() - 0.5) * 0.12
    );
    leafMesh.rotation.set((Math.random() - 0.5) * 0.2, leaf * (Math.PI / 3), (Math.random() - 0.5) * 0.2);
    leafMesh.castShadow = true;
    planterGroup.add(leafMesh);
  }

  // =========================================================================
  // 7. CANASTAS DE YUTE Y MANTA ENROLLADA
  // =========================================================================
  const basketGroup = new THREE.Group();
  basketGroup.position.set(-radius + 1.65, 0, -1.85);
  furnGroup.add(basketGroup);

  const basket1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.20, 0.35, 16),
    juteBasketMat
  );
  basket1.position.y = 0.175;
  basket1.castShadow = true;
  basketGroup.add(basket1);

  const rolledBlanket1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.32, 12),
    alpacaThrowMat
  );
  rolledBlanket1.rotation.z = 0.25;
  rolledBlanket1.position.set(0.02, 0.36, 0);
  rolledBlanket1.castShadow = true;
  basketGroup.add(rolledBlanket1);

  // =========================================================================
  // 8. BATH-POD INTERIOR FIJO (cuando bathLocation === "inside") O OPEN SUITE
  // =========================================================================
  if (bathLocation === "inside") {
    const bathPod = new THREE.Mesh(
      new THREE.BoxGeometry(
        FIXED_FURNITURE.bathPod.width,
        FIXED_FURNITURE.bathPod.height,
        0.12
      ),
      bathWallMat
    );
    bathPod.position.set(-radius + 1.40, 1.05, 0.50);
    bathPod.rotation.y = Math.PI / 4;
    bathPod.castShadow = true;
    furnGroup.add(bathPod);

    // Mampara de ducha de cristal estriado
    const showerScreen = new THREE.Mesh(
      new THREE.BoxGeometry(1.10, 1.90, 0.04),
      glassMat
    );
    showerScreen.position.set(-radius + 1.10, 0.95, 0.90);
    showerScreen.rotation.y = Math.PI / 4;
    furnGroup.add(showerScreen);

    // Mueble de tocador de teca
    const vanity = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.70, 0.40),
      bedBaseMat
    );
    vanity.position.set(-radius + 1.25, 0.35, 0.10);
    vanity.rotation.y = Math.PI / 4;
    furnGroup.add(vanity);

    // Lavatorio de piedra tallada
    const stoneSink = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.14, 0.12, 20),
      stoneSinkMat
    );
    stoneSink.position.set(-radius + 1.25, 0.76, 0.10);
    stoneSink.rotation.y = Math.PI / 4;
    stoneSink.castShadow = true;
    furnGroup.add(stoneSink);

    // Grifería de latón
    const faucet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8),
      brassMat
    );
    faucet.position.set(-radius + 1.15, 0.86, 0.02);
    furnGroup.add(faucet);

    // Espejo ovalado retroiluminado
    const mirrorMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.02, 24), glassMat);
    mirrorMesh.rotation.x = Math.PI / 2;
    mirrorMesh.rotation.y = Math.PI / 4;
    mirrorMesh.position.set(-radius + 1.32, 1.35, 0.42);
    furnGroup.add(mirrorMesh);

    // Toallas waffle enrolladas
    for (let t = 0; t < 2; t++) {
      const rolledTowel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.28, 12),
        towelMat
      );
      rolledTowel.rotation.z = Math.PI / 2;
      rolledTowel.position.set(-radius + 1.42 + t * 0.08, 0.73, 0.22);
      rolledTowel.castShadow = true;
      furnGroup.add(rolledTowel);
    }
  } else {
    // Cuando el baño es exterior, liberamos el espacio interior con banco de descanso y perchero
    const openBench = new THREE.Mesh(
      new THREE.BoxGeometry(1.60, 0.35, 0.50),
      bedBaseMat
    );
    openBench.position.set(-radius + 1.30, 0.175, 0.35);
    openBench.rotation.y = Math.PI / 4;
    openBench.castShadow = true;
    furnGroup.add(openBench);

    const openCushion = new THREE.Mesh(
      new THREE.BoxGeometry(1.50, 0.08, 0.44),
      linenDuvetMat
    );
    openCushion.position.set(-radius + 1.30, 0.38, 0.35);
    openCushion.rotation.y = Math.PI / 4;
    furnGroup.add(openCushion);

    // Albornoz / Bata doblada de algodón
    const robe = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.06, 0.30), towelMat);
    robe.position.set(-radius + 1.50, 0.45, 0.45);
    robe.rotation.y = Math.PI / 4;
    furnGroup.add(robe);
  }

  // =========================================================================
  // 9. KITCHENETTE CON BANDEJA ARTESANAL (Solo en Ø7m y Ø8m)
  // =========================================================================
  if (diameter >= 7) {
    const quartzMat = new THREE.MeshStandardMaterial({
      color: 0xf4f0e6,
      roughness: 0.25,
      clippingPlanes: [clipPlane],
    });
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(
        FIXED_FURNITURE.kitchenette.width,
        FIXED_FURNITURE.kitchenette.height,
        FIXED_FURNITURE.kitchenette.depth
      ),
      quartzMat
    );
    counter.position.set(radius - 1.40, 0.45, 0.50);
    counter.rotation.y = -Math.PI / 4;
    counter.castShadow = true;
    furnGroup.add(counter);

    // Jarra artesanal de cristal / cafetera
    const carafe = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 16), glassMat);
    carafe.position.set(radius - 1.65, 0.98, 0.45);
    furnGroup.add(carafe);

    // Vasos de vidrio artesanal
    for (let v = 0; v < 2; v++) {
      const glassCup = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.08, 12), glassMat);
      glassCup.position.set(radius - 1.50 + v * 0.07, 0.94, 0.55);
      furnGroup.add(glassCup);
    }
  }

  // =========================================================================
  // 10. SILLA BUTTERFLY DE CUERO (En Ø7m y Ø8m)
  // =========================================================================
  if (diameter >= 7) {
    const chairGroup = new THREE.Group();
    chairGroup.position.set(-radius + 1.85, 0, 1.40);
    chairGroup.rotation.y = -Math.PI / 3;
    furnGroup.add(chairGroup);

    // Patas cruzadas de hierro negro
    const legGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.68, 8);
    const leg1 = new THREE.Mesh(legGeo, metalFrameMat);
    leg1.rotation.z = 0.45;
    leg1.position.set(-0.22, 0.30, 0);
    chairGroup.add(leg1);

    const leg2 = new THREE.Mesh(legGeo, metalFrameMat);
    leg2.rotation.z = -0.45;
    leg2.position.set(0.22, 0.30, 0);
    chairGroup.add(leg2);

    // Asiento suspendido de cuero natural
    const sling = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.04, 0.58),
      leatherMat
    );
    sling.rotation.x = -0.28;
    sling.position.set(0, 0.38, 0.05);
    sling.castShadow = true;
    chairGroup.add(sling);

    const backSling = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.45, 0.03),
      leatherMat
    );
    backSling.rotation.x = 0.38;
    backSling.position.set(0, 0.62, -0.14);
    backSling.castShadow = true;
    chairGroup.add(backSling);

    const chairCushion = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.26, 0.08),
      ochreCushionMat
    );
    chairCushion.rotation.x = -0.25;
    chairCushion.position.set(0, 0.42, 0.02);
    chairGroup.add(chairCushion);
  }

  // =========================================================================
  // 11. SALA LOUNGE FIJA (2.00 × 0.90 m) + MESA ORGÁNICA — Exclusiva de Ø8m
  // =========================================================================
  if (diameter === 8) {
    const loungeMat = new THREE.MeshStandardMaterial({
      color: 0xdfd4c4,
      roughness: 0.80,
      clippingPlanes: [clipPlane],
    });
    const sofa = new THREE.Mesh(
      new THREE.BoxGeometry(
        FIXED_FURNITURE.lounge.width,
        FIXED_FURNITURE.lounge.height,
        FIXED_FURNITURE.lounge.depth
      ),
      loungeMat
    );
    sofa.position.set(0, 0.225, 1.20);
    sofa.castShadow = true;
    sofa.receiveShadow = true;
    furnGroup.add(sofa);

    const sofaBack = new THREE.Mesh(
      new THREE.BoxGeometry(2.00, 0.40, 0.18),
      loungeMat
    );
    sofaBack.position.set(0, 0.50, 0.79);
    sofaBack.castShadow = true;
    furnGroup.add(sofaBack);

    // Cojines decorativos de living
    const sofaCushion1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.38, 0.12),
      alpacaThrowMat
    );
    sofaCushion1.rotation.set(-0.2, 0.15, 0);
    sofaCushion1.position.set(-0.65, 0.52, 0.92);
    furnGroup.add(sofaCushion1);

    const sofaCushion2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.38, 0.12),
      ochreCushionMat
    );
    sofaCushion2.rotation.set(-0.2, -0.15, 0);
    sofaCushion2.position.set(0.65, 0.52, 0.92);
    furnGroup.add(sofaCushion2);

    // Mesa de centro baja
    const coffeeTable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.42, 0.28, 24),
      bedBaseMat
    );
    coffeeTable.position.set(0, 0.14, 1.95);
    coffeeTable.castShadow = true;
    furnGroup.add(coffeeTable);
  }

  return furnGroup;
}
