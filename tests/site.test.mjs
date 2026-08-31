import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const prizeIds = [
  "esposa-nenepira",
  "prima-vaper",
  "bolos",
  "350-reais",
  "lanche-subway",
];

class FakeClassList {
  // Store CSS classes for behavior tests without a browser DOM.
  constructor() {
    this.values = new Set();
  }

  add(...names) {
    for (const name of names) {
      this.values.add(name);
    }
  }

  remove(...names) {
    for (const name of names) {
      this.values.delete(name);
    }
  }

  toggle(name, force) {
    if (force === true) {
      this.values.add(name);
      return true;
    }
    if (force === false) {
      this.values.delete(name);
      return false;
    }
    if (this.values.has(name)) {
      this.values.delete(name);
      return false;
    }
    this.values.add(name);
    return true;
  }

  contains(name) {
    return this.values.has(name);
  }
}

class FakeElement {
  // Provide the DOM surface used by the static page script.
  constructor(name = "element", dataset = {}) {
    this.name = name;
    this.attributes = new Map();
    this.classList = new FakeClassList();
    this.listeners = new Map();
    this.style = {};
    this.childrenBySelector = new Map();
    this.dataset = dataset;
    this.textContent = "";
    this.hidden = false;
    this.open = false;
    this.disabled = false;
    this.isContentEditable = false;
    this.offsetWidth = 100;
    this.value = "";
    this.focused = false;
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(listener);
  }

  dispatch(type, overrides = {}) {
    const event = {
      type,
      target: this,
      key: "",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      shiftKey: false,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      ...overrides,
    };
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
    return event;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  querySelector(selector) {
    if (!this.childrenBySelector.has(selector)) {
      this.childrenBySelector.set(selector, new FakeElement(selector));
    }
    return this.childrenBySelector.get(selector);
  }

  replaceChildren(...children) {
    this.replacementChildren = children;
  }

  append(...children) {
    this.appendedChildren = [...(this.appendedChildren ?? []), ...children];
  }

  matches(selector) {
    return selector.split(",").some((part) => part.trim() === this.name);
  }

  focus() {
    this.focused = true;
  }

  getBoundingClientRect() {
    return {
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
    };
  }

  showModal() {
    this.open = true;
  }

  close() {
    this.open = false;
    this.dispatch("close");
  }
}

class FakeImage extends FakeElement {
  // Resolve local sprite requests deterministically, with optional manual delay.
  constructor(autoLoad = true) {
    super("img");
    this.autoLoad = autoLoad;
    this.complete = false;
    this.naturalWidth = 0;
    this.source = "";
  }

  set src(value) {
    this.source = String(value);
    if (this.autoLoad) {
      this.resolveLoad();
    }
  }

  get src() {
    return this.source;
  }

  resolveLoad() {
    if (this.complete) {
      return;
    }
    this.complete = true;
    this.naturalWidth = 1024;
    this.dispatch("load");
  }

  decode() {
    return Promise.resolve();
  }
}

function createPageHarness(options = {}) {
  // Execute the real application script against a deterministic fake page.
  const elements = new Map();
  const achievementSlots = prizeIds.map(
    (prizeId, index) =>
      new FakeElement("achievement-" + index, { prizeId }),
  );
  const fallbackReels = [
    new FakeElement("fallback-0"),
    new FakeElement("fallback-1"),
    new FakeElement("fallback-2"),
  ];
  const classroomAnswerButtons = [
    new FakeElement("classroom-answer-0", { choiceIndex: "0" }),
    new FakeElement("classroom-answer-1", { choiceIndex: "1" }),
    new FakeElement("classroom-answer-2", { choiceIndex: "2" }),
  ];
  const createdImages = [];
  class HarnessImage extends FakeImage {
    constructor() {
      super(options.imagesAutoLoad !== false);
      createdImages.push(this);
    }
  }
  const releaseEntries = Array.from(
    { length: 27 },
    (_, index) => new FakeElement("release-" + index),
  );
  const audio = new FakeElement("casino-music");
  audio.paused = true;
  audio.ended = false;
  audio.volume = 0;
  audio.currentTime = 0;
  audio.play = async () => {
    audio.paused = false;
    audio.dispatch("play");
  };
  audio.pause = () => {
    audio.paused = true;
    audio.dispatch("pause");
  };

  function getElement(selector) {
    if (!elements.has(selector)) {
      elements.set(selector, new FakeElement(selector));
    }
    return elements.get(selector);
  }

  elements.set("#casino-music", audio);
  const classroomFinaleImage = new FakeImage(
    options.finaleAutoLoad !== false,
  );
  elements.set("#classroom-finale-image", classroomFinaleImage);
  getElement("#casino-volume").value = "25";
  getElement("#casino-result-flash").hidden = true;
  getElement("#casino-logo").dataset.src =
    "assets/images/casino/nanabet-logo.png";
  getElement("#casino-logo").hidden = true;
  getElement("#casino-chip-balance").dataset.src =
    "assets/images/casino/casino-chip.png";
  getElement("#casino-chip-balance").hidden = true;
  getElement("#casino-chip-rule").dataset.src =
    "assets/images/casino/casino-chip.png";
  getElement("#casino-chip-rule").hidden = true;
  getElement("#casino-gift-rule").dataset.src =
    "assets/images/casino/symbol-gift.png";
  getElement("#casino-gift-rule").hidden = true;
  getElement("#achievements-background-portrait").dataset.srcset =
    "assets/images/casino/achievements-room-portrait.png";
  getElement("#achievements-background-image").dataset.src =
    "assets/images/casino/achievements-room-landscape.png";
  getElement("#classroom-finale").hidden = true;
  getElement("#classroom-background-portrait").dataset.srcset =
    "assets/images/gojo/classroom-portrait.png";
  getElement("#classroom-background-image").dataset.src =
    "assets/images/gojo/classroom-landscape.png";
  getElement("#classroom-finale-portrait").dataset.srcset =
    "assets/images/gojo/gojo-finale-portrait.png";
  classroomFinaleImage.dataset.src =
    "assets/images/gojo/gojo-finale-landscape.png";

  const storage = new Map();
  if (options.savedAchievements !== undefined) {
    storage.set(
      "niasguts-achievements-v1",
      JSON.stringify(options.savedAchievements),
    );
  }
  if (options.savedTokens !== undefined) {
    storage.set("niasguts-casino-fichas-v1", String(options.savedTokens));
  }
  if (options.baitConsumed !== false) {
    storage.set("niasguts-casino-bait-v1", "true");
  }

  let randomValues = [];
  const fakeMath = Object.create(Math);
  fakeMath.random = () => randomValues.shift() ?? 0;
  const timers = new Map();
  let nextTimerId = 1;
  const documentListeners = new Map();
  const windowObject = {
    devicePixelRatio: 1,
    matchMedia: (query) => ({
      matches: query.includes("prefers-reduced-motion")
        ? options.reducedMotion !== false
        : true,
      addEventListener() {},
    }),
    setTimeout(callback, milliseconds) {
      const timerId = nextTimerId;
      nextTimerId += 1;
      timers.set(timerId, { callback, milliseconds });
      return timerId;
    },
    clearTimeout(timerId) {
      timers.delete(timerId);
    },
  };
  const documentObject = {
    hidden: false,
    title: "",
    documentElement: new FakeElement("html"),
    querySelector: getElement,
    querySelectorAll(selector) {
      if (selector === ".achievement-slot") {
        return achievementSlots;
      }
      if (selector === ".fallback-reel") {
        return fallbackReels;
      }
      if (selector === ".release-entry") {
        return releaseEntries;
      }
      if (selector === ".classroom-answer") {
        return classroomAnswerButtons;
      }
      if (selector === ".marin-gif-frame") {
        return [];
      }
      return [];
    },
    createElement: (name) => new FakeElement(name),
    addEventListener(type, listener) {
      if (!documentListeners.has(type)) {
        documentListeners.set(type, []);
      }
      documentListeners.get(type).push(listener);
    },
  };
  const localStorage = {
    getItem(key) {
      if (options.storageAvailable === false) {
        throw new Error("Storage blocked");
      }
      return storage.get(key) ?? null;
    },
    setItem(key, value) {
      if (options.storageAvailable === false) {
        throw new Error("Storage blocked");
      }
      storage.set(key, String(value));
    },
    removeItem(key) {
      if (options.storageAvailable === false) {
        throw new Error("Storage blocked");
      }
      storage.delete(key);
    },
  };
  const context = vm.createContext({
    console,
    Date,
    Intl,
    Image: HarnessImage,
    Math: fakeMath,
    performance,
    localStorage,
    document: documentObject,
    getComputedStyle: () => ({ getPropertyValue: () => "#000000" }),
    window: windowObject,
  });
  windowObject.document = documentObject;

  return {
    achievementSlots,
    audio,
    classroomAnswerButtons,
    classroomFinaleImage,
    context,
    createdImages,
    documentListeners,
    elements,
    fallbackReels,
    releaseEntries,
    runTimer(milliseconds) {
      const timerEntry = [...timers.entries()].find(
        ([, timer]) => timer.milliseconds === milliseconds,
      );
      assert.notEqual(timerEntry, undefined, "timer not found: " + milliseconds);
      const [timerId, timer] = timerEntry;
      timers.delete(timerId);
      timer.callback();
    },
    setRandomValues(values) {
      randomValues = [...values];
    },
    storage,
    timers,
  };
}

async function loadHarness(options = {}) {
  // Load and run the production script in one isolated test context.
  const harness = createPageHarness(options);
  const applicationSource = await readFile(resolve(projectRoot, "app.js"), "utf8");
  vm.runInContext(applicationSource, harness.context, { filename: "app.js" });
  vm.runInContext(
    "casino3DFailed = true; achievements3DFailed = true",
    harness.context,
  );
  return harness;
}

async function settleMicrotasks() {
  // Allow nested image load and decode promises to settle in behavior tests.
  for (let pass = 0; pass < 6; pass += 1) {
    await Promise.resolve();
  }
}

test("static page exposes the version 1.17 full-screen experience", async () => {
  // Verify deployment markup and all required native controls.
  const html = await readFile(resolve(projectRoot, "index.html"), "utf8");
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /src="app\.js" defer/);
  assert.match(html, /id="casino-canvas"/);
  assert.match(html, /id="casino-token-balance"/);
  assert.match(html, /id="casino-jackpot-continue"/);
  assert.match(html, /id="achievements-canvas"/);
  assert.match(html, /id="toggle-casino-music"/);
  assert.match(html, /versão 1\.17/);
  assert.match(html, /id="casino-title" aria-label="nanaBet"/);
  assert.match(html, /id="casino-logo"/);
  assert.match(html, /id="casino-chip-balance"/);
  assert.match(html, /id="casino-chip-rule"/);
  assert.match(html, /id="casino-gift-rule"/);
  assert.match(html, /id="achievements-background-portrait"/);
  assert.match(html, /id="achievements-background-image"/);
  assert.match(html, /data-src="assets\/images\/casino\/nanabet-logo\.png"/);
  assert.match(html, /data-src="assets\/images\/casino\/casino-chip\.png"/);
  assert.match(
    html,
    /data-srcset="assets\/images\/casino\/achievements-room-portrait\.png"/,
  );
  assert.match(
    html,
    /data-src="assets\/images\/casino\/achievements-room-landscape\.png"/,
  );
  assert.doesNotMatch(
    html,
    /<img[^>]+\ssrc="assets\/images\/casino\//,
  );
  assert.match(
    html,
    /aria-label="Uma ficha por giro\. O presente libera uma conquista\."/,
  );
  assert.match(html, /id="casino-result-flash"/);
  assert.match(html, /id="open-classroom"/);
  assert.match(html, /id="classroom-dialog"/);
  assert.match(html, /id="classroom-background-portrait"/);
  assert.match(html, /id="classroom-background-image"/);
  assert.match(html, /id="classroom-finale"/);
  assert.match(html, /id="classroom-finale-portrait"/);
  assert.match(html, /id="classroom-finale-image"/);
  assert.match(html, /id="gojo-character"/);
  assert.match(html, /data-srcset="assets\/images\/gojo\/classroom-portrait\.png"/);
  assert.match(html, /data-src="assets\/images\/gojo\/classroom-landscape\.png"/);
  assert.match(
    html,
    /data-srcset="assets\/images\/gojo\/gojo-finale-portrait\.png"/,
  );
  assert.match(
    html,
    /data-src="assets\/images\/gojo\/gojo-finale-landscape\.png"/,
  );
  assert.match(html, /GANHAR FICHAS NA AULA/);
  assert.equal((html.match(/class="classroom-answer"/g) ?? []).length, 3);
  assert.equal((html.match(/data-prize-id=/g) ?? []).length, 5);
  assert.equal((html.match(/class="release-entry"/g) ?? []).length, 27);
  assert.ok(
    html.indexOf('<div class="casino-audio-controls"') <
      html.indexOf('<div class="casino-control-deck">'),
  );
  assert.doesNotMatch(html, /aria-describedby="casino-description"/);
  assert.doesNotMatch(html, /aria-controls="patch-notes-dialog"/);
  assert.doesNotMatch(html, /aperte\s+p/i);
  assert.doesNotMatch(html, /class="lever-label"/);
  assert.doesNotMatch(html, /class="casino-tray"/);
  assert.doesNotMatch(html, /vitrine de prêmios muito reais/i);
  assert.doesNotMatch(html, /A BANCA SEMPRE TOMA O CAFÉ/i);
  assert.doesNotMatch(html, /MINIGAME EM BREVE/i);
  assert.doesNotMatch(html, /ARTE DO GOJO EM PRODUÇÃO/);
  assert.doesNotMatch(html, /reforço da nanaBet/i);
  assert.doesNotMatch(html, /class="casino-chip-mark"/);
  assert.doesNotMatch(html, /devolve 1/);
  assert.doesNotMatch(html, /classroom-kicker/);
  assert.doesNotMatch(html, /coraç/i);
  assert.doesNotMatch(html, /<style>/);
});

