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
  const airportSunsetMeshRef = useRef<THREE.Mesh | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const runwayLightsGroupRef = useRef<THREE.Group | null>(null);

  const lightsRef = useRef<{
    sun: THREE.DirectionalLight;
    ambient: THREE.AmbientLight;
    sunsetRim: THREE.DirectionalLight;
    tarmacLight1: THREE.SpotLight;
    tarmacLight2: THREE.SpotLight;
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

    // 1. Scene & Depth Fog tuned to London City Airport golden sunset
    const scene = new THREE.Scene();
    scene.background = null; // transparent so the high-res background image layers through cleanly
    scene.fog = new THREE.FogExp2(0x18151f, 0.005);
    sceneRef.current = scene;

    // 2. Camera with cinematic focal length
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 2000);
    camera.position.set(12, 4, 18);
    cameraRef.current = camera;

    // 3. WebGL Renderer with High Dynamic Range & Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const textureLoader = new THREE.TextureLoader();

    // 4. Lighting System Tuned to Golden Hour Sunset Airport Atmosphere
    // Warm golden ambient reflecting off the Thames water & airport tarmac
    const ambient = new THREE.AmbientLight(0xffedd5, 1.1);
    scene.add(ambient);

    // Warm Golden Sun Key Light matching the sunset in London City Airport photo
    const sun = new THREE.DirectionalLight(0xffa500, 3.6);
    sun.position.set(28, 18, 30);
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

    // Twilight Blue Sky Rim Light from opposite horizon
    const sunsetRim = new THREE.DirectionalLight(0x38bdf8, 2.2);
    sunsetRim.position.set(-25, 6, -30);
    scene.add(sunsetRim);

    // Runway / Tarmac Overhead Floodlights
    const tarmacLight1 = new THREE.SpotLight(0xfffbeb, 0, 50, Math.PI / 3.2, 0.35, 1);
    tarmacLight1.position.set(0, 22, 8);
    scene.add(tarmacLight1);

    const tarmacLight2 = new THREE.SpotLight(0xfef08a, 0, 50, Math.PI / 3.2, 0.35, 1);
    tarmacLight2.position.set(0, 22, -8);
    scene.add(tarmacLight2);

    lightsRef.current = { sun, ambient, sunsetRim, tarmacLight1, tarmacLight2 };

    // ==============================================================
    // 5. EXACT REQUESTED REAL AIRPORT SUNSET BACKGROUND
    // ==============================================================
    const sunsetTex = textureLoader.load(ASSET_IMAGES.londonAirportSunset);
    sunsetTex.wrapS = THREE.ClampToEdgeWrapping;
    sunsetTex.wrapT = THREE.ClampToEdgeWrapping;
    
    // Curved panoramic cylindrical cyclorama backdrop
    const sunsetGeo = new THREE.CylinderGeometry(200, 200, 160, 64, 1, true, -Math.PI * 0.75, Math.PI * 1.5);
    const sunsetMat = new THREE.MeshBasicMaterial({
      map: sunsetTex,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const airportSunsetMesh = new THREE.Mesh(sunsetGeo, sunsetMat);
    airportSunsetMesh.position.set(0, 24, -30);
    scene.add(airportSunsetMesh);
    airportSunsetMeshRef.current = airportSunsetMesh;

    // ==============================================================
    // 6. REAL AIRPORT TARMAC & RUNWAY SURFACE
    // ==============================================================
    const floorGeo = new THREE.PlaneGeometry(320, 320, 32, 32);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111317,
      metalness: 0.85,
      roughness: 0.28,
      envMapIntensity: 1.2,
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

    const centerlineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const centerlineGeo = new THREE.BoxGeometry(0.25, 0.06, 1.4);
    for (let z = -120; z < 100; z += 6) {
      const lightMesh = new THREE.Mesh(centerlineGeo, centerlineMat);
      lightMesh.position.set(0, 0, z);
      runwayLightsGroup.add(lightMesh);
    }

    const edgeLightGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const edgeAmberMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const edgeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const greenThresholdMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const blueTaxiMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // Green Runway Threshold Light Bar
    for (let x = -15; x <= 15; x += 1.5) {
      const thLight = new THREE.Mesh(edgeLightGeo, greenThresholdMat);
      thLight.position.set(x, 0.08, -35);
      runwayLightsGroup.add(thLight);
    }

    // Approach Light System (ALS) crossbars
    for (let z = -90; z < -35; z += 12) {
      for (let x = -9; x <= 9; x += 2) {
        const als = new THREE.Mesh(edgeLightGeo, edgeWhiteMat);
        als.position.set(x, 0.08, z);
        runwayLightsGroup.add(als);
      }
    }

    // Runway Amber / White Side Edges
    for (let z = -35; z < 90; z += 8) {
      const isAmber = z > 45;
      const mat = isAmber ? edgeAmberMat : edgeWhiteMat;

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

    // 8. Atmospheric Sunset Particles / Dust
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 90;
      positions[i + 1] = (Math.random() - 0.5) * 45;
      positions[i + 2] = (Math.random() - 0.5) * 140;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.35,
      transparent: true,
      opacity: 0.3,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 9. Build Exact Pure White Commercial Airliner Model
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

    // Main Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Spin Turbofan Blades & Spiral Spinner Cone
      if (aircraftRef.current) {
        aircraftRef.current.fanBlades.forEach((fan) => {
          fan.rotation.z += 14 * delta;
        });

        aircraftRef.current.spinners.forEach((spinner) => {
          spinner.rotation.y += 14 * delta;
        });

        // Anti-Collision Strobe Flash
        const strobeFlash = Math.sin(time * 7) > 0.82;
        aircraftRef.current.navLights.forEach((light) => {
          light.intensity = strobeFlash ? 4.5 : 1.2;
        });
      }

      // Stream Dust / Atmosphere Particles
      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;
        for (let i = 2; i < array.length; i += 3) {
          array[i] += 42 * delta;
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

      // 2D Screen Projections for Interactive Exploded Callouts
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

  // Update Aircraft State Based on Scroll Progress
  useEffect(() => {
    if (!isSceneReady || !aircraftRef.current || !lightsRef.current || !sceneRef.current) return;

    const aircraft = aircraftRef.current;
    const lights = lightsRef.current;
    const scene = sceneRef.current;
    const p = Math.max(0, Math.min(1, scrollProgress));

    // Exploded View Factor (begins once landed near runway threshold: p > 0.58)
    let explodedFactor = 0;
    if (p > 0.58) {
      explodedFactor = Math.min(1, (p - 0.58) / 0.32);
    }
    smoothExploded.current = explodedFactor;

    // Background & Tarmac Transitions
    if (airportSunsetMeshRef.current && floorMeshRef.current) {
      // In flight, background is at full beauty, tarmac fades in as we descend towards touchdown
      if (p < 0.35) {
        (floorMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 0;
        if (runwayLightsGroupRef.current) runwayLightsGroupRef.current.visible = false;
        airportSunsetMeshRef.current.position.y = 24;
      } else {
        const landingProgress = Math.min(1, (p - 0.35) / 0.3);
        (floorMeshRef.current.material as THREE.MeshStandardMaterial).opacity = landingProgress * 0.95;
        if (runwayLightsGroupRef.current) runwayLightsGroupRef.current.visible = true;
        airportSunsetMeshRef.current.position.y = 24 - landingProgress * 8;
      }
    }

    // 1. Aircraft Trajectory, Descent, and Flare Landing
    if (p < 0.38) {
      // Phase 1: High Flight at Sunset above the Airport Skyline
      const sub = p / 0.38;
      aircraft.root.position.y = 3.8 - sub * 1.6;
      aircraft.root.position.z = sub * -2.5;
      aircraft.root.rotation.x = -0.05 + Math.sin(sub * Math.PI) * 0.08;
      aircraft.root.rotation.z = Math.sin(sub * Math.PI * 1.5) * 0.12;
      aircraft.root.rotation.y = 0.2 - sub * 0.2;

      lights.sun.intensity = 3.6;
      lights.tarmacLight1.intensity = 0;
      lights.tarmacLight2.intensity = 0;
      aircraft.landingLights.forEach((l) => (l.intensity = 0));
    } else if (p < 0.68) {
      // Phase 2: Approach & Touchdown on London City Runway
      const sub = (p - 0.38) / 0.3;
      aircraft.root.position.y = 2.2 - sub * 2.2; // touches down smoothly on runway at y = 0
      aircraft.root.position.z = -2.5 + sub * 2.5;
      aircraft.root.rotation.x = 0.04 * (1 - sub); // aerodynamic flare on landing
      aircraft.root.rotation.z = 0.05 * (1 - sub);
      aircraft.root.rotation.y = sub * 0.08;

      lights.sun.intensity = 3.6 - sub * 1.5;
      lights.tarmacLight1.intensity = sub * 3.8;
      lights.tarmacLight2.intensity = sub * 3.2;

      // Aircraft Landing Lights turn on to illuminate runway
      aircraft.landingLights.forEach((l) => (l.intensity = sub * 4.2));
    } else {
      // Phase 3: Landed on Airport Runway / Disassembly View
      aircraft.root.position.set(0, 0, 0);
      aircraft.root.rotation.set(
        0.03,
        0.12 + (isOrbitMode ? orbitRotation.current.y : 0),
        isOrbitMode ? orbitRotation.current.x : 0
      );

      lights.sun.intensity = 2.2;
      lights.tarmacLight1.intensity = 4.8;
      lights.tarmacLight2.intensity = 4.2;
      aircraft.landingLights.forEach((l) => (l.intensity = 2.0));
    }

    // 2. Explode Components along vectors
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

    // 3. Camera Trajectory Logic
    if (selectedComponentId) {
      const selected = AIRCRAFT_COMPONENTS.find((c) => c.id === selectedComponentId);
      if (selected) {
        targetCamPos.current.set(...selected.cameraPosition);
        targetCamLook.current.set(...selected.cameraTarget);
        return;
      }
    }

    if (p < 0.35) {
      // Cinematic Chase Shot with Sunset Airport in background
      const sub = p / 0.35;
      targetCamPos.current.set(14 - sub * 4, 5 - sub * 1.5, 25 - sub * 6);
      targetCamLook.current.set(0, 2 - sub * 1, 0);
    } else if (p < 0.68) {
      // Approach down glideslope leading to airport runway
      const sub = (p - 0.35) / 0.33;
      targetCamPos.current.set(10 - sub * 2.5, 3.5 - sub * 1.5, 19 - sub * 5.5);
      targetCamLook.current.set(0, 0.6 - sub * 0.6, 0);
    } else {
      // Disassembly close-up inspection on runway
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
