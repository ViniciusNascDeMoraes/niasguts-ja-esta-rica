import * as THREE from "./assets/vendor/three.module.min.mjs";

const FULL_TURN_RADIANS = Math.PI * 2;
const SYMBOL_ANGLE_RADIANS = FULL_TURN_RADIANS / 6;
const LEVER_IDLE_ANGLE = THREE.MathUtils.degToRad(-10);
const LEVER_PULLED_ANGLE = THREE.MathUtils.degToRad(150);
const LEVER_PULL_DURATION_MS = 340;
const LEVER_HOLD_DURATION_MS = 120;
const LEVER_RETURN_DURATION_MS = 440;
const LEVER_TOTAL_DURATION_MS =
  LEVER_PULL_DURATION_MS + LEVER_HOLD_DURATION_MS + LEVER_RETURN_DURATION_MS;
const REEL_START_DELAY_MS = 300;

function easeInOutCubic(progress) {
  // Ease a normalized value without overshooting either endpoint.
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function easeOutCubic(progress) {
  // Decelerate a normalized value toward its endpoint.
  return 1 - Math.pow(1 - progress, 3);
}

export function calculateReelTargetRotation(
  currentIndex,
  targetIndex,
  currentRotation,
  fullTurns,
  symbolCount,
) {
  // Spin backward through full turns and finish with the target face forward.
  const symbolAngleRadians = FULL_TURN_RADIANS / symbolCount;
  const backwardSteps =
    (currentIndex - targetIndex + symbolCount) % symbolCount;
  return currentRotation -
    fullTurns * FULL_TURN_RADIANS -
    backwardSteps * symbolAngleRadians;
}

function createStandardMaterial(color, options = {}) {
  // Create one glossy material from the shared site palette.
  const materialOptions = {
    color,
    metalness: options.metalness ?? 0.12,
    roughness: options.roughness ?? 0.34,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
  };

  if (options.emissive !== undefined) {
    materialOptions.emissive = options.emissive;
    materialOptions.emissiveIntensity = options.emissiveIntensity ?? 0;
  }

  return new THREE.MeshStandardMaterial(materialOptions);
}

function addBox(parent, name, size, position, material) {
  // Add a named rectangular machine part to a parent object.
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    material,
  );
  mesh.name = name;
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function createSymbolTexture(
  character,
  background,
  foreground,
  highlight,
  renderer,
) {
  // Draw one high-resolution reel symbol onto a local canvas texture.
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 384;
  textureCanvas.height = 384;
  const context = textureCanvas.getContext("2d");

  if (context === null) {
    throw new Error("Canvas 2D is unavailable for the reel symbols.");
  }

  context.fillStyle = background;
  context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
  context.fillStyle = highlight;
  context.beginPath();
  context.ellipse(132, 92, 106, 66, -0.3, 0, FULL_TURN_RADIANS);
  context.fill();
  context.fillStyle = foreground;
  context.font = character === "7"
    ? '900 245px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif'
    : '230px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
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
  // Build one physical cylinder with six tangent symbol plates.
  const reel = new THREE.Group();
  const drumMaterial = createStandardMaterial(palette.hairBlondeSoft, {
    metalness: 0.08,
    roughness: 0.42,
  });
  const capMaterial = createStandardMaterial(palette.navy, {
    metalness: 0.48,
    roughness: 0.24,
  });
  const drumGeometry = new THREE.CylinderGeometry(0.88, 0.88, 1.3, 48, 1, false);
  drumGeometry.rotateZ(Math.PI / 2);
  const drum = new THREE.Mesh(drumGeometry, [drumMaterial, capMaterial, capMaterial]);
  drum.castShadow = true;
  drum.receiveShadow = true;
  reel.add(drum);

  for (let symbolIndex = 0; symbolIndex < symbols.length; symbolIndex += 1) {
    const angle = symbolIndex * SYMBOL_ANGLE_RADIANS;
    const texture = createSymbolTexture(
      symbols[symbolIndex],
      symbolBackgrounds[symbolIndex],
      palette.navyDeep,
      palette.casinoGlass,
      renderer,
    );
    const plateMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.02,
      roughness: 0.38,
    });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.82), plateMaterial);
    plate.position.set(0, Math.sin(angle) * 0.91, Math.cos(angle) * 0.91);
    plate.rotation.x = -angle;
    plate.castShadow = true;
    reel.add(plate);
  }

  return reel;
}