test("custom domain and every local media asset are release-ready", async () => {
  // Guard GitHub Pages routing and prevent silent GIF or music omissions.
  const cname = await readFile(resolve(projectRoot, "CNAME"), "utf8");
  assert.equal(cname.trim(), "niasguts.viniciuspirasoft.com");
  const mediaPaths = [
    "assets/musica.mp3",
    "assets/gifs/marin-chibi.gif",
    "assets/gifs/marin-cry.gif",
    "assets/gifs/marin-love.gif",
    "assets/gifs/marin-bisque.gif",
    "assets/gifs/marin-peak.gif",
    "assets/gifs/marin-square.gif",
    "assets/gifs/marin-bisque-doll.gif",
    "assets/gifs/marin-sono-bisque.gif",
    "assets/images/gojo/classroom-landscape.png",
    "assets/images/gojo/classroom-portrait.png",
    "assets/images/gojo/gojo-neutral.png",
    "assets/images/gojo/gojo-caring.png",
    "assets/images/gojo/gojo-teaching.png",
    "assets/images/gojo/gojo-praise.png",
    "assets/images/gojo/gojo-reassuring.png",
    "assets/images/gojo/gojo-reward.png",
    "assets/images/gojo/gojo-finale-landscape.png",
    "assets/images/gojo/gojo-finale-portrait.png",
    "assets/images/casino/achievements-room-landscape.png",
    "assets/images/casino/achievements-room-portrait.png",
    "assets/images/casino/casino-chip.png",
    "assets/images/casino/nanabet-logo.png",
    "assets/images/casino/nanabet-palette-reference.png",
    "assets/images/casino/symbol-coffee.png",
    "assets/images/casino/symbol-tiger.png",
    "assets/images/casino/symbol-diamond.png",
    "assets/images/casino/symbol-cherries.png",
    "assets/images/casino/symbol-seven.png",
    "assets/images/casino/symbol-gift.png",
  ];
  for (const mediaPath of mediaPaths) {
    const bytes = await readFile(resolve(projectRoot, mediaPath));
    assert.ok(bytes.byteLength > 1024, mediaPath + " is unexpectedly small");
  }
});

test("classroom PNGs keep their expected dimensions and transparency", async () => {
  // Read the dependency-free PNG IHDR fields used by the responsive art layer.
  const expectedAssets = [
    ["classroom-landscape.png", 1672, 941, 2],
    ["classroom-portrait.png", 941, 1672, 2],
    ["gojo-neutral.png", 1024, 1536, 6],
    ["gojo-caring.png", 1024, 1536, 6],
    ["gojo-teaching.png", 1024, 1536, 6],
    ["gojo-praise.png", 1024, 1536, 6],
    ["gojo-reassuring.png", 1024, 1536, 6],
    ["gojo-reward.png", 1024, 1536, 6],
    ["gojo-finale-landscape.png", 1672, 941, 2],
    ["gojo-finale-portrait.png", 941, 1672, 2],
  ];

  for (const [filename, width, height, colorType] of expectedAssets) {
    const bytes = await readFile(
      resolve(projectRoot, "assets", "images", "gojo", filename),
    );
    assert.deepEqual(
      [...bytes.subarray(0, 8)],
      [137, 80, 78, 71, 13, 10, 26, 10],
      filename,
    );
    assert.equal(bytes.readUInt32BE(16), width, filename);
    assert.equal(bytes.readUInt32BE(20), height, filename);
    assert.equal(bytes[24], 8, filename);
    assert.equal(bytes[25], colorType, filename);
  }

  const rootAssetNames = await readdir(resolve(projectRoot, "assets"), {
    recursive: true,
  });
  assert.equal(
    rootAssetNames.some((name) => name.includes("ChatGPT Image")),
    false,
  );
});

