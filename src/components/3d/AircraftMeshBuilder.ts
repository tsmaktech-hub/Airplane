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
  navLights: THREE.PointLight[];
}

export function buildAeroAircraft(): AircraftMeshGroups {
  const root = new THREE.Group();
  root.name = 'AircraftRoot';

  // --- High-Grade PBR Materials ---
  const fuselageMat = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    metalness: 0.65,
    roughness: 0.35,
    envMapIntensity: 1.2,
  });

  const leadingEdgeMat = new THREE.MeshStandardMaterial({
    color: 0xc8d0db,
    metalness: 0.92,
    roughness: 0.18,
  });

  const carbonBrakeMat = new THREE.MeshStandardMaterial({
    color: 0x141619,
    metalness: 0.25,
    roughness: 0.75,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x111215,
    metalness: 0.05,
    roughness: 0.85,
  });

  const cockpitGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    metalness: 0.9,
    roughness: 0.08,
    transparent: true,
    opacity: 0.85,
  });

  const goldAvionicsMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    metalness: 0.85,
    roughness: 0.3,
  });

  const hydraulicPistonMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.1,
  });

  const fanBladeMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.88,
    roughness: 0.22,
  });

  const fanBlades: THREE.Mesh[] = [];
  const navLights: THREE.PointLight[] = [];

  // ==========================================
  // 1. FUSELAGE
  // ==========================================
  const fuselage = new THREE.Group();
  fuselage.name = 'FuselageGroup';

  // Center Main Tube
  const tubeGeo = new THREE.CylinderGeometry(1.2, 1.2, 12, 32, 1, false);
  tubeGeo.rotateX(Math.PI / 2);
  const tubeMesh = new THREE.Mesh(tubeGeo, fuselageMat);
  tubeMesh.castShadow = true;
  tubeMesh.receiveShadow = true;
  fuselage.add(tubeMesh);

  // Cockpit Windshield Visor
  const visorGeo = new THREE.CylinderGeometry(1.205, 1.205, 1.5, 32, 1, false, 0, Math.PI);
  visorGeo.rotateX(Math.PI / 2);
  visorGeo.rotateZ(Math.PI);
  const visorMesh = new THREE.Mesh(visorGeo, cockpitGlassMat);
  visorMesh.position.set(0, 0.25, 4.8);
  fuselage.add(visorMesh);

  // Tail Cone
  const tailConeGeo = new THREE.ConeGeometry(1.2, 5.5, 32);
  tailConeGeo.rotateX(-Math.PI / 2);
  const tailConeMesh = new THREE.Mesh(tailConeGeo, fuselageMat);
  tailConeMesh.position.set(0, 0.2, -8.7);
  tailConeMesh.castShadow = true;
  fuselage.add(tailConeMesh);

  // Vertical Fin (Vertical Stabilizer)
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(-3.5, 0);
  finShape.lineTo(-1.8, 4.2);
  finShape.lineTo(-0.8, 4.2);
  finShape.closePath();

  const finExtrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
  const finGeo = new THREE.ExtrudeGeometry(finShape, finExtrudeSettings);
  finGeo.rotateY(Math.PI / 2);
  const finMesh = new THREE.Mesh(finGeo, fuselageMat);
  finMesh.position.set(0.1, 1.0, -8.5);
  finMesh.castShadow = true;
  fuselage.add(finMesh);

  // Horizontal Stabilizers (Tail Wings)
  const horizShape = new THREE.Shape();
  horizShape.moveTo(0, 0);
  horizShape.lineTo(4.5, -1.8);
  horizShape.lineTo(4.2, -2.8);
  horizShape.lineTo(0, -1.8);
  horizShape.closePath();
  const horizExtrude = new THREE.ExtrudeGeometry(horizShape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04 });
  horizExtrude.rotateX(Math.PI / 2);

  const horizLeft = new THREE.Mesh(horizExtrude, leadingEdgeMat);
  horizLeft.position.set(0, 0.4, -9.2);
  fuselage.add(horizLeft);

  const horizRight = horizLeft.clone();
  horizRight.scale.set(-1, 1, 1);
  fuselage.add(horizRight);

  root.add(fuselage);

  // ==========================================
  // 2. RADOME & AVIONICS BAY (Nose)
  // ==========================================
  const radomeAvionics = new THREE.Group();
  radomeAvionics.name = 'RadomeAvionicsGroup';

  // Nose Dome Shell
  const noseConeGeo = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  noseConeGeo.rotateX(Math.PI / 2);
  const noseMesh = new THREE.Mesh(noseConeGeo, fuselageMat);
  noseMesh.position.set(0, 0, 6.0);
  noseMesh.scale.set(1, 0.9, 1.6);
  noseMesh.castShadow = true;
  radomeAvionics.add(noseMesh);

  // Internal Phased-Array Weather Radar Dish (revealed in exploded view)
  const radarDishGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.15, 24);
  radarDishGeo.rotateX(Math.PI / 2);
  const radarDish = new THREE.Mesh(radarDishGeo, goldAvionicsMat);
  radarDish.position.set(0, 0, 6.2);
  radomeAvionics.add(radarDish);

  // Dual Avionics Rack Computers
  const rackGeo = new THREE.BoxGeometry(0.4, 0.35, 0.8);
  const rackLeft = new THREE.Mesh(rackGeo, goldAvionicsMat);
  rackLeft.position.set(-0.4, -0.2, 5.2);
  const rackRight = new THREE.Mesh(rackGeo, goldAvionicsMat);
  rackRight.position.set(0.4, -0.2, 5.2);
  radomeAvionics.add(rackLeft);
  radomeAvionics.add(rackRight);

  root.add(radomeAvionics);

  // ==========================================
  // 3. WINGS (Left & Right)
  // ==========================================
  const createWing = (isRight: boolean) => {
    const wingGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    // Swept main wing geometry
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(10.5 * sign, -4.5);
    wingShape.lineTo(10.2 * sign, -6.0);
    wingShape.lineTo(0, -3.8);
    wingShape.closePath();

    const wingExtrude = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.28,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    });
    wingExtrude.rotateX(Math.PI / 2);

    const wingMesh = new THREE.Mesh(wingExtrude, fuselageMat);
    wingMesh.castShadow = true;
    wingMesh.receiveShadow = true;
    wingGroup.add(wingMesh);

    // Polished Silver Leading Edge
    const edgeShape = new THREE.Shape();
    edgeShape.moveTo(0, 0);
    edgeShape.lineTo(10.5 * sign, -4.5);
    edgeShape.lineTo(10.5 * sign, -4.8);
    edgeShape.lineTo(0, -0.4);
    edgeShape.closePath();
    const edgeExtrude = new THREE.ExtrudeGeometry(edgeShape, { depth: 0.32, bevelEnabled: false });
    edgeExtrude.rotateX(Math.PI / 2);
    const edgeMesh = new THREE.Mesh(edgeExtrude, leadingEdgeMat);
    wingGroup.add(edgeMesh);

    // Blended Winglet (Sharklet) at wing tip
    const wingletShape = new THREE.Shape();
    wingletShape.moveTo(0, 0);
    wingletShape.lineTo(0.2 * sign, 1.8);
    wingletShape.lineTo(-0.8 * sign, 1.5);
    wingletShape.lineTo(-0.9 * sign, 0);
    wingletShape.closePath();
    const wingletExtrude = new THREE.ExtrudeGeometry(wingletShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
    wingletExtrude.rotateY(Math.PI / 2);
    const wingletMesh = new THREE.Mesh(wingletExtrude, leadingEdgeMat);
    wingletMesh.position.set(10.5 * sign, 0.1, -4.6);
    wingGroup.add(wingletMesh);

    // Navigation Light at wing tip
    const navLightColor = isRight ? 0x10b981 : 0xef4444; // Green (Stbd), Red (Port)
    const navLight = new THREE.PointLight(navLightColor, 3, 8);
    navLight.position.set(10.6 * sign, 0.2, -4.6);
    wingGroup.add(navLight);
    navLights.push(navLight);

    // Small bulb mesh
    const bulbGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const bulbMat = new THREE.MeshBasicMaterial({ color: navLightColor });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.position.copy(navLight.position);
    wingGroup.add(bulbMesh);

    // Set position & slight dihedral upward angle
    wingGroup.position.set(0, -0.2, 1.0);
    wingGroup.rotation.z = isRight ? -0.06 : 0.06;

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
    const flapGeo = new THREE.BoxGeometry(4.2, 0.15, 0.8);
    const flapMesh = new THREE.Mesh(flapGeo, leadingEdgeMat);
    flapMesh.castShadow = true;
    flapGroup.add(flapMesh);
    flapGroup.position.set(3.6 * sign, -0.3, -2.2);
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
    const aileronGeo = new THREE.BoxGeometry(3.2, 0.12, 0.6);
    const aileronMesh = new THREE.Mesh(aileronGeo, fuselageMat);
    aileronMesh.castShadow = true;
    aileronGroup.add(aileronMesh);
    aileronGroup.position.set(8.2 * sign, 0.1, -4.2);
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
  // 5. TURBOFAN ENGINES (Left & Right)
  // ==========================================
  const createEngine = (isRight: boolean) => {
    const engineGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    // Wing Pylon Mount
    const pylonGeo = new THREE.BoxGeometry(0.3, 0.8, 2.4);
    const pylonMesh = new THREE.Mesh(pylonGeo, fuselageMat);
    pylonMesh.position.set(0, 0.7, 0.2);
    engineGroup.add(pylonMesh);

    // Nacelle Cowling (Outer Nacelle)
    const nacelleGeo = new THREE.CylinderGeometry(0.95, 0.9, 3.2, 32, 1, true);
    nacelleGeo.rotateX(Math.PI / 2);
    const nacelleMesh = new THREE.Mesh(nacelleGeo, fuselageMat);
    nacelleMesh.castShadow = true;
    nacelleMesh.receiveShadow = true;
    engineGroup.add(nacelleMesh);

    // Shiny Aluminum Intake Lip
    const lipGeo = new THREE.TorusGeometry(0.95, 0.08, 16, 32);
    const lipMesh = new THREE.Mesh(lipGeo, leadingEdgeMat);
    lipMesh.position.set(0, 0, 1.6);
    engineGroup.add(lipMesh);

    // Turbofan Core Spinner Center Cone
    const spinnerGeo = new THREE.ConeGeometry(0.35, 1.2, 24);
    spinnerGeo.rotateX(Math.PI / 2);
    const spinnerMesh = new THREE.Mesh(spinnerGeo, leadingEdgeMat);
    spinnerMesh.position.set(0, 0, 1.2);
    engineGroup.add(spinnerMesh);

    // Titanium Fan Blades Disk
    const fanGroup = new THREE.Group();
    fanGroup.position.set(0, 0, 1.0);
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const bladeGeo = new THREE.BoxGeometry(0.08, 0.55, 0.02);
      const bladeMesh = new THREE.Mesh(bladeGeo, fanBladeMat);
      bladeMesh.position.set(Math.cos(angle) * 0.55, Math.sin(angle) * 0.55, 0);
      bladeMesh.rotation.z = angle + 0.3;
      bladeMesh.rotation.y = 0.45;
      fanGroup.add(bladeMesh);
    }
    engineGroup.add(fanGroup);
    fanBlades.push(fanGroup as unknown as THREE.Mesh);

    // Exhaust Nozzle
    const exhaustGeo = new THREE.CylinderGeometry(0.7, 0.55, 1.0, 24, 1, true);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaustMesh = new THREE.Mesh(exhaustGeo, leadingEdgeMat);
    exhaustMesh.position.set(0, 0, -1.8);
    engineGroup.add(exhaustMesh);

    // Exhaust Cone Center Spike
    const exhaustSpike = new THREE.ConeGeometry(0.25, 0.9, 16);
    exhaustSpike.rotateX(-Math.PI / 2);
    const spikeMesh = new THREE.Mesh(exhaustSpike, leadingEdgeMat);
    spikeMesh.position.set(0, 0, -2.1);
    engineGroup.add(spikeMesh);

    engineGroup.position.set(4.2 * sign, -0.9, 1.2);
    return engineGroup;
  };

  const engineLeft = createEngine(false);
  const engineRight = createEngine(true);
  engineLeft.name = 'EngineLeftGroup';
  engineRight.name = 'EngineRightGroup';
  root.add(engineLeft);
  root.add(engineRight);

  // ==========================================
  // 6. MAIN & NOSE LANDING GEAR & BRAKES
  // ==========================================
  // Nose Gear
  const gearNose = new THREE.Group();
  gearNose.name = 'GearNoseGroup';
  const noseStrutGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 16);
  const noseStrut = new THREE.Mesh(noseStrutGeo, hydraulicPistonMat);
  gearNose.add(noseStrut);

  const noseWheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 20);
  noseWheelGeo.rotateZ(Math.PI / 2);
  const noseWheel1 = new THREE.Mesh(noseWheelGeo, tireMat);
  noseWheel1.position.set(0.15, -0.9, 0);
  const noseWheel2 = noseWheel1.clone();
  noseWheel2.position.set(-0.15, -0.9, 0);
  gearNose.add(noseWheel1);
  gearNose.add(noseWheel2);
  gearNose.position.set(0, -1.4, 4.5);
  root.add(gearNose);

  // Main Landing Gear (Left & Right)
  const createMainGear = (isRight: boolean) => {
    const gearGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    // Shock Oleo Strut
    const strutGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 16);
    const strutMesh = new THREE.Mesh(strutGeo, hydraulicPistonMat);
    gearGroup.add(strutMesh);

    // Torque Links
    const linkGeo = new THREE.BoxGeometry(0.06, 0.5, 0.12);
    const linkMesh = new THREE.Mesh(linkGeo, leadingEdgeMat);
    linkMesh.position.set(0, -0.3, 0.15);
    linkMesh.rotation.x = 0.5;
    gearGroup.add(linkMesh);

    // Axle
    const axleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16);
    axleGeo.rotateZ(Math.PI / 2);
    const axleMesh = new THREE.Mesh(axleGeo, hydraulicPistonMat);
    axleMesh.position.set(0, -1.1, 0);
    gearGroup.add(axleMesh);

    gearGroup.position.set(2.4 * sign, -1.5, -0.4);
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

    // Dual Main Tires
    const wheelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.28, 24);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMesh1 = new THREE.Mesh(wheelGeo, tireMat);
    wheelMesh1.position.set(0.24, 0, 0);
    wheelMesh1.castShadow = true;
    const wheelMesh2 = wheelMesh1.clone();
    wheelMesh2.position.set(-0.24, 0, 0);
    wheelGroup.add(wheelMesh1);
    wheelGroup.add(wheelMesh2);

    // Metallic Rim Hubs
    const rimGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 20);
    rimGeo.rotateZ(Math.PI / 2);
    const rim1 = new THREE.Mesh(rimGeo, leadingEdgeMat);
    rim1.position.set(0.24, 0, 0);
    const rim2 = rim1.clone();
    rim2.position.set(-0.24, 0, 0);
    wheelGroup.add(rim1);
    wheelGroup.add(rim2);

    // Carbon Disc Brake Assembly
    const brakeGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.18, 20);
    brakeGeo.rotateZ(Math.PI / 2);
    const brakeMesh = new THREE.Mesh(brakeGeo, carbonBrakeMat);
    brakeGroup.add(brakeMesh);

    wheelGroup.position.set(2.4 * sign, -2.6, -0.4);
    brakeGroup.position.set(2.4 * sign, -2.6, -0.4);

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
  const cylinderGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.4, 16);
  cylinderGeo.rotateZ(Math.PI / 2);
  const cylinderMesh = new THREE.Mesh(cylinderGeo, hydraulicPistonMat);
  const valveGeo = new THREE.BoxGeometry(0.4, 0.3, 0.3);
  const valveMesh = new THREE.Mesh(valveGeo, leadingEdgeMat);
  valveMesh.position.set(0, 0.2, 0);
  hydraulics.add(cylinderMesh);
  hydraulics.add(valveMesh);
  hydraulics.position.set(0.8, 0.2, -1.8);
  root.add(hydraulics);

  const fuelSystem = new THREE.Group();
  fuelSystem.name = 'FuelSystemGroup';
  const pumpGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.6, 20);
  const pumpMesh = new THREE.Mesh(pumpGeo, leadingEdgeMat);
  const flangeGeo = new THREE.TorusGeometry(0.38, 0.05, 12, 24);
  flangeGeo.rotateX(Math.PI / 2);
  const flangeMesh = new THREE.Mesh(flangeGeo, leadingEdgeMat);
  fuelSystem.add(pumpMesh);
  fuelSystem.add(flangeMesh);
  fuelSystem.position.set(0, -0.6, 0.2);
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
    navLights,
  };
}