function buildCasinoModel(scene, renderer, palette, symbols, initialIndices) {
  // Assemble the complete stylized slot machine from procedural meshes.
  const machine = new THREE.Group();
  machine.name = "Tigrinho da Barista";
  machine.position.x = -0.35;
  scene.add(machine);

  const bodyMaterial = createStandardMaterial(palette.hairPink, {
    metalness: 0.24,
    roughness: 0.26,
  });
  const darkPinkMaterial = createStandardMaterial(palette.hairPinkDark, {
    metalness: 0.32,
    roughness: 0.28,
  });
  const navyMaterial = createStandardMaterial(palette.navyDeep, {
    metalness: 0.3,
    roughness: 0.3,
  });
  const blueMaterial = createStandardMaterial(palette.navy, {
    metalness: 0.24,
    roughness: 0.32,
  });
  const goldMaterial = createStandardMaterial(palette.hairBlonde, {
    metalness: 0.5,
    roughness: 0.22,
  });
  const paleMaterial = createStandardMaterial(palette.shirt, {
    metalness: 0.04,
    roughness: 0.38,
  });

  addBox(machine, "cabinet-body", [7.25, 7.8, 2.85], [0, 0, 0], bodyMaterial);
  addBox(machine, "cabinet-right-depth", [0.42, 7.45, 3.22], [3.72, -0.02, -0.08], darkPinkMaterial);
  addBox(machine, "cabinet-top", [7.65, 0.46, 3.35], [0.04, 4.05, -0.02], goldMaterial);
  addBox(machine, "cabinet-base", [7.85, 0.62, 3.5], [0.04, -4.03, 0], navyMaterial);
  addBox(machine, "cabinet-foot", [7.4, 0.28, 3.2], [0.02, -4.42, -0.08], darkPinkMaterial);

  addBox(machine, "marquee-shell", [7.05, 2.12, 0.58], [0, 2.92, 1.62], darkPinkMaterial);
  addBox(machine, "marquee-face", [6.5, 1.62, 0.3], [0, 2.96, 2.04], navyMaterial);
  addBox(machine, "marquee-lip", [6.72, 0.18, 0.64], [0, 1.94, 1.92], goldMaterial);

  const bulbMaterials = [];
  for (let bulbIndex = 0; bulbIndex < 9; bulbIndex += 1) {
    const isPinkBulb = bulbIndex % 2 === 1;
    const bulbColor = isPinkBulb ? palette.hairPink : palette.hairBlonde;
    const bulbMaterial = createStandardMaterial(bulbColor, {
      metalness: 0.05,
      roughness: 0.18,
      emissive: new THREE.Color(bulbColor),
      emissiveIntensity: 0.75,
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), bulbMaterial);
    bulb.position.set(-2.5 + bulbIndex * 0.625, 3.56, 2.29);
    bulb.castShadow = true;
    machine.add(bulb);
    bulbMaterials.push(bulbMaterial);
  }

  addBox(machine, "reel-bank", [5.72, 2.42, 0.54], [-0.45, 0.47, 1.63], navyMaterial);
  addBox(machine, "reel-bank-inset", [5.34, 1.95, 0.3], [-0.45, 0.48, 2.02], blueMaterial);

  const reelGroups = [];
  const reelPositions = [-2.12, -0.45, 1.22];
  const symbolBackgrounds = [
    palette.hairBlondeSoft,
    palette.shirt,
    palette.skirtBlueSoft,
    palette.hairPinkSoft,
    palette.shirt,
    palette.hairBlondeSoft,
  ];

  for (let reelIndex = 0; reelIndex < reelPositions.length; reelIndex += 1) {
    const reelFrame = new THREE.Group();
    reelFrame.position.set(reelPositions[reelIndex], 0.5, 2.14);
    machine.add(reelFrame);

    addBox(reelFrame, "reel-frame-top", [1.5, 0.16, 0.34], [0, 0.87, 0.16], goldMaterial);
    addBox(reelFrame, "reel-frame-bottom", [1.5, 0.16, 0.34], [0, -0.87, 0.16], goldMaterial);
    addBox(reelFrame, "reel-frame-left", [0.15, 1.58, 0.34], [-0.68, 0, 0.16], goldMaterial);
    addBox(reelFrame, "reel-frame-right", [0.15, 1.58, 0.34], [0.68, 0, 0.16], goldMaterial);

    const reel = createReel(symbols, symbolBackgrounds, palette, renderer);
    reel.rotation.x = initialIndices[reelIndex] * SYMBOL_ANGLE_RADIANS;
    reelFrame.add(reel);
    reelGroups.push(reel);
  }

  addBox(machine, "control-deck", [6.56, 1.98, 0.72], [0, -2.16, 1.78], navyMaterial);
  addBox(machine, "result-screen", [5.78, 0.54, 0.28], [0, -1.62, 2.26], paleMaterial);
  addBox(machine, "audio-panel", [5.78, 0.62, 0.28], [0, -2.27, 2.27], blueMaterial);
  const trayMaterial = createStandardMaterial(palette.hairBlonde, {
    metalness: 0.38,
    roughness: 0.24,
    emissive: new THREE.Color(palette.hairBlonde),
    emissiveIntensity: 0.05,
  });
  addBox(machine, "prize-tray", [5.78, 0.42, 0.42], [0, -2.91, 2.27], trayMaterial);

  const leverPivotMaterial = createStandardMaterial(palette.hairPinkDark, {
    metalness: 0.58,
    roughness: 0.2,
    emissive: new THREE.Color(palette.hairPink),
    emissiveIntensity: 0.05,
  });
  const leverPivotGeometry = new THREE.CylinderGeometry(0.55, 0.63, 0.72, 32);
  leverPivotGeometry.rotateZ(Math.PI / 2);
  const leverPivot = new THREE.Mesh(leverPivotGeometry, leverPivotMaterial);
  leverPivot.position.set(4.18, -0.2, 0.66);
  leverPivot.castShadow = true;
  machine.add(leverPivot);

  const leverHandle = new THREE.Group();
  leverHandle.name = "three-dimensional-lever";
  leverHandle.position.set(4.55, -0.2, 0.66);
  leverHandle.rotation.x = LEVER_IDLE_ANGLE;
  machine.add(leverHandle);

  const armGeometry = new THREE.CylinderGeometry(0.11, 0.14, 2.35, 18);
  const armMaterial = createStandardMaterial(palette.shirt, {
    metalness: 0.82,
    roughness: 0.16,
  });
  const leverArm = new THREE.Mesh(armGeometry, armMaterial);
  leverArm.position.y = 1.16;
  leverArm.castShadow = true;
  leverHandle.add(leverArm);

  const knobMaterial = createStandardMaterial(palette.hairPink, {
    metalness: 0.22,
    roughness: 0.18,
    emissive: new THREE.Color(palette.hairPinkDark),
    emissiveIntensity: 0.08,
  });
  const leverKnob = new THREE.Mesh(new THREE.SphereGeometry(0.46, 32, 22), knobMaterial);
  leverKnob.position.y = 2.36;
  leverKnob.castShadow = true;
  leverHandle.add(leverKnob);

  const sideStripe = addBox(
    machine,
    "side-stripe",
    [0.12, 5.8, 0.45],
    [3.97, 0.15, -0.38],
    goldMaterial,
  );
  sideStripe.rotation.y = Math.PI / 18;

  machine.traverse((object) => {
    // Mark every modeled surface for the shared light and shadow setup.
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  return {
    machine,
    reelGroups,
    bulbMaterials,
    leverHandle,
    leverPivotMaterial,
    knobMaterial,
    trayMaterial,
  };
}

export function createCasino3D(options) {
  // Create and control one fixed-camera WebGL slot machine.
  const {
    canvas,
    palette,
    symbols,
    initialIndices,
    onContextFailure = () => {},
  } = options;
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

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
  camera.position.set(7.4, 5.1, 15.8);
  camera.lookAt(-0.25, -0.05, 0.25);

  const hemisphereLight = new THREE.HemisphereLight(
    new THREE.Color(palette.shirt),
    new THREE.Color(palette.navyDeep),
    2.3,
  );
  scene.add(hemisphereLight);

  const keyLight = new THREE.DirectionalLight(new THREE.Color(palette.shirt), 4.4);
  keyLight.position.set(5.5, 9, 10);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -8;
  keyLight.shadow.camera.right = 8;
  keyLight.shadow.camera.top = 9;
  keyLight.shadow.camera.bottom = -9;
  scene.add(keyLight);

  const pinkLight = new THREE.PointLight(new THREE.Color(palette.hairPink), 18, 18, 2);
  pinkLight.position.set(-5, 2.5, 7);
  scene.add(pinkLight);

  const goldLight = new THREE.PointLight(new THREE.Color(palette.hairBlonde), 15, 16, 2);
  goldLight.position.set(5, 4, 6);
  scene.add(goldLight);

  const floorMaterial = new THREE.ShadowMaterial({
    color: new THREE.Color(palette.navyDeep),
    opacity: 0.3,
    transparent: true,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -4.57, 0.5);
  floor.receiveShadow = true;
  scene.add(floor);

  const model = buildCasinoModel(scene, renderer, palette, symbols, initialIndices);
  const reelIndices = [...initialIndices];
  const reelRotations = initialIndices.map(
    (symbolIndex) => symbolIndex * SYMBOL_ANGLE_RADIANS,
  );
  let frameRequest = 0;
  let isVisible = true;
  let spinState = null;
  let celebrationState = null;
  let isDisposed = false;

  function resize() {
    // Match the renderer and camera to the displayed canvas dimensions.
    if (isDisposed) {
      return;
    }

    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderOnce();
  }

  function renderOnce() {
    // Draw the current scene only while its modal is visible.
    if (!isDisposed && isVisible) {
      renderer.render(scene, camera);
    }
  }

  function requestFrame() {
    // Schedule one animation frame when no frame is already pending.
    if (frameRequest === 0 && !isDisposed) {
      frameRequest = window.requestAnimationFrame(renderFrame);
    }
  }

  function updateLever(elapsedMilliseconds) {
    // Move the handle through a forward-and-down physical pull arc.
    if (elapsedMilliseconds <= LEVER_PULL_DURATION_MS) {
      const progress = easeInOutCubic(elapsedMilliseconds / LEVER_PULL_DURATION_MS);
      model.leverHandle.rotation.x = THREE.MathUtils.lerp(
        LEVER_IDLE_ANGLE,
        LEVER_PULLED_ANGLE,
        progress,
      );
      return;
    }

    if (elapsedMilliseconds <= LEVER_PULL_DURATION_MS + LEVER_HOLD_DURATION_MS) {
      model.leverHandle.rotation.x = LEVER_PULLED_ANGLE;
      return;
    }

    const returnProgress = Math.min(
      1,
      (elapsedMilliseconds - LEVER_PULL_DURATION_MS - LEVER_HOLD_DURATION_MS) /
        LEVER_RETURN_DURATION_MS,
    );
    model.leverHandle.rotation.x = THREE.MathUtils.lerp(
      LEVER_PULLED_ANGLE,
      LEVER_IDLE_ANGLE,
      easeOutCubic(returnProgress),
    );
  }

  function finishSpin(state) {
    // Snap every moving part to its exact final state and resolve the spin.
    if (spinState !== state) {
      return;
    }

    for (let reelIndex = 0; reelIndex < model.reelGroups.length; reelIndex += 1) {
      model.reelGroups[reelIndex].rotation.x = state.targetRotations[reelIndex];
    }
    model.leverHandle.rotation.x = LEVER_IDLE_ANGLE;
    spinState = null;
    renderOnce();
    state.resolve();
  }

  function renderFrame(timestamp) {
    // Advance active reel, lever, and light animations before drawing a frame.
    frameRequest = 0;
    let needsAnotherFrame = false;

    if (spinState !== null) {
      const elapsedMilliseconds = timestamp - spinState.startedAt;
      updateLever(Math.min(elapsedMilliseconds, LEVER_TOTAL_DURATION_MS));

      for (let reelIndex = 0; reelIndex < model.reelGroups.length; reelIndex += 1) {
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

      const pulse = 0.55 + Math.sin(elapsedMilliseconds / 75) * 0.4;
      for (const bulbMaterial of model.bulbMaterials) {
        bulbMaterial.emissiveIntensity = Math.max(0.15, pulse);
      }
      needsAnotherFrame = true;
    }

    if (celebrationState !== null) {
      const celebrationElapsed = timestamp - celebrationState.startedAt;
      const celebrationProgress = celebrationElapsed / celebrationState.duration;

      if (celebrationProgress >= 1) {
        model.trayMaterial.emissiveIntensity = 0.05;
        celebrationState = null;
      } else {
        const glow = Math.abs(Math.sin(celebrationProgress * Math.PI * 5));
        model.trayMaterial.emissiveIntensity = celebrationState.isPrize
          ? 0.18 + glow * 1.6
          : 0.05 + glow * 0.2;
        needsAnotherFrame = true;
      }
    }

    renderOnce();

    if (needsAnotherFrame) {
      requestFrame();
    }
  }

  function spinTo(targetIndices, animationOptions) {
    // Rotate all reels to an authoritative outcome supplied by the page logic.
    const { durations, fullTurns, reducedMotion } = animationOptions;

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

    if (reducedMotion) {
      for (let reelIndex = 0; reelIndex < model.reelGroups.length; reelIndex += 1) {
        model.reelGroups[reelIndex].rotation.x = targetRotations[reelIndex];
      }
      model.leverHandle.rotation.x = LEVER_IDLE_ANGLE;
      renderOnce();
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      // Keep the timer authoritative even when browser animation frames are throttled.
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

  function celebrate(isPrize, reducedMotion) {
    // Pulse the physical payout tray without transforming the HTML text layer.
    if (reducedMotion) {
      model.trayMaterial.emissiveIntensity = isPrize ? 0.8 : 0.05;
      renderOnce();
      model.trayMaterial.emissiveIntensity = 0.05;
      return;
    }

    celebrationState = {
      startedAt: performance.now(),
      duration: isPrize ? 1100 : 380,
      isPrize,
    };
    requestFrame();
  }

  function setLeverFocus(isFocused) {
    // Highlight the rendered lever when its accessible HTML control has focus.
    const intensity = isFocused ? 0.75 : 0.05;
    model.leverPivotMaterial.emissiveIntensity = intensity;
    model.knobMaterial.emissiveIntensity = isFocused ? 0.48 : 0.08;
    renderOnce();
  }

  function setVisible(nextVisible) {
    // Pause static rendering while keeping any authoritative spin timer alive.
    isVisible = nextVisible;
    if (isVisible) {
      resize();
      requestFrame();
    }
  }

  function dispose() {
    // Release renderer, observer, geometries, textures, and materials.
    if (isDisposed) {
      return;
    }

    isDisposed = true;
    resizeObserver.disconnect();
    if (frameRequest !== 0) {
      window.cancelAnimationFrame(frameRequest);
    }

    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    scene.traverse((object) => {
      // Collect each shared GPU resource exactly once before disposal.
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

  canvas.addEventListener("webglcontextlost", (event) => {
    // Switch the page to its semantic fallback if the GPU context disappears.
    event.preventDefault();
    onContextFailure();
  });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  return {
    celebrate,
    dispose,
    resize,
    setLeverFocus,
    setVisible,
    spinTo,
  };
}