test("casino PNGs keep their delivered dimensions and transparency", async () => {
  // Protect the artist originals while distinguishing opaque room references.
  const expectedAssets = [
    ["achievements-room-landscape.png", 1672, 941, 2],
    ["achievements-room-portrait.png", 941, 1672, 2],
    ["casino-chip.png", 1254, 1254, 6],
    ["nanabet-logo.png", 2172, 724, 6],
    ["nanabet-palette-reference.png", 1448, 1086, 2],
    ["symbol-coffee.png", 1254, 1254, 6],
    ["symbol-tiger.png", 1254, 1254, 6],
    ["symbol-diamond.png", 1254, 1254, 6],
    ["symbol-cherries.png", 1254, 1254, 6],
    ["symbol-seven.png", 1254, 1254, 6],
    ["symbol-gift.png", 1254, 1254, 6],
  ];

  for (const [filename, width, height, colorType] of expectedAssets) {
    const bytes = await readFile(
      resolve(projectRoot, "assets", "images", "casino", filename),
    );
    assert.deepEqual(
      [...bytes.subarray(0, 8)],
      [137, 80, 78, 71, 13, 10, 26, 10],
      filename,
    );
    assert.equal(bytes.readUInt32BE(16), width, filename);
    assert.equal(bytes.readUInt32BE(20), height, filename);
    assert.equal(bytes[24], 8, filename);
    assert.equal(bytes[25], colorType, filename);
  }
});

test("vendored Three.js module and MIT notice remain pinned", async () => {
  // Detect accidental dependency drift or a missing redistribution notice.
  const moduleBytes = await readFile(
    resolve(projectRoot, "assets/vendor/three.module.min.mjs"),
  );
  const coreBytes = await readFile(
    resolve(projectRoot, "assets/vendor/three.core.min.js"),
  );
  const license = await readFile(
    resolve(projectRoot, "assets/vendor/THREE-LICENSE.txt"),
    "utf8",
  );
  assert.equal(
    createHash("sha256").update(moduleBytes).digest("hex"),
    "86bcee248b64f44bcfc23c331ae74619061957d59cab040171dcb6fb5900beb6",
  );
  assert.equal(
    createHash("sha256").update(coreBytes).digest("hex"),
    "05b2609338c76cd65daf74f3ac515bc9a5045e1b3b33edc07d8c9bd55250fa90",
  );
  assert.match(license, /Copyright © 2010-2026 three\.js authors/);
  const casinoModule = await import(
    pathToFileURL(resolve(projectRoot, "casino-3d.mjs")).href
  );
  assert.equal(typeof casinoModule.createCasino3D, "function");
  assert.equal(typeof casinoModule.createAchievements3D, "function");
});

test("procedural tiger face has two eyes and correctly placed chibi details", async () => {
  // Guard the face against duplicate eyes or forehead whiskers.
  const casinoModule = await import(
    pathToFileURL(resolve(projectRoot, "casino-3d.mjs")).href
  );
  const tiger = casinoModule.createTigerModel({
    hairBlonde: "#f5c06b",
    hairBlondeSoft: "#ffe7b5",
    hairPink: "#ef6f9b",
    navyDeep: "#171b2e",
  });
  const names = [];
  tiger.traverse((object) => names.push(object.name));

  assert.deepEqual(
    names.filter((name) => name.startsWith("tiger-eye-")).sort(),
    ["tiger-eye-left", "tiger-eye-right"],
  );
  assert.deepEqual(
    names.filter((name) => name.startsWith("tiger-inner-ear-")).sort(),
    ["tiger-inner-ear-left", "tiger-inner-ear-right"],
  );
  assert.deepEqual(
    names.filter((name) => name.startsWith("tiger-forehead-stripe-")).sort(),
    ["tiger-forehead-stripe-left", "tiger-forehead-stripe-right"],
  );
  assert.deepEqual(
    names.filter((name) => name.startsWith("tiger-whisker-")).sort(),
    [
      "tiger-whisker-left-1",
      "tiger-whisker-left-2",
      "tiger-whisker-right-1",
      "tiger-whisker-right-2",
    ],
  );
  assert.deepEqual(
    names.filter((name) => name.startsWith("tiger-smile-")),
    [],
  );
});

test("procedural foot prize has five distinct toes", async () => {
  // Keep the renamed prize recognizable in both jackpot and gallery scenes.
  const casinoModule = await import(
    pathToFileURL(resolve(projectRoot, "casino-3d.mjs")).href
  );
  const foot = casinoModule.createFootPrize({
    hairBlonde: "#f5c06b",
    hairBlondeSoft: "#ffe7b5",
    hairPink: "#ef6f9b",
  });
  const names = [];
  foot.traverse((object) => names.push(object.name));

  assert.deepEqual(
    names.filter((name) => /^foot-toe-\d$/.test(name)).sort(),
    ["foot-toe-1", "foot-toe-2", "foot-toe-3", "foot-toe-4", "foot-toe-5"],
  );
});

test("jackpot prize anchor stays centered and viewport-bound", async () => {
  // Project the same camera-local anchor through every required viewport.
  const casinoModule = await import(
    pathToFileURL(resolve(projectRoot, "casino-3d.mjs")).href
  );
  const THREE = await import(
    pathToFileURL(
      resolve(projectRoot, "assets/vendor/three.module.min.mjs"),
    ).href
  );
  const viewports = [
    [320, 568],
    [568, 320],
    [390, 844],
    [768, 1024],
    [1366, 768],
    [1920, 1080],
  ];

  for (const [width, height] of viewports) {
    const aspect = width / height;
    const fov = aspect < 0.75 ? 48 : aspect < 1.15 ? 40 : 33;
    const distanceScale = aspect < 0.75 ? 1.34 : aspect < 1.15 ? 1.16 : 1;
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
    camera.position.set(
      7.6 * distanceScale,
      5.15 * distanceScale,
      16.5 * distanceScale,
    );
    camera.lookAt(-0.15, -0.1, 0.25);
    const anchor = new THREE.Group();
    camera.add(anchor);
    const layout = casinoModule.calculatePrizePresentationLayout({
      viewportWidth: width,
      viewportHeight: height,
      verticalFovDegrees: fov,
      modelWidth: 2.2,
      modelHeight: 1.6,
    });
    anchor.position.set(...layout.position);
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    const projected = anchor
      .getWorldPosition(new THREE.Vector3())
      .project(camera);

    assert.ok(Math.abs(projected.x) < 1e-9, width + "x" + height);
    assert.ok(Math.abs(projected.y) < 1e-9, width + "x" + height);
    assert.ok(layout.scale * 2.2 <= layout.visibleWidth * 0.46 + 1e-9);
    assert.ok(layout.scale * 1.6 <= layout.visibleHeight * 0.34 + 1e-9);
  }
});

test("all six reel faces stop exactly on the selected symbol", async () => {
  // Cover every current and target face while preserving backward rotation.
  const casinoModule = await import(
    pathToFileURL(resolve(projectRoot, "casino-3d.mjs")).href
  );
  const symbolCount = 6;
  const fullTurn = Math.PI * 2;
  const symbolAngle = fullTurn / symbolCount;

  for (let currentIndex = 0; currentIndex < symbolCount; currentIndex += 1) {
    for (let targetIndex = 0; targetIndex < symbolCount; targetIndex += 1) {
      const currentRotation = currentIndex * symbolAngle;
      const targetRotation = casinoModule.calculateReelTargetRotation(
        currentIndex,
        targetIndex,
        currentRotation,
        5,
        symbolCount,
      );
      const normalizedRotation =
        ((targetRotation % fullTurn) + fullTurn) % fullTurn;
      const expectedRotation = targetIndex * symbolAngle;
      assert.ok(Math.abs(normalizedRotation - expectedRotation) < 1e-9);
      assert.ok(targetRotation <= currentRotation - 5 * fullTurn);
    }
  }
});

