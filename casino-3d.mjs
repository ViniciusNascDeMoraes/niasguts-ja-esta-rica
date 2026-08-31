import * as THREE from "./assets/vendor/three.module.min.mjs";

const FULL_TURN_RADIANS = Math.PI * 2;
const LEVER_IDLE_ANGLE = THREE.MathUtils.degToRad(-12);
const LEVER_PULLED_ANGLE = THREE.MathUtils.degToRad(148);
const LEVER_PULL_DURATION_MS = 340;
const LEVER_HOLD_DURATION_MS = 120;
const LEVER_RETURN_DURATION_MS = 440;
const LEVER_TOTAL_DURATION_MS =
  LEVER_PULL_DURATION_MS + LEVER_HOLD_DURATION_MS + LEVER_RETURN_DURATION_MS;
const REEL_START_DELAY_MS = 260;
const DANCE_FRAME_INTERVAL_MS = 1000 / 30;
const GALLERY_FRAME_INTERVAL_MS = 1000 / 20;
const JACKPOT_STAGE_DISTANCE = 7;
const JACKPOT_MAX_WIDTH_RATIO = 0.46;
const JACKPOT_MAX_HEIGHT_RATIO = 0.34;

function easeInOutCubic(progress) {
  // Smooth both ends of a physical control movement.
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function easeOutCubic(progress) {
  // Decelerate reel and prize movement into an exact resting pose.
  return 1 - Math.pow(1 - progress, 3);
}

export function calculateReelTargetRotation(
  currentIndex,
  targetIndex,
  currentRotation,
  fullTurns,
  symbolCount,
) {
  // Rotate backwards by whole turns plus the shortest indexed face delta.
  const symbolAngle = FULL_TURN_RADIANS / symbolCount;
  const forwardSteps =
    ((targetIndex - currentIndex) % symbolCount + symbolCount) % symbolCount;
  const backwardSteps = forwardSteps === 0 ? 0 : symbolCount - forwardSteps;
  return (
    currentRotation -
    fullTurns * FULL_TURN_RADIANS -
    backwardSteps * symbolAngle
  );
}

export function calculatePrizePresentationLayout(options) {
  // Fit a centered prize into the clear middle band of any casino viewport.
  const {
    viewportWidth,
    viewportHeight,
    verticalFovDegrees,
    distance = JACKPOT_STAGE_DISTANCE,
    modelWidth,
    modelHeight,
  } = options;
  const aspect = viewportWidth / viewportHeight;
  const visibleHeight =
    2 * distance * Math.tan(THREE.MathUtils.degToRad(verticalFovDegrees) / 2);
  const visibleWidth = visibleHeight * aspect;
  const scale = Math.min(
    (visibleWidth * JACKPOT_MAX_WIDTH_RATIO) / modelWidth,
    (visibleHeight * JACKPOT_MAX_HEIGHT_RATIO) / modelHeight,
  );

  return {
    position: [0, 0, -distance],
    scale,
    visibleHeight,
    visibleWidth,
  };
}

function createStandardMaterial(color, options = {}) {
  // Build one palette-bound material with explicit physical properties.
  const materialOptions = {
    color: new THREE.Color(color),
    metalness: options.metalness ?? 0.08,
    roughness: options.roughness ?? 0.42,
  };

  if (options.emissive !== undefined) {
    materialOptions.emissive = new THREE.Color(options.emissive);
    materialOptions.emissiveIntensity = options.emissiveIntensity ?? 0;
  }

  if (options.transparent !== undefined) {
    materialOptions.transparent = options.transparent;
    materialOptions.opacity = options.opacity ?? 1;
  }

  return new THREE.MeshStandardMaterial(materialOptions);
}

function applyShadows(mesh) {
  // Give procedural objects consistent cabinet lighting.
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addBox(parent, size, position, material, name = "") {
  // Add a rectangular procedural part.
  const mesh = applyShadows(
    new THREE.Mesh(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      material,
    ),
  );
  mesh.position.set(position[0], position[1], position[2]);
  mesh.name = name;
  parent.add(mesh);
  return mesh;
}

function addSphere(
  parent,
  radius,
  position,
  material,
  scale = [1, 1, 1],
  name = "",
) {
  // Add a smooth sphere or ellipsoid.
  const mesh = applyShadows(
    new THREE.Mesh(new THREE.SphereGeometry(radius, 28, 20), material),
  );
  mesh.position.set(position[0], position[1], position[2]);
  mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.name = name;
  parent.add(mesh);
  return mesh;
}

function addCylinder(
  parent,
  radiusTop,
  radiusBottom,
  height,
  position,
  material,
  radialSegments = 32,
  name = "",
) {
  // Add a vertical cylinder or cone.
  const mesh = applyShadows(
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments,
      ),
      material,
    ),
  );
  mesh.position.set(position[0], position[1], position[2]);
  mesh.name = name;
  parent.add(mesh);
  return mesh;
}

function createTextTexture(text, background, foreground) {
  // Draw sharp text for a plaque attached to an actual 3D object.
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 512;
  textureCanvas.height = 256;
  const context = textureCanvas.getContext("2d");

  if (context === null) {
    throw new Error("Canvas 2D is unavailable for a 3D plaque.");
  }

  context.fillStyle = background;
  context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
  context.strokeStyle = foreground;
  context.lineWidth = 18;
  context.strokeRect(12, 12, 488, 232);
  context.fillStyle = foreground;
  context.font = '900 126px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 256, 137);

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createSymbolTexture(
  character,
  background,
  palette,
  renderer,
) {
  // Draw one high-resolution reel face onto a local canvas texture.
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 384;
  textureCanvas.height = 384;
  const context = textureCanvas.getContext("2d");

  if (context === null) {
    throw new Error("Canvas 2D is unavailable for the reel symbols.");
  }

  context.fillStyle = background;
  context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
  context.fillStyle = palette.white;
  context.beginPath();
  context.ellipse(132, 92, 106, 66, -0.3, 0, FULL_TURN_RADIANS);
  context.fill();

  context.fillStyle = palette.navyDeep;
  context.font = character === "7"
    ? '900 245px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif'
    : '220px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(character, 192, 205);

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createReel(symbols, symbolBackgrounds, palette, renderer) {
  // Build one physical cylinder with one tangent plate per symbol.
  const reel = new THREE.Group();
  const symbolAngle = FULL_TURN_RADIANS / symbols.length;
  const plateHeight = Math.min(0.78, 2 * Math.sin(Math.PI / symbols.length) * 0.9);
  const drumMaterial = createStandardMaterial(palette.hairBlondeSoft, {
    metalness: 0.08,
    roughness: 0.42,
  });
  const capMaterial = createStandardMaterial(palette.navy, {
    metalness: 0.48,
    roughness: 0.24,
  });
  const drumGeometry = new THREE.CylinderGeometry(0.9, 0.9, 1.3, 48, 1, false);
  drumGeometry.rotateZ(Math.PI / 2);
  const drum = applyShadows(
    new THREE.Mesh(drumGeometry, [drumMaterial, capMaterial, capMaterial]),
  );
  reel.add(drum);

  for (let symbolIndex = 0; symbolIndex < symbols.length; symbolIndex += 1) {
    const angle = symbolIndex * symbolAngle;
    const texture = createSymbolTexture(
      symbols[symbolIndex],
      symbolBackgrounds[symbolIndex % symbolBackgrounds.length],
      palette,
      renderer,
    );
    const plateMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.02,
      roughness: 0.38,
    });
    const plate = applyShadows(
      new THREE.Mesh(new THREE.PlaneGeometry(1.18, plateHeight), plateMaterial),
    );
    plate.position.set(0, Math.sin(angle) * 0.92, Math.cos(angle) * 0.92);
    plate.rotation.x = -angle;
    reel.add(plate);
  }

  return reel;
}

function createPedestal(palette) {
  // Create the permanent plinth used by every trophy slot.
  const group = new THREE.Group();
  const baseMaterial = createStandardMaterial(palette.navy, {
    metalness: 0.42,
    roughness: 0.24,
  });
  const rimMaterial = createStandardMaterial(palette.hairBlonde, {
    metalness: 0.66,
    roughness: 0.18,
    emissive: palette.hairBlonde,
    emissiveIntensity: 0.08,
  });
  addCylinder(group, 0.86, 1, 0.3, [0, -0.95, 0], baseMaterial, 40);
  addCylinder(group, 0.76, 0.86, 0.18, [0, -0.72, 0], rimMaterial, 40);
  return group;
}

