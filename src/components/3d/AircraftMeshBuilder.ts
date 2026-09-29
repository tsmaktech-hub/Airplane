import * as THREE from 'three';

export interface AircraftMeshGroups {
  root: THREE.Group;
  fuselage: THREE.Group;
  radomeAvionics: THREE.Group;
  wingLeft: THREE.Group;
  wingRight: THREE.Group;
  engineLeft: THREE.Group;
  engineRight: THREE.Group;
  flapsLeft: THREE.Group;
  flapsRight: THREE.Group;
  aileronLeft: THREE.Group;
  aileronRight: THREE.Group;
  gearNose: THREE.Group;
  gearMainLeft: THREE.Group;
  gearMainRight: THREE.Group;
  brakeLeft: THREE.Group;
  brakeRight: THREE.Group;
  wheelLeft: THREE.Group;
  wheelRight: THREE.Group;
  hydraulics: THREE.Group;
  fuelSystem: THREE.Group;
  fanBlades: THREE.Mesh[];
  spinners: THREE.Mesh[];
  navLights: THREE.PointLight[];
  landingLights: THREE.SpotLight[];
}

/**
 * Creates high-resolution procedural canvas textures for the user-specified
 * pure white 3D commercial jet aeroplane:
 * - Glossy pristine white fuselage with subtle aerospace panel lines
 * - Dark-tinted passenger cabin windows with realistic frame bezels
 * - Cockpit windshield glass with multi-pane framing
 * - Clean white engine cowlings and tail fin
 */
function createWhiteFuselageTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Pristine Pearlescent White Aircraft Skin
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, '#f8fafc');
  grad.addColorStop(0.3, '#ffffff');
  grad.addColorStop(0.5, '#f1f5f9');
  grad.addColorStop(0.7, '#ffffff');
  grad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 1024);

  // 2. Ultra-Delicate Panel Lines & Rivet Seams
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.18)';
  ctx.lineWidth = 1;
  for (let x = 140; x < 1920; x += 110) {
    ctx.beginPath();
    ctx.moveTo(x, 180);
    ctx.lineTo(x, 844);
    ctx.stroke();
  }
  for (let y = 280; y < 760; y += 110) {
    ctx.beginPath();
    ctx.moveTo(100, y);
    ctx.lineTo(1940, y);
    ctx.stroke();
  }

  // 3. Subtle Sleek Aviation Accent Line (Clean Titanium / Cyan Trim)
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(100, 525);
  ctx.bezierCurveTo(450, 525, 1200, 490, 2048, 450);
  ctx.lineTo(2048, 465);
  ctx.bezierCurveTo(1200, 505, 450, 540, 100, 540);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(100, 540);
  ctx.bezierCurveTo(450, 540, 1200, 510, 2048, 475);
  ctx.lineTo(2048, 485);
  ctx.bezierCurveTo(1200, 520, 450, 550, 100, 550);
  ctx.closePath();
  ctx.fill();

  // 4. Passenger Windows with Realistic Tinted Glass & Silver Bezels
  const drawWindowRow = (startY: number) => {
    for (let i = 0; i < 34; i++) {
      const wx = 380 + i * 42;
      if (i >= 15 && i <= 17) continue; // wing exit gap

      // Chrome window bezel
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.roundRect(wx - 1, startY - 1, 18, 26, 6);
      ctx.fill();

      // Tinted dark glass with sky reflection
      const winGrad = ctx.createLinearGradient(wx, startY, wx, startY + 24);
      winGrad.addColorStop(0, '#0f172a');
      winGrad.addColorStop(0.5, '#1e293b');
      winGrad.addColorStop(0.85, '#0284c7');
      winGrad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = winGrad;
      ctx.beginPath();
      ctx.roundRect(wx, startY, 16, 24, 5);
      ctx.fill();

      // Diagonal window reflection line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wx + 3, startY + 3);
      ctx.lineTo(wx + 13, startY + 13);
      ctx.stroke();
    }
  };

  drawWindowRow(415);
  drawWindowRow(615);

  // 5. Commercial Passenger Doors (Door 1L, Overwing Exit, Aft Door)
  const drawDoor = (dx: number, dy: number, w: number, h: number, label: string) => {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(dx, dy, w, h);

    // Door window
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(dx + w / 2 - 6, dy + 18, 12, 18, 4);
    ctx.fill();

    // Handle
    ctx.fillStyle = '#475569';
    ctx.fillRect(dx + 8, dy + h / 2, 8, 3);

    // Label
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(label, dx - 2, dy + h + 12);
  };

  drawDoor(280, 375, 42, 95, 'DOOR 1L');
  drawDoor(980, 395, 36, 75, 'EXIT');
  drawDoor(1720, 375, 42, 95, 'DOOR 2L');

  drawDoor(280, 585, 42, 95, 'DOOR 1R');
  drawDoor(980, 585, 36, 75, 'EXIT');
  drawDoor(1720, 585, 42, 95, 'DOOR 2R');

  // 6. Clean Typography Branding
  ctx.font = '700 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.letterSpacing = '4px';
  ctx.fillText('AEROCORE TECHNOLOGIES', 380, 365);
  ctx.fillText('AEROCORE TECHNOLOGIES', 380, 725);

  // 7. Aircraft Tail Registration
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText('N737-AC', 1650, 345);
  ctx.fillText('N737-AC', 1650, 745);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates engine spinner spiral texture
 */
function createSpinnerSpiralTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 24;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const centerX = 256;
  const centerY = 256;
  for (let a = 0; a < 8 * Math.PI; a += 0.05) {
    const r = (a / (8 * Math.PI)) * 220;
    const x = centerX + Math.cos(a) * r;
    const y = centerY + Math.sin(a) * r;
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

/**
 * Creates Tail Fin Logo Texture on white vertical stabilizer
 */
function createWhiteTailFinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Pure white base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 512);

  // AeroCore stylized cyan/navy chevron wings insignia
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(256, 110);
  ctx.lineTo(400, 340);
  ctx.lineTo(330, 340);
  ctx.lineTo(256, 220);
  ctx.lineTo(182, 340);
  ctx.lineTo(112, 340);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(256, 235);
  ctx.lineTo(305, 325);
  ctx.lineTo(207, 325);
  ctx.closePath();
  ctx.fill();

  ctx.font = 'bold 24px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.fillText('AEROCORE', 256, 410);

  return new THREE.CanvasTexture(canvas);
}

export function buildAeroAircraft(): AircraftMeshGroups {
  const root = new THREE.Group();
  root.name = 'AircraftRoot';

  const fuselageTexture = createWhiteFuselageTexture();
  const spinnerTexture = createSpinnerSpiralTexture();
  const tailTexture = createWhiteTailFinTexture();

  // --- High-Grade PBR Materials for Pure White 3D Aeroplane ---
  const whiteFuselageMat = new THREE.MeshStandardMaterial({
    map: fuselageTexture,
    color: 0xffffff,
    metalness: 0.22,
    roughness: 0.2,
    envMapIntensity: 1.6,
  });

  const whiteWingMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.18,
    roughness: 0.25,
    envMapIntensity: 1.4,
  });

  const leadingEdgeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.94,
    roughness: 0.1,
    envMapIntensity: 2.0,
  });

  const whiteTailFinMat = new THREE.MeshStandardMaterial({
    map: tailTexture,
    color: 0xffffff,
    metalness: 0.2,
    roughness: 0.25,
  });

  const carbonBrakeMat = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    metalness: 0.35,
    roughness: 0.65,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x141518,
    metalness: 0.08,
    roughness: 0.88,
  });

  const cockpitGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.95,
    roughness: 0.05,
    transparent: true,
    opacity: 0.92,
  });

  const goldAvionicsMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.88,
    roughness: 0.25,
  });

  const hydraulicPistonMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.98,
    roughness: 0.06,
  });

  const fanBladeMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.92,
    roughness: 0.18,
  });

  const spinnerMat = new THREE.MeshStandardMaterial({
    map: spinnerTexture,
    metalness: 0.65,
    roughness: 0.22,
  });

  const fanBlades: THREE.Mesh[] = [];
  const spinners: THREE.Mesh[] = [];
  const navLights: THREE.PointLight[] = [];
  const landingLights: THREE.SpotLight[] = [];

  // ==========================================
  // 1. PURE WHITE FUSELAGE & EMPENNAGE
  // ==========================================
  const fuselage = new THREE.Group();
  fuselage.name = 'FuselageGroup';

  // Main Pure White Fuselage Tube
  const tubeGeo = new THREE.CylinderGeometry(1.25, 1.25, 13.5, 48, 1, false);
  tubeGeo.rotateX(Math.PI / 2);
  const tubeMesh = new THREE.Mesh(tubeGeo, whiteFuselageMat);
  tubeMesh.castShadow = true;
  tubeMesh.receiveShadow = true;
  fuselage.add(tubeMesh);

  // Cockpit Windshield Visor (Sleek dark glass visor)
  const visorGeo = new THREE.CylinderGeometry(1.255, 1.255, 2.0, 36, 1, false, -Math.PI / 3, (Math.PI * 2) / 3);
  visorGeo.rotateX(Math.PI / 2);
  visorGeo.rotateZ(Math.PI);
  const visorMesh = new THREE.Mesh(visorGeo, cockpitGlassMat);
  visorMesh.position.set(0, 0.22, 5.2);
  fuselage.add(visorMesh);

  // Cockpit Window Center Pillar & Frames
  const frameGeo = new THREE.BoxGeometry(0.08, 0.5, 1.9);
  const frameMesh = new THREE.Mesh(frameGeo, leadingEdgeMat);
  frameMesh.position.set(0, 1.15, 5.2);
  fuselage.add(frameMesh);

  // Top White SATCOM Radome Fairing
  const satcomGeo = new THREE.SphereGeometry(0.45, 24, 16);
  satcomGeo.scale(0.8, 0.35, 2.8);
  const satcomMesh = new THREE.Mesh(satcomGeo, whiteWingMat);
  satcomMesh.position.set(0, 1.35, 0.5);
  fuselage.add(satcomMesh);

  // Antennas
  const createAntenna = (y: number, z: number, isDown = false) => {
    const antGeo = new THREE.BoxGeometry(0.04, 0.3, 0.25);
    const antMesh = new THREE.Mesh(antGeo, leadingEdgeMat);
    antMesh.position.set(0, y, z);
    antMesh.rotation.x = isDown ? 0.3 : -0.3;
    fuselage.add(antMesh);
  };
  createAntenna(1.4, 3.2);
  createAntenna(1.4, -3.5);
  createAntenna(-1.35, 2.0, true);

  // Tail Cone
  const tailConeGeo = new THREE.ConeGeometry(1.25, 6.2, 40);
  tailConeGeo.rotateX(-Math.PI / 2);
  const tailConeMesh = new THREE.Mesh(tailConeGeo, whiteFuselageMat);
  tailConeMesh.position.set(0, 0.25, -9.8);
  tailConeMesh.castShadow = true;
  fuselage.add(tailConeMesh);

  // APU Exhaust
  const apuGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.4, 16);
  apuGeo.rotateX(Math.PI / 2);
  const apuMesh = new THREE.Mesh(apuGeo, carbonBrakeMat);
  apuMesh.position.set(0, 0.25, -12.95);
  fuselage.add(apuMesh);

  // Swept Pure White Vertical Stabilizer (Tail Fin)
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(-4.2, 0);
  finShape.lineTo(-2.2, 4.8);
  finShape.lineTo(-1.0, 4.8);
  finShape.closePath();

  const finExtrude = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.24,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.05,
    bevelThickness: 0.05,
  });
  finExtrude.rotateY(Math.PI / 2);
  const finMesh = new THREE.Mesh(finExtrude, whiteTailFinMat);
  finMesh.position.set(0.12, 1.1, -9.5);
  finMesh.castShadow = true;
  fuselage.add(finMesh);

  // Swept Horizontal Stabilizers
  const horizShape = new THREE.Shape();
  horizShape.moveTo(0, 0);
  horizShape.lineTo(4.8, -2.1);
  horizShape.lineTo(4.4, -3.2);
  horizShape.lineTo(0, -2.2);
  horizShape.closePath();
  const horizExtrude = new THREE.ExtrudeGeometry(horizShape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelSize: 0.04,
    bevelThickness: 0.04,
  });
  horizExtrude.rotateX(Math.PI / 2);

  const horizLeft = new THREE.Mesh(horizExtrude, whiteWingMat);
  horizLeft.position.set(0, 0.45, -10.2);
  horizLeft.rotation.z = 0.08;
  fuselage.add(horizLeft);

  const horizRight = horizLeft.clone();
  horizRight.scale.set(-1, 1, 1);
  horizRight.rotation.z = -0.08;
  fuselage.add(horizRight);

  root.add(fuselage);

  // ==========================================
  // 2. RADOME & AVIONICS BAY (Nose)
  // ==========================================
  const radomeAvionics = new THREE.Group();
  radomeAvionics.name = 'RadomeAvionicsGroup';

  const noseConeGeo = new THREE.SphereGeometry(1.25, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  noseConeGeo.rotateX(Math.PI / 2);
  const noseMesh = new THREE.Mesh(noseConeGeo, whiteFuselageMat);
  noseMesh.position.set(0, 0, 6.75);
  noseMesh.scale.set(1, 0.92, 1.7);
  noseMesh.castShadow = true;
  radomeAvionics.add(noseMesh);

  // Pitot Probes
  const pitotGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8);
  pitotGeo.rotateX(Math.PI / 2);
  const pitotLeft = new THREE.Mesh(pitotGeo, leadingEdgeMat);
  pitotLeft.position.set(-1.1, 0.1, 7.2);
  const pitotRight = pitotLeft.clone();
  pitotRight.position.set(1.1, 0.1, 7.2);
  radomeAvionics.add(pitotLeft);
  radomeAvionics.add(pitotRight);

  // Internal Radar Dish
  const radarDishGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.18, 32);
  radarDishGeo.rotateX(Math.PI / 2);
  const radarDish = new THREE.Mesh(radarDishGeo, goldAvionicsMat);
  radarDish.position.set(0, 0.05, 6.9);
  radomeAvionics.add(radarDish);

  // Avionics Computers
  const rackGeo = new THREE.BoxGeometry(0.45, 0.38, 0.85);
  const rackLeft = new THREE.Mesh(rackGeo, goldAvionicsMat);
  rackLeft.position.set(-0.45, -0.15, 5.8);
  const rackRight = new THREE.Mesh(rackGeo, goldAvionicsMat);
  rackRight.position.set(0.45, -0.15, 5.8);
  radomeAvionics.add(rackLeft);
  radomeAvionics.add(rackRight);

  root.add(radomeAvionics);

  // ==========================================
  // 3. PURE WHITE SWEPT WINGS & FLAP TRACK CANOES
  // ==========================================
  const createWing = (isRight: boolean) => {
    const wingGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    // Supercritical Cambered Main Wing in Pure White
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(11.2 * sign, -4.8);
    wingShape.lineTo(10.8 * sign, -6.4);
    wingShape.lineTo(0, -4.2);
    wingShape.closePath();

    const wingExtrude = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.32,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.09,
      bevelThickness: 0.09,
    });
    wingExtrude.rotateX(Math.PI / 2);

    const wingMesh = new THREE.Mesh(wingExtrude, whiteWingMat);
    wingMesh.castShadow = true;
    wingMesh.receiveShadow = true;
    wingGroup.add(wingMesh);

    // Chrome Polished Leading Edge Slats
    const edgeShape = new THREE.Shape();
    edgeShape.moveTo(0, 0);
    edgeShape.lineTo(11.2 * sign, -4.8);
    edgeShape.lineTo(11.2 * sign, -5.1);
    edgeShape.lineTo(0, -0.5);
    edgeShape.closePath();
    const edgeExtrude = new THREE.ExtrudeGeometry(edgeShape, { depth: 0.36, bevelEnabled: false });
    edgeExtrude.rotateX(Math.PI / 2);
    const edgeMesh = new THREE.Mesh(edgeExtrude, leadingEdgeMat);
    wingGroup.add(edgeMesh);

    // White Flap Track Fairings ("Canoes")
    const canoeOffsets = [3.2, 5.5, 7.8];
    canoeOffsets.forEach((dist) => {
      const canoeGeo = new THREE.ConeGeometry(0.16, 1.8, 16);
      canoeGeo.rotateX(Math.PI / 2);
      const canoeMesh = new THREE.Mesh(canoeGeo, whiteWingMat);
      canoeMesh.scale.set(1, 0.65, 1);
      const backOffset = -2.2 - (dist / 11.2) * 2.6;
      canoeMesh.position.set(dist * sign, -0.32, backOffset);
      wingGroup.add(canoeMesh);
    });

    // White Blended Winglet
    const wingletShape = new THREE.Shape();
    wingletShape.moveTo(0, 0);
    wingletShape.lineTo(0.35 * sign, 2.1);
    wingletShape.lineTo(-0.75 * sign, 1.7);
    wingletShape.lineTo(-0.85 * sign, 0);
    wingletShape.closePath();
    const wingletExtrude = new THREE.ExtrudeGeometry(wingletShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    wingletExtrude.rotateY(Math.PI / 2);
    const wingletMesh = new THREE.Mesh(wingletExtrude, whiteWingMat);
    wingletMesh.position.set(11.2 * sign, 0.15, -4.9);
    wingGroup.add(wingletMesh);

    // Navigation Lights
    const navLightColor = isRight ? 0x10b981 : 0xef4444;
    const navLight = new THREE.PointLight(navLightColor, 3.5, 10);
    navLight.position.set(11.3 * sign, 0.25, -4.9);
    wingGroup.add(navLight);
    navLights.push(navLight);

    const bulbMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 12),
      new THREE.MeshBasicMaterial({ color: navLightColor })
    );
    bulbMesh.position.copy(navLight.position);
    wingGroup.add(bulbMesh);

    // Wing Landing Light Beam
    const wingSpot = new THREE.SpotLight(0xfffbeb, 2.5, 30, Math.PI / 6, 0.3, 1);
    wingSpot.position.set(3.8 * sign, -0.2, 0.5);
    wingSpot.target.position.set(3.8 * sign, -4.0, 15);
    wingGroup.add(wingSpot);
    wingGroup.add(wingSpot.target);
    landingLights.push(wingSpot);

    wingGroup.position.set(0, -0.2, 1.2);
    wingGroup.rotation.z = isRight ? -0.065 : 0.065;
    return wingGroup;
  };

  const wingLeft = createWing(false);
  const wingRight = createWing(true);
  wingLeft.name = 'WingLeftGroup';
  wingRight.name = 'WingRightGroup';
  root.add(wingLeft);
  root.add(wingRight);

  // ==========================================
  // 4. TRAILING EDGE FLAPS & AILERONS
  // ==========================================
  const createFlap = (isRight: boolean) => {
    const flapGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;
    const flapGeo = new THREE.BoxGeometry(4.5, 0.16, 0.9);
    const flapMesh = new THREE.Mesh(flapGeo, leadingEdgeMat);
    flapMesh.castShadow = true;
    flapGroup.add(flapMesh);
    flapGroup.position.set(3.8 * sign, -0.32, -2.4);
    flapGroup.rotation.y = isRight ? -0.38 : 0.38;
    return flapGroup;
  };

  const flapsLeft = createFlap(false);
  const flapsRight = createFlap(true);
  flapsLeft.name = 'FlapsLeftGroup';
  flapsRight.name = 'FlapsRightGroup';
  root.add(flapsLeft);
  root.add(flapsRight);

  const createAileron = (isRight: boolean) => {
    const aileronGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;
    const aileronGeo = new THREE.BoxGeometry(3.5, 0.14, 0.65);
    const aileronMesh = new THREE.Mesh(aileronGeo, whiteWingMat);
    aileronMesh.castShadow = true;
    aileronGroup.add(aileronMesh);
    aileronGroup.position.set(8.8 * sign, 0.12, -4.6);
    aileronGroup.rotation.y = isRight ? -0.4 : 0.4;
    return aileronGroup;
  };

  const aileronLeft = createAileron(false);
  const aileronRight = createAileron(true);
  aileronLeft.name = 'AileronLeftGroup';
  aileronRight.name = 'AileronRightGroup';
  root.add(aileronLeft);
  root.add(aileronRight);

  // ==========================================
  // 5. PURE WHITE TURBOFAN ENGINES
  // ==========================================
  const createEngine = (isRight: boolean) => {
    const engineGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    // White Pylon Mount
    const pylonGeo = new THREE.BoxGeometry(0.32, 0.9, 2.8);
    const pylonMesh = new THREE.Mesh(pylonGeo, whiteWingMat);
    pylonMesh.position.set(0, 0.75, 0.2);
    engineGroup.add(pylonMesh);

    // Pure White Nacelle Barrel
    const nacelleGeo = new THREE.CylinderGeometry(1.05, 0.98, 3.4, 40, 1, true);
    nacelleGeo.rotateX(Math.PI / 2);
    const nacelleMesh = new THREE.Mesh(nacelleGeo, whiteWingMat);
    nacelleMesh.castShadow = true;
    nacelleMesh.receiveShadow = true;
    engineGroup.add(nacelleMesh);

    // Mirror-Chrome Intake Lip
    const lipGeo = new THREE.TorusGeometry(1.05, 0.1, 20, 40);
    const lipMesh = new THREE.Mesh(lipGeo, leadingEdgeMat);
    lipMesh.position.set(0, 0, 1.7);
    engineGroup.add(lipMesh);

    // Nacelle Vortex Strake (Chine)
    const chineGeo = new THREE.BoxGeometry(0.04, 0.35, 0.8);
    const chineMesh = new THREE.Mesh(chineGeo, leadingEdgeMat);
    chineMesh.position.set(-0.95 * sign, 0.1, 0.6);
    chineMesh.rotation.z = -0.3 * sign;
    engineGroup.add(chineMesh);

    // Center Spinner Cone with White Spiral
    const spinnerGeo = new THREE.ConeGeometry(0.38, 1.3, 32);
    spinnerGeo.rotateX(Math.PI / 2);
    const spinnerMesh = new THREE.Mesh(spinnerGeo, spinnerMat);
    spinnerMesh.position.set(0, 0, 1.3);
    engineGroup.add(spinnerMesh);
    spinners.push(spinnerMesh);

    // Titanium Fan Blades
    const fanGroup = new THREE.Group();
    fanGroup.position.set(0, 0, 1.05);
    const bladeCount = 24;
    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2;
      const bladeGeo = new THREE.BoxGeometry(0.09, 0.62, 0.025);
      const bladeMesh = new THREE.Mesh(bladeGeo, fanBladeMat);
      bladeMesh.position.set(Math.cos(angle) * 0.62, Math.sin(angle) * 0.62, 0);
      bladeMesh.rotation.z = angle + 0.35;
      bladeMesh.rotation.y = 0.45;
      fanGroup.add(bladeMesh);
    }
    engineGroup.add(fanGroup);
    fanBlades.push(fanGroup as unknown as THREE.Mesh);

    // Exhaust Nozzle & Core Spike
    const exhaustGeo = new THREE.CylinderGeometry(0.78, 0.62, 1.1, 32, 1, true);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaustMesh = new THREE.Mesh(exhaustGeo, carbonBrakeMat);
    exhaustMesh.position.set(0, 0, -1.9);
    engineGroup.add(exhaustMesh);

    const exhaustSpike = new THREE.ConeGeometry(0.28, 1.0, 20);
    exhaustSpike.rotateX(-Math.PI / 2);
    const spikeMesh = new THREE.Mesh(exhaustSpike, leadingEdgeMat);
    spikeMesh.position.set(0, 0, -2.25);
    engineGroup.add(spikeMesh);

    engineGroup.position.set(4.4 * sign, -0.95, 1.3);
    return engineGroup;
  };

  const engineLeft = createEngine(false);
  const engineRight = createEngine(true);
  engineLeft.name = 'EngineLeftGroup';
  engineRight.name = 'EngineRightGroup';
  root.add(engineLeft);
  root.add(engineRight);

  // ==========================================
  // 6. LANDING GEAR & BRAKES
  // ==========================================
  const gearNose = new THREE.Group();
  gearNose.name = 'GearNoseGroup';

  const noseStrutGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.9, 16);
  const noseStrut = new THREE.Mesh(noseStrutGeo, hydraulicPistonMat);
  gearNose.add(noseStrut);

  const scissorGeo = new THREE.BoxGeometry(0.05, 0.4, 0.1);
  const scissor = new THREE.Mesh(scissorGeo, leadingEdgeMat);
  scissor.position.set(0, -0.4, 0.12);
  gearNose.add(scissor);

  const noseWheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 24);
  noseWheelGeo.rotateZ(Math.PI / 2);
  const noseWheel1 = new THREE.Mesh(noseWheelGeo, tireMat);
  noseWheel1.position.set(0.18, -0.95, 0);
  const noseWheel2 = noseWheel1.clone();
  noseWheel2.position.set(-0.18, -0.95, 0);
  gearNose.add(noseWheel1);
  gearNose.add(noseWheel2);

  const noseTaxiLight = new THREE.SpotLight(0xfffbeb, 3.8, 35, Math.PI / 7, 0.3, 1);
  noseTaxiLight.position.set(0, -0.5, 0.2);
  noseTaxiLight.target.position.set(0, -3.2, 18);
  gearNose.add(noseTaxiLight);
  gearNose.add(noseTaxiLight.target);
  landingLights.push(noseTaxiLight);

  gearNose.position.set(0, -1.45, 4.8);
  root.add(gearNose);

  const createMainGear = (isRight: boolean) => {
    const gearGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    const strutGeo = new THREE.CylinderGeometry(0.14, 0.14, 2.4, 20);
    const strutMesh = new THREE.Mesh(strutGeo, hydraulicPistonMat);
    gearGroup.add(strutMesh);

    const linkGeo = new THREE.BoxGeometry(0.07, 0.55, 0.14);
    const linkMesh = new THREE.Mesh(linkGeo, leadingEdgeMat);
    linkMesh.position.set(0, -0.35, 0.16);
    linkMesh.rotation.x = 0.5;
    gearGroup.add(linkMesh);

    const tubeLineGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.8, 8);
    const tubeLine = new THREE.Mesh(tubeLineGeo, leadingEdgeMat);
    tubeLine.position.set(0.08, -0.3, -0.1);
    gearGroup.add(tubeLine);

    const axleGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.9, 16);
    axleGeo.rotateZ(Math.PI / 2);
    const axleMesh = new THREE.Mesh(axleGeo, hydraulicPistonMat);
    axleMesh.position.set(0, -1.2, 0);
    gearGroup.add(axleMesh);

    gearGroup.position.set(2.5 * sign, -1.55, -0.4);
    return gearGroup;
  };

  const gearMainLeft = createMainGear(false);
  const gearMainRight = createMainGear(true);
  gearMainLeft.name = 'GearMainLeftGroup';
  gearMainRight.name = 'GearMainRightGroup';
  root.add(gearMainLeft);
  root.add(gearMainRight);

  const createWheelAndBrake = (isRight: boolean) => {
    const wheelGroup = new THREE.Group();
    const brakeGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.32, 28);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMesh1 = new THREE.Mesh(wheelGeo, tireMat);
    wheelMesh1.position.set(0.26, 0, 0);
    wheelMesh1.castShadow = true;
    const wheelMesh2 = wheelMesh1.clone();
    wheelMesh2.position.set(-0.26, 0, 0);
    wheelGroup.add(wheelMesh1);
    wheelGroup.add(wheelMesh2);

    const rimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.34, 24);
    rimGeo.rotateZ(Math.PI / 2);
    const rim1 = new THREE.Mesh(rimGeo, leadingEdgeMat);
    rim1.position.set(0.26, 0, 0);
    const rim2 = rim1.clone();
    rim2.position.set(-0.26, 0, 0);
    wheelGroup.add(rim1);
    wheelGroup.add(rim2);

    const brakeGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 24);
    brakeGeo.rotateZ(Math.PI / 2);
    const brakeMesh = new THREE.Mesh(brakeGeo, carbonBrakeMat);
    brakeGroup.add(brakeMesh);

    const caliperGeo = new THREE.BoxGeometry(0.18, 0.3, 0.25);
    const caliperMesh = new THREE.Mesh(caliperGeo, goldAvionicsMat);
    caliperMesh.position.set(0, 0.25, 0);
    brakeGroup.add(caliperMesh);

    wheelGroup.position.set(2.5 * sign, -2.75, -0.4);
    brakeGroup.position.set(2.5 * sign, -2.75, -0.4);

    return { wheelGroup, brakeGroup };
  };

  const leftWheelBrake = createWheelAndBrake(false);
  const rightWheelBrake = createWheelAndBrake(true);

  const wheelLeft = leftWheelBrake.wheelGroup;
  const wheelRight = rightWheelBrake.wheelGroup;
  const brakeLeft = leftWheelBrake.brakeGroup;
  const brakeRight = rightWheelBrake.brakeGroup;

  wheelLeft.name = 'WheelLeftGroup';
  wheelRight.name = 'WheelRightGroup';
  brakeLeft.name = 'BrakeLeftGroup';
  brakeRight.name = 'BrakeRightGroup';

  root.add(wheelLeft);
  root.add(wheelRight);
  root.add(brakeLeft);
  root.add(brakeRight);

  // ==========================================
  // 7. HYDRAULIC POWER UNIT & FUEL BOOST PUMP
  // ==========================================
  const hydraulics = new THREE.Group();
  hydraulics.name = 'HydraulicsGroup';
  const cylinderGeo = new THREE.CylinderGeometry(0.16, 0.16, 1.5, 16);
  cylinderGeo.rotateZ(Math.PI / 2);
  const cylinderMesh = new THREE.Mesh(cylinderGeo, hydraulicPistonMat);
  const valveGeo = new THREE.BoxGeometry(0.45, 0.35, 0.35);
  const valveMesh = new THREE.Mesh(valveGeo, leadingEdgeMat);
  valveMesh.position.set(0, 0.22, 0);
  hydraulics.add(cylinderMesh);
  hydraulics.add(valveMesh);
  hydraulics.position.set(0.85, 0.2, -1.8);
  root.add(hydraulics);

  const fuelSystem = new THREE.Group();
  fuelSystem.name = 'FuelSystemGroup';
  const pumpGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.65, 24);
  const pumpMesh = new THREE.Mesh(pumpGeo, leadingEdgeMat);
  const flangeGeo = new THREE.TorusGeometry(0.42, 0.06, 12, 28);
  flangeGeo.rotateX(Math.PI / 2);
  const flangeMesh = new THREE.Mesh(flangeGeo, leadingEdgeMat);
  fuelSystem.add(pumpMesh);
  fuelSystem.add(flangeMesh);
  fuelSystem.position.set(0, -0.65, 0.2);
  root.add(fuelSystem);

  return {
    root,
    fuselage,
    radomeAvionics,
    wingLeft,
    wingRight,
    engineLeft,
    engineRight,
    flapsLeft,
    flapsRight,
    aileronLeft,
    aileronRight,
    gearNose,
    gearMainLeft,
    gearMainRight,
    brakeLeft,
    brakeRight,
    wheelLeft,
    wheelRight,
    hydraulics,
    fuelSystem,
    fanBlades,
    spinners,
    navLights,
    landingLights,
  };
}