test("one random roll selects the two exact outcome bands", async () => {
  // Assert inclusive lower bounds and exclusive upper bounds.
  const harness = await loadHarness();
  const scenarios = [
    [0, "prize"],
    [0.124999, "prize"],
    [0.125, "loss"],
    [0.999999, "loss"],
  ];

  for (const [roll, expectedType] of scenarios) {
    harness.setRandomValues([roll, 0, 0.2, 0.4, 0.6]);
    vm.runInContext("chooseCasinoOutcome()", harness.context);
    assert.equal(
      vm.runInContext("pendingCasinoOutcomeType", harness.context),
      expectedType,
    );
  }
});

test("the first eligible spin guarantees the foot prize and persists the bait", async () => {
  // The promotional first result bypasses RNG but still spends one chip.
  const harness = await loadHarness({
    savedTokens: 5,
    baitConsumed: false,
  });
  harness.setRandomValues([0.999999]);
  await vm.runInContext("startCasinoSpin()", harness.context);

  assert.equal(
    vm.runInContext("pendingCasinoOutcomeType", harness.context),
    "prize",
  );
  assert.equal(
    vm.runInContext("pendingCasinoPrize.id", harness.context),
    "prima-vaper",
  );
  assert.equal(
    harness.elements.get("#casino-jackpot-prize").textContent,
    "pé da prima do vaper",
  );
  assert.equal(vm.runInContext("casinoTokenBalance", harness.context), 4);
  assert.equal(harness.storage.get("niasguts-casino-bait-v1"), "true");
});

test("an empty balance leaves the guaranteed bait unconsumed", async () => {
  // The special result waits for an actual eligible lever pull.
  const harness = await loadHarness({
    savedTokens: 0,
    baitConsumed: false,
  });
  await vm.runInContext("startCasinoSpin()", harness.context);

  assert.equal(vm.runInContext("casinoBaitConsumed", harness.context), false);
  assert.equal(harness.storage.has("niasguts-casino-bait-v1"), false);
});

test("the bait becomes a repeat for an existing owner and normal odds resume", async () => {
  // Existing saved progress keeps its stable ID while receiving the one-time gag.
  const harness = await loadHarness({
    savedAchievements: ["prima-vaper"],
    savedTokens: 5,
    baitConsumed: false,
  });
  await vm.runInContext("startCasinoSpin()", harness.context);
  assert.equal(
    harness.elements.get("#casino-jackpot-badge").textContent,
    "VOCÊ GANHOU DE NOVO",
  );
  assert.equal(vm.runInContext("unlockedAchievementIds.size", harness.context), 1);

  vm.runInContext("closeCasinoJackpot()", harness.context);
  harness.setRandomValues([0.9, 0, 0.25, 0.5, 0]);
  await vm.runInContext("startCasinoSpin()", harness.context);
  assert.equal(
    vm.runInContext("pendingCasinoOutcomeType", harness.context),
    "loss",
  );
});

test("blocked storage consumes the bait once for the current visit", async () => {
  // An unavailable localStorage must not repeat the guaranteed win in memory.
  const harness = await loadHarness({
    savedTokens: 5,
    baitConsumed: false,
    storageAvailable: false,
  });
  await vm.runInContext("startCasinoSpin()", harness.context);
  assert.equal(vm.runInContext("casinoBaitConsumed", harness.context), true);

  vm.runInContext("closeCasinoJackpot()", harness.context);
  harness.setRandomValues([0.9, 0, 0.25, 0.5, 0]);
  await vm.runInContext("startCasinoSpin()", harness.context);
  assert.equal(
    vm.runInContext("pendingCasinoOutcomeType", harness.context),
    "loss",
  );
});

test("every casino outcome spends exactly one chip", async () => {
  // Both an achievement and an ordinary loss consume the paid spin.
  const scenarios = [
    { roll: [0.05, 0], expectedType: "prize" },
    { roll: [0.125, 0, 0.25, 0.5, 0], expectedType: "loss" },
  ];

  for (const scenario of scenarios) {
    const harness = await loadHarness({ savedTokens: 10 });
    harness.setRandomValues(scenario.roll);
    await vm.runInContext("startCasinoSpin()", harness.context);
    assert.equal(
      vm.runInContext("pendingCasinoOutcomeType", harness.context),
      scenario.expectedType,
    );
    assert.equal(
      vm.runInContext("casinoTokenBalance", harness.context),
      9,
    );
    assert.equal(
      harness.storage.get("niasguts-casino-fichas-v1"),
      "9",
    );
  }
});

test("fallback reels render only the six remaining symbols", async () => {
  // A complete fallback spin never creates the removed chip marker.
  const harness = await loadHarness({ savedTokens: 5 });
  harness.setRandomValues([0.125, 0, 0.25, 0.5, 0]);
  await vm.runInContext("startCasinoSpin()", harness.context);

  for (const reel of harness.fallbackReels) {
    assert.equal(reel.classList.contains("is-chip"), false);
    assert.equal("chipCount" in reel.dataset, false);
    assert.notEqual(reel.textContent, "");
    assert.notEqual(reel.textContent, "FICHA");
  }
});

test("ordinary loss results never contain a matching triple", async () => {
  // Exhaust all 125 source combinations and verify triple repair.
  const harness = await loadHarness();
  for (let first = 0; first < 5; first += 1) {
    for (let second = 0; second < 5; second += 1) {
      for (let third = 0; third < 5; third += 1) {
        harness.setRandomValues([
          (first + 0.01) / 5,
          (second + 0.01) / 5,
          (third + 0.01) / 5,
        ]);
        const labels = vm.runInContext(
          "createOrdinaryLosingOutcome().map((symbol) => symbol.label)",
          harness.context,
        );
        assert.equal(new Set(labels).size > 1, true);
      }
    }
  }
});

test("achievement outcomes award all five locked prizes before repeats", async () => {
  // Unlock the five stable IDs in order, acknowledging each blocking jackpot.
  const harness = await loadHarness({ savedTokens: 20 });

  for (let prizeIndex = 0; prizeIndex < prizeIds.length; prizeIndex += 1) {
    harness.setRandomValues([0.05, 0]);
    await vm.runInContext("startCasinoSpin()", harness.context);
    assert.equal(
      vm.runInContext("unlockedAchievementIds.size", harness.context),
      prizeIndex + 1,
    );
    assert.equal(
      vm.runInContext("casinoJackpotOpen", harness.context),
      true,
    );
    assert.equal(
      harness.elements.get("#slot-machine").classList.contains("is-jackpot"),
      true,
    );
    vm.runInContext("closeCasinoJackpot()", harness.context);
    assert.equal(
      harness.elements.get("#slot-machine").classList.contains("is-jackpot"),
      false,
    );
  }

  harness.setRandomValues([0.05, 0]);
  await vm.runInContext("startCasinoSpin()", harness.context);
  assert.equal(vm.runInContext("unlockedAchievementIds.size", harness.context), 5);
  assert.equal(
    harness.elements.get("#casino-jackpot-badge").textContent,
    "VOCÊ GANHOU DE NOVO",
  );
  assert.equal(
    harness.storage.get("niasguts-achievements-v1"),
    JSON.stringify(prizeIds),
  );
});

test("ordinary casino messages replace one centered two-second card", async () => {
  // Ready, spinning, and loss feedback share one non-jackpot surface.
  const harness = await loadHarness();
  vm.runInContext("casinoIsOpen = true", harness.context);
  const messages = [
    ["pronta para tentar?", "default"],
    ["os rolos estão girando...", "spinning"],
    ["a banca venceu. continua não rica.", "loss"],
  ];

  for (const [message, tone] of messages) {
    vm.runInContext(
      `showCasinoMessage(${JSON.stringify(message)}, ${JSON.stringify(tone)})`,
      harness.context,
    );
    const activeFlashTimers = [...harness.timers.values()].filter(
      (timer) => timer.milliseconds === 2000,
    );
    assert.equal(activeFlashTimers.length, 1);
    assert.equal(harness.elements.get("#casino-result-flash").hidden, false);
    assert.equal(
      harness.elements.get("#casino-result-flash").textContent,
      message,
    );
    assert.equal(harness.elements.get("#casino-result").textContent, message);
  }

  harness.runTimer(2000);
  assert.equal(harness.elements.get("#casino-result-flash").hidden, true);
  assert.equal(
    harness.elements.get("#casino-result").textContent,
    messages.at(-1)[0],
  );
});