function createRingPrize(palette) {
  // Model a gold ring with a faceted blue gem.
  const group = new THREE.Group();
  const gold = createStandardMaterial(palette.hairBlonde, {
    metalness: 0.82,
    roughness: 0.16,
    emissive: palette.hairBlonde,
    emissiveIntensity: 0.08,
  });
  const gem = createStandardMaterial(palette.skirtBlue, {
    metalness: 0.32,
    roughness: 0.08,
    emissive: palette.skirtBlue,
    emissiveIntensity: 0.34,
  });
  const band = applyShadows(
    new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.13, 18, 56), gold),
  );
  band.position.y = 0.45;
  band.rotation.x = 0.18;
  group.add(band);
  const setting = addBox(group, [0.42, 0.18, 0.36], [0, 1.03, 0], gold);
  setting.rotation.x = 0.15;
  const stone = applyShadows(
    new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), gem),
  );
  stone.position.set(0, 1.28, 0.04);
  stone.scale.set(0.9, 1.25, 0.9);
  group.add(stone);
  return group;
}

export function createFootPrize(palette) {
  // Model a playful cartoon foot with five individually readable toes.
  const group = new THREE.Group();
  const skin = createStandardMaterial(palette.hairBlondeSoft, {
    roughness: 0.58,
  });
  const warmSkin = createStandardMaterial(palette.hairBlonde, {
    roughness: 0.5,
  });
  const nail = createStandardMaterial(palette.hairPink, {
    metalness: 0.08,
    roughness: 0.32,
  });

  addCylinder(
    group,
    0.31,
    0.42,
    0.92,
    [0, 0.76, -0.46],
    skin,
    28,
    "foot-ankle",
  );
  addSphere(
    group,
    0.62,
    [0, 0.28, -0.34],
    skin,
    [0.78, 0.66, 0.92],
    "foot-heel",
  );
  addSphere(
    group,
    0.7,
    [0, 0.2, 0.28],
    skin,
    [1.05, 0.52, 1.16],
    "foot-forefoot",
  );
  addSphere(
    group,
    0.42,
    [0, 0.05, 0.14],
    warmSkin,
    [1.15, 0.16, 1.2],
    "foot-sole-pad",
  );

  const toes = [
    { x: -0.43, y: 0.2, z: 0.93, radius: 0.23 },
    { x: -0.17, y: 0.21, z: 1.04, radius: 0.19 },
    { x: 0.07, y: 0.2, z: 1.01, radius: 0.175 },
    { x: 0.28, y: 0.19, z: 0.94, radius: 0.15 },
    { x: 0.46, y: 0.17, z: 0.84, radius: 0.13 },
  ];

  for (let toeIndex = 0; toeIndex < toes.length; toeIndex += 1) {
    const toe = toes[toeIndex];
    addSphere(
      group,
      toe.radius,
      [toe.x, toe.y, toe.z],
      skin,
      [1, 0.78, 1.08],
      "foot-toe-" + (toeIndex + 1),
    );
    addSphere(
      group,
      toe.radius * 0.58,
      [toe.x, toe.y + toe.radius * 0.54, toe.z + toe.radius * 0.4],
      nail,
      [0.72, 0.16, 0.62],
      "foot-nail-" + (toeIndex + 1),
    );
  }

  return group;
}

function createCakePrize(palette) {
  // Model a stacked celebration cake with piped frosting and a candle.
  const group = new THREE.Group();
  const sponge = createStandardMaterial(palette.hairBlondeSoft, {
    roughness: 0.56,
  });
  const frosting = createStandardMaterial(palette.hairPinkSoft, {
    roughness: 0.4,
  });
  const accent = createStandardMaterial(palette.hairPink, {
    roughness: 0.34,
  });
  const flame = createStandardMaterial(palette.hairBlonde, {
    emissive: palette.hairBlonde,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });
  addCylinder(group, 0.8, 0.8, 0.56, [0, -0.12, 0], sponge, 40);
  addCylinder(group, 0.82, 0.82, 0.15, [0, 0.22, 0], frosting, 40);
  addCylinder(group, 0.57, 0.57, 0.48, [0, 0.52, 0], sponge, 36);
  addCylinder(group, 0.59, 0.59, 0.14, [0, 0.82, 0], frosting, 36);
  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * FULL_TURN_RADIANS;
    addSphere(
      group,
      0.1,
      [Math.cos(angle) * 0.72, 0.23, Math.sin(angle) * 0.72],
      accent,
    );
  }
  addCylinder(group, 0.055, 0.055, 0.45, [0, 1.08, 0], accent, 12);
  const flameMesh = applyShadows(
    new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), flame),
  );
  flameMesh.position.y = 1.38;
  flameMesh.scale.y = 1.5;
  group.add(flameMesh);
  return group;
}

function createCashCasePrize(palette) {
  // Model a prize suitcase with a real R$350 plaque on its front.
  const group = new THREE.Group();
  const caseMaterial = createStandardMaterial(palette.navy, {
    metalness: 0.46,
    roughness: 0.25,
  });
  const trimMaterial = createStandardMaterial(palette.hairBlonde, {
    metalness: 0.74,
    roughness: 0.16,
  });
  addBox(group, [1.55, 0.92, 0.5], [0, 0.25, 0], caseMaterial);
  addBox(group, [1.64, 0.08, 0.56], [0, 0.25, 0], trimMaterial);
  addBox(group, [0.09, 1, 0.56], [-0.65, 0.25, 0], trimMaterial);
  addBox(group, [0.09, 1, 0.56], [0.65, 0.25, 0], trimMaterial);
  const handle = applyShadows(
    new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.065, 12, 28, Math.PI), trimMaterial),
  );
  handle.position.set(0, 0.77, 0);
  group.add(handle);
  const plaqueTexture = createTextTexture(
    "R$350",
    palette.hairPinkSoft,
    palette.navyDeep,
  );
  const plaqueMaterial = new THREE.MeshStandardMaterial({
    map: plaqueTexture,
    roughness: 0.34,
  });
  const plaque = applyShadows(
    new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.52), plaqueMaterial),
  );
  plaque.position.set(0, 0.25, 0.256);
  group.add(plaque);
  return group;
}

function createSandwichPrize(palette) {
  // Model a logo-free layered sandwich.
  const group = new THREE.Group();
  const bread = createStandardMaterial(palette.hairBlondeSoft, {
    roughness: 0.58,
  });
  const crust = createStandardMaterial(palette.hairBlonde, {
    roughness: 0.5,
  });
  const lettuce = createStandardMaterial(palette.skirtBlue, {
    roughness: 0.46,
  });
  const tomato = createStandardMaterial(palette.tieRed, {
    roughness: 0.42,
  });
  const cheese = createStandardMaterial(palette.hairPink, {
    roughness: 0.42,
  });
  addSphere(group, 0.8, [0, 0.73, 0], crust, [1.35, 0.44, 0.72]);
  addSphere(group, 0.7, [0, 0.79, 0.04], bread, [1.35, 0.37, 0.7]);
  addBox(group, [1.72, 0.13, 0.82], [0, 0.36, 0], lettuce);
  const cheeseLayer = addBox(
    group,
    [1.55, 0.1, 0.76],
    [0.08, 0.19, 0],
    cheese,
  );
  cheeseLayer.rotation.y = 0.08;
  addBox(group, [1.58, 0.13, 0.73], [-0.04, 0.03, 0], tomato);
  addSphere(group, 0.76, [0, -0.18, 0], crust, [1.3, 0.34, 0.7]);
  addSphere(group, 0.67, [0, -0.12, 0.04], bread, [1.3, 0.28, 0.68]);
  return group;
}

function createMysteryPrize(palette) {
  // Model a locked mystery crate instead of displaying a flat emoji.
  const group = new THREE.Group();
  const boxMaterial = createStandardMaterial(palette.navy, {
    metalness: 0.32,
    roughness: 0.28,
  });
  const trimMaterial = createStandardMaterial(palette.hairPinkDark, {
    metalness: 0.42,
    roughness: 0.24,
  });
  addBox(group, [1.22, 1.22, 1.22], [0, 0.18, 0], boxMaterial);
  addBox(group, [1.34, 0.12, 1.34], [0, 0.75, 0], trimMaterial);
  addBox(group, [0.12, 1.34, 1.34], [0, 0.18, 0], trimMaterial);
  const questionTexture = createTextTexture(
    "?",
    palette.navy,
    palette.hairBlonde,
  );
  const questionMaterial = new THREE.MeshStandardMaterial({
    map: questionTexture,
    roughness: 0.32,
  });
  const question = applyShadows(
    new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.76), questionMaterial),
  );
  question.position.set(0, 0.18, 0.616);
  group.add(question);
  return group;
}

