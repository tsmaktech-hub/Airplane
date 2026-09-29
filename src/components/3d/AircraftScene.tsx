import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { AIRCRAFT_COMPONENTS } from '../../data/partsData';
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
  const lightsRef = useRef<{
    sun: THREE.DirectionalLight;
    ambient: THREE.AmbientLight;
    hangarSpot1: THREE.SpotLight;
    hangarSpot2: THREE.SpotLight;
    rimLight: THREE.DirectionalLight;
  } | null>(null);
  const hangarFloorRef = useRef<THREE.Mesh | null>(null);
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

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a101d);
    scene.fog = new THREE.FogExp2(0x0a101d, 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(12, 4, 18);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambient = new THREE.AmbientLight(0x7dd3fc, 0.8);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfffbeb, 2.8);
    sun.position.set(25, 30, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 100;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    scene.add(sun);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-20, -5, -25);
    scene.add(rimLight);

    // Hangar Overhead Spotlights (intensify in hangar)
    const hangarSpot1 = new THREE.SpotLight(0xffffff, 0, 40, Math.PI / 4, 0.4, 1);
    hangarSpot1.position.set(0, 18, 5);
    scene.add(hangarSpot1);

    const hangarSpot2 = new THREE.SpotLight(0x38bdf8, 0, 40, Math.PI / 4, 0.4, 1);
    hangarSpot2.position.set(0, 18, -5);
    scene.add(hangarSpot2);

    lightsRef.current = { sun, ambient, hangarSpot1, hangarSpot2, rimLight };

    // 5. Hangar Floor & Runway Surface
    const floorGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      metalness: 0.8,
      roughness: 0.25,
      envMapIntensity: 0.8,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -3.2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
    hangarFloorRef.current = floorMesh;

    // Floor Markings / Runway Lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
    const centerline = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 80).rotateX(-Math.PI / 2), lineMat);
    centerline.position.set(0, -3.19, 0);
    scene.add(centerline);

    // 6. Atmospheric Cloud / Vapor Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 80;
      positions[i + 1] = (Math.random() - 0.5) * 40;
      positions[i + 2] = (Math.random() - 0.5) * 120;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xa5f3fc,
      size: 0.35,
      transparent: true,
      opacity: 0.25,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 7. Build Modular 3D Aircraft
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

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Spin Engine Turbofan Blades
      if (aircraftRef.current) {
        aircraftRef.current.fanBlades.forEach((fan) => {
          fan.rotation.z += 12 * delta;
        });

        // Flash Navigation Strobe Lights
        const strobeState = Math.sin(time * 6) > 0.85;
        aircraftRef.current.navLights.forEach((light) => {
          light.intensity = strobeState ? 4 : 1.2;
        });
      }

      // Stream Cloud / Vapor Particles
      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;
        for (let i = 2; i < array.length; i += 3) {
          array[i] += 40 * delta;
          if (array[i] > 60) array[i] = -60;
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

      // Calculate 2D Screen Positions for Interactive Callout Lines
      if (cameraRef.current && containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        const screenPos: Record<string, { x: number; y: number; visible: boolean }> = {};

        AIRCRAFT_COMPONENTS.forEach((comp) => {
          const worldPos = new THREE.Vector3(...comp.threePosition);
          const explodedOffset = new THREE.Vector3(...comp.explodedOffset).multiplyScalar(smoothExploded.current);
          worldPos.add(explodedOffset);

          // Apply root aircraft world transform
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

  // Update Aircraft State Based on Scroll Progress & Selected Component
  useEffect(() => {
    if (!isSceneReady || !aircraftRef.current || !lightsRef.current || !sceneRef.current) return;

    const aircraft = aircraftRef.current;
    const lights = lightsRef.current;
    const scene = sceneRef.current;
    const p = Math.max(0, Math.min(1, scrollProgress));

    // Calculate Exploded View Factor (begins after landing in hangar: p > 0.55)
    let explodedFactor = 0;
    if (p > 0.55) {
      explodedFactor = Math.min(1, (p - 0.55) / 0.35);
    }
    smoothExploded.current = explodedFactor;

    // 1. Altitude Descent & Roll Motion
    if (p < 0.4) {
      // Phase 1: High Flight
      const flightProgress = p / 0.4;
      aircraft.root.position.y = 3.5 - flightProgress * 1.5;
      aircraft.root.position.z = flightProgress * -2;
      aircraft.root.rotation.x = -0.05 + Math.sin(flightProgress * Math.PI) * 0.08;
      aircraft.root.rotation.z = Math.sin(flightProgress * Math.PI * 1.5) * 0.12;
      aircraft.root.rotation.y = 0.2 - flightProgress * 0.2;

      // Sky Atmosphere
      scene.background = new THREE.Color(0x0c1626);
      if (scene.fog) {
        scene.fog.color.setHex(0x0c1626);
        (scene.fog as THREE.FogExp2).density = 0.012;
      }
      lights.sun.intensity = 2.8;
      lights.hangarSpot1.intensity = 0;
      lights.hangarSpot2.intensity = 0;
      if (hangarFloorRef.current) hangarFloorRef.current.visible = false;
    } else if (p < 0.7) {
      // Phase 2: Approach & Landing into Hangar
      const approachProgress = (p - 0.4) / 0.3;
      aircraft.root.position.y = 2.0 - approachProgress * 2.0; // touches down at y = 0
      aircraft.root.position.z = -2 + approachProgress * 2;
      aircraft.root.rotation.x = 0.03 * (1 - approachProgress);
      aircraft.root.rotation.z = 0.05 * (1 - approachProgress);
      aircraft.root.rotation.y = approachProgress * 0.1;

      // Transition to Hangar Environment
      const bgColor = new THREE.Color(0x0c1626).lerp(new THREE.Color(0x07080b), approachProgress);
      scene.background = bgColor;
      if (scene.fog) {
        scene.fog.color.copy(bgColor);
        (scene.fog as THREE.FogExp2).density = 0.012 + approachProgress * 0.01;
      }
      lights.sun.intensity = 2.8 - approachProgress * 1.8;
      lights.hangarSpot1.intensity = approachProgress * 3.5;
      lights.hangarSpot2.intensity = approachProgress * 2.8;
      if (hangarFloorRef.current) {
        hangarFloorRef.current.visible = true;
        (hangarFloorRef.current.material as THREE.MeshStandardMaterial).opacity = approachProgress;
      }
    } else {
      // Phase 3: Hangar Docked & Exploded Inspection View
      aircraft.root.position.set(0, 0, 0);
      aircraft.root.rotation.set(0.04, 0.15 + (isOrbitMode ? orbitRotation.current.y : 0), isOrbitMode ? orbitRotation.current.x : 0);

      scene.background = new THREE.Color(0x07080a);
      if (scene.fog) {
        scene.fog.color.setHex(0x07080a);
        (scene.fog as THREE.FogExp2).density = 0.02;
      }
      lights.sun.intensity = 1.0;
      lights.hangarSpot1.intensity = 4.2;
      lights.hangarSpot2.intensity = 3.8;
      if (hangarFloorRef.current) hangarFloorRef.current.visible = true;
    }

    // 2. Explode Components along vectors
    const ef = smoothExploded.current;
    aircraft.radomeAvionics.position.set(0, 1.8 * ef, 4.5 * ef);
    aircraft.engineLeft.position.set(-4.2 - 2.5 * ef, -0.9 - 2.0 * ef, 1.2 + 3.0 * ef);
    aircraft.engineRight.position.set(4.2 + 2.5 * ef, -0.9 - 2.0 * ef, 1.2 + 3.0 * ef);
    aircraft.wingLeft.position.set(-4.5 * ef, -0.2 + 1.2 * ef, 1.0 - 1.5 * ef);
    aircraft.wingRight.position.set(4.5 * ef, -0.2 + 1.2 * ef, 1.0 - 1.5 * ef);
    aircraft.flapsLeft.position.set(-3.6 - 3.0 * ef, -0.3 - 1.2 * ef, -2.2 - 3.5 * ef);
    aircraft.flapsRight.position.set(3.6 + 3.0 * ef, -0.3 - 1.2 * ef, -2.2 - 3.5 * ef);
    aircraft.aileronLeft.position.set(-8.2 - 4.8 * ef, 0.1 + 0.8 * ef, -4.2 - 3.8 * ef);
    aircraft.aileronRight.position.set(8.2 + 4.8 * ef, 0.1 + 0.8 * ef, -4.2 - 3.8 * ef);
    aircraft.gearMainLeft.position.set(-2.4 - 0.5 * ef, -1.5 - 3.2 * ef, -0.4 + 0.5 * ef);
    aircraft.gearMainRight.position.set(2.4 + 0.5 * ef, -1.5 - 3.2 * ef, -0.4 + 0.5 * ef);
    aircraft.wheelLeft.position.set(-2.4 - 1.8 * ef, -2.6 - 4.0 * ef, -0.4 + 2.2 * ef);
    aircraft.wheelRight.position.set(2.4 + 1.8 * ef, -2.6 - 4.0 * ef, -0.4 + 2.2 * ef);
    aircraft.brakeLeft.position.set(-2.4 - 1.2 * ef, -2.6 - 3.8 * ef, -0.4 + 1.5 * ef);
    aircraft.brakeRight.position.set(2.4 + 1.2 * ef, -2.6 - 3.8 * ef, -0.4 + 1.5 * ef);
    aircraft.hydraulics.position.set(0.8 - 1.2 * ef, 0.2 + 2.2 * ef, -1.8 - 2.5 * ef);
    aircraft.fuelSystem.position.set(0, -0.6 - 3.0 * ef, 0.2 - 1.5 * ef);

    // 3. Camera Position Logic (Check if a component is selected vs default scroll trajectory)
    if (selectedComponentId) {
      const selected = AIRCRAFT_COMPONENTS.find((c) => c.id === selectedComponentId);
      if (selected) {
        targetCamPos.current.set(...selected.cameraPosition);
        targetCamLook.current.set(...selected.cameraTarget);
        return;
      }
    }

    // Default Scroll Camera Trajectory
    if (p < 0.35) {
      // High altitude wide cinematic shot
      const sub = p / 0.35;
      targetCamPos.current.set(14 - sub * 4, 5 - sub * 1.5, 24 - sub * 6);
      targetCamLook.current.set(0, 2 - sub * 1, 0);
    } else if (p < 0.7) {
      // Descending alongside aircraft into hangar
      const sub = (p - 0.35) / 0.35;
      targetCamPos.current.set(10 - sub * 2, 3.5 - sub * 1.5, 18 - sub * 5);
      targetCamLook.current.set(0, 0.5 - sub * 0.5, 0);
    } else {
      // Disassembly exploded close inspection view
      const sub = (p - 0.7) / 0.3;
      targetCamPos.current.set(8 - sub * 1.5, 2.8 + sub * 0.5, 13 - sub * 2.5);
      targetCamLook.current.set(1.5 * sub, 0, 0);
    }
  }, [scrollProgress, selectedComponentId, isSceneReady, isOrbitMode]);

  // Raycasting Click on 3D Aircraft
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

    // If small click without dragging, perform raycast
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
        // Find which component group was clicked
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
      className={`w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none`}
    />
  );
};