test("closing and jackpots cancel ordinary message cards", async () => {
  // Never leave a stale card over a reopened casino or a blocking win.
  const harness = await loadHarness();
  vm.runInContext("openCasino()", harness.context);
  assert.equal(harness.elements.get("#casino-result-flash").hidden, false);
  harness.elements.get("#casino-dialog").close();
  assert.equal(harness.elements.get("#casino-result-flash").hidden, true);

  vm.runInContext("openCasino()", harness.context);
  assert.equal(harness.elements.get("#casino-result-flash").hidden, false);
  vm.runInContext("showCasinoJackpot(CASINO_PRIZES[0], true)", harness.context);
  assert.equal(harness.elements.get("#casino-result-flash").hidden, true);
});

test("zero chips disable the lever and expose the classroom entry", async () => {
  // Show the final loss first, then reveal the lesson without a reset path.
  const harness = await loadHarness({ savedTokens: 1 });
  vm.runInContext("casinoIsOpen = true", harness.context);
  harness.setRandomValues([0.9, 0, 0.25, 0.5, 0]);
  await vm.runInContext("startCasinoSpin()", harness.context);
  assert.equal(vm.runInContext("casinoTokenBalance", harness.context), 0);
  assert.equal(harness.elements.get("#spin-casino").disabled, true);
  assert.equal(harness.elements.get("#casino-result-flash").hidden, false);
  assert.equal(harness.elements.get("#casino-empty").hidden, true);
  harness.runTimer(2000);
  assert.equal(harness.elements.get("#casino-result-flash").hidden, true);
  assert.equal(harness.elements.get("#casino-empty").hidden, false);
  assert.equal(harness.elements.get("#open-classroom").disabled, false);
  assert.equal(
    harness.elements.get("#spin-casino").getAttribute("aria-label"),
    "Sem fichas; ganhe fichas na aula",
  );
});

test("casino artwork loads only on first open and upgrades native fallbacks", async () => {
  // Keep the main page light, then reveal the logo, chip, legend, and six faces.
  const harness = await loadHarness();
  assert.equal(harness.createdImages.length, 0);
  assert.equal(harness.elements.get("#casino-logo").src, undefined);
  assert.equal(harness.elements.get("#casino-chip-balance").src, undefined);

  vm.runInContext("openCasino()", harness.context);
  assert.equal(harness.createdImages.length, 6);
  assert.deepEqual(
    harness.createdImages.map((image) => image.src),
    [
      "assets/images/casino/symbol-coffee.png",
      "assets/images/casino/symbol-tiger.png",
      "assets/images/casino/symbol-diamond.png",
      "assets/images/casino/symbol-cherries.png",
      "assets/images/casino/symbol-seven.png",
      "assets/images/casino/symbol-gift.png",
    ],
  );
  assert.equal(
    harness.elements.get("#casino-logo").src,
    "assets/images/casino/nanabet-logo.png",
  );
  assert.equal(
    harness.elements.get("#casino-chip-balance").src,
    "assets/images/casino/casino-chip.png",
  );
  assert.equal(
    harness.elements.get("#casino-gift-rule").src,
    "assets/images/casino/symbol-gift.png",
  );

  harness.elements.get("#casino-logo").dispatch("load");
  harness.elements.get("#casino-chip-balance").dispatch("load");
  harness.elements.get("#casino-chip-rule").dispatch("load");
  harness.elements.get("#casino-gift-rule").dispatch("load");
  await settleMicrotasks();

  assert.equal(harness.elements.get("#casino-logo").hidden, false);
  assert.equal(
    harness.elements.get("#casino-marquee").classList.contains(
      "is-logo-ready",
    ),
    true,
  );
  assert.equal(harness.elements.get("#casino-gift-rule-fallback").hidden, true);
  assert.equal(
    harness.fallbackReels[0].replacementChildren[0].src,
    "assets/images/casino/symbol-coffee.png",
  );
  assert.equal(
    harness.fallbackReels[1].replacementChildren[0].src,
    "assets/images/casino/symbol-tiger.png",
  );

  vm.runInContext("openCasino()", harness.context);
  assert.equal(harness.createdImages.length, 6);
});

test("one missing reel illustration keeps only its character fallback", async () => {
  // A partial asset failure must not disable the other illustrated faces.
  const harness = await loadHarness({ imagesAutoLoad: false });
  vm.runInContext("openCasino()", harness.context);
  const tigerImage = harness.createdImages.find((image) =>
    image.src.endsWith("symbol-tiger.png"),
  );
  for (const image of harness.createdImages) {
    if (image === tigerImage) {
      image.dispatch("error");
    } else {
      image.resolveLoad();
    }
  }
  await settleMicrotasks();

  assert.equal(
    harness.fallbackReels[0].replacementChildren[0].src,
    "assets/images/casino/symbol-coffee.png",
  );
  assert.equal(harness.fallbackReels[1].textContent, "🐯");
});

test("achievement room art is orientation-aware and lazily requested", async () => {
  // Preserve the CSS gradient until the selected local background succeeds.
  const harness = await loadHarness();
  assert.equal(
    harness.elements.get("#achievements-background-image").src,
    undefined,
  );
  assert.equal(
    harness.elements.get("#achievements-background-portrait").srcset,
    undefined,
  );

  vm.runInContext("openAchievements()", harness.context);
  assert.equal(
    harness.elements.get("#achievements-background-image").src,
    "assets/images/casino/achievements-room-landscape.png",
  );
  assert.equal(
    harness.elements.get("#achievements-background-portrait").srcset,
    "assets/images/casino/achievements-room-portrait.png",
  );
  harness.elements.get("#achievements-background-image").dispatch("load");
  assert.equal(
    harness.elements.get("#achievements-screen").classList.contains(
      "is-background-ready",
    ),
    true,
  );
  harness.elements.get("#achievements-background-image").dispatch("error");
  assert.equal(
    harness.elements.get("#achievements-screen").classList.contains(
      "is-background-ready",
    ),
    false,
  );
});

test("each classroom lesson covers all operations with three valid choices", async () => {
  // Validate the generated math contract independently of dialogue progression.
  const harness = await loadHarness();
  harness.setRandomValues(Array(80).fill(0.37));
  const questions = JSON.parse(
    vm.runInContext("JSON.stringify(createClassroomQuestions())", harness.context),
  );

  assert.equal(questions.length, 5);
  assert.match(questions[0].expression, /\+/);
  assert.match(questions[1].expression, /−/);
  assert.match(questions[2].expression, /×/);
  assert.match(questions[4].expression, /÷/);

  for (const question of questions) {
    assert.equal(question.choices.length, 3);
    assert.equal(new Set(question.choices).size, 3);
    assert.equal(question.choices.includes(question.answer), true);
    assert.equal(question.choices.every(Number.isInteger), true);
    assert.equal(question.choices.every((choice) => choice >= 0), true);
  }
});

test("opening class pauses the casino and closing it awards nothing", async () => {
  // Exercise the modal handoff, audio reset, and cancellation path.
  const harness = await loadHarness({ savedTokens: 0 });
  vm.runInContext("openCasino()", harness.context);
  await Promise.resolve();
  harness.audio.currentTime = 19;
  vm.runInContext("openClassroom()", harness.context);

  assert.equal(harness.elements.get("#casino-dialog").open, false);
  assert.equal(harness.elements.get("#classroom-dialog").open, true);
  assert.equal(vm.runInContext("casinoIsOpen", harness.context), false);
  assert.equal(harness.audio.paused, true);
  assert.equal(harness.audio.currentTime, 0);
  assert.equal(vm.runInContext("classroomQuestions.length", harness.context), 5);
  const firstLessonExpression = vm.runInContext(
    "classroomQuestions[0].expression",
    harness.context,
  );

  harness.elements.get("#classroom-dialog").close();
  assert.equal(vm.runInContext("casinoTokenBalance", harness.context), 0);
  assert.equal(harness.elements.get("#casino-dialog").open, true);
  assert.equal(vm.runInContext("classroomPhase", harness.context), "closed");

  harness.setRandomValues(Array(80).fill(0.99));
  vm.runInContext("openClassroom()", harness.context);
  assert.equal(harness.elements.get("#classroom-dialog").open, true);
  assert.notEqual(
    vm.runInContext("classroomQuestions[0].expression", harness.context),
    firstLessonExpression,
  );
});