function createPrizeModel(modelId, palette) {
  // Route stable prize IDs to their procedural model factories.
  if (modelId === "ring") {
    return createRingPrize(palette);
  }
  if (modelId === "foot") {
    return createFootPrize(palette);
  }
  if (modelId === "cake") {
    return createCakePrize(palette);
  }
  if (modelId === "cash-case") {
    return createCashCasePrize(palette);
  }
  if (modelId === "sandwich") {
    return createSandwichPrize(palette);
  }
  throw new Error("Unknown 3D prize model: " + modelId);
}

function createCenteredPrizePresentation(modelId, palette) {
  // Center unlike procedural models around one stable animation pivot.
  const presentation = new THREE.Group();
  presentation.name = "jackpot-prize-" + modelId;
  const model = createPrizeModel(modelId, palette);
  model.updateWorldMatrix(true, true);
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  model.position.sub(center);
  presentation.userData.modelSize = size;
  presentation.userData.presentationScale = 1;
  presentation.add(model);
  return presentation;
}

function createJackpotPresentation(camera, palette, prizes) {
  // Keep every celebration layer camera-centered with the real prize foremost.
  const stage = new THREE.Group();
  stage.name = "jackpot-presentation-stage";
  stage.position.set(0, 0, -JACKPOT_STAGE_DISTANCE);
  stage.visible = false;
  camera.add(stage);

  const backdropMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(palette.navyDeep),
    transparent: true,
    opacity: 0.72,
    depthTest: true,
    depthWrite: false,
  });
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    backdropMaterial,
  );
  backdrop.name = "jackpot-backdrop-3d";
  backdrop.position.z = -2.6;
  backdrop.renderOrder = 9;
  stage.add(backdrop);

  const flashMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(palette.shirt),
    transparent: true,
    opacity: 0,
    depthTest: true,
    depthWrite: false,
  });
  const flash = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), flashMaterial);
  flash.name = "jackpot-flash-3d";
  flash.position.z = -2.4;
  flash.renderOrder = 10;
  stage.add(flash);

  const rayMaterials = [palette.hairBlonde, palette.hairPink].map(
    (color) => new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false,
    }),
  );
  const rayGeometry = new THREE.BufferGeometry();
  rayGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([
      0, 0, 0,
      -0.075, 1, 0,
      0.075, 1, 0,
    ], 3),
  );
  rayGeometry.computeVertexNormals();
  const rays = new THREE.Group();
  rays.name = "jackpot-rays-3d";
  rays.position.z = -2.1;
  for (let rayIndex = 0; rayIndex < 20; rayIndex += 1) {
    const ray = new THREE.Mesh(
      rayGeometry,
      rayMaterials[rayIndex % rayMaterials.length],
    );
    ray.name = "jackpot-ray-" + rayIndex;
    ray.rotation.z = (rayIndex / 20) * FULL_TURN_RADIANS;
    ray.renderOrder = 11;
    rays.add(ray);
  }
  stage.add(rays);

  const haloMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(palette.hairBlonde),
    transparent: true,
    opacity: 0.76,
    side: THREE.DoubleSide,
    depthTest: true,
    depthWrite: false,
  });
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.055, 12, 64),
    haloMaterial,
  );
  halo.name = "jackpot-halo-3d";
  halo.position.z = -1.8;
  halo.renderOrder = 12;
  stage.add(halo);

  const effectMaterials = [
    palette.hairBlonde,
    palette.hairPink,
    palette.skirtBlue,
    palette.shirt,
  ].map((color) => new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.92,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  }));

  const particleRoot = new THREE.Group();
  particleRoot.name = "jackpot-particles-3d";
  particleRoot.position.z = -1.5;
  const particles = [];
  for (let particleIndex = 0; particleIndex < 42; particleIndex += 1) {
    const geometry = particleIndex % 2 === 0
      ? new THREE.TetrahedronGeometry(0.1, 0)
      : new THREE.BoxGeometry(0.11, 0.2, 0.07);
    const particle = new THREE.Mesh(
      geometry,
      effectMaterials[particleIndex % effectMaterials.length],
    );
    particle.name = "jackpot-particle-" + particleIndex;
    particle.renderOrder = 13;
    particle.userData.seed = particleIndex / 42;
    particleRoot.add(particle);
    particles.push(particle);
  }
  stage.add(particleRoot);

  const confettiRoot = new THREE.Group();
  confettiRoot.name = "jackpot-confetti-3d";
  confettiRoot.position.z = -1.3;
  const confetti = [];
  for (let confettiIndex = 0; confettiIndex < 24; confettiIndex += 1) {
    const piece = new THREE.Mesh(
      new THREE.PlaneGeometry(0.11, 0.25),
      effectMaterials[confettiIndex % effectMaterials.length],
    );
    piece.name = "jackpot-confetti-" + confettiIndex;
    piece.renderOrder = 14;
    piece.userData.seed = confettiIndex / 24;
    confettiRoot.add(piece);
    confetti.push(piece);
  }
  stage.add(confettiRoot);

  const prizeModels = new Map();
  for (const prize of prizes) {
    const presentation = createCenteredPrizePresentation(
      prize.modelId,
      palette,
    );
    presentation.visible = false;
    stage.add(presentation);
    prizeModels.set(prize.modelId, presentation);
  }

  return {
    backdrop,
    confetti,
    confettiRoot,
    flash,
    flashMaterial,
    halo,
    particleRoot,
    particles,
    prizeModels,
    rayMaterials,
    rays,
    stage,
    visibleHeight: 1,
    visibleWidth: 1,
  };
}

export function createTigerModel(palette) {
  // Build a chibi low-poly tiger and expose its dance joints.
  const root = new THREE.Group();
  root.name = "tiger-root";
  const orange = createStandardMaterial(palette.hairBlonde, {
    roughness: 0.48,
  });
  const pale = createStandardMaterial(palette.hairBlondeSoft, {
    roughness: 0.54,
  });
  const stripe = createStandardMaterial(palette.navyDeep, {
    roughness: 0.42,
  });
  const pink = createStandardMaterial(palette.hairPink, {
    roughness: 0.38,
  });

  const body = addSphere(root, 0.78, [0, 0.2, 0], orange, [0.9, 1.15, 0.78]);
  const belly = addSphere(root, 0.55, [0, 0.06, 0.53], pale, [0.8, 1, 0.25]);
  belly.castShadow = false;
  const head = new THREE.Group();
  head.name = "tiger-head";
  head.position.y = 1.25;
  root.add(head);
  addSphere(
    head,
    0.72,
    [0, 0, 0],
    orange,
    [1, 0.92, 0.86],
    "tiger-head-shape",
  );
  addSphere(
    head,
    0.3,
    [-0.15, -0.15, 0.57],
    pale,
    [0.78, 0.62, 0.34],
    "tiger-muzzle-left",
  );
  addSphere(
    head,
    0.3,
    [0.15, -0.15, 0.57],
    pale,
    [0.78, 0.62, 0.34],
    "tiger-muzzle-right",
  );

  for (const [side, x] of [["left", -0.36], ["right", 0.36]]) {
    const ear = applyShadows(
      new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 4), orange),
    );
    ear.name = "tiger-ear-" + side;
    ear.position.set(x, 0.65, -0.02);
    ear.rotation.z = x < 0 ? -0.2 : 0.2;
    head.add(ear);

    const innerEar = applyShadows(
      new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.33, 4), pink),
    );
    innerEar.name = "tiger-inner-ear-" + side;
    innerEar.position.set(x, 0.64, 0.13);
    innerEar.rotation.z = x < 0 ? -0.2 : 0.2;
    head.add(innerEar);
  }

  for (const [side, x] of [["left", -0.23], ["right", 0.23]]) {
    addSphere(
      head,
      0.078,
      [x, 0.09, 0.67],
      stripe,
      [0.92, 1.08, 0.5],
      "tiger-eye-" + side,
    );
  }

  addSphere(
    head,
    0.075,
    [0, -0.13, 0.79],
    pink,
    [1.08, 0.82, 0.62],
    "tiger-nose",
  );

  for (const [side, x] of [["left", -0.21], ["right", 0.21]]) {
    const foreheadStripe = applyShadows(
      new THREE.Mesh(new THREE.CircleGeometry(0.105, 3), stripe),
    );
    foreheadStripe.name = "tiger-forehead-stripe-" + side;
    foreheadStripe.position.set(x, 0.39, 0.645);
    foreheadStripe.scale.set(0.72, 1.18, 1);
    foreheadStripe.rotation.z = x < 0 ? 0.22 : -0.22;
    head.add(foreheadStripe);
  }

  for (const [side, direction] of [["left", -1], ["right", 1]]) {
    for (let whiskerIndex = 0; whiskerIndex < 2; whiskerIndex += 1) {
      const whisker = addCylinder(
        head,
        0.012,
        0.012,
        0.31,
        [direction * 0.39, -0.14 - whiskerIndex * 0.11, 0.7],
        stripe,
        8,
        "tiger-whisker-" + side + "-" + (whiskerIndex + 1),
      );
      whisker.rotation.z =
        Math.PI / 2 + direction * (whiskerIndex === 0 ? 0.12 : -0.12);
    }
  }

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.72, 0.48, 0);
  root.add(leftArm);
  const leftArmMesh = addCylinder(
    leftArm,
    0.16,
    0.2,
    0.86,
    [0, -0.34, 0],
    orange,
    16,
  );
  leftArmMesh.rotation.z = -0.18;
  const rightArm = new THREE.Group();
  rightArm.position.set(0.72, 0.48, 0);
  root.add(rightArm);
  const rightArmMesh = addCylinder(
    rightArm,
    0.16,
    0.2,
    0.86,
    [0, -0.34, 0],
    orange,
    16,
  );
  rightArmMesh.rotation.z = 0.18;

  const leftLeg = addCylinder(
    root,
    0.2,
    0.25,
    0.72,
    [-0.34, -0.78, 0],
    orange,
    16,
  );
  const rightLeg = addCylinder(
    root,
    0.2,
    0.25,
    0.72,
    [0.34, -0.78, 0],
    orange,
    16,
  );
  const tail = applyShadows(
    new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.13, 12, 30, Math.PI * 1.35),
      orange,
    ),
  );
  tail.position.set(0.58, 0.05, -0.45);
  tail.rotation.y = 0.75;
  root.add(tail);
  root.userData = {
    body,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    tail,
  };
  return root;
}

