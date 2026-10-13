import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useConfiguratorStore } from "../../store/useConfiguratorStore";
import { createGeodesicDomeMesh } from "./GeodesicDomeMesh";
import { createInteriorFurniture } from "./InteriorFurniture";
import { createExteriorAmenities } from "./ExteriorAmenities";
import { createTerrainLot } from "./TerrainLot";
import { LOT_SPECS_MAP, TimeOfDay } from "../../types/configurator";

// Perfiles de Iluminación Cinemática para Paracas
interface LightingProfile {
  bgColor: THREE.Color;
  fogColor: THREE.Color;
  fogDensity: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  sunPos: THREE.Vector3;
  sunCastShadow: boolean;
  hemiSkyColor: THREE.Color;
  hemiGroundColor: THREE.Color;
  hemiIntensity: number;
  interiorIntensity: number;
  bedLampIntensity: number;
  poolIntensity: number;
  fireIntensity: number;
  starOpacity: number;
}

const LIGHTING_PROFILES: Record<TimeOfDay, LightingProfile> = {
  day: {
    bgColor: new THREE.Color(0xf5efe6),
    fogColor: new THREE.Color(0xf5efe6),
    fogDensity: 0.016,
    sunColor: new THREE.Color(0xffe6c2),
    sunIntensity: 2.2,
    sunPos: new THREE.Vector3(15, 20, 12),
    sunCastShadow: true,
    hemiSkyColor: new THREE.Color(0xc9d7e6),
    hemiGroundColor: new THREE.Color(0xc4a574),
    hemiIntensity: 0.80,
    interiorIntensity: 0.2,
    bedLampIntensity: 0.0,
    poolIntensity: 0.2,
    fireIntensity: 0.0,
    starOpacity: 0.0,
  },
  golden: {
    bgColor: new THREE.Color(0xdf955c), // Ocre cálido dorado de atardecer
    fogColor: new THREE.Color(0xd88c52),
    fogDensity: 0.020,
    sunColor: new THREE.Color(0xff8c42), // Luz dorada ámbar 3200K
    sunIntensity: 2.5,
    sunPos: new THREE.Vector3(-22, 5.2, 14), // Ángulo rasante ~14° para sombras alargadas
    sunCastShadow: true,
    hemiSkyColor: new THREE.Color(0xffa873),
    hemiGroundColor: new THREE.Color(0x8a4c24),
    hemiIntensity: 0.70,
    interiorIntensity: 0.8,
    bedLampIntensity: 0.3,
    poolIntensity: 0.8,
    fireIntensity: 0.5,
    starOpacity: 0.0,
  },
  night: {
    bgColor: new THREE.Color(0x0c1018), // Cielo nocturno azul medianoche profundo
    fogColor: new THREE.Color(0x0c1018),
    fogDensity: 0.018,
    sunColor: new THREE.Color(0x405570), // Luz de luna tenue
    sunIntensity: 0.18,
    sunPos: new THREE.Vector3(15, 20, 12),
    sunCastShadow: false,
    hemiSkyColor: new THREE.Color(0x141c2b),
    hemiGroundColor: new THREE.Color(0x0b0e14),
    hemiIntensity: 0.16,
    interiorIntensity: 3.2,
    bedLampIntensity: 1.4,
    poolIntensity: 2.4,
    fireIntensity: 2.0,
    starOpacity: 0.85,
  },
};