test("wrong classroom answers retry and five correct answers award once", async () => {
  // Complete one deterministic lesson through both feedback branches.
  const harness = await loadHarness({ savedTokens: 0 });
  vm.runInContext("openCasino(); openClassroom()", harness.context);

  vm.runInContext("handleClassroomContinue()", harness.context);
  vm.runInContext("handleClassroomContinue()", harness.context);
  vm.runInContext("handleClassroomContinue()", harness.context);
  assert.equal(vm.runInContext("classroomPhase", harness.context), "question");

  const firstExpression = vm.runInContext(
    "classroomQuestions[0].expression",
    harness.context,
  );
  const firstAnswer = vm.runInContext(
    "classroomQuestions[0].answer",
    harness.context,
  );
  const wrongButton = harness.classroomAnswerButtons.find(
    (button) => Number(button.dataset.answerValue) !== firstAnswer,
  );
  wrongButton.dispatch("click");
  assert.equal(vm.runInContext("classroomPhase", harness.context), "wrong");
  assert.equal(vm.runInContext("classroomQuestionIndex", harness.context), 0);
  assert.match(
    harness.elements.get("#classroom-dialogue-text").textContent,
    /Quase, meu bem\./,
  );

  vm.runInContext("handleClassroomContinue()", harness.context);
  assert.equal(
    vm.runInContext("classroomQuestions[0].expression", harness.context),
    firstExpression,
  );

  for (let questionIndex = 0; questionIndex < 5; questionIndex += 1) {
    const correctAnswer = vm.runInContext(
      "classroomQuestions[classroomQuestionIndex].answer",
      harness.context,
    );
    const correctButton = harness.classroomAnswerButtons.find(
      (button) => Number(button.dataset.answerValue) === correctAnswer,
    );
    correctButton.dispatch("click");

    if (questionIndex < 4) {
      assert.equal(vm.runInContext("classroomPhase", harness.context), "correct");
      vm.runInContext("handleClassroomContinue()", harness.context);
    }
  }

  assert.equal(vm.runInContext("classroomPhase", harness.context), "reward");
  assert.equal(
    harness.elements.get("#classroom-continue").textContent,
    "RECEBER 5 FICHAS",
  );
  vm.runInContext("handleClassroomContinue()", harness.context);

  assert.equal(vm.runInContext("casinoTokenBalance", harness.context), 5);
  assert.equal(harness.storage.get("niasguts-casino-fichas-v1"), "5");
  assert.equal(harness.elements.get("#classroom-dialog").open, false);
  assert.equal(harness.elements.get("#casino-dialog").open, true);
  assert.equal(
    harness.elements.get("#casino-result").textContent,
    "Gojo te deu 5 fichas. Boa garota.",
  );
  assert.equal(harness.elements.get("#casino-result-flash").hidden, false);

  vm.runInContext("claimClassroomReward()", harness.context);
  assert.equal(vm.runInContext("casinoTokenBalance", harness.context), 5);
});

test("classroom typewriter completes a line before advancing", async () => {
  // Preserve native click, Enter, and Space semantics through one continue button.
  const harness = await loadHarness({ savedTokens: 0, reducedMotion: false });
  vm.runInContext("openCasino(); openClassroom()", harness.context);
  assert.equal(vm.runInContext("classroomIsTyping", harness.context), true);
  assert.equal(harness.elements.get("#classroom-dialogue-text").textContent, "");
  const fullLine = harness.elements.get(
    "#classroom-dialogue-announcement",
  ).textContent;

  vm.runInContext("handleClassroomContinue()", harness.context);
  assert.equal(vm.runInContext("classroomIntroIndex", harness.context), 0);
  assert.equal(harness.elements.get("#classroom-dialogue-text").textContent, fullLine);
  assert.equal(vm.runInContext("classroomIsTyping", harness.context), false);

  vm.runInContext("handleClassroomContinue()", harness.context);
  assert.equal(vm.runInContext("classroomIntroIndex", harness.context), 1);
  assert.equal(vm.runInContext("classroomIsTyping", harness.context), true);
});

test("classroom art loads lazily and follows every dialogue context", async () => {
  // Map the six poses while withholding the finale until the fifth answer.
  const harness = await loadHarness({ savedTokens: 0 });
  assert.equal(harness.createdImages.length, 0);
  assert.equal(
    harness.elements.get("#classroom-background-image").src,
    undefined,
  );
  assert.equal(harness.classroomFinaleImage.src, "");
  assert.equal(
    harness.elements.get("#classroom-finale-portrait").srcset,
    undefined,
  );

  vm.runInContext("openCasino(); openClassroom()", harness.context);
  assert.equal(
    harness.createdImages.filter((image) => image.src.includes("/gojo/"))
      .length,
    6,
  );
  assert.equal(
    harness.elements.get("#classroom-background-portrait").srcset,
    "assets/images/gojo/classroom-portrait.png",
  );
  assert.equal(
    harness.elements.get("#classroom-background-image").src,
    "assets/images/gojo/classroom-landscape.png",
  );
  assert.equal(harness.classroomFinaleImage.src, "");
  await settleMicrotasks();
  assert.equal(harness.elements.get("#gojo-character").dataset.pose, "caring");

  vm.runInContext("handleClassroomContinue()", harness.context);
  await settleMicrotasks();
  assert.equal(harness.elements.get("#gojo-character").dataset.pose, "neutral");

  vm.runInContext("handleClassroomContinue()", harness.context);
  await settleMicrotasks();
  assert.equal(
    harness.elements.get("#gojo-character").dataset.pose,
    "reassuring",
  );

  vm.runInContext("handleClassroomContinue()", harness.context);
  await settleMicrotasks();
  assert.equal(harness.elements.get("#gojo-character").dataset.pose, "teaching");

  const firstAnswer = vm.runInContext(
    "classroomQuestions[0].answer",
    harness.context,
  );
  harness.classroomAnswerButtons
    .find((button) => Number(button.dataset.answerValue) !== firstAnswer)
    .dispatch("click");
  await settleMicrotasks();
  assert.equal(
    harness.elements.get("#gojo-character").dataset.pose,
    "reassuring",
  );

  vm.runInContext("handleClassroomContinue()", harness.context);
  harness.classroomAnswerButtons
    .find((button) => Number(button.dataset.answerValue) === firstAnswer)
    .dispatch("click");
  await settleMicrotasks();
  assert.equal(harness.elements.get("#gojo-character").dataset.pose, "praise");

  vm.runInContext(
    "classroomQuestionIndex = 4; showClassroomQuestion()",
    harness.context,
  );
  const finalAnswer = vm.runInContext(
    "classroomQuestions[4].answer",
    harness.context,
  );
  harness.classroomAnswerButtons
    .find((button) => Number(button.dataset.answerValue) === finalAnswer)
    .dispatch("click");
  await settleMicrotasks();
  assert.equal(harness.elements.get("#gojo-character").dataset.pose, "reward");
  assert.equal(harness.elements.get("#classroom-art-status").hidden, true);
  assert.equal(
    harness.elements.get("#classroom-finale-portrait").srcset,
    "assets/images/gojo/gojo-finale-portrait.png",
  );
  assert.equal(
    harness.classroomFinaleImage.src,
    "assets/images/gojo/gojo-finale-landscape.png",
  );
  assert.equal(harness.elements.get("#classroom-finale").hidden, false);
  assert.equal(
    harness.elements.get("#classroom-finale").classList.contains("is-visible"),
    true,
  );
  assert.equal(
    harness.elements.get("#classroom-screen").classList.contains("is-finale"),
    true,
  );

  vm.runInContext("resetClassroomLesson()", harness.context);
  assert.equal(harness.elements.get("#classroom-finale").hidden, true);
  assert.equal(
    harness.elements.get("#classroom-screen").classList.contains("is-finale"),
    false,
  );
});

test("a failed finale CG keeps the existing reward pose", async () => {
  // The delivered sprite remains a complete fallback for either CG request.
  const harness = await loadHarness({
    savedTokens: 0,
    finaleAutoLoad: false,
  });
  vm.runInContext(
    "openCasino(); openClassroom(); classroomQuestionIndex = 4; showClassroomQuestion()",
    harness.context,
  );
  const finalAnswer = vm.runInContext(
    "classroomQuestions[4].answer",
    harness.context,
  );
  harness.classroomAnswerButtons
    .find((button) => Number(button.dataset.answerValue) === finalAnswer)
    .dispatch("click");
  await settleMicrotasks();
  assert.equal(harness.elements.get("#gojo-character").dataset.pose, "reward");
  assert.equal(harness.elements.get("#classroom-finale").hidden, false);
  assert.equal(
    harness.elements.get("#classroom-finale").classList.contains("is-visible"),
    false,
  );

  harness.classroomFinaleImage.dispatch("error");
  await settleMicrotasks();
  assert.equal(harness.elements.get("#gojo-character").dataset.pose, "reward");
  assert.equal(harness.elements.get("#classroom-finale").hidden, true);
  assert.equal(
    harness.elements.get("#classroom-screen").classList.contains("is-finale"),
    false,
  );
});