function buildCasinoModel(
  scene,
  camera,
  renderer,
  palette,
  symbols,
  initialIndices,
  prizes,
) {
  // Assemble a deep cabinet, physical reels, external lever, tiger, and prizes.
  const machine = new THREE.Group();
  machine.name = "nanaBet";
  machine.position.x = 0.35;
  scene.add(machine);

  const bodyMaterial = createStandardMaterial(palette.hairPink, {
    metalness: 0.24,
    roughness: 0.26,
    emissive: palette.hairPinkDark,
    emissiveIntensity: 0.03,
  });
  const darkPinkMaterial = createStandardMaterial(palette.hairPinkDark, {
    metalness: 0.34,
    roughness: 0.25,
  });
  const navyMaterial = createStandardMaterial(palette.navyDeep, {
    metalness: 0.34,
    roughness: 0.28,
  });
  const blueMaterial = createStandardMaterial(palette.navy, {
    metalness: 0.26,
    roughness: 0.32,
  });
  const goldMaterial = createStandardMaterial(palette.hairBlonde, {
    metalness: 0.62,
    roughness: 0.19,
    emissive: palette.hairBlonde,
    emissiveIntensity: 0.06,
  });
  const paleMaterial = createStandardMaterial(palette.shirt, {
    metalness: 0.04,
    roughness: 0.38,
  });

  addBox(machine, [7.15, 7.7, 3], [0, 0, 0], bodyMaterial, "cabinet-body");
  addBox(
    machine,
    [0.48, 7.35, 3.4],
    [3.72, -0.02, -0.08],
    darkPinkMaterial,
    "cabinet-right-side",
  );
  addBox(machine, [7.62, 0.5, 3.48], [0.04, 4, -0.03], goldMaterial);
  addBox(machine, [7.85, 0.62, 3.55], [0.04, -4.02, 0], navyMaterial);
  addBox(machine, [7.35, 0.28, 3.2], [0.02, -4.43, -0.08], darkPinkMaterial);
  addBox(machine, [7.02, 2.08, 0.64], [0, 2.9, 1.66], darkPinkMaterial);
  addBox(machine, [6.48, 1.58, 0.32], [0, 2.94, 2.08], navyMaterial);
  addBox(machine, [6.72, 0.18, 0.68], [0, 1.91, 1.96], goldMaterial);

  const bulbMaterials = [];
  for (let bulbIndex = 0; bulbIndex < 9; bulbIndex += 1) {
    const bulbColor =
      bulbIndex % 2 === 1 ? palette.hairPink : palette.hairBlonde;
    const bulbMaterial = createStandardMaterial(bulbColor, {
      metalness: 0.05,
      roughness: 0.18,
      emissive: bulbColor,
      emissiveIntensity: 0.72,
    });
    const bulb = applyShadows(
      new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), bulbMaterial),
    );
    bulb.position.set(-2.5 + bulbIndex * 0.625, 3.54, 2.34);
    machine.add(bulb);
    bulbMaterials.push(bulbMaterial);
  }

  addBox(machine, [5.78, 2.42, 0.58], [-0.46, 0.5, 1.66], navyMaterial);
  addBox(machine, [5.36, 1.98, 0.32], [-0.46, 0.5, 2.07], blueMaterial);

  const reelGroups = [];
  const reelPositions = [-2.13, -0.46, 1.21];
  const symbolBackgrounds = [
    palette.hairBlondeSoft,
    palette.shirt,
    palette.skirtBlueSoft,
    palette.hairPinkSoft,
    palette.shirt,
    palette.hairBlondeSoft,
  ];
  const symbolAngle = FULL_TURN_RADIANS / symbols.length;

  for (let reelIndex = 0; reelIndex < reelPositions.length; reelIndex += 1) {
    const reelFrame = new THREE.Group();
    reelFrame.position.set(reelPositions[reelIndex], 0.52, 2.19);
    machine.add(reelFrame);
    addBox(reelFrame, [1.5, 0.16, 0.34], [0, 0.88, 0.15], goldMaterial);
    addBox(reelFrame, [1.5, 0.16, 0.34], [0, -0.88, 0.15], goldMaterial);
    addBox(reelFrame, [0.15, 1.6, 0.34], [-0.69, 0, 0.15], goldMaterial);
    addBox(reelFrame, [0.15, 1.6, 0.34], [0.69, 0, 0.15], goldMaterial);
    const reel = createReel(symbols, symbolBackgrounds, palette, renderer);
    reel.rotation.x = initialIndices[reelIndex] * symbolAngle;
    reelFrame.add(reel);
    reelGroups.push(reel);
  }

  addBox(machine, [6.58, 2, 0.76], [0, -2.16, 1.8], navyMaterial);
  addBox(machine, [5.8, 0.54, 0.3], [0, -1.62, 2.31], paleMaterial);
  addBox(machine, [5.8, 0.62, 0.3], [0, -2.27, 2.31], blueMaterial);
  const trayMaterial = createStandardMaterial(palette.hairBlonde, {
    metalness: 0.42,
    roughness: 0.22,
    emissive: palette.hairBlonde,
    emissiveIntensity: 0.06,
  });
  addBox(machine, [5.8, 0.42, 0.44], [0, -2.91, 2.32], trayMaterial);

  const leverPivotMaterial = createStandardMaterial(palette.hairPinkDark, {
    metalness: 0.6,
    roughness: 0.18,
    emissive: palette.hairPink,
    emissiveIntensity: 0.04,
  });
  const leverPivotGeometry = new THREE.CylinderGeometry(0.58, 0.66, 0.78, 36);
  leverPivotGeometry.rotateZ(Math.PI / 2);
  const leverPivot = applyShadows(
    new THREE.Mesh(leverPivotGeometry, leverPivotMaterial),
  );
  leverPivot.position.set(4.18, -0.18, 0.66);
  machine.add(leverPivot);

  const leverHandle = new THREE.Group();
  leverHandle.name = "three-dimensional-lever";
  leverHandle.position.set(4.58, -0.18, 0.66);
  leverHandle.rotation.x = LEVER_IDLE_ANGLE;
  machine.add(leverHandle);
  const armMaterial = createStandardMaterial(palette.shirt, {
    metalness: 0.84,
    roughness: 0.14,
    emissive: palette.shirt,
    emissiveIntensity: 0,
  });
  const leverArm = applyShadows(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.15, 2.38, 20),
      armMaterial,
    ),
  );
  leverArm.position.y = 1.17;
  leverHandle.add(leverArm);
  const knobMaterial = createStandardMaterial(palette.hairPink, {
    metalness: 0.22,
    roughness: 0.16,
    emissive: palette.hairPink,
    emissiveIntensity: 0.08,
  });
  const leverKnob = applyShadows(
    new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 22), knobMaterial),
  );
  leverKnob.position.y = 2.4;
  leverHandle.add(leverKnob);

  const tiger = createTigerModel(palette);
  tiger.position.set(-5, -2.7, 2.25);
  tiger.scale.setScalar(0.78);
  tiger.rotation.y = 0.18;
  scene.add(tiger);
  const jackpot = createJackpotPresentation(camera, palette, prizes);

  machine.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  return {
    armMaterial,
    bodyMaterial,
    bulbMaterials,
    goldMaterial,
    knobMaterial,
    leverArm,
    leverHandle,
    leverKnob,
    leverPivotMaterial,
    machine,
    jackpot,
    reelGroups,
    tiger,
    trayMaterial,
  };
}

