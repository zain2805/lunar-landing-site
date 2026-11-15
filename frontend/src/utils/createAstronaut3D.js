import * as THREE from 'three';

/**
 * Creates a fully articulated, highly detailed 3D Spacesuit Astronaut mesh hierarchy.
 * Designed for real Three.js WebGL scenes with realistic microgravity kinematics.
 */
export function createDetailedAstronaut3D(options = {}) {
  const {
    scale = 1.0,
    enableLights = true,
    suitColor = 0xf1f5f9,
    visorGold = 0xf59e0b,
    isCommander = true,
  } = options;

  const astronaut = new THREE.Group();
  astronaut.scale.set(scale, scale, scale);

  // ==========================================
  // 1. ADVANCED MATERIALS
  // ==========================================
  const suitMaterial = new THREE.MeshStandardMaterial({
    color: suitColor,
    roughness: 0.55,
    metalness: 0.15,
  });

  const jointMaterial = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.85,
    metalness: 0.2,
  });

  const goldVisorMaterial = new THREE.MeshStandardMaterial({
    color: visorGold,
    emissive: 0x92400e,
    emissiveIntensity: 0.45,
    roughness: 0.06,
    metalness: 0.96,
  });

  const helmetShellMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.22,
    metalness: 0.18,
  });

  const plssMaterial = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.45,
    metalness: 0.35,
  });

  const dcmMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.5,
  });

  const gloveMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.7,
    metalness: 0.2,
  });

  const bootSoleMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.95,
    metalness: 0.1,
  });

  const metalRingMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.2,
    metalness: 0.85,
  });

  const stripeMaterial = new THREE.MeshStandardMaterial({
    color: isCommander ? 0xdc2626 : 0x0284c7, // Red for commander, blue for specialist
    roughness: 0.4,
    metalness: 0.2,
  });

  const ledCyanMaterial = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
  const ledRedMaterial = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const ledGreenMaterial = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const lightGlowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // ==========================================
  // 2. TORSO & HARD UPPER TORSO (HUT)
  // ==========================================
  const torsoGroup = new THREE.Group();
  astronaut.add(torsoGroup);

  // Main Torso shell
  const torsoGeo = new THREE.CylinderGeometry(1.25, 1.05, 2.3, 20);
  const torsoMesh = new THREE.Mesh(torsoGeo, suitMaterial);
  torsoMesh.position.y = 0;
  torsoGroup.add(torsoMesh);

  // Upper chest reinforcement plate
  const chestPlateGeo = new THREE.BoxGeometry(1.65, 1.25, 0.35);
  const chestPlate = new THREE.Mesh(chestPlateGeo, suitMaterial);
  chestPlate.position.set(0, 0.4, 0.95);
  torsoGroup.add(chestPlate);

  // Display and Control Module (DCM) chest unit
  const dcmGeo = new THREE.BoxGeometry(1.15, 0.9, 0.5);
  const dcmMesh = new THREE.Mesh(dcmGeo, dcmMaterial);
  dcmMesh.position.set(0, 0.35, 1.25);
  torsoGroup.add(dcmMesh);

  // DCM Digital Gauges & Controls
  const dcmScreenGeo = new THREE.PlaneGeometry(0.75, 0.32);
  const dcmScreen = new THREE.Mesh(dcmScreenGeo, ledCyanMaterial);
  dcmScreen.position.set(0, 0.52, 1.51);
  torsoGroup.add(dcmScreen);

  // LED indicators on DCM
  [-0.35, -0.15, 0.15, 0.35].forEach((lx, i) => {
    const ledGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const ledMat = i === 0 ? ledRedMaterial : i === 1 ? ledGreenMaterial : ledCyanMaterial;
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(lx, 0.22, 1.51);
    torsoGroup.add(led);
  });

  // Oxygen Umbilical Quick-Disconnects
  const intakePort = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 12), stripeMaterial);
  intakePort.rotation.x = Math.PI / 2;
  intakePort.position.set(-0.35, 0.02, 1.5);
  torsoGroup.add(intakePort);

  const exhaustPort = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 12), metalRingMaterial);
  exhaustPort.rotation.x = Math.PI / 2;
  exhaustPort.position.set(0.35, 0.02, 1.5);
  torsoGroup.add(exhaustPort);

  // Dual Corrugated Oxygen / Coolant Hoses curving from DCM to PLSS
  [-0.38, 0.38].forEach((hx) => {
    const hoseCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(hx, 0.02, 1.45),
      new THREE.Vector3(hx * 1.55, -0.2, 0.8),
      new THREE.Vector3(hx * 1.6, 0.2, -0.3),
      new THREE.Vector3(hx * 1.1, 0.6, -1.05),
    ]);
    const hoseGeo = new THREE.TubeGeometry(hoseCurve, 24, 0.075, 10, false);
    const hose = new THREE.Mesh(hoseGeo, jointMaterial);
    torsoGroup.add(hose);
  });

  // ==========================================
  // 3. PLSS BACKPACK & SAFER PROPULSION
  // ==========================================
  const backpackGroup = new THREE.Group();
  torsoGroup.add(backpackGroup);

  const plssGeo = new THREE.BoxGeometry(1.95, 2.65, 1.05);
  const plssMesh = new THREE.Mesh(plssGeo, plssMaterial);
  plssMesh.position.set(0, 0.2, -1.1);
  backpackGroup.add(plssMesh);

  // Top sublimator cooling louvers
  for (let l = 0; l < 4; l++) {
    const louverGeo = new THREE.BoxGeometry(1.6, 0.08, 0.95);
    const louver = new THREE.Mesh(louverGeo, metalRingMaterial);
    louver.position.set(0, 1.25 + l * 0.12, -1.1);
    backpackGroup.add(louver);
  }

  // High-gain UHF whip antenna
  const antennaGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.5, 8);
  const antenna = new THREE.Mesh(antennaGeo, metalRingMaterial);
  antenna.position.set(-0.75, 2.4, -1.1);
  antenna.rotation.z = -0.15;
  backpackGroup.add(antenna);

  const antennaTipGeo = new THREE.SphereGeometry(0.1, 12, 12);
  const antennaTip = new THREE.Mesh(antennaTipGeo, ledCyanMaterial);
  antennaTip.position.set(-0.75 - 0.35, 3.6, -1.1);
  backpackGroup.add(antennaTip);

  // SAFER Cold-gas Thruster Blocks (4 corners)
  const thrusters = [];
  [
    [-0.95, 1.2, -1.6],
    [0.95, 1.2, -1.6],
    [-0.95, -0.8, -1.6],
    [0.95, -0.8, -1.6],
  ].forEach(([tx, ty, tz]) => {
    const blockGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);
    const block = new THREE.Mesh(blockGeo, metalRingMaterial);
    block.position.set(tx, ty, tz + 0.3);
    backpackGroup.add(block);

    // Thruster nozzle
    const nozzleGeo = new THREE.ConeGeometry(0.1, 0.2, 8);
    const nozzle = new THREE.Mesh(nozzleGeo, dcmMaterial);
    nozzle.position.set(tx, ty, tz + 0.1);
    nozzle.rotation.x = Math.PI / 2;
    backpackGroup.add(nozzle);
    thrusters.push(nozzle);
  });

  // ==========================================
  // 4. HELMET & HEAD (WITH GLOWING GOLD VISOR)
  // ==========================================
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.7, 0.05);
  torsoGroup.add(headGroup);

  // Helmet Collar Ring
  const collarGeo = new THREE.TorusGeometry(0.85, 0.12, 16, 32);
  const collar = new THREE.Mesh(collarGeo, metalRingMaterial);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = -0.32;
  headGroup.add(collar);

  // Main Helmet Shell
  const helmetGeo = new THREE.SphereGeometry(1.05, 32, 28);
  helmetGeo.scale(1.0, 1.08, 1.04);
  const helmetMesh = new THREE.Mesh(helmetGeo, helmetShellMaterial);
  headGroup.add(helmetMesh);

  // Gleaming Gold Bubble Visor
  const visorGeo = new THREE.SphereGeometry(
    0.95,
    32,
    24,
    -Math.PI * 0.44,
    Math.PI * 0.88,
    Math.PI * 0.18,
    Math.PI * 0.62
  );
  visorGeo.scale(1.02, 1.05, 1.14);
  const visorMesh = new THREE.Mesh(visorGeo, goldVisorMaterial);
  visorMesh.position.set(0, 0.08, 0.12);
  headGroup.add(visorMesh);

  // Helmet Sun-Shield Brow Peak
  const browGeo = new THREE.TorusGeometry(0.96, 0.08, 12, 24, Math.PI * 0.7);
  const brow = new THREE.Mesh(browGeo, suitMaterial);
  brow.position.set(0, 0.65, 0.55);
  brow.rotation.x = 0.5;
  headGroup.add(brow);

  // Dual Helmet EVA Floodlights (Left & Right)
  [-0.92, 0.92].forEach((hx) => {
    const lightPodGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.35, 12);
    const lightPod = new THREE.Mesh(lightPodGeo, dcmMaterial);
    lightPod.rotation.z = hx > 0 ? -Math.PI / 4 : Math.PI / 4;
    lightPod.rotation.x = Math.PI / 2;
    lightPod.position.set(hx, 0.28, 0.6);
    headGroup.add(lightPod);

    // Glowing Lens Disc
    const lensGeo = new THREE.CircleGeometry(0.13, 16);
    const lens = new THREE.Mesh(lensGeo, lightGlowMaterial);
    lens.position.set(hx, 0.28, 0.78);
    headGroup.add(lens);

    if (enableLights) {
      const floodLight = new THREE.PointLight(0xe0f2fe, 1.2, 25);
      floodLight.position.set(hx, 0.28, 1.0);
      headGroup.add(floodLight);
    }
  });

  // ==========================================
  // 5. ARMS & ARTICULATED EVA GLOVES
  // ==========================================
  const arms = [];

  [-1, 1].forEach((side) => {
    const isLeft = side === -1;
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 1.55, 0.95, 0);
    torsoGroup.add(armGroup);

    // Shoulder Bell
    const shoulderGeo = new THREE.SphereGeometry(0.62, 18, 18);
    const shoulder = new THREE.Mesh(shoulderGeo, suitMaterial);
    armGroup.add(shoulder);

    // Shoulder Mission Stripe
    const stripeGeo = new THREE.TorusGeometry(0.62, 0.06, 12, 24);
    const stripe = new THREE.Mesh(stripeGeo, stripeMaterial);
    stripe.rotation.x = Math.PI / 2;
    armGroup.add(stripe);

    // Upper Arm (Bicep)
    const upperArmGeo = new THREE.CylinderGeometry(0.44, 0.4, 1.25, 16);
    const upperArm = new THREE.Mesh(upperArmGeo, suitMaterial);
    upperArm.position.set(0, -0.75, 0);
    armGroup.add(upperArm);

    // Elbow Bellows Joint
    const elbowGeo = new THREE.TorusGeometry(0.42, 0.09, 12, 24);
    const elbow = new THREE.Mesh(elbowGeo, jointMaterial);
    elbow.rotation.x = Math.PI / 2;
    elbow.position.set(0, -1.4, 0);
    armGroup.add(elbow);

    // Forearm Group (For articulation)
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -1.45, 0);
    armGroup.add(forearmGroup);

    const forearmGeo = new THREE.CylinderGeometry(0.4, 0.36, 1.2, 16);
    const forearm = new THREE.Mesh(forearmGeo, suitMaterial);
    forearm.position.set(0, -0.65, 0);
    forearmGroup.add(forearm);

    // Wrist Disconnect Ring
    const wristRingGeo = new THREE.TorusGeometry(0.38, 0.07, 12, 24);
    const wristRing = new THREE.Mesh(wristRingGeo, metalRingMaterial);
    wristRing.rotation.x = Math.PI / 2;
    wristRing.position.set(0, -1.25, 0);
    forearmGroup.add(wristRing);

    // EVA Glove Palm
    const palmGeo = new THREE.BoxGeometry(0.48, 0.45, 0.28);
    const palm = new THREE.Mesh(palmGeo, gloveMaterial);
    palm.position.set(0, -1.5, 0);
    forearmGroup.add(palm);

    // 4 Articulated Glove Fingers
    for (let f = 0; f < 4; f++) {
      const fingerGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.35, 8);
      const finger = new THREE.Mesh(fingerGeo, gloveMaterial);
      finger.position.set((f - 1.5) * 0.11, -1.8, (f % 2) * 0.04);
      finger.rotation.x = 0.35 + f * 0.05;
      forearmGroup.add(finger);
    }

    // Thumb
    const thumbGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.32, 8);
    const thumb = new THREE.Mesh(thumbGeo, gloveMaterial);
    thumb.position.set(side * 0.25, -1.55, 0.12);
    thumb.rotation.z = side * 0.6;
    thumb.rotation.x = -0.3;
    forearmGroup.add(thumb);

    // Initial Spacewalk Arm Poses
    if (isLeft) {
      armGroup.rotation.z = 0.55;
      armGroup.rotation.x = 0.4;
      forearmGroup.rotation.x = -0.65;
    } else {
      armGroup.rotation.z = -0.45;
      armGroup.rotation.x = -0.25;
      forearmGroup.rotation.x = -0.4;
    }

    arms.push({ armGroup, forearmGroup, isLeft });
  });

  // ==========================================
  // 6. PELVIS, LEGS & HEAVY LUNAR OVERBOOTS
  // ==========================================
  const waistGroup = new THREE.Group();
  torsoGroup.add(waistGroup);

  // Waist Ring
  const waistRingGeo = new THREE.TorusGeometry(1.08, 0.14, 16, 32);
  const waistRing = new THREE.Mesh(waistRingGeo, metalRingMaterial);
  waistRing.rotation.x = Math.PI / 2;
  waistRing.position.set(0, -1.15, 0);
  waistGroup.add(waistRing);

  // Pelvis lower suit body
  const pelvisGeo = new THREE.CylinderGeometry(1.05, 0.95, 0.95, 18);
  const pelvis = new THREE.Mesh(pelvisGeo, suitMaterial);
  pelvis.position.set(0, -1.55, 0);
  waistGroup.add(pelvis);

  const legs = [];

  [-1, 1].forEach((side) => {
    const isLeft = side === -1;
    const legGroup = new THREE.Group();
    legGroup.position.set(side * 0.62, -1.95, 0);
    waistGroup.add(legGroup);

    // Upper Thigh
    const thighGeo = new THREE.CylinderGeometry(0.52, 0.46, 1.6, 16);
    const thigh = new THREE.Mesh(thighGeo, suitMaterial);
    thigh.position.set(0, -0.8, 0);
    legGroup.add(thigh);

    // Thigh Utility Pouch
    const pouchGeo = new THREE.BoxGeometry(0.2, 0.55, 0.35);
    const pouch = new THREE.Mesh(pouchGeo, plssMaterial);
    pouch.position.set(side * 0.52, -0.75, 0.1);
    legGroup.add(pouch);

    // Knee Accordion Bellows
    const kneeGeo = new THREE.TorusGeometry(0.48, 0.09, 12, 24);
    const knee = new THREE.Mesh(kneeGeo, jointMaterial);
    knee.rotation.x = Math.PI / 2;
    knee.position.set(0, -1.65, 0);
    legGroup.add(knee);

    // Calf / Lower Leg Group
    const lowerLegGroup = new THREE.Group();
    lowerLegGroup.position.set(0, -1.7, 0);
    legGroup.add(lowerLegGroup);

    const calfGeo = new THREE.CylinderGeometry(0.46, 0.49, 1.5, 16);
    const calf = new THREE.Mesh(calfGeo, suitMaterial);
    calf.position.set(0, -0.75, 0);
    lowerLegGroup.add(calf);

    // Red/Blue Commander Stripe on Lower Leg
    const legStripeGeo = new THREE.TorusGeometry(0.48, 0.06, 12, 24);
    const legStripe = new THREE.Mesh(legStripeGeo, stripeMaterial);
    legStripe.rotation.x = Math.PI / 2;
    legStripe.position.set(0, -0.65, 0);
    lowerLegGroup.add(legStripe);

    // Heavy Lunar Overboot
    const bootGroup = new THREE.Group();
    bootGroup.position.set(0, -1.5, 0.15);
    lowerLegGroup.add(bootGroup);

    // Ankle Gaiter Cuff
    const cuffGeo = new THREE.CylinderGeometry(0.52, 0.55, 0.35, 16);
    const cuff = new THREE.Mesh(cuffGeo, jointMaterial);
    cuff.position.set(0, 0.1, -0.1);
    bootGroup.add(cuff);

    // Foot Main Body
    const footGeo = new THREE.BoxGeometry(0.8, 0.5, 1.45);
    const foot = new THREE.Mesh(footGeo, suitMaterial);
    foot.position.set(0, -0.15, 0.2);
    bootGroup.add(foot);

    // Heavy Tread Sole
    const soleGeo = new THREE.BoxGeometry(0.86, 0.16, 1.55);
    const sole = new THREE.Mesh(soleGeo, bootSoleMaterial);
    sole.position.set(0, -0.44, 0.2);
    bootGroup.add(sole);

    // Initial Leg Float Poses
    if (isLeft) {
      legGroup.rotation.x = -0.25;
      legGroup.rotation.z = -0.12;
      lowerLegGroup.rotation.x = 0.45;
    } else {
      legGroup.rotation.x = 0.2;
      legGroup.rotation.z = 0.14;
      lowerLegGroup.rotation.x = 0.35;
    }

    legs.push({ legGroup, lowerLegGroup, isLeft });
  });

  // ==========================================
  // 7. ZERO-G UMBILICAL TETHER CABLE
  // ==========================================
  const tetherPoints = [];
  for (let tp = 0; tp <= 20; tp++) {
    tetherPoints.push(new THREE.Vector3(0, -0.5 - tp * 0.45, -1.6 - tp * 0.8));
  }
  const tetherCurve = new THREE.CatmullRomCurve3(tetherPoints);
  const tetherGeo = new THREE.TubeGeometry(tetherCurve, 32, 0.065, 8, false);
  const tetherMesh = new THREE.Mesh(tetherGeo, stripeMaterial);
  torsoGroup.add(tetherMesh);

  // ==========================================
  // 8. COLD-GAS THRUSTER PARTICLES (SAFER)
  // ==========================================
  const particleCount = 40;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let p = 0; p < particleCount * 3; p++) {
    particlePositions[p] = (Math.random() - 0.5) * 0.8;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.18,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });
  const thrusterParticles = new THREE.Points(particleGeo, particleMat);
  thrusterParticles.position.set(0, 0, -2.0);
  torsoGroup.add(thrusterParticles);

  // ==========================================
  // 9. ANIMATION / MICROGRAVITY UPDATE ENGINE
  // ==========================================
  const update = (time, delta = 0.016, mouse = { x: 0, y: 0 }) => {
    // 1. Natural Zero-G Floating Harmonic Oscillation
    torsoGroup.position.y = Math.sin(time * 0.85) * 0.28;
    torsoGroup.position.x = Math.cos(time * 0.55) * 0.18;
    torsoGroup.position.z = Math.sin(time * 0.4) * 0.12;

    // 2. Slow 3-Axis Tumbling / Space Rotation
    torsoGroup.rotation.y = Math.sin(time * 0.35) * 0.22 + mouse.x * 0.4;
    torsoGroup.rotation.x = Math.cos(time * 0.45) * 0.15 - mouse.y * 0.3;
    torsoGroup.rotation.z = Math.sin(time * 0.25) * 0.08;

    // 3. Head & Helmet tracking
    headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, mouse.x * 0.45, 0.05);
    headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -mouse.y * 0.35, 0.05);

    // 4. Subtle Microgravity Limb Sway
    arms.forEach(({ armGroup, forearmGroup, isLeft }) => {
      const sign = isLeft ? 1 : -1;
      armGroup.rotation.z += Math.sin(time * 1.2 + (isLeft ? 0 : 2)) * 0.003;
      armGroup.rotation.x += Math.cos(time * 0.9 + (isLeft ? 1 : 0)) * 0.002;
      forearmGroup.rotation.x += Math.sin(time * 1.5 + (isLeft ? 2 : 1)) * 0.003;
    });

    legs.forEach(({ legGroup, lowerLegGroup, isLeft }) => {
      legGroup.rotation.x += Math.sin(time * 0.75 + (isLeft ? 0 : 1.5)) * 0.002;
      lowerLegGroup.rotation.x += Math.cos(time * 0.85 + (isLeft ? 1 : 0)) * 0.0025;
    });

    // 5. Umbilical Tether wave animation
    const pos = tetherGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const yVal = pos.getY(i);
      const wave = Math.sin(time * 2.2 + yVal * 2.0) * 0.015;
      pos.setX(i, pos.getX(i) + wave);
    }
    tetherGeo.attributes.position.needsUpdate = true;

    // 6. Thruster cold-gas burst shimmer
    thrusterParticles.rotation.z += 0.05;
    particleMat.opacity = 0.4 + Math.sin(time * 8.0) * 0.35;
  };

  return {
    group: astronaut,
    torsoGroup,
    headGroup,
    arms,
    legs,
    update,
  };
}