test("a finale CG that loads after closing the lesson stays hidden", async () => {
  // Invalidate the pending scene before an old image request can finish.
  const harness = await loadHarness({
    savedTokens: 0,
    finaleAutoLoad: false,
  });
  vm.runInContext(
    "openCasino(); openClassroom(); classroomQuestionIndex = 4; showClassroomQuestion()",
    harness.context,
  );
  const finalAnswer = vm.runInContext(
    "classroomQuestions[4].answer",
    harness.context,
  );
  harness.classroomAnswerButtons
    .find((button) => Number(button.dataset.answerValue) === finalAnswer)
    .dispatch("click");
  harness.elements.get("#classroom-dialog").close();
  harness.classroomFinaleImage.resolveLoad();
  await settleMicrotasks();

  assert.equal(vm.runInContext("classroomPhase", harness.context), "closed");
  assert.equal(harness.elements.get("#classroom-finale").hidden, true);
  assert.equal(
    harness.elements.get("#classroom-screen").classList.contains("is-finale"),
    false,
  );
});

test("a stale classroom pose load cannot replace the latest request", async () => {
  // Resolve caring after neutral and retain the newer neutral state.
  const harness = await loadHarness({
    savedTokens: 0,
    imagesAutoLoad: false,
  });
  vm.runInContext("openCasino(); openClassroom()", harness.context);
  const neutralImage = harness.createdImages.find((image) =>
    image.src.endsWith("gojo-neutral.png"),
  );
  const caringImage = harness.createdImages.find((image) =>
    image.src.endsWith("gojo-caring.png"),
  );

  vm.runInContext("showClassroomPose('neutral')", harness.context);
  neutralImage.resolveLoad();
  await settleMicrotasks();
  assert.equal(harness.elements.get("#gojo-character").dataset.pose, "neutral");

  caringImage.resolveLoad();
  await settleMicrotasks();
  assert.equal(harness.elements.get("#gojo-character").dataset.pose, "neutral");
});

test("storage failure keeps visit progress and exposes both warnings", async () => {
  // Preserve in-memory defaults when browser persistence is blocked.
  const harness = await loadHarness({ storageAvailable: false });
  assert.equal(vm.runInContext("casinoTokenBalance", harness.context), 5);
  assert.equal(vm.runInContext("casinoTokensArePersistent", harness.context), false);
  assert.equal(vm.runInContext("casinoBaitIsPersistent", harness.context), false);
  assert.equal(vm.runInContext("achievementsArePersistent", harness.context), false);
  assert.equal(
    harness.elements.get("#casino-token-storage-note").hidden,
    false,
  );
  assert.equal(
    harness.elements.get("#achievement-storage-note").hidden,
    false,
  );
});

test("manual music pause wins over an unresolved play request", async () => {
  // Reproduce the former race and assert stale playback cannot resume.
  const harness = await loadHarness();
  let resolvePlay;
  harness.audio.play = () => {
    harness.audio.paused = false;
    return new Promise((resolvePlayPromise) => {
      resolvePlay = resolvePlayPromise;
    });
  };
  harness.audio.pause = () => {
    harness.audio.paused = true;
  };

  const pendingPlay = vm.runInContext(
    "casinoIsOpen = true; casinoMusicWanted = true; reconcileCasinoMusic()",
    harness.context,
  );
  vm.runInContext("toggleCasinoMusic()", harness.context);
  resolvePlay();
  await pendingPlay;
  await Promise.resolve();

  assert.equal(harness.audio.paused, true);
  assert.equal(vm.runInContext("casinoMusicWanted", harness.context), false);
  assert.equal(
    harness.elements.get("#toggle-casino-music").getAttribute("aria-pressed"),
    "false",
  );
});

test("manual music pause persists through close and reopen", async () => {
  // Keep the desired state while resetting playback to the beginning.
  const harness = await loadHarness();
  vm.runInContext("openCasino()", harness.context);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(harness.audio.paused, false);

  vm.runInContext("toggleCasinoMusic()", harness.context);
  await Promise.resolve();
  assert.equal(harness.audio.paused, true);
  harness.audio.currentTime = 23;
  harness.elements.get("#casino-dialog").close();
  assert.equal(harness.audio.currentTime, 0);
  vm.runInContext("openCasino()", harness.context);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(harness.audio.paused, true);
  assert.equal(harness.audio.currentTime, 0);
});

test("enabled music restarts from zero after the casino reopens", async () => {
  // Pause casino-only audio on close and start a fresh loop on reopen.
  const harness = await loadHarness();
  vm.runInContext("openCasino()", harness.context);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(harness.audio.paused, false);

  harness.audio.currentTime = 37;
  harness.elements.get("#casino-dialog").close();
  assert.equal(harness.audio.paused, true);
  assert.equal(harness.audio.currentTime, 0);

  vm.runInContext("openCasino()", harness.context);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(harness.audio.paused, false);
  assert.equal(harness.audio.currentTime, 0);
});

test("a stale play completion cannot move closed-casino music past zero", async () => {
  // Settle an old playback request after close and reapply the latest state.
  const harness = await loadHarness();
  let resolvePlay;
  harness.audio.play = () =>
    new Promise((resolvePlayPromise) => {
      resolvePlay = () => {
        harness.audio.paused = false;
        resolvePlayPromise();
      };
    });

  const pendingPlay = vm.runInContext(
    "casinoDialog.open = true; casinoIsOpen = true; reconcileCasinoMusic()",
    harness.context,
  );
  harness.audio.currentTime = 41;
  harness.elements.get("#casino-dialog").close();
  resolvePlay();
  await pendingPlay;

  assert.equal(harness.audio.paused, true);
  assert.equal(harness.audio.currentTime, 0);
});

test("an existing 3D casino is reactivated after every reopen", async () => {
  // Exercise the dialog lifecycle against one retained renderer instance.
  const harness = await loadHarness();
  harness.context.visibilityCalls = [];
  vm.runInContext(
    `casino3D = {
      setVisible(value) { visibilityCalls.push(value); },
      setLeverInteractive() {},
      setCollectionComplete() {},
    }`,
    harness.context,
  );

  vm.runInContext("openCasino()", harness.context);
  harness.elements.get("#casino-dialog").close();
  vm.runInContext("openCasino()", harness.context);

  assert.deepEqual([...harness.context.visibilityCalls], [true, false, true]);
});

test("rejected music playback leaves a truthful retry control", async () => {
  // Handle browser autoplay rejection without a stale pressed state.
  const harness = await loadHarness();
  harness.audio.play = async () => {
    throw new Error("Autoplay blocked");
  };
  await vm.runInContext(
    "casinoIsOpen = true; casinoMusicWanted = true; reconcileCasinoMusic()",
    harness.context,
  );
  assert.equal(harness.audio.paused, true);
  assert.equal(vm.runInContext("casinoMusicWanted", harness.context), false);
  assert.equal(
    harness.elements.get("#toggle-casino-music").textContent,
    "▶ MÚSICA",
  );
});

test("restored five-prize progress completes the trophy gallery", async () => {
  // Filter unknown IDs while retaining the permanent five-prize collection.
  const harness = await loadHarness({
    savedAchievements: [...prizeIds, "unknown-prize"],
  });
  assert.equal(
    harness.elements.get("#achievements-screen").classList.contains("is-complete"),
    true,
  );
  assert.equal(
    harness.elements.get("#achievement-complete-plaque").hidden,
    false,
  );
  assert.equal(vm.runInContext("unlockedAchievementIds.size", harness.context), 5);
  assert.equal(harness.elements.get("#achievements-count").textContent, "5/5");
});

test("secret patch notes paginate three releases and support P toggling", async () => {
  // Confirm initial visibility, bounded navigation, and the hidden keyboard entry.
  const harness = await loadHarness();
  assert.deepEqual(
    harness.releaseEntries.map((entry) => entry.hidden),
    [false, false, false, ...Array(24).fill(true)],
  );
  assert.equal(harness.elements.get("#release-page-status").textContent, "1/9");
  vm.runInContext("changeReleasePage(1)", harness.context);
  assert.deepEqual(
    harness.releaseEntries.map((entry) => entry.hidden),
    [true, true, true, false, false, false, ...Array(21).fill(true)],
  );

  const shortcut = {
    key: "P",
    target: new FakeElement("main"),
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    preventDefault() {},
  };
  harness.elements.get("#classroom-dialog").open = true;
  harness.context.handlePatchNotesShortcut(shortcut);
  assert.equal(harness.elements.get("#patch-notes-dialog").open, false);
  harness.elements.get("#classroom-dialog").open = false;
  harness.context.handlePatchNotesShortcut(shortcut);
  assert.equal(harness.elements.get("#patch-notes-dialog").open, true);
  harness.context.handlePatchNotesShortcut(shortcut);
  assert.equal(harness.elements.get("#patch-notes-dialog").open, false);
});