function createCasinoRenderer(canvas, palette) {
  // Create a transparent WebGL2 renderer bound to the provided canvas.
  const context = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  if (context === null) {
    throw new Error("WebGL 2 is unavailable.");
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    context,
    alpha: true,
    antialias: true,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(new THREE.Color(palette.navyDeep), 0);
  return renderer;
}

function disposeScene(scene, renderer) {
  // Release each shared GPU resource exactly once.
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  scene.traverse((object) => {
    if (object.geometry) {
      geometries.add(object.geometry);
    }
    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of objectMaterials) {
      if (material) {
        materials.add(material);
        if (material.map) {
          textures.add(material.map);
        }
      }
    }
  });
  for (const texture of textures) {
    texture.dispose();
  }
  for (const material of materials) {
    material.dispose();
  }
  for (const geometry of geometries) {
    geometry.dispose();
  }
  renderer.dispose();
}

export function createCasino3D(options) {
  // Create and control the full-screen fixed-camera slot machine.
  const {
    canvas,
    palette,
    symbols,
    prizes,
    initialIndices,
    reducedMotion = false,
    onLeverActivate = () => {},
    onContextFailure = () => {},
  } = options;
  const renderer = createCasinoRenderer(canvas, palette);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
  camera.position.set(7.6, 5.15, 16.5);
  camera.lookAt(-0.15, -0.1, 0.25);
  scene.add(camera);

  const hemisphereLight = new THREE.HemisphereLight(
    new THREE.Color(palette.shirt),
    new THREE.Color(palette.navyDeep),
    2.35,
  );
  scene.add(hemisphereLight);
  const keyLight = new THREE.DirectionalLight(
    new THREE.Color(palette.shirt),
    4.5,
  );
  keyLight.position.set(5.5, 9, 10);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -9;
  keyLight.shadow.camera.right = 9;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -10;
  scene.add(keyLight);
  const pinkLight = new THREE.PointLight(
    new THREE.Color(palette.hairPink),
    18,
    20,
    2,
  );
  pinkLight.position.set(-5, 2.5, 7);
  scene.add(pinkLight);
  const goldLight = new THREE.PointLight(
    new THREE.Color(palette.hairBlonde),
    16,
    18,
    2,
  );
  goldLight.position.set(5, 4, 7);
  scene.add(goldLight);

  const floorMaterial = new THREE.ShadowMaterial({
    color: new THREE.Color(palette.navyDeep),
    opacity: 0.34,
    transparent: true,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 15), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -4.58, 0.5);
  floor.receiveShadow = true;
  scene.add(floor);

  const model = buildCasinoModel(
    scene,
    camera,
    renderer,
    palette,
    symbols,
    initialIndices,
    prizes,
  );
  const reelIndices = [...initialIndices];
  const symbolAngle = FULL_TURN_RADIANS / symbols.length;
  const reelRotations = initialIndices.map(
    (symbolIndex) => symbolIndex * symbolAngle,
  );
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const leverHitMeshes = [model.leverArm, model.leverKnob];
  let frameRequest = 0;
  let lastFrameTimestamp = 0;
  let isVisible = true;
  let isDisposed = false;
  let isLeverInteractive = true;
  let isLeverHovered = false;
  let isLeverFocused = false;
  let pointerStartedOnLever = false;
  let spinState = null;
  let celebrationState = null;
  let jackpotState = null;

  function renderOnce() {
    // Draw only while the containing dialog is visible.
    if (!isDisposed && isVisible) {
      renderer.render(scene, camera);
    }
  }

  function updateJackpotLayout(width, height) {
    // Refit every normalized model while the stage remains at screen center.
    let sharedLayout = null;
    for (const prize of model.jackpot.prizeModels.values()) {
      const size = prize.userData.modelSize;
      const previousScale = prize.userData.presentationScale || 1;
      const animationMultiplier = prize.scale.x / previousScale;
      const layout = calculatePrizePresentationLayout({
        viewportWidth: width,
        viewportHeight: height,
        verticalFovDegrees: camera.fov,
        modelWidth: size.x,
        modelHeight: size.y,
      });
      prize.userData.presentationScale = layout.scale;
      if (prize.visible) {
        prize.scale.setScalar(layout.scale * animationMultiplier);
      }
      sharedLayout = layout;
    }

    if (sharedLayout === null) {
      return;
    }

    model.jackpot.stage.position.set(...sharedLayout.position);
    model.jackpot.visibleHeight = sharedLayout.visibleHeight;
    model.jackpot.visibleWidth = sharedLayout.visibleWidth;
    const flashDepthRatio =
      (JACKPOT_STAGE_DISTANCE + Math.abs(model.jackpot.flash.position.z)) /
      JACKPOT_STAGE_DISTANCE;
    const backdropDepthRatio =
      (JACKPOT_STAGE_DISTANCE + Math.abs(model.jackpot.backdrop.position.z)) /
      JACKPOT_STAGE_DISTANCE;
    model.jackpot.backdrop.scale.set(
      sharedLayout.visibleWidth * backdropDepthRatio * 0.54,
      sharedLayout.visibleHeight * backdropDepthRatio * 0.54,
      1,
    );
    model.jackpot.flash.scale.set(
      sharedLayout.visibleWidth * flashDepthRatio * 0.54,
      sharedLayout.visibleHeight * flashDepthRatio * 0.54,
      1,
    );
    const rayRadius = Math.hypot(
      sharedLayout.visibleWidth,
      sharedLayout.visibleHeight,
    ) * 0.62;
    model.jackpot.rays.scale.setScalar(rayRadius);
    const haloScale = Math.min(
      sharedLayout.visibleWidth * 0.24,
      sharedLayout.visibleHeight * 0.26,
    );
    model.jackpot.halo.scale.setScalar(haloScale);
  }

  function resize() {
    // Preserve the whole cabinet in portrait, landscape, and desktop canvases.
    if (isDisposed) {
      return;
    }
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    const aspect = width / height;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = aspect;
    camera.fov = aspect < 0.75 ? 48 : aspect < 1.15 ? 40 : 33;
    const distanceScale = aspect < 0.75 ? 1.34 : aspect < 1.15 ? 1.16 : 1;
    camera.position.set(
      7.6 * distanceScale,
      5.15 * distanceScale,
      16.5 * distanceScale,
    );
    camera.lookAt(-0.15, -0.1, 0.25);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    updateJackpotLayout(width, height);
    renderOnce();
  }

  function requestFrame() {
    // Coalesce animation requests.
    if (frameRequest === 0 && !isDisposed && isVisible) {
      frameRequest = window.requestAnimationFrame(renderFrame);
    }
  }

  function setLeverGlow() {
    // Express hover and keyboard focus directly on the modeled control.
    const highlighted =
      isLeverInteractive && (isLeverHovered || isLeverFocused);
    model.leverPivotMaterial.emissiveIntensity = highlighted ? 0.9 : 0.04;
    model.knobMaterial.emissiveIntensity = highlighted ? 0.72 : 0.08;
    model.armMaterial.emissiveIntensity = highlighted ? 0.28 : 0;
    canvas.style.cursor =
      isLeverInteractive && isLeverHovered ? "pointer" : "default";
    renderOnce();
  }

  function pointerIntersectsLever(event) {
    // Raycast against only the moving arm and knob, never their rectangular area.
    if (!isLeverInteractive || spinState !== null || jackpotState !== null) {
      return false;
    }
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) {
      return false;
    }
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(leverHitMeshes, false).length > 0;
  }

  function handlePointerMove(event) {
    // Change pointer feedback only over real lever geometry.
    const nextHovered = pointerIntersectsLever(event);
    if (nextHovered !== isLeverHovered) {
      isLeverHovered = nextHovered;
      setLeverGlow();
    }
  }

  function handlePointerDown(event) {
    // Start an activation gesture only on the actual arm or knob.
    pointerStartedOnLever = pointerIntersectsLever(event);
    if (pointerStartedOnLever) {
      event.preventDefault();
      canvas.setPointerCapture?.(event.pointerId);
    }
  }

  function handlePointerUp(event) {
    // Activate only when the same precise gesture ends on the lever.
    const shouldActivate =
      pointerStartedOnLever && pointerIntersectsLever(event);
    pointerStartedOnLever = false;
    if (canvas.hasPointerCapture?.(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    if (shouldActivate) {
      event.preventDefault();
      onLeverActivate();
    }
  }

  function handlePointerLeave() {
    // Remove stale pointer feedback outside the canvas.
    pointerStartedOnLever = false;
    if (isLeverHovered) {
      isLeverHovered = false;
      setLeverGlow();
    }
  }

  function updateLever(elapsedMilliseconds) {
    // Pull the lever forward and down around its horizontal pivot.
    if (elapsedMilliseconds <= LEVER_PULL_DURATION_MS) {
      const progress = easeInOutCubic(
        elapsedMilliseconds / LEVER_PULL_DURATION_MS,
      );
      model.leverHandle.rotation.x = THREE.MathUtils.lerp(
        LEVER_IDLE_ANGLE,
        LEVER_PULLED_ANGLE,
        progress,
      );
      return;
    }
    if (
      elapsedMilliseconds <=
      LEVER_PULL_DURATION_MS + LEVER_HOLD_DURATION_MS
    ) {
      model.leverHandle.rotation.x = LEVER_PULLED_ANGLE;
      return;
    }
    const returnProgress = Math.min(
      1,
      (elapsedMilliseconds -
        LEVER_PULL_DURATION_MS -
        LEVER_HOLD_DURATION_MS) /
        LEVER_RETURN_DURATION_MS,
    );
    model.leverHandle.rotation.x = THREE.MathUtils.lerp(
      LEVER_PULLED_ANGLE,
      LEVER_IDLE_ANGLE,
      easeOutCubic(returnProgress),
    );
  }

  function updateTiger(timestamp, victory) {
    // Run the regular 30 fps dance or a stronger jackpot celebration.
    if (reducedMotion) {
      return;
    }
    const seconds = timestamp / 1000;
    const speed = victory ? 8.5 : 4.2;
    const strength = victory ? 1 : 0.48;
    const wave = Math.sin(seconds * speed);
    const counterWave = Math.sin(seconds * speed + Math.PI);
    model.tiger.position.y = -2.7 + Math.abs(wave) * 0.28 * strength;
    model.tiger.rotation.y = 0.18 + wave * 0.18 * strength;
    model.tiger.rotation.z = wave * 0.08 * strength;
    model.tiger.userData.head.rotation.z = -wave * 0.14 * strength;
    model.tiger.userData.leftArm.rotation.z = -0.45 - wave * 0.8 * strength;
    model.tiger.userData.rightArm.rotation.z =
      0.45 + counterWave * 0.8 * strength;
    model.tiger.userData.leftLeg.rotation.z = wave * 0.22 * strength;
    model.tiger.userData.rightLeg.rotation.z = counterWave * 0.22 * strength;
    model.tiger.userData.tail.rotation.z = wave * 0.3 * strength;
  }

  function updateParticles(timestamp) {
    // Reuse pooled sparks and confetti behind the camera-aligned prize.
    if (jackpotState === null || reducedMotion) {
      return;
    }
    const elapsedSeconds = (timestamp - jackpotState.startedAt) / 1000;
    const presentationWidth = model.jackpot.visibleWidth;
    const presentationHeight = model.jackpot.visibleHeight;
    for (let index = 0; index < model.jackpot.particles.length; index += 1) {
      const particle = model.jackpot.particles[index];
      const seed = particle.userData.seed;
      const cycle = (elapsedSeconds * (0.42 + (index % 5) * 0.035) + seed) % 1;
      const angle = seed * FULL_TURN_RADIANS * 5 + elapsedSeconds * 1.4;
      particle.position.set(
        Math.sin(angle) * presentationWidth * (0.22 + (index % 4) * 0.025),
        presentationHeight * (0.52 - cycle * 1.04),
        -0.08 - Math.abs(Math.cos(angle * 0.73)) * 0.18,
      );
      particle.rotation.set(
        angle * 1.3,
        angle * 0.9,
        angle * 1.7,
      );
    }

    for (let index = 0; index < model.jackpot.confetti.length; index += 1) {
      const piece = model.jackpot.confetti[index];
      const seed = piece.userData.seed;
      const cycle =
        (elapsedSeconds * (0.3 + (index % 4) * 0.025) + seed) % 1;
      piece.position.set(
        (seed - 0.5) * presentationWidth * 0.94 +
          Math.sin(elapsedSeconds * 2 + index) * presentationWidth * 0.025,
        presentationHeight * (0.58 - cycle * 1.16),
        -0.06 - (index % 5) * 0.025,
      );
      piece.rotation.set(
        elapsedSeconds * (1.4 + (index % 3) * 0.35),
        elapsedSeconds * (1.8 + (index % 4) * 0.28),
        elapsedSeconds * (2.1 + (index % 5) * 0.22),
      );
    }
  }

  function updateJackpot(timestamp) {
    // Raise or bounce the actual prize, then keep it floating until confirmation.
    if (jackpotState === null) {
      return;
    }
    const elapsed = timestamp - jackpotState.startedAt;
    const introDuration = jackpotState.isRepeat ? 450 : 1100;
    const introProgress = Math.min(1, elapsed / introDuration);
    const prize = jackpotState.prize;
    const presentationScale = prize.userData.presentationScale;

    if (reducedMotion) {
      prize.position.y = 0;
      prize.scale.setScalar(presentationScale);
      model.jackpot.halo.rotation.z = 0;
      model.jackpot.flashMaterial.opacity = 0;
      for (const bulbMaterial of model.bulbMaterials) {
        bulbMaterial.emissiveIntensity = 1.05;
      }
      model.trayMaterial.emissiveIntensity = 0.85;
      return;
    } else if (jackpotState.isRepeat) {
      const bounce = Math.sin(introProgress * Math.PI) * 0.36;
      prize.position.y = bounce;
      prize.scale.setScalar(presentationScale * (1 + bounce * 0.3));
    } else {
      prize.position.y = THREE.MathUtils.lerp(
        -model.jackpot.visibleHeight * 0.38,
        0,
        easeOutCubic(introProgress),
      );
      const scaleMultiplier = THREE.MathUtils.lerp(
        0.24,
        1,
        easeOutCubic(introProgress),
      );
      prize.scale.setScalar(presentationScale * scaleMultiplier);
    }

    if (!reducedMotion && introProgress >= 1) {
      prize.position.y = Math.sin(elapsed / 280) * 0.12;
      prize.rotation.y += 0.035;
      prize.scale.setScalar(
        presentationScale * (jackpotState.isRepeat ? 1.02 : 1),
      );
    }
    model.jackpot.halo.rotation.z = elapsed / 1000;
    model.jackpot.rays.rotation.z = -elapsed / 8000;
    model.jackpot.flashMaterial.opacity =
      elapsed < 850 ? 0.9 * (1 - easeOutCubic(elapsed / 850)) : 0;
    const rayOpacity = 0.25 + Math.abs(Math.sin(elapsed / 260)) * 0.16;
    for (const rayMaterial of model.jackpot.rayMaterials) {
      rayMaterial.opacity = rayOpacity;
    }
    const lightPulse = 1.05 + Math.sin(elapsed / 80) * 0.8;
    for (const bulbMaterial of model.bulbMaterials) {
      bulbMaterial.emissiveIntensity = Math.max(0.3, lightPulse);
    }
    model.trayMaterial.emissiveIntensity = 0.8 + Math.abs(Math.sin(elapsed / 95));
    updateParticles(timestamp);
  }

  function finishSpin(state) {
    // Snap all moving parts to exact indexed faces and resolve the promise.
    if (spinState !== state) {
      return;
    }
    for (let reelIndex = 0; reelIndex < model.reelGroups.length; reelIndex += 1) {
      model.reelGroups[reelIndex].rotation.x = state.targetRotations[reelIndex];
    }
    model.leverHandle.rotation.x = LEVER_IDLE_ANGLE;
    spinState = null;
    setLeverGlow();
    renderOnce();
    state.resolve();
  }

  function renderFrame(timestamp) {
    // Advance reels, prize effects, cabinet lights, and the dancing tiger.
    frameRequest = 0;
    if (!isVisible || isDisposed) {
      return;
    }
    const shouldUpdate =
      spinState !== null ||
      jackpotState !== null ||
      timestamp - lastFrameTimestamp >= DANCE_FRAME_INTERVAL_MS;

    if (shouldUpdate) {
      lastFrameTimestamp = timestamp;
      if (spinState !== null) {
        const elapsedMilliseconds = timestamp - spinState.startedAt;
        updateLever(Math.min(elapsedMilliseconds, LEVER_TOTAL_DURATION_MS));
        for (
          let reelIndex = 0;
          reelIndex < model.reelGroups.length;
          reelIndex += 1
        ) {
          const reelElapsed = elapsedMilliseconds - REEL_START_DELAY_MS;
          const progress = THREE.MathUtils.clamp(
            reelElapsed / spinState.durations[reelIndex],
            0,
            1,
          );
          model.reelGroups[reelIndex].rotation.x = THREE.MathUtils.lerp(
            spinState.startRotations[reelIndex],
            spinState.targetRotations[reelIndex],
            easeOutCubic(progress),
          );
        }
        const spinPulse = 0.55 + Math.sin(elapsedMilliseconds / 72) * 0.4;
        for (const bulbMaterial of model.bulbMaterials) {
          bulbMaterial.emissiveIntensity = Math.max(0.15, spinPulse);
        }
      }

      if (celebrationState !== null && jackpotState === null) {
        const elapsed = timestamp - celebrationState.startedAt;
        const progress = elapsed / celebrationState.duration;
        if (progress >= 1) {
          model.trayMaterial.emissiveIntensity = 0.06;
          celebrationState = null;
        } else {
          const glow = Math.abs(Math.sin(progress * Math.PI * 4));
          model.trayMaterial.emissiveIntensity =
            0.06 + glow * celebrationState.strength;
        }
      }

      updateTiger(timestamp, jackpotState !== null);
      updateJackpot(timestamp);
      renderOnce();
    }

    if (
      !reducedMotion ||
      spinState !== null ||
      celebrationState !== null
    ) {
      requestFrame();
    }
  }

  function spinTo(targetIndices, animationOptions) {
    // Rotate the physical reels to the page's authoritative result.
    const { durations, fullTurns, reducedMotion: skipMotion } = animationOptions;
    if (spinState !== null) {
      return Promise.reject(new Error("A casino spin is already running."));
    }
    const targetRotations = [];
    for (let reelIndex = 0; reelIndex < model.reelGroups.length; reelIndex += 1) {
      targetRotations.push(
        calculateReelTargetRotation(
          reelIndices[reelIndex],
          targetIndices[reelIndex],
          reelRotations[reelIndex],
          fullTurns[reelIndex],
          symbols.length,
        ),
      );
      reelIndices[reelIndex] = targetIndices[reelIndex];
      reelRotations[reelIndex] = targetRotations[reelIndex];
    }

    if (skipMotion) {
      for (let reelIndex = 0; reelIndex < model.reelGroups.length; reelIndex += 1) {
        model.reelGroups[reelIndex].rotation.x = targetRotations[reelIndex];
      }
      model.leverHandle.rotation.x = LEVER_IDLE_ANGLE;
      renderOnce();
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const totalDuration = REEL_START_DELAY_MS + Math.max(...durations);
      const state = {
        startedAt: performance.now(),
        startRotations: model.reelGroups.map((reel) => reel.rotation.x),
        targetRotations,
        durations,
        resolve,
      };
      spinState = state;
      window.setTimeout(() => finishSpin(state), totalDuration);
      requestFrame();
    });
  }

  function celebrate(kind, skipMotion) {
    // Pulse the physical payout tray for non-blocking outcomes.
    if (skipMotion) {
      renderOnce();
      return;
    }
    celebrationState = {
      startedAt: performance.now(),
      duration: kind === "prize" ? 1100 : 520,
      strength: 0.25,
    };
    requestFrame();
  }

  function showPrize(modelId, isRepeat, skipMotion) {
    // Present the matching real model and start the reusable victory system.
    for (const prize of model.jackpot.prizeModels.values()) {
      prize.visible = false;
      prize.position.set(0, 0, 0);
      prize.rotation.set(0, 0, 0);
    }
    const prize = model.jackpot.prizeModels.get(modelId);
    if (prize === undefined) {
      return;
    }
    prize.visible = true;
    prize.position.y =
      skipMotion || isRepeat ? 0 : -model.jackpot.visibleHeight * 0.38;
    prize.scale.setScalar(
      prize.userData.presentationScale * (skipMotion ? 1 : 0.24),
    );
    model.jackpot.stage.visible = true;
    model.jackpot.flash.visible = !skipMotion;
    model.jackpot.flashMaterial.opacity = skipMotion ? 0 : 0.9;
    model.jackpot.rays.visible = true;
    model.jackpot.halo.visible = true;
    model.jackpot.particleRoot.visible = !skipMotion;
    model.jackpot.confettiRoot.visible = !skipMotion;
    jackpotState = {
      startedAt: performance.now(),
      prize,
      isRepeat,
    };
    requestFrame();
    renderOnce();
  }

  function hidePrize() {
    // Reset the pooled prize presentation after explicit confirmation.
    jackpotState = null;
    model.jackpot.stage.visible = false;
    model.jackpot.flash.visible = false;
    model.jackpot.flashMaterial.opacity = 0;
    model.jackpot.rays.visible = false;
    model.jackpot.halo.visible = false;
    model.jackpot.particleRoot.visible = false;
    model.jackpot.confettiRoot.visible = false;
    for (const prize of model.jackpot.prizeModels.values()) {
      prize.visible = false;
    }
    for (const bulbMaterial of model.bulbMaterials) {
      bulbMaterial.emissiveIntensity = 0.72;
    }
    model.trayMaterial.emissiveIntensity = 0.06;
    setLeverGlow();
    renderOnce();
  }

  function setLeverFocus(isFocused) {
    // Transfer native keyboard focus feedback to the 3D lever.
    isLeverFocused = isFocused;
    setLeverGlow();
  }

  function setLeverInteractive(nextInteractive) {
    // Disable both raycasting and pointer feedback while play is unavailable.
    isLeverInteractive = nextInteractive;
    if (!isLeverInteractive) {
      isLeverHovered = false;
      pointerStartedOnLever = false;
    }
    setLeverGlow();
  }

  function setCollectionComplete(isComplete) {
    // Turn the completed cabinet gold and pink without changing its verdict.
    model.bodyMaterial.emissive.set(
      new THREE.Color(isComplete ? palette.hairBlonde : palette.hairPinkDark),
    );
    model.bodyMaterial.emissiveIntensity = isComplete ? 0.28 : 0.03;
    model.goldMaterial.emissiveIntensity = isComplete ? 0.34 : 0.06;
    renderOnce();
  }

  function setVisible(nextVisible) {
    // Pause all rendering while the dialog or browser tab is hidden.
    isVisible = nextVisible;
    if (isVisible) {
      resize();
      requestFrame();
    } else if (frameRequest !== 0) {
      window.cancelAnimationFrame(frameRequest);
      frameRequest = 0;
    }
  }

  function handleContextLost(event) {
    // Switch to the semantic fallback if the GPU context disappears.
    event.preventDefault();
    onContextFailure();
  }

  function dispose() {
    // Remove listeners, observer, frame, and every GPU resource.
    if (isDisposed) {
      return;
    }
    isDisposed = true;
    resizeObserver?.disconnect();
    if (resizeObserver === null) {
      window.removeEventListener("resize", resize);
    }
    if (frameRequest !== 0) {
      window.cancelAnimationFrame(frameRequest);
    }
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointerup", handlePointerUp);
    canvas.removeEventListener("pointercancel", handlePointerLeave);
    canvas.removeEventListener("pointerleave", handlePointerLeave);
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    disposeScene(scene, renderer);
  }

  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerLeave);
  canvas.addEventListener("pointerleave", handlePointerLeave);
  canvas.addEventListener("webglcontextlost", handleContextLost);
  const resizeObserver =
    typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  if (resizeObserver === null) {
    window.addEventListener("resize", resize);
  } else {
    resizeObserver.observe(canvas);
  }
  resize();
  requestFrame();

  return {
    celebrate,
    dispose,
    hidePrize,
    resize,
    setCollectionComplete,
    setLeverFocus,
    setLeverInteractive,
    setVisible,
    showPrize,
    spinTo,
  };
}

