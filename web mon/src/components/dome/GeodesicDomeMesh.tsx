import * as THREE from "three";
import { DomeDiameter, DOME_SPECS_MAP } from "../../types/configurator";

export function createGeodesicDomeMesh(
  diameter: DomeDiameter,
  coverProgress: number,
  clipPlane: THREE.Plane
): THREE.Group {
  const specs = DOME_SPECS_MAP[diameter];
  const radius = specs.radius;
  const height = specs.height;

  const domeGroup = new THREE.Group();
  domeGroup.position.set(0, 0.20, -0.4);

  // =========================================================================
  // 1. GEOMETRÍA GEODÉSICA BASE 3V (Hemisferio truncado)
  // =========================================================================
  const icosaGeo = new THREE.IcosahedronGeometry(radius, 2);
  const posAttr = icosaGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    if (posAttr.getY(i) < 0) posAttr.setY(i, 0);
  }
  icosaGeo.computeVertexNormals();

  // =========================================================================
  // 2. ESTRUCTURA GEODÉSICA (Struts de Madera Termotratada / Timber Framing)
  // =========================================================================
  const wireGeo = new THREE.WireframeGeometry(icosaGeo);
  const strutMat = new THREE.LineBasicMaterial({
    color: 0x3e2b1e, // Madera termotratada oscura y cálida
    linewidth: 2,
    clippingPlanes: [clipPlane],
    clipShadows: true,
  });
  const wireSegments = new THREE.LineSegments(wireGeo, strutMat);
  domeGroup.add(wireSegments);

  // Anillo de cimentación y zócalo inferior de madera
  const baseTensionRingGeo = new THREE.CylinderGeometry(radius + 0.05, radius + 0.05, 0.12, 48, 1, true);
  const timberRingMat = new THREE.MeshStandardMaterial({
    color: 0x4a3525,
    roughness: 0.78,
    metalness: 0.05,
    side: THREE.DoubleSide,
    clippingPlanes: [clipPlane],
  });
  const tensionRing = new THREE.Mesh(baseTensionRingGeo, timberRingMat);
  tensionRing.position.y = 0.06;
  tensionRing.castShadow = true;
  domeGroup.add(tensionRing);

  // =========================================================================
  // 3. SISTEMA DE CUBIERTA INTERPOLADA (0.0 Wireframe → 0.45 Glass → 1.0 Adobe)
  // =========================================================================
  const glassTint = new THREE.Color(0xdff2f5); // Tinte cristal cyan
  const adobeTint = new THREE.Color(0xc4a882); // Tinte arena/adobe cálido Paracas

  const colorT = THREE.MathUtils.smoothstep(coverProgress, 0.20, 0.85);
  const currentSkinColor = glassTint.clone().lerp(adobeTint, colorT);

  // Transmission física
  let transmission = 0;
  if (coverProgress >= 0.15 && coverProgress < 0.75) {
    const glassFactor = 1.0 - (coverProgress - 0.15) / 0.60;
    transmission = glassFactor * 0.85;
  }

  // Opacidad y rugosidad
  let opacity = 0;
  let isTransparent = true;
  if (coverProgress < 0.15) {
    opacity = (coverProgress / 0.15) * 0.25;
  } else if (coverProgress < 0.80) {
    opacity = THREE.MathUtils.lerp(0.35, 0.95, (coverProgress - 0.15) / 0.65);
  } else {
    opacity = 1.0;
    isTransparent = false;
  }

  const roughness = THREE.MathUtils.lerp(0.12, 0.90, THREE.MathUtils.smoothstep(coverProgress, 0.25, 0.85));

  // Membrana Exterior del Domo
  const skinMat = new THREE.MeshPhysicalMaterial({
    color: currentSkinColor,
    roughness: roughness,
    metalness: 0.02,
    transmission: transmission,
    thickness: 0.5,
    ior: 1.5,
    side: THREE.FrontSide,
    transparent: isTransparent,
    opacity: opacity,
    clippingPlanes: [clipPlane],
    clipShadows: true,
  });

  const skinMesh = new THREE.Mesh(icosaGeo, skinMat);
  skinMesh.castShadow = coverProgress > 0.4;
  skinMesh.receiveShadow = true;
  domeGroup.add(skinMesh);

  // =========================================================================
  // 4. REVESTIMIENTO INTERIOR (Adobe / Estuco Cálido en Cara Interna)
  // =========================================================================
  const innerIcosaGeo = new THREE.IcosahedronGeometry(radius * 0.994, 2);
  const innerPos = innerIcosaGeo.attributes.position;
  for (let i = 0; i < innerPos.count; i++) {
    if (innerPos.getY(i) < 0) innerPos.setY(i, 0);
  }
  innerIcosaGeo.computeVertexNormals();

  const innerAdobeMat = new THREE.MeshStandardMaterial({
    color: 0xdfd2c0, // Revoque interior de arcilla / estuco cálido
    roughness: 0.94,
    side: THREE.BackSide,
    transparent: coverProgress < 0.65,
    opacity: THREE.MathUtils.clamp(coverProgress * 1.3, 0.0, 1.0),
    clippingPlanes: [clipPlane],
  });

  const innerLinerMesh = new THREE.Mesh(innerIcosaGeo, innerAdobeMat);
  domeGroup.add(innerLinerMesh);

  // =========================================================================
  // 5. VENTANAL PANORÁMICO (Curvatura ~120° con Refracción Fresnel)
  // =========================================================================
  const windowArc = (2 * Math.PI) / 3; // 120 grados
  const glassGeo = new THREE.CylinderGeometry(
    radius * 0.996,
    radius * 0.996,
    height * 0.72,
    36,
    1,
    true,
    -Math.PI / 3,
    windowArc
  );

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xebf7f8,
    transmission: 0.94,
    thickness: 0.55,
    roughness: 0.05,
    ior: 1.52, // Vidrio arquitectónico templado
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
    clippingPlanes: [clipPlane],
  });

  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.position.set(0, height * 0.40, 0);
  glassMesh.rotation.y = -Math.PI / 2;
  domeGroup.add(glassMesh);

  // Marco perimetral del ventanal
  const windowFrameMat = new THREE.MeshStandardMaterial({
    color: 0x382618,
    roughness: 0.70,
    metalness: 0.1,
    clippingPlanes: [clipPlane],
  });

  const lintelGeo = new THREE.CylinderGeometry(
    radius * 1.002,
    radius * 1.002,
    0.06,
    36,
    1,
    true,
    -Math.PI / 3,
    windowArc
  );
  const lintelMesh = new THREE.Mesh(lintelGeo, windowFrameMat);
  lintelMesh.position.set(0, height * 0.75, 0);
  lintelMesh.rotation.y = -Math.PI / 2;
  lintelMesh.castShadow = true;
  domeGroup.add(lintelMesh);

  const sillGeo = new THREE.CylinderGeometry(
    radius * 1.002,
    radius * 1.002,
    0.06,
    36,
    1,
    true,
    -Math.PI / 3,
    windowArc
  );
  const sillMesh = new THREE.Mesh(sillGeo, windowFrameMat);
  sillMesh.position.set(0, height * 0.05, 0);
  sillMesh.rotation.y = -Math.PI / 2;
  domeGroup.add(sillMesh);

  // =========================================================================
  // 6. BLOCK 1: PUERTA DE ENTRADA ARQUITECTÓNICA + UMBRAL DE ACCESO
  // =========================================================================
  // Ubicada en la transición frontal hacia la terraza y sendero exterior
  const doorGroup = new THREE.Group();
  
  // Posicionamiento angular en el perímetro del domo (hacia el lateral frontal)
  const doorAngle = Math.PI * 0.38; // ~68 grados
  const doorRadius = radius * 0.98;
  const doorX = Math.sin(doorAngle) * doorRadius;
  const doorZ = Math.cos(doorAngle) * doorRadius;

  doorGroup.position.set(doorX, 0, doorZ);
  doorGroup.rotation.y = doorAngle;
  domeGroup.add(doorGroup);

  const doorWoodMat = new THREE.MeshStandardMaterial({
    color: 0x422d1d, // Madera de cedro / teca oscura
    roughness: 0.72,
    clippingPlanes: [clipPlane],
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xc5a059, // Latón satinado cepillado
    roughness: 0.35,
    metalness: 0.85,
    clippingPlanes: [clipPlane],
  });

  const stoneThresholdMat = new THREE.MeshStandardMaterial({
    color: 0xb89a6a, // Piedra caliche
    roughness: 0.90,
    clippingPlanes: [clipPlane],
  });

  // Marco de la Puerta (Jambas + Dintel)
  const doorFrameWidth = 1.05;
  const doorFrameHeight = 2.15;
  const frameThickness = 0.08;

  // Jambas laterales
  const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.08, doorFrameHeight, frameThickness), doorWoodMat);
  jambL.position.set(-doorFrameWidth / 2 + 0.04, doorFrameHeight / 2, 0);
  jambL.castShadow = true;
  doorGroup.add(jambL);

  const jambR = new THREE.Mesh(new THREE.BoxGeometry(0.08, doorFrameHeight, frameThickness), doorWoodMat);
  jambR.position.set(doorFrameWidth / 2 - 0.04, doorFrameHeight / 2, 0);
  jambR.castShadow = true;
  doorGroup.add(jambR);

  // Dintel superior
  const header = new THREE.Mesh(new THREE.BoxGeometry(doorFrameWidth, 0.08, frameThickness), doorWoodMat);
  header.position.set(0, doorFrameHeight - 0.04, 0);
  header.castShadow = true;
  doorGroup.add(header);

  // Hoja de la Puerta de Madera
  const doorLeaf = new THREE.Mesh(
    new THREE.BoxGeometry(doorFrameWidth - 0.16, doorFrameHeight - 0.12, 0.05),
    doorWoodMat
  );
  doorLeaf.position.set(0, (doorFrameHeight - 0.12) / 2 + 0.02, 0);
  doorLeaf.castShadow = true;
  doorGroup.add(doorLeaf);

  // Ventanuco / Visor vertical de cristal templado
  const glassInsert = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 1.45, 0.06),
    glassMat
  );
  glassInsert.position.set(-0.15, 1.15, 0);
  doorGroup.add(glassInsert);

  // Tirador vertical de latón arquitectónico (Manillón 0.60m)
  const handleBar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.65, 12),
    brassMat
  );
  handleBar.position.set(0.24, 1.05, 0.045);
  handleBar.castShadow = true;
  doorGroup.add(handleBar);

  const handleSupportTop = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.05), brassMat);
  handleSupportTop.position.set(0.24, 1.30, 0.025);
  doorGroup.add(handleSupportTop);

  const handleSupportBottom = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.05), brassMat);
  handleSupportBottom.position.set(0.24, 0.80, 0.025);
  doorGroup.add(handleSupportBottom);

  // Umbral / Escalón de Piedra Caliche a cota de acceso
  const thresholdStep = new THREE.Mesh(
    new THREE.BoxGeometry(doorFrameWidth + 0.25, 0.12, 0.40),
    stoneThresholdMat
  );
  thresholdStep.position.set(0, 0.04, 0.16);
  thresholdStep.receiveShadow = true;
  thresholdStep.castShadow = true;
  doorGroup.add(thresholdStep);

  return domeGroup;
}