test("CSS keeps colors centralized and every screen viewport-bound", async () => {
  // Guard the semantic Marin palette and scroll-free full-screen shells.
  const css = await readFile(resolve(projectRoot, "styles.css"), "utf8");
  const cssWithoutRoot = css.replace(/:root\s*\{[\s\S]*?\}/, "");
  assert.doesNotMatch(cssWithoutRoot, /#[0-9a-f]{3,8}/i);
  assert.doesNotMatch(cssWithoutRoot, /rgba?\(/i);
  assert.doesNotMatch(css, /overflow:\s*(auto|scroll)/);
  assert.match(css, /html\s*\{[\s\S]*?overflow:\s*hidden/);
  assert.match(css, /\.site-dialog\s*\{[\s\S]*?height:\s*100dvh/);
  assert.match(css, /\.classroom-screen\s*\{[\s\S]*?height:\s*100%/);
  assert.match(css, /\.classroom-background,[\s\S]*?position:\s*absolute/);
  assert.match(css, /\.classroom-background img\s*\{[\s\S]*?object-fit:\s*cover/);
  assert.match(css, /\.casino-logo\s*\{[\s\S]*?object-fit:\s*contain/);
  assert.match(css, /\.casino-chip-icon\s*\{[\s\S]*?object-fit:\s*contain/);
  assert.match(
    css,
    /\.achievements-background\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?pointer-events:\s*none/,
  );
  assert.match(
    css,
    /\.achievements-background img\s*\{[\s\S]*?object-fit:\s*cover/,
  );
  assert.match(css, /\.classroom-finale\s*\{[\s\S]*?z-index:\s*3/);
  assert.match(css, /\.classroom-finale img\s*\{[\s\S]*?object-fit:\s*cover/);
  assert.match(
    css,
    /\.classroom-screen\.is-finale \.classroom-dialogue-box\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?right:[\s\S]*?bottom:/,
  );
  assert.match(css, /\.classroom-stage\s*\{[\s\S]*?min-height:\s*0/);
  assert.match(css, /\.gojo-character\s*\{[\s\S]*?object-fit:\s*contain/);
  assert.match(css, /\.classroom-dialogue-box\s*\{[\s\S]*?overflow:\s*hidden/);
  assert.match(
    css,
    /\.classroom-screen:not\(\.is-finale\) \.classroom-dialogue-box\s*\{[\s\S]*?margin-block-start:\s*clamp\(-3\.5rem, -8dvh, -1\.5rem\)/,
  );
  assert.doesNotMatch(css, /\.gojo-placeholder/);
  assert.doesNotMatch(css, /\.classroom-kicker/);
  assert.match(
    css,
    /\.classroom-speaker\s*\{[\s\S]*?font-size:\s*clamp\(0\.72rem, 2vmin, 1rem\)/,
  );
  assert.match(
    css,
    /\.classroom-dialogue-text\s*\{[\s\S]*?font-size:\s*clamp\(0\.88rem, 2\.5vmin, 1\.25rem\)/,
  );
  assert.match(
    css,
    /\.classroom-answer,[\s\S]*?\.classroom-continue\s*\{[\s\S]*?font-size:\s*clamp\(0\.85rem, 2\.25vmin, 1\.125rem\)/,
  );
  const shortLandscapeCss = css.slice(
    css.indexOf("@media (max-height: 34rem) and (min-width: 34.01rem)"),
  );
  assert.match(
    shortLandscapeCss,
    /\.classroom-speaker\s*\{[\s\S]*?font-size:\s*clamp\(0\.58rem, 2\.25dvh, 0\.73rem\)/,
  );
  assert.match(
    shortLandscapeCss,
    /\.classroom-dialogue-text\s*\{[\s\S]*?font-size:\s*clamp\(0\.68rem, 2\.75dvh, 0\.85rem\)/,
  );
  assert.match(
    shortLandscapeCss,
    /\.classroom-answer,[\s\S]*?\.classroom-continue\s*\{[\s\S]*?font-size:\s*clamp\(0\.6rem, 2\.4dvh, 0\.75rem\)/,
  );
  assert.match(css, /\.slot-lever\s*\{[\s\S]*?width:\s*1px/);
  assert.match(css, /\.slot-lever\s*\{[\s\S]*?pointer-events:\s*none/);
  assert.match(
    css,
    /\.casino-audio-controls\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?right:[\s\S]*?pointer-events:\s*auto;/,
  );
  assert.match(css, /\.slot-machine\.is-jackpot \.casino-audio-controls,/);
  assert.match(css, /\.casino-result-flash\s*\{[\s\S]*?z-index:\s*20/);
  assert.match(css, /\.casino-rules\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?right:/);
  assert.doesNotMatch(css, /\.lever-label/);
  assert.doesNotMatch(css, /\.casino-tray/);
  assert.doesNotMatch(css, /\.achievements-kicker/);
  assert.doesNotMatch(css, /casino-chip-mark|fallback-reel\.is-chip/);
  assert.match(
    css,
    /\.slot-machine\.is-ready \.jackpot-flash,[\s\S]*?display:\s*none/,
  );
});

test("3D source uses centered jackpots, a dancing tiger, and precise lever raycasting", async () => {
  // Prevent regression to flat prizes or a rectangular pointer control.
  const source = await readFile(resolve(projectRoot, "casino-3d.mjs"), "utf8");
  for (const factory of [
    "createRingPrize",
    "createFootPrize",
    "createCakePrize",
    "createCashCasePrize",
    "createSandwichPrize",
    "createTigerModel",
  ]) {
    assert.match(source, new RegExp("function " + factory + "\\("));
  }
  assert.match(source, /camera\.add\(stage\)/);
  assert.match(source, /name = "jackpot-presentation-stage"/);
  assert.doesNotMatch(source, /prizeRoot\.position\.set/);
  assert.match(source, /new THREE\.Raycaster\(\)/);
  assert.doesNotMatch(source, /character === "FICHA"/);
  assert.match(source, /context\.fillText\(character, 192, 205\)/);
  assert.match(source, /context\.drawImage\(symbolImage, 24, 24, 336, 336\)/);
  assert.match(source, /symbolImages = Array\(symbols\.length\)\.fill\(null\)/);
  assert.match(source, /leverHitMeshes = \[model\.leverArm, model\.leverKnob\]/);
  assert.match(source, /intersectObjects\(leverHitMeshes, false\)/);
  assert.doesNotMatch(source, /leverPivot.*leverHitMeshes/);
  assert.doesNotMatch(source, /function createChibiPrize\(/);
  assert.doesNotMatch(source, /tiger-smile-/);
});

test("casino source has six faces and no refunded-chip outcome", async () => {
  // Guard the simplified economy while retaining the classroom reward path.
  const applicationSource = await readFile(resolve(projectRoot, "app.js"), "utf8");
  assert.match(applicationSource, /name: "pé da prima do vaper", modelId: "foot"/);
  assert.match(applicationSource, /niasguts-casino-bait-v1/);
  assert.match(applicationSource, /const CASINO_PRIZE_CHANCE = 0\.125/);
  assert.match(applicationSource, /CLASSROOM_REWARD_TOKENS = 5/);
  assert.match(applicationSource, /symbol-coffee\.png/);
  assert.match(applicationSource, /symbol-gift\.png/);
  assert.match(applicationSource, /initializeCasinoArt\(\)/);
  assert.match(applicationSource, /initializeAchievementsBackground\(\)/);
  assert.doesNotMatch(applicationSource, /CASINO_REFUND/);
  assert.doesNotMatch(applicationSource, /character: "FICHA"/);
  assert.doesNotMatch(applicationSource, /"voce ganhou outra ficha"/);
  assert.doesNotMatch(applicationSource, /pendingCasinoOutcomeType === "refund"/);
  assert.doesNotMatch(applicationSource, /patrimônio líquido/);
  assert.doesNotMatch(applicationSource, /🪙/u);
  assert.doesNotMatch(applicationSource, /CASINO_DOUBLE_SYMBOL/);
  assert.doesNotMatch(applicationSource, /pendingCasinoOutcomeType === "double"/);
});
