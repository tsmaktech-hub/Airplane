import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { AIRCRAFT_COMPONENTS, ASSET_IMAGES } from '../../data/partsData';
import { buildAeroAircraft, AircraftMeshGroups } from './AircraftMeshBuilder';

interface AircraftSceneProps {
  scrollProgress: number; // 0 to 1
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateScreenPositions: (positions: Record<string, { x: number; y: number; visible: boolean }>) => void;
  isOrbitMode?: boolean;
}

export const AircraftScene: React.FC<AircraftSceneProps> = ({
  scrollProgress,
  selectedComponentId,
  onSelectComponent,
  onUpdateScreenPositions,
  isOrbitMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const aircraftRef = useRef<AircraftMeshGroups | null>(null);

  // Background Panorama & Environment Meshes
  const skyMeshRef = useRef<THREE.Mesh | null>(null);
  const approachMeshRef = useRef<THREE.Mesh | null>(null);
  const hangarMeshRef = useRef<THREE.Mesh | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const runwayLightsGroupRef = useRef<THREE.Group | null>(null);

  const lightsRef = useRef<{
    sun: THREE.DirectionalLight;
    ambient: THREE.AmbientLight;
    hangarSpot1: THREE.SpotLight;
    hangarSpot2: THREE.SpotLight;
    rimLight: THREE.DirectionalLight;
  } | null>(null);

  const particlesRef = useRef<THREE.Points | null>(null);

  // Smooth lerp state
  const targetCamPos = useRef(new THREE.Vector3(12, 4, 18));
  const targetCamLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentCamPos = useRef(new THREE.Vector3(12, 4, 18));
  const currentCamLook = useRef(new THREE.Vector3(0, 0, 0));
  const smoothExploded = useRef(0);
  const isDragging = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const orbitRotation = useRef({ x: 0, y: 0 });

  const [isSceneReady, setIsSceneReady] = useState(false);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Depth Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a101d);
    scene.fog = new THREE.FogExp2(0x0a101d, 0.008);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1500);
    camera.position.set(12, 4, 18);
    cameraRef.current = camera;

    // 3. Renderer with High Dynamic Range & Color Precision
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const textureLoader = new THREE.TextureLoader();

    // 4. Lighting System
    const ambient = new THREE.AmbientLight(0xcfd8dc, 0.9);
    scene.add(ambient);

    // Warm Golden Sunlight in sky / twilight rim
    const sun = new THREE.DirectionalLight(0xffedd5, 3.2);
    sun.position.set(30, 35, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 120;
    sun.shadow.camera.left = -25;
    sun.shadow.camera.right = 25;
    sun.shadow.camera.top = 25;
    sun.shadow.camera.bottom = -25;
    scene.add(sun);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    rimLight.position.set(-25, -2, -30);
    scene.add(rimLight);

    // Hangar Overhead Industrial Spotlights
    const hangarSpot1 = new THREE.SpotLight(0xffffff, 0, 50, Math.PI / 3.5, 0.35, 1);
    hangarSpot1.position.set(0, 22, 6);
    scene.add(hangarSpot1);

    const hangarSpot2 = new THREE.SpotLight(0x38bdf8, 0, 50, Math.PI / 3.5, 0.35, 1);
    hangarSpot2.position.set(0, 22, -6);
    scene.add(hangarSpot2);

    lightsRef.current = { sun, ambient, hangarSpot1, hangarSpot2, rimLight };

    // ==============================================================
    // 5. REAL IMAGE BACKGROUND PANORAMAS (Sky -> Airport Approach -> Hangar)
    // ==============================================================

    // A. Real High-Altitude Sky Background (Cruise Flight Phase)
    const skyTex = textureLoader.load(ASSET_IMAGES.skyClouds);
    skyTex.wrapS = THREE.ClampToEdgeWrapping;
    skyTex.wrapT = THREE.ClampToEdgeWrapping;
    const skyGeo = new THREE.SphereGeometry(220, 48, 32);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.rotation.y = -Math.PI / 2.2;
    scene.add(skyMesh);
    skyMeshRef.current = skyMesh;

    // B. Real Airport Runway Approach Background (Descent Phase leading to Airport)
    const approachTex = textureLoader.load(ASSET_IMAGES.airportApproach);
    const approachGeo = new THREE.CylinderGeometry(180, 180, 140, 48, 1, true, -Math.PI * 0.7, Math.PI * 1.4);
    const approachMat = new THREE.MeshBasicMaterial({
      map: approachTex,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });
    const approachMesh = new THREE.Mesh(approachGeo, approachMat);
    approachMesh.position.set(0, 20, -25);
    scene.add(approachMesh);
    approachMeshRef.current = approachMesh;

    // C. Real Airport Maintenance Hangar Background (Docked & Disassembly Phase)
    const hangarTex = textureLoader.load(ASSET_IMAGES.hangarBay);
    const hangarGeo = new THREE.CylinderGeometry(110, 110, 90, 48, 1, true);
    const hangarMat = new THREE.MeshStandardMaterial({
      map: hangarTex,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.0,
      roughness: 0.4,
      metalness: 0.6,
      depthWrite: false,
    });
    const hangarMesh = new THREE.Mesh(hangarGeo, hangarMat);
    hangarMesh.position.set(0, 15, 0);
    scene.add(hangarMesh);
    hangarMeshRef.current = hangarMesh;

    // ==============================================================
    // 6. REAL AIRPORT TARMAC & RUNWAY SURFACE
    // ==============================================================
    const tarmacTex = textureLoader.load(ASSET_IMAGES.tarmacRunway);
    tarmacTex.wrapS = THREE.RepeatWrapping;
    tarmacTex.wrapT = THREE.RepeatWrapping;
    tarmacTex.repeat.set(8, 8);

    const floorGeo = new THREE.PlaneGeometry(280, 280, 32, 32);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: tarmacTex,
      metalness: 0.7,
      roughness: 0.35,
      transparent: true,
      opacity: 0.0,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -3.3;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
    floorMeshRef.current = floorMesh;

    // 7. REAL 3D AIRPORT RUNWAY APPROACH & THRESHOLD LIGHTS
    const runwayLightsGroup = new THREE.Group();
    runwayLightsGroup.position.set(0, -3.28, 0);

    // Runway Centerline White Inset Lights
    const centerlineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const centerlineGeo = new THREE.BoxGeometry(0.2, 0.05, 1.2);
    for (let z = -120; z < 100; z += 6) {
      const lightMesh = new THREE.Mesh(centerlineGeo, centerlineMat);
      lightMesh.position.set(0, 0, z);
      runwayLightsGroup.add(lightMesh);
    }

    // Runway Edge Lights (Yellow/White) & Green Threshold Barrette
    const edgeLightGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const edgeYellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const edgeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const greenThresholdMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const blueTaxiMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // Green Threshold Bar (The runway start)
    for (let x = -14; x <= 14; x += 1.5) {
      const thLight = new THREE.Mesh(edgeLightGeo, greenThresholdMat);
      thLight.position.set(x, 0.08, -35);
      runwayLightsGroup.add(thLight);
    }

    // Approach Light System (ALS) crossbars leading to runway
    for (let z = -90; z < -35; z += 12) {
      for (let x = -8; x <= 8; x += 2) {
        const als = new THREE.Mesh(edgeLightGeo, edgeWhiteMat);
        als.position.set(x, 0.08, z);
        runwayLightsGroup.add(als);
      }
    }

    // Runway Edges
    for (let z = -35; z < 90; z += 8) {
      const isYellowZone = z > 50;
      const mat = isYellowZone ? edgeYellowMat : edgeWhiteMat;

      const leftEdge = new THREE.Mesh(edgeLightGeo, mat);
      leftEdge.position.set(-14, 0.08, z);
      runwayLightsGroup.add(leftEdge);

      const rightEdge = new THREE.Mesh(edgeLightGeo, mat);
      rightEdge.position.set(14, 0.08, z);
      runwayLightsGroup.add(rightEdge);

      // Blue taxiway border lights
      const taxiLeft = new THREE.Mesh(edgeLightGeo, blueTaxiMat);
      taxiLeft.position.set(-20, 0.06, z);
      runwayLightsGroup.add(taxiLeft);
    }

    scene.add(runwayLightsGroup);
    runwayLightsGroup.visible = false;
    runwayLightsGroupRef.current = runwayLightsGroup;

    // 8. Atmospheric Cloud & Vapor Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 90;
      positions[i + 1] = (Math.random() - 0.5) * 45;
      positions[i + 2] = (Math.random() - 0.5) * 140;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 0.38,
      transparent: true,
      opacity: 0.3,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 9. Build Genuine Commercial Jetliner Model
    const aircraft = buildAeroAircraft();
    scene.add(aircraft.root);
    aircraftRef.current = aircraft;

    setIsSceneReady(true);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Main 60FPS Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Spin CFM LEAP Turbofan Blades AND Iconic White Spiral Spinner
      if (aircraftRef.current) {
        aircraftRef.current.fanBlades.forEach((fan) => {
          fan.rotation.z += 14 * delta;
        });

        aircraftRef.current.spinners.forEach((spinner) => {
          spinner.rotation.y += 14 * delta;
        });

        // Anti-Collision Strobe Flash (Wingtip white, belly red beacon)
        const strobeFlash = Math.sin(time * 7) > 0.82;
        aircraftRef.current.navLights.forEach((light) => {
          light.intensity = strobeFlash ? 4.5 : 1.2;
        });
      }

      // Stream High-Altitude Cloud/Vapor Particles
      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;
        for (let i = 2; i < array.length; i += 3) {
          array[i] += 48 * delta;
          if (array[i] > 70) array[i] = -70;
        }
        posAttr.needsUpdate = true;
      }

      // Camera Smooth Lerp
      currentCamPos.current.lerp(targetCamPos.current, 0.08);
      currentCamLook.current.lerp(targetCamLook.current, 0.08);

      if (cameraRef.current) {
        cameraRef.current.position.copy(currentCamPos.current);
        cameraRef.current.lookAt(currentCamLook.current);
      }

      // Screen Projections for 2D Callout Lines
      if (cameraRef.current && containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        const screenPos: Record<string, { x: number; y: number; visible: boolean }> = {};

        AIRCRAFT_COMPONENTS.forEach((comp) => {
          const worldPos = new THREE.Vector3(...comp.threePosition);
          const explodedOffset = new THREE.Vector3(...comp.explodedOffset).multiplyScalar(smoothExploded.current);
          worldPos.add(explodedOffset);

          if (aircraftRef.current) {
            worldPos.applyEuler(aircraftRef.current.root.rotation);
            worldPos.add(aircraftRef.current.root.position);
          }

          const projected = worldPos.clone().project(cameraRef.current!);
          const visible = projected.z < 1 && projected.x >= -1.1 && projected.x <= 1.1 && projected.y >= -1.1 && projected.y <= 1.1;

          screenPos[comp.id] = {
            x: ((projected.x + 1) * w) / 2,
            y: ((-projected.y + 1) * h) / 2,
            visible: visible && smoothExploded.current > 0.25,
          };
        });

        onUpdateScreenPositions(screenPos);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Aircraft State & Real Image Backgrounds Based on Scroll Progress
  useEffect(() => {
    if (!isSceneReady || !aircraftRef.current || !lightsRef.current || !sceneRef.current) return;

    const aircraft = aircraftRef.current;
    const lights = lightsRef.current;
    const scene = sceneRef.current;
    const p = Math.max(0, Math.min(1, scrollProgress));

    // Exploded View Factor (Active in hangar: p > 0.58)
    let explodedFactor = 0;
    if (p > 0.58) {
      explodedFactor = Math.min(1, (p - 0.58) / 0.32);
    }
    smoothExploded.current = explodedFactor;

    // REAL IMAGE BACKGROUND TRANSITIONS:
    // Phase 1 (0 to 0.35): Real high altitude sky & clouds
    // Phase 2 (0.35 to 0.68): Real aerial descent approaching international airport runway
    // Phase 3 (0.68 to 1.0): Real airport tarmac & maintenance hangar
    if (skyMeshRef.current && approachMeshRef.current && hangarMeshRef.current && floorMeshRef.current) {
      if (p < 0.35) {
        // High Sky
        const skyOp = 1.0;
        const appOp = Math.max(0, (p - 0.2) / 0.15);
        (skyMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 1.0 - appOp * 0.5;
        (approachMeshRef.current.material as THREE.MeshBasicMaterial).opacity = appOp;
        (hangarMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 0;
        (floorMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 0;
        if (runwayLightsGroupRef.current) runwayLightsGroupRef.current.visible = false;
      } else if (p < 0.68) {
        // Approach leading directly to airport runway
        const descentProgress = (p - 0.35) / 0.33;
        (skyMeshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1.0 - descentProgress * 1.5);
        (approachMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 1.0 - descentProgress * 0.4;
        (hangarMeshRef.current.material as THREE.MeshStandardMaterial).opacity = Math.max(0, (descentProgress - 0.5) * 2);
        (floorMeshRef.current.material as THREE.MeshStandardMaterial).opacity = descentProgress;

        if (runwayLightsGroupRef.current) {
          runwayLightsGroupRef.current.visible = true;
        }
      } else {
        // Landed on Tarmac in Hangar Bay
        (skyMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
        (approachMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
        (hangarMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 1.0;
        (floorMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 1.0;
        if (runwayLightsGroupRef.current) runwayLightsGroupRef.current.visible = true;
      }
    }

    // 1. Aircraft Trajectory, Pitch, Roll & Landing
    if (p < 0.38) {
      // High Flight
      const sub = p / 0.38;
      aircraft.root.position.y = 3.8 - sub * 1.6;
      aircraft.root.position.z = sub * -2.5;
      aircraft.root.rotation.x = -0.05 + Math.sin(sub * Math.PI) * 0.08;
      aircraft.root.rotation.z = Math.sin(sub * Math.PI * 1.5) * 0.12;
      aircraft.root.rotation.y = 0.2 - sub * 0.2;

      lights.sun.intensity = 3.2;
      lights.hangarSpot1.intensity = 0;
      lights.hangarSpot2.intensity = 0;
      aircraft.landingLights.forEach((l) => (l.intensity = 0));
    } else if (p < 0.68) {
      // Final Approach & Touchdown on Runway
      const sub = (p - 0.38) / 0.3;
      aircraft.root.position.y = 2.2 - sub * 2.2; // touches down smoothly at y = 0
      aircraft.root.position.z = -2.5 + sub * 2.5;
      aircraft.root.rotation.x = 0.04 * (1 - sub); // flare on touchdown
      aircraft.root.rotation.z = 0.05 * (1 - sub);
      aircraft.root.rotation.y = sub * 0.08;

      lights.sun.intensity = 3.2 - sub * 1.8;
      lights.hangarSpot1.intensity = sub * 3.8;
      lights.hangarSpot2.intensity = sub * 3.2;

      // Turn on aircraft landing lights to illuminate the runway
      aircraft.landingLights.forEach((l) => (l.intensity = sub * 4.0));
    } else {
      // Docked on Tarmac / Hangar Exploded Inspection
      aircraft.root.position.set(0, 0, 0);
      aircraft.root.rotation.set(
        0.03,
        0.12 + (isOrbitMode ? orbitRotation.current.y : 0),
        isOrbitMode ? orbitRotation.current.x : 0
      );

      lights.sun.intensity = 1.2;
      lights.hangarSpot1.intensity = 4.8;
      lights.hangarSpot2.intensity = 4.2;
      aircraft.landingLights.forEach((l) => (l.intensity = 1.5));
    }

    // 2. Component Exploded Displacement
    const ef = smoothExploded.current;
    aircraft.radomeAvionics.position.set(0, 1.8 * ef, 4.8 * ef);
    aircraft.engineLeft.position.set(-4.4 - 2.8 * ef, -0.95 - 2.2 * ef, 1.3 + 3.2 * ef);
    aircraft.engineRight.position.set(4.4 + 2.8 * ef, -0.95 - 2.2 * ef, 1.3 + 3.2 * ef);
    aircraft.wingLeft.position.set(-4.8 * ef, -0.2 + 1.2 * ef, 1.2 - 1.6 * ef);
    aircraft.wingRight.position.set(4.8 * ef, -0.2 + 1.2 * ef, 1.2 - 1.6 * ef);
    aircraft.flapsLeft.position.set(-3.8 - 3.2 * ef, -0.32 - 1.3 * ef, -2.4 - 3.8 * ef);
    aircraft.flapsRight.position.set(3.8 + 3.2 * ef, -0.32 - 1.3 * ef, -2.4 - 3.8 * ef);
    aircraft.aileronLeft.position.set(-8.8 - 5.0 * ef, 0.12 + 0.9 * ef, -4.6 - 4.0 * ef);
    aircraft.aileronRight.position.set(8.8 + 5.0 * ef, 0.12 + 0.9 * ef, -4.6 - 4.0 * ef);
    aircraft.gearMainLeft.position.set(-2.5 - 0.6 * ef, -1.55 - 3.4 * ef, -0.4 + 0.6 * ef);
    aircraft.gearMainRight.position.set(2.5 + 0.6 * ef, -1.55 - 3.4 * ef, -0.4 + 0.6 * ef);
    aircraft.wheelLeft.position.set(-2.5 - 2.0 * ef, -2.75 - 4.2 * ef, -0.4 + 2.4 * ef);
    aircraft.wheelRight.position.set(2.5 + 2.0 * ef, -2.75 - 4.2 * ef, -0.4 + 2.4 * ef);
    aircraft.brakeLeft.position.set(-2.5 - 1.4 * ef, -2.75 - 4.0 * ef, -0.4 + 1.6 * ef);
    aircraft.brakeRight.position.set(2.5 + 1.4 * ef, -2.75 - 4.0 * ef, -0.4 + 1.6 * ef);
    aircraft.hydraulics.position.set(0.85 - 1.3 * ef, 0.22 + 2.4 * ef, -1.8 - 2.6 * ef);
    aircraft.fuelSystem.position.set(0, -0.65 - 3.2 * ef, 0.2 - 1.6 * ef);

    // 3. Camera Framing Logic
    if (selectedComponentId) {
      const selected = AIRCRAFT_COMPONENTS.find((c) => c.id === selectedComponentId);
      if (selected) {
        targetCamPos.current.set(...selected.cameraPosition);
        targetCamLook.current.set(...selected.cameraTarget);
        return;
      }
    }

    if (p < 0.35) {
      // High Flight Chase View
      const sub = p / 0.35;
      targetCamPos.current.set(14 - sub * 4, 5 - sub * 1.5, 25 - sub * 6);
      targetCamLook.current.set(0, 2 - sub * 1, 0);
    } else if (p < 0.68) {
      // Runway Approach & Descent along the approach corridor
      const sub = (p - 0.35) / 0.33;
      targetCamPos.current.set(10 - sub * 2.5, 3.5 - sub * 1.5, 19 - sub * 5.5);
      targetCamLook.current.set(0, 0.6 - sub * 0.6, 0);
    } else {
      // Disassembly Micro Inspection
      const sub = (p - 0.68) / 0.32;
      targetCamPos.current.set(7.5 - sub * 1.2, 2.6 + sub * 0.6, 13.5 - sub * 2.5);
      targetCamLook.current.set(1.4 * sub, 0, 0);
    }
  }, [scrollProgress, selectedComponentId, isSceneReady, isOrbitMode]);

  // Raycasting Click Interaction
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !isOrbitMode) return;
    const deltaX = e.clientX - prevMousePos.current.x;
    const deltaY = e.clientY - prevMousePos.current.y;
    orbitRotation.current.y += deltaX * 0.005;
    orbitRotation.current.x += deltaY * 0.005;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  }, [isOrbitMode]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const moved = Math.hypot(e.clientX - prevMousePos.current.x, e.clientY - prevMousePos.current.y);
    isDragging.current = false;

    if (moved < 5 && containerRef.current && cameraRef.current && sceneRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        let matchedCompId: string | null = null;

        while (obj && obj !== sceneRef.current) {
          const name = obj.name;
          if (name.includes('Engine')) matchedCompId = 'engine';
          else if (name.includes('Wheel')) matchedCompId = 'wheel';
          else if (name.includes('Brake')) matchedCompId = 'brakes';
          else if (name.includes('Gear')) matchedCompId = 'landing-gear';
          else if (name.includes('Flap')) matchedCompId = 'flaps';
          else if (name.includes('Aileron')) matchedCompId = 'aileron';
          else if (name.includes('Radome') || name.includes('Avionics')) matchedCompId = 'avionics';
          else if (name.includes('Hydraulic')) matchedCompId = 'hydraulics';
          else if (name.includes('Fuel')) matchedCompId = 'fuel-system';
          else if (name.includes('Wing')) matchedCompId = 'wing';

          if (matchedCompId) break;
          obj = obj.parent;
        }

        if (matchedCompId) {
          onSelectComponent(matchedCompId);
        }
      }
    }
  }, [onSelectComponent]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
    />
  );
};
