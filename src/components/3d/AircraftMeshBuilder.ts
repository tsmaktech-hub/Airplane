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
 * Creates high-resolution procedural canvas textures for real commercial airliner details:
 * - Fuselage passenger windows with cabin glow, passenger doors, emergency escape lines
 * - Cockpit windshield frames, registration "N737-AC", airline livery stripes & stencils
 * - Engine spinner spiral cone pattern
 * - Tail fin AeroCore logo
 */
function createFuselageTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Base Aircraft Skin - Deep aeronautical obsidian / metallic titanium
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, '#1c222c');
  grad.addColorStop(0.3, '#2a3240');
  grad.addColorStop(0.5, '#222935');
  grad.addColorStop(0.8, '#181d26');
  grad.addColorStop(1, '#11141a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 1024);

  // 2. Subtle Rivet & Panel Seams
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let x = 120; x < 1900; x += 110) {
    ctx.beginPath();
    ctx.moveTo(x, 150);
    ctx.lineTo(x, 874);
    ctx.stroke();
  }
  for (let y = 250; y < 800; y += 120) {
    ctx.beginPath();
    ctx.moveTo(100, y);
    ctx.lineTo(1950, y);
    ctx.stroke();
  }

  // 3. Airline Livery Accent Waves (Cyan and Polished Silver Speedlines)
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(80, 520);
  ctx.bezierCurveTo(400, 520, 1200, 480, 2048, 430);
  ctx.lineTo(2048, 470);
  ctx.bezierCurveTo(1200, 520, 400, 550, 80, 550);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(80, 550);
  ctx.bezierCurveTo(400, 550, 1200, 510, 2048, 470);
  ctx.lineTo(2048, 490);
  ctx.bezierCurveTo(1200, 530, 400, 565, 80, 565);
  ctx.closePath();
  ctx.fill();

  // 4. Passenger Windows with Warm Cabin Interior Glow
  const drawWindowRow = (startY: number) => {
    for (let i = 0; i < 34; i++) {
      const wx = 380 + i * 42;
      // Skip over wing door gap
      if (i >= 15 && i <= 17) continue;

      // Chrome window bezel
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(wx - 1, startY - 1, 18, 26, 6);
      ctx.fill();

      // Window Glass with ambient cabin light
      const winGrad = ctx.createLinearGradient(wx, startY, wx, startY + 24);
      winGrad.addColorStop(0, '#0f172a');
      winGrad.addColorStop(0.4, '#1e293b');
      winGrad.addColorStop(0.85, '#38bdf8');
      winGrad.addColorStop(1, '#7dd3fc');
      ctx.fillStyle = winGrad;
      ctx.beginPath();
      ctx.roundRect(wx, startY, 16, 24, 5);
      ctx.fill();

      // Window divider shade reflection
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wx + 4, startY + 3);
      ctx.lineTo(wx + 12, startY + 12);
      ctx.stroke();
    }
  };

  // Port and Starboard window rows on texture map
  drawWindowRow(410);
  drawWindowRow(610);

  // 5. Commercial Passenger Doors (Door 1L, Overwing Exit, Aft Door)
  const drawDoor = (dx: number, dy: number, w: number, h: number, label: string) => {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(dx, dy, w, h);

    // Inner door window
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.roundRect(dx + w / 2 - 6, dy + 20, 12, 18, 4);
    ctx.fill();

    // Door latch handle
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(dx + 8, dy + h / 2, 10, 4);

    // Warning text
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#facc15';
    ctx.fillText(label, dx - 4, dy + h + 14);
  };

  drawDoor(280, 370, 42, 95, 'DOOR 1L');
  drawDoor(980, 390, 36, 75, 'EMERGENCY EXIT');
  drawDoor(1720, 370, 42, 95, 'DOOR 2L');

  // Opposite side doors
  drawDoor(280, 580, 42, 95, 'DOOR 1R');
  drawDoor(980, 580, 36, 75, 'EMERGENCY EXIT');
  drawDoor(1720, 580, 42, 95, 'DOOR 2R');

  // 6. Bold Aerospace Branding: "AEROCORE TECHNOLOGIES"
  ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.letterSpacing = '4px';
  ctx.fillText('AEROCORE TECHNOLOGIES', 380, 360);
  ctx.fillText('AEROCORE TECHNOLOGIES', 380, 725);

  ctx.font = '500 13px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('COMMERCIAL ROTABLE FLEET · CFM LEAP POWERED', 385, 385);
  ctx.fillText('COMMERCIAL ROTABLE FLEET · CFM LEAP POWERED', 385, 750);

  // 7. Aircraft Tail Registration
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('N737-AC', 1650, 340);
  ctx.fillText('N737-AC', 1650, 745);

  // 8. Technical Stencils (Pitot Port, Danger, No Step)
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('STATIC PORT - DO NOT PLUG', 180, 490);
  ctx.fillText('STATIC PORT - DO NOT PLUG', 180, 570);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('CUT HERE IN EMERGENCY', 1250, 350);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates the engine turbofan spinner cone spiral texture
 * (Iconic white spiral painted on jet engine spinners)
 */
function createSpinnerSpiralTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Shiny black cone background
  ctx.fillStyle = '#111418';
  ctx.fillRect(0, 0, 512, 512);

  // Archimedean Spiral in crisp white
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 22;
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
 * Creates Tail Fin Logo Texture
 */
function createTailFinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep navy to black vertical fin gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.5, '#0284c7');
  grad.addColorStop(1, '#0369a1');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // AeroCore Chevron Wings Logo
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(256, 120);
  ctx.lineTo(390, 330);
  ctx.lineTo(320, 330);
  ctx.lineTo(256, 220);
  ctx.lineTo(192, 330);
  ctx.lineTo(122, 330);
  ctx.closePath();
  ctx.fill();

  // Cyan glowing inner accent
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(256, 240);
  ctx.lineTo(300, 320);
  ctx.lineTo(212, 320);
  ctx.closePath();
  ctx.fill();

  ctx.font = 'bold 24px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('AEROCORE', 256, 400);

  return new THREE.CanvasTexture(canvas);
}

export function buildAeroAircraft(): AircraftMeshGroups {
  const root = new THREE.Group();
  root.name = 'AircraftRoot';

  // Load / Generate High-Fidelity Textures
  const fuselageTexture = createFuselageTexture();
  const spinnerTexture = createSpinnerSpiralTexture();
  const tailTexture = createTailFinTexture();

  // --- High-Grade PBR Materials for Real Jetliner ---
  const fuselageMat = new THREE.MeshStandardMaterial({
    map: fuselageTexture,
    metalness: 0.72,
    roughness: 0.28,
    envMapIntensity: 1.5,
  });

  const leadingEdgeMat = new THREE.MeshStandardMaterial({
    color: 0xd4dbe4,
    metalness: 0.95,
    roughness: 0.12,
    envMapIntensity: 1.8,
  });

  const tailFinMat = new THREE.MeshStandardMaterial({
    map: tailTexture,
    metalness: 0.65,
    roughness: 0.32,
  });

  const carbonBrakeMat = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    metalness: 0.35,
    roughness: 0.65,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x141518,
    metalness: 0.08,
    roughness: 0.9,
  });

  const cockpitGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.92,
    roughness: 0.06,
    transparent: true,
    opacity: 0.88,
  });

  const goldAvionicsMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.88,
    roughness: 0.25,
  });

  const hydraulicPistonMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.98,
    roughness: 0.08,
  });

  const fanBladeMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.92,
    roughness: 0.18,
  });

  const spinnerMat = new THREE.MeshStandardMaterial({
    map: spinnerTexture,
    metalness: 0.7,
    roughness: 0.25,
  });

  const fanBlades: THREE.Mesh[] = [];
  const spinners: THREE.Mesh[] = [];
  const navLights: THREE.PointLight[] = [];
  const landingLights: THREE.SpotLight[] = [];

  // ==========================================
  // 1. FUSELAGE & EMPENNAGE
  // ==========================================
  const fuselage = new THREE.Group();
  fuselage.name = 'FuselageGroup';

  // Main Aerodynamic Fuselage Tube
  const tubeGeo = new THREE.CylinderGeometry(1.25, 1.25, 13.5, 48, 1, false);
  tubeGeo.rotateX(Math.PI / 2);
  const tubeMesh = new THREE.Mesh(tubeGeo, fuselageMat);
  tubeMesh.castShadow = true;
  tubeMesh.receiveShadow = true;
  fuselage.add(tubeMesh);

  // Cockpit Windshield Visor & Anti-Glare Nose Patch
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

  // Top SATCOM Radome Fairing (Broadband satellite hump on fuselage crown)
  const satcomGeo = new THREE.SphereGeometry(0.45, 24, 16);
  satcomGeo.scale(0.8, 0.35, 2.8);
  const satcomMesh = new THREE.Mesh(satcomGeo, leadingEdgeMat);
  satcomMesh.position.set(0, 1.35, 0.5);
  fuselage.add(satcomMesh);

  // VHF/UHF Blade Antennas
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

  // Tail Cone tapering towards APU
  const tailConeGeo = new THREE.ConeGeometry(1.25, 6.2, 40);
  tailConeGeo.rotateX(-Math.PI / 2);
  const tailConeMesh = new THREE.Mesh(tailConeGeo, fuselageMat);
  tailConeMesh.position.set(0, 0.25, -9.8);
  tailConeMesh.castShadow = true;
  fuselage.add(tailConeMesh);

  // APU (Auxiliary Power Unit) Exhaust Nozzle at the extreme tail tip
  const apuGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.4, 16);
  apuGeo.rotateX(Math.PI / 2);
  const apuMesh = new THREE.Mesh(apuGeo, carbonBrakeMat);
  apuMesh.position.set(0, 0.25, -12.95);
  fuselage.add(apuMesh);

  // Swept Vertical Stabilizer (Tail Fin)
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
  const finMesh = new THREE.Mesh(finExtrude, tailFinMat);
  finMesh.position.set(0.12, 1.1, -9.5);
  finMesh.castShadow = true;
  fuselage.add(finMesh);

  // Swept Horizontal Stabilizers (Tailplanes)
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

  const horizLeft = new THREE.Mesh(horizExtrude, leadingEdgeMat);
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

  // Aerodynamic Nose Radome Shell
  const noseConeGeo = new THREE.SphereGeometry(1.25, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  noseConeGeo.rotateX(Math.PI / 2);
  const noseMesh = new THREE.Mesh(noseConeGeo, fuselageMat);
  noseMesh.position.set(0, 0, 6.75);
  noseMesh.scale.set(1, 0.92, 1.7);
  noseMesh.castShadow = true;
  radomeAvionics.add(noseMesh);

  // Pitot Probes on Radome Side
  const pitotGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8);
  pitotGeo.rotateX(Math.PI / 2);
  const pitotLeft = new THREE.Mesh(pitotGeo, leadingEdgeMat);
  pitotLeft.position.set(-1.1, 0.1, 7.2);
  const pitotRight = pitotLeft.clone();
  pitotRight.position.set(1.1, 0.1, 7.2);
  radomeAvionics.add(pitotLeft);
  radomeAvionics.add(pitotRight);

  // Internal Phased-Array Weather Radar Scanner
  const radarDishGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.18, 32);
  radarDishGeo.rotateX(Math.PI / 2);
  const radarDish = new THREE.Mesh(radarDishGeo, goldAvionicsMat);
  radarDish.position.set(0, 0.05, 6.9);
  radomeAvionics.add(radarDish);

  // Modular Avionics Computer Bins (ARINC 600)
  const rackGeo = new THREE.BoxGeometry(0.45, 0.38, 0.85);
  const rackLeft = new THREE.Mesh(rackGeo, goldAvionicsMat);
  rackLeft.position.set(-0.45, -0.15, 5.8);
  const rackRight = new THREE.Mesh(rackGeo, goldAvionicsMat);
  rackRight.position.set(0.45, -0.15, 5.8);
  radomeAvionics.add(rackLeft);
  radomeAvionics.add(rackRight);

  root.add(radomeAvionics);

  // ==========================================
  // 3. SWEPT WINGS & FLAP TRACK CANOES
  // ==========================================
  const createWing = (isRight: boolean) => {
    const wingGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    // Supercritical Cambered Main Wing
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

    const wingMesh = new THREE.Mesh(wingExtrude, fuselageMat);
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

    // Flap Track Fairings ("Canoes" under wing - standard on modern airliners!)
    const canoeOffsets = [3.2, 5.5, 7.8];
    canoeOffsets.forEach((dist) => {
      const canoeGeo = new THREE.ConeGeometry(0.16, 1.8, 16);
      canoeGeo.rotateX(Math.PI / 2);
      const canoeMesh = new THREE.Mesh(canoeGeo, leadingEdgeMat);
      canoeMesh.scale.set(1, 0.65, 1);
      const backOffset = -2.2 - (dist / 11.2) * 2.6;
      canoeMesh.position.set(dist * sign, -0.32, backOffset);
      wingGroup.add(canoeMesh);
    });

    // Blended Winglet / Sharklet
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
    const wingletMesh = new THREE.Mesh(wingletExtrude, tailFinMat);
    wingletMesh.position.set(11.2 * sign, 0.15, -4.9);
    wingGroup.add(wingletMesh);

    // Navigation Wingtip Light (Green = Starboard/Right, Red = Port/Left)
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

    // Wing Landing Light Beam (illuminates runway!)
    const wingSpot = new THREE.SpotLight(0xfffbeb, 2.5, 30, Math.PI / 6, 0.3, 1);
    wingSpot.position.set(3.8 * sign, -0.2, 0.5);
    wingSpot.target.position.set(3.8 * sign, -4.0, 15);
    wingGroup.add(wingSpot);
    wingGroup.add(wingSpot.target);
    landingLights.push(wingSpot);

    wingGroup.position.set(0, -0.2, 1.2);
    wingGroup.rotation.z = isRight ? -0.065 : 0.065; // realistic dihedral angle
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
    const aileronMesh = new THREE.Mesh(aileronGeo, fuselageMat);
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
  // 5. CFM LEAP HIGH-BYPASS TURBOFAN ENGINES
  // ==========================================
  const createEngine = (isRight: boolean) => {
    const engineGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    // Aerodynamic Engine Pylon Mount
    const pylonGeo = new THREE.BoxGeometry(0.32, 0.9, 2.8);
    const pylonMesh = new THREE.Mesh(pylonGeo, fuselageMat);
    pylonMesh.position.set(0, 0.75, 0.2);
    engineGroup.add(pylonMesh);

    // Nacelle Cowling Outer Barrel
    const nacelleGeo = new THREE.CylinderGeometry(1.05, 0.98, 3.4, 40, 1, true);
    nacelleGeo.rotateX(Math.PI / 2);
    const nacelleMesh = new THREE.Mesh(nacelleGeo, fuselageMat);
    nacelleMesh.castShadow = true;
    nacelleMesh.receiveShadow = true;
    engineGroup.add(nacelleMesh);

    // Polished Mirror Chrome Intake Lip
    const lipGeo = new THREE.TorusGeometry(1.05, 0.1, 20, 40);
    const lipMesh = new THREE.Mesh(lipGeo, leadingEdgeMat);
    lipMesh.position.set(0, 0, 1.7);
    engineGroup.add(lipMesh);

    // Nacelle Vortex Strake (Chine) on inboard side
    const chineGeo = new THREE.BoxGeometry(0.04, 0.35, 0.8);
    const chineMesh = new THREE.Mesh(chineGeo, leadingEdgeMat);
    chineMesh.position.set(-0.95 * sign, 0.1, 0.6);
    chineMesh.rotation.z = -0.3 * sign;
    engineGroup.add(chineMesh);

    // Center Turbofan Spinner with Iconic White Painted Spiral
    const spinnerGeo = new THREE.ConeGeometry(0.38, 1.3, 32);
    spinnerGeo.rotateX(Math.PI / 2);
    const spinnerMesh = new THREE.Mesh(spinnerGeo, spinnerMat);
    spinnerMesh.position.set(0, 0, 1.3);
    engineGroup.add(spinnerMesh);
    spinners.push(spinnerMesh);

    // Full Titanium Fan Blades Disk
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

    // Rear Exhaust Nozzle & Center Exhaust Spike
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
  // 6. REALISTIC LANDING GEAR, BRAKES & WHEELS
  // ==========================================
  // Dual-Wheel Nose Gear with Taxi Lights
  const gearNose = new THREE.Group();
  gearNose.name = 'GearNoseGroup';

  const noseStrutGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.9, 16);
  const noseStrut = new THREE.Mesh(noseStrutGeo, hydraulicPistonMat);
  gearNose.add(noseStrut);

  // Nose Steering Collar & Torque Scissors
  const scissorGeo = new THREE.BoxGeometry(0.05, 0.4, 0.1);
  const scissor = new THREE.Mesh(scissorGeo, leadingEdgeMat);
  scissor.position.set(0, -0.4, 0.12);
  gearNose.add(scissor);

  // Dual Nose Tires with Alloy Hubs
  const noseWheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 24);
  noseWheelGeo.rotateZ(Math.PI / 2);
  const noseWheel1 = new THREE.Mesh(noseWheelGeo, tireMat);
  noseWheel1.position.set(0.18, -0.95, 0);
  const noseWheel2 = noseWheel1.clone();
  noseWheel2.position.set(-0.18, -0.95, 0);
  gearNose.add(noseWheel1);
  gearNose.add(noseWheel2);

  // Nose Gear Taxi/Takeoff Floodlight
  const noseTaxiLight = new THREE.SpotLight(0xfffbeb, 3.8, 35, Math.PI / 7, 0.3, 1);
  noseTaxiLight.position.set(0, -0.5, 0.2);
  noseTaxiLight.target.position.set(0, -3.2, 18);
  gearNose.add(noseTaxiLight);
  gearNose.add(noseTaxiLight.target);
  landingLights.push(noseTaxiLight);

  gearNose.position.set(0, -1.45, 4.8);
  root.add(gearNose);

  // Main Landing Gear (Left & Right)
  const createMainGear = (isRight: boolean) => {
    const gearGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    // Heavy Oleo-Pneumatic Shock Strut
    const strutGeo = new THREE.CylinderGeometry(0.14, 0.14, 2.4, 20);
    const strutMesh = new THREE.Mesh(strutGeo, hydraulicPistonMat);
    gearGroup.add(strutMesh);

    // Torque Scissors Link
    const linkGeo = new THREE.BoxGeometry(0.07, 0.55, 0.14);
    const linkMesh = new THREE.Mesh(linkGeo, leadingEdgeMat);
    linkMesh.position.set(0, -0.35, 0.16);
    linkMesh.rotation.x = 0.5;
    gearGroup.add(linkMesh);

    // Hydraulic Brake Fluid Lines
    const tubeLineGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.8, 8);
    const tubeLine = new THREE.Mesh(tubeLineGeo, leadingEdgeMat);
    tubeLine.position.set(0.08, -0.3, -0.1);
    gearGroup.add(tubeLine);

    // Main Axle
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

  // Separate Wheel Hubs & Brakes for exploded view
  const createWheelAndBrake = (isRight: boolean) => {
    const wheelGroup = new THREE.Group();
    const brakeGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    // Treaded Rubber Tires
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.32, 28);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMesh1 = new THREE.Mesh(wheelGeo, tireMat);
    wheelMesh1.position.set(0.26, 0, 0);
    wheelMesh1.castShadow = true;
    const wheelMesh2 = wheelMesh1.clone();
    wheelMesh2.position.set(-0.26, 0, 0);
    wheelGroup.add(wheelMesh1);
    wheelGroup.add(wheelMesh2);

    // Forged Alloy Wheel Rims
    const rimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.34, 24);
    rimGeo.rotateZ(Math.PI / 2);
    const rim1 = new THREE.Mesh(rimGeo, leadingEdgeMat);
    rim1.position.set(0.26, 0, 0);
    const rim2 = rim1.clone();
    rim2.position.set(-0.26, 0, 0);
    wheelGroup.add(rim1);
    wheelGroup.add(rim2);

    // Carbon-Carbon Multi-Disc Brake Assembly & Caliper
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