export function createAchievements3D(options) {
  // Build one responsive WebGL gallery aligned to five native HTML slots.
  const {
    canvas,
    palette,
    prizes,
    slots,
    unlockedIds,
    reducedMotion = false,
    onContextFailure = () => {},
  } = options;
  const renderer = createCasinoRenderer(canvas, palette);
  renderer.shadowMap.enabled = false;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 1, 2000);
  camera.position.set(0, 0, 1000);
  const ambientLight = new THREE.HemisphereLight(
    new THREE.Color(palette.shirt),
    new THREE.Color(palette.navyDeep),
    2.7,
  );
  scene.add(ambientLight);
  const keyLight = new THREE.DirectionalLight(
    new THREE.Color(palette.shirt),
    4.2,
  );
  keyLight.position.set(100, 400, 600);
  scene.add(keyLight);
  const pinkLight = new THREE.PointLight(
    new THREE.Color(palette.hairPink),
    10,
    1200,
    1.5,
  );
  scene.add(pinkLight);
  const goldLight = new THREE.PointLight(
    new THREE.Color(palette.hairBlonde),
    9,
    1200,
    1.5,
  );
  scene.add(goldLight);

  const unlockedSet = new Set(unlockedIds);
  const items = new Map();
  for (let prizeIndex = 0; prizeIndex < prizes.length; prizeIndex += 1) {
    const prize = prizes[prizeIndex];
    const root = new THREE.Group();
    const pedestal = createPedestal(palette);
    const mystery = createMysteryPrize(palette);
    const model = createPrizeModel(prize.modelId, palette);
    mystery.position.y = -0.05;
    model.position.y = -0.08;
    root.add(pedestal, mystery, model);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(palette.hairBlonde),
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.065, 10, 48),
      glowMaterial,
    );
    glow.position.set(0, 0.25, -0.4);
    glow.visible = false;
    root.add(glow);
    scene.add(root);
    const isUnlocked = unlockedSet.has(prize.id);
    mystery.visible = !isUnlocked;
    model.visible = isUnlocked;
    items.set(prize.id, {
      glow,
      model,
      mystery,
      prize,
      root,
      slot: slots[prizeIndex],
    });
  }

  let frameRequest = 0;
  let isVisible = true;
  let isDisposed = false;
  let lastFrameTimestamp = 0;
  let highlighted = null;

  function renderOnce() {
    // Draw the gallery only while its full-screen dialog is visible.
    if (!isDisposed && isVisible) {
      renderer.render(scene, camera);
    }
  }

  function resize() {
    // Align every procedural pedestal to its responsive HTML slot.
    if (isDisposed) {
      return;
    }
    const canvasBounds = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(canvasBounds.width));
    const height = Math.max(1, Math.round(canvasBounds.height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    camera.left = 0;
    camera.right = width;
    camera.top = height;
    camera.bottom = 0;
    camera.updateProjectionMatrix();
    keyLight.position.set(width * 0.2, height * 0.9, 650);
    pinkLight.position.set(width * 0.08, height * 0.5, 320);
    goldLight.position.set(width * 0.92, height * 0.65, 320);

    for (const item of items.values()) {
      const modelSpace = item.slot.querySelector(".achievement-model-space");
      const bounds = modelSpace.getBoundingClientRect();
      const centerX = bounds.left - canvasBounds.left + bounds.width / 2;
      const centerY =
        height - (bounds.top - canvasBounds.top + bounds.height / 2);
      const scale = Math.max(10, Math.min(bounds.width, bounds.height) / 3.25);
      item.root.position.set(centerX, centerY - scale * 0.08, 0);
      item.root.scale.setScalar(scale);
    }
    renderOnce();
  }

  function requestFrame() {
    // Coalesce low-rate gallery animation frames.
    if (frameRequest === 0 && !isDisposed && isVisible) {
      frameRequest = window.requestAnimationFrame(renderFrame);
    }
  }

  function renderFrame(timestamp) {
    // Float unlocked prizes at 20 fps and animate only the active reveal.
    frameRequest = 0;
    if (!isVisible || isDisposed) {
      return;
    }
    if (timestamp - lastFrameTimestamp >= GALLERY_FRAME_INTERVAL_MS) {
      lastFrameTimestamp = timestamp;
      for (const item of items.values()) {
        if (item.model.visible) {
          if (!reducedMotion) {
            item.model.rotation.y += 0.025;
            item.model.position.y =
              -0.08 + Math.sin(timestamp / 520 + item.root.position.x) * 0.06;
          }
        }
      }

      if (highlighted !== null) {
        const elapsed = timestamp - highlighted.startedAt;
        const progress = Math.min(1, elapsed / highlighted.duration);
        const item = highlighted.item;
        if (highlighted.reducedMotion) {
          item.glow.visible = true;
        } else if (highlighted.isNew) {
          item.model.position.y =
            -0.08 - (1 - easeOutCubic(progress)) * 1.35;
          const scale = THREE.MathUtils.lerp(
            0.25,
            1,
            easeOutCubic(progress),
          );
          item.model.scale.setScalar(scale);
          item.glow.rotation.z += 0.12;
        } else {
          const bounce = Math.sin(progress * Math.PI) * 0.32;
          item.model.scale.setScalar(1 + bounce);
          item.glow.rotation.z += 0.2;
        }

        if (progress >= 1) {
          item.model.scale.setScalar(1);
          item.glow.visible = false;
          highlighted = null;
        }
      }
      renderOnce();
    }

    if (!reducedMotion || highlighted !== null) {
      requestFrame();
    }
  }

  function setUnlocked(nextUnlockedIds) {
    // Reveal only models whose stable prize IDs are known as unlocked.
    const nextUnlocked = new Set(nextUnlockedIds);
    for (const [prizeId, item] of items) {
      const isUnlocked = nextUnlocked.has(prizeId);
      item.model.visible = isUnlocked;
      item.mystery.visible = !isUnlocked;
    }
    renderOnce();
    requestFrame();
  }

  function highlightPrize(prizeId, isNew, skipMotion) {
    // Raise a new trophy for 1.1 s or bounce a repeat for 450 ms.
    const item = items.get(prizeId);
    if (item === undefined) {
      return;
    }
    item.model.visible = true;
    item.mystery.visible = false;
    item.model.scale.setScalar(1);
    item.glow.visible = true;
    highlighted = {
      duration: isNew ? 1100 : 450,
      isNew,
      item,
      reducedMotion: skipMotion,
      startedAt: performance.now(),
    };
    if (skipMotion) {
      renderOnce();
      window.setTimeout(() => {
        if (highlighted?.item === item) {
          item.glow.visible = false;
          highlighted = null;
          renderOnce();
        }
      }, isNew ? 1100 : 450);
    } else {
      requestFrame();
    }
  }

  function setVisible(nextVisible) {
    // Stop the 20 fps gallery loop while hidden.
    isVisible = nextVisible;
    if (isVisible) {
      resize();
      requestFrame();
    } else if (frameRequest !== 0) {
      window.cancelAnimationFrame(frameRequest);
      frameRequest = 0;
    }
  }

  function handleContextLost(event) {
    // Let the page switch to its readable fallback.
    event.preventDefault();
    onContextFailure();
  }

  function dispose() {
    // Release listeners, observer, frame, and gallery GPU resources.
    if (isDisposed) {
      return;
    }
    isDisposed = true;
    resizeObserver?.disconnect();
    if (resizeObserver === null) {
      window.removeEventListener("resize", resize);
    }
    if (frameRequest !== 0) {
      window.cancelAnimationFrame(frameRequest);
    }
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    disposeScene(scene, renderer);
  }

  canvas.addEventListener("webglcontextlost", handleContextLost);
  const resizeObserver =
    typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  if (resizeObserver === null) {
    window.addEventListener("resize", resize);
  } else {
    resizeObserver.observe(canvas);
  }
  resize();
  requestFrame();

  return {
    dispose,
    highlightPrize,
    resize,
    setUnlocked,
    setVisible,
  };
}