export const DomeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Zustand store values
  const lotArea = useConfiguratorStore((s) => s.lotArea);
  const diameter = useConfiguratorStore((s) => s.diameter);
  const timeOfDay = useConfiguratorStore((s) => s.timeOfDay);
  const coverProgress = useConfiguratorStore((s) => s.coverProgress);
  const cameraPreset = useConfiguratorStore((s) => s.cameraPreset);
  const bathLocation = useConfiguratorStore((s) => s.bathLocation);
  const waterFeature = useConfiguratorStore((s) => s.waterFeature);
  const groundTreatment = useConfiguratorStore((s) => s.groundTreatment);
  const amenities = useConfiguratorStore((s) => s.amenities);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const clippingPlaneRef = useRef<THREE.Plane | null>(null);
  const fireLightRef = useRef<THREE.PointLight | null>(null);
  const starMatRef = useRef<THREE.PointsMaterial | null>(null);

  // References to lights for smooth transitions
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const interiorLightRef = useRef<THREE.PointLight | null>(null);
  const bedLampLRef = useRef<THREE.PointLight | null>(null);
  const bedLampRRef = useRef<THREE.PointLight | null>(null);
  const poolLightRef = useRef<THREE.PointLight | null>(null);

  const timeOfDayRef = useRef<TimeOfDay>(timeOfDay);
  useEffect(() => {
    timeOfDayRef.current = timeOfDay;
  }, [timeOfDay]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 600;

    const isMobile = window.innerWidth < 768;
    const maxDPR = isMobile ? 1.25 : Math.min(window.devicePixelRatio, 1.75);

    // 1. SCENE & BACKGROUND
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const initialProfile = LIGHTING_PROFILES[timeOfDay];
    scene.background = initialProfile.bgColor.clone();
    scene.fog = new THREE.FogExp2(initialProfile.fogColor.getHex(), initialProfile.fogDensity);

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 90);
    camera.position.set(13, 10, 16);
    cameraRef.current = camera;

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(maxDPR);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. CLIPPING PLANE FOR PLANTA 3D (Y = 1.50 m)
    const clipPlane = new THREE.Plane(
      new THREE.Vector3(0, -1, 0),
      cameraPreset === "top" ? 1.50 : 100
    );
    clippingPlaneRef.current = clipPlane;

    // 5. LIGHTING SETUP
    const hemiLight = new THREE.HemisphereLight(
      initialProfile.hemiSkyColor,
      initialProfile.hemiGroundColor,
      initialProfile.hemiIntensity
    );
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(
      initialProfile.sunColor,
      initialProfile.sunIntensity
    );
    sunLight.position.copy(initialProfile.sunPos);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = isMobile ? 512 : 1024;
    sunLight.shadow.mapSize.height = isMobile ? 512 : 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 16;
    sunLight.shadow.camera.bottom = -16;
    sunLight.shadow.bias = -0.0008;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Interior & Accent Lights
    const nightGroup = new THREE.Group();
    scene.add(nightGroup);

    const interiorPoint = new THREE.PointLight(
      0xff9933,
      initialProfile.interiorIntensity,
      9,
      2
    );
    interiorPoint.position.set(0, 2.5, -0.5);
    nightGroup.add(interiorPoint);
    interiorLightRef.current = interiorPoint;

    const bedLampL = new THREE.PointLight(
      0xffaa44,
      initialProfile.bedLampIntensity,
      3.5,
      2
    );
    bedLampL.position.set(-1.45, 1.0, -1.8);
    nightGroup.add(bedLampL);
    bedLampLRef.current = bedLampL;

    const bedLampR = new THREE.PointLight(
      0xffaa44,
      initialProfile.bedLampIntensity,
      3.5,
      2
    );
    bedLampR.position.set(1.45, 1.0, -1.8);
    nightGroup.add(bedLampR);
    bedLampRRef.current = bedLampR;

    if (waterFeature === "plunge" || waterFeature === "jacuzzi") {
      const poolLight = new THREE.PointLight(
        waterFeature === "jacuzzi" ? 0x48b5ab : 0x3d8b84,
        initialProfile.poolIntensity,
        5,
        2
      );
      poolLight.position.set(3.4, 0.4, 3.8);
      nightGroup.add(poolLight);
      poolLightRef.current = poolLight;
    }

    if (amenities.firepit) {
      const fireLight = new THREE.PointLight(
        0xff5722,
        initialProfile.fireIntensity,
        4.5,
        2
      );
      fireLight.position.set(-3.4, 0.4, 3.8);
      nightGroup.add(fireLight);
      fireLightRef.current = fireLight;
    }

    // Campo de Estrellas (activo dinámicamente con opacidad)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = Math.random() * 40 + 4;
      starPositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.14,
      transparent: true,
      opacity: initialProfile.starOpacity,
    });
    starMatRef.current = starMat;
    scene.add(new THREE.Points(starGeo, starMat));

    // 6. BUILD SCENE ENTITIES
    const terrainGroup = createTerrainLot(lotArea, groundTreatment, amenities.garden);
    scene.add(terrainGroup);

    const domeMesh = createGeodesicDomeMesh(diameter, coverProgress, clipPlane);
    scene.add(domeMesh);

    const furnitureGroup = createInteriorFurniture(diameter, bathLocation, clipPlane);
    scene.add(furnitureGroup);

    const lotDepth = LOT_SPECS_MAP[lotArea].depth;
    const amenitiesGroup = createExteriorAmenities(
      diameter,
      amenities,
      waterFeature,
      bathLocation,
      lotDepth
    );
    scene.add(amenitiesGroup);

    // 7. CAMERA PRESET APPLICATION
    switch (cameraPreset) {
      case "iso":
        clipPlane.constant = 100;
        camera.position.set(13, 10, 16);
        camera.lookAt(0, 1.4, 0.5);
        break;
      case "interior":
        clipPlane.constant = 100;
        camera.position.set(0, 1.55, 1.8);
        camera.lookAt(0, 1.1, -1.2);
        break;
      case "deck":
        clipPlane.constant = 100;
        camera.position.set(4.2, 1.8, 6.2);
        camera.lookAt(0, 1.0, 3.0);
        break;
      case "top":
        clipPlane.constant = 1.50; // Plano de corte a 1.50m
        camera.position.set(0, 16, 0.5);
        camera.lookAt(0, 0, 0.5);
        break;
    }

    // 8. INTERACTION CONTROLS
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let spherical = {
      radius: camera.position.length(),
      theta: Math.atan2(camera.position.x, camera.position.z),
      phi: Math.acos(camera.position.y / camera.position.length()),
    };

    const updateCameraPos = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 1.4, 0.5);
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };

      spherical.theta -= dx * 0.0055;
      spherical.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.03, spherical.phi - dy * 0.0055));
      updateCameraPos();
    };

    const onMouseUp = () => (isDragging = false);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(6, Math.min(28, spherical.radius + e.deltaY * 0.015));
      updateCameraPos();
    };

    // Mobile touch
    let prevTouch = { x: 0, y: 0 };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevTouch.x;
      const dy = e.touches[0].clientY - prevTouch.y;
      prevTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      spherical.theta -= dx * 0.0075;
      spherical.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.03, spherical.phi - dy * 0.0075));
      updateCameraPos();
    };
    const onTouchEnd = () => (isDragging = false);

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("wheel", onWheel, { passive: false });
    dom.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // 9. ANIMATION LOOP CON LERP SUAVE (Transición 1.2s entre Modos de Luz)
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const currentMode = timeOfDayRef.current;
      const target = LIGHTING_PROFILES[currentMode];

      // Factor de relajación exponencial (smooth lerp ~1.2s)
      const lerpFactor = 1.0 - Math.exp(-3.2 * delta);

      // Interpolación de Fondo y Niebla
      if (scene.background instanceof THREE.Color) {
        scene.background.lerp(target.bgColor, lerpFactor);
      }
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.lerp(target.fogColor, lerpFactor);
        scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, target.fogDensity, lerpFactor);
      }

      // Interpolación de Luz Solar
      if (sunLightRef.current) {
        sunLightRef.current.color.lerp(target.sunColor, lerpFactor);
        sunLightRef.current.intensity = THREE.MathUtils.lerp(
          sunLightRef.current.intensity,
          target.sunIntensity,
          lerpFactor
        );
        sunLightRef.current.position.lerp(target.sunPos, lerpFactor);
        sunLightRef.current.castShadow = target.sunCastShadow;
      }

      // Interpolación de Luz Hemisférica
      if (hemiLightRef.current) {
        hemiLightRef.current.color.lerp(target.hemiSkyColor, lerpFactor);
        hemiLightRef.current.groundColor.lerp(target.hemiGroundColor, lerpFactor);
        hemiLightRef.current.intensity = THREE.MathUtils.lerp(
          hemiLightRef.current.intensity,
          target.hemiIntensity,
          lerpFactor
        );
      }

      // Interpolación de Luces Interiores y Acentos
      if (interiorLightRef.current) {
        interiorLightRef.current.intensity = THREE.MathUtils.lerp(
          interiorLightRef.current.intensity,
          target.interiorIntensity,
          lerpFactor
        );
      }
      if (bedLampLRef.current && bedLampRRef.current) {
        const lampI = THREE.MathUtils.lerp(
          bedLampLRef.current.intensity,
          target.bedLampIntensity,
          lerpFactor
        );
        bedLampLRef.current.intensity = lampI;
        bedLampRRef.current.intensity = lampI;
      }
      if (poolLightRef.current) {
        poolLightRef.current.intensity = THREE.MathUtils.lerp(
          poolLightRef.current.intensity,
          target.poolIntensity,
          lerpFactor
        );
      }

      // Flicker de fuego en firepit
      if (fireLightRef.current) {
        const flicker = currentMode !== "day" ? Math.sin(elapsed * 7) * 0.35 + Math.cos(elapsed * 13) * 0.15 : 0;
        const targetFire = target.fireIntensity > 0 ? target.fireIntensity + flicker : 0;
        fireLightRef.current.intensity = THREE.MathUtils.lerp(
          fireLightRef.current.intensity,
          targetFire,
          lerpFactor
        );
      }

      // Opacidad de Estrellas
      if (starMatRef.current) {
        starMatRef.current.opacity = THREE.MathUtils.lerp(
          starMatRef.current.opacity,
          target.starOpacity,
          lerpFactor
        );
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("wheel", onWheel);
      dom.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      renderer.dispose();
    };
  }, [
    lotArea,
    diameter,
    coverProgress,
    cameraPreset,
    bathLocation,
    waterFeature,
    groundTreatment,
    amenities,
  ]);

  return <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />;
};
