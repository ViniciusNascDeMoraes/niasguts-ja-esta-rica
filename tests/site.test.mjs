import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
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
  const releaseEntries = Array.from(
    { length: 21 },
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
  getElement("#casino-volume").value = "25";
  getElement("#casino-result-flash").hidden = true;

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
    matchMedia: () => ({ matches: true, addEventListener() {} }),
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
    context,
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

test("static page exposes the version 1.11 full-screen experience", async () => {
  // Verify deployment markup and all required native controls.
  const html = await readFile(resolve(projectRoot, "index.html"), "utf8");
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /src="app\.js" defer/);
  assert.match(html, /id="casino-canvas"/);
  assert.match(html, /id="casino-token-balance"/);
  assert.match(html, /id="casino-jackpot-continue"/);
  assert.match(html, /id="achievements-canvas"/);
  assert.match(html, /id="toggle-casino-music"/);
  assert.match(html, /versão 1\.11/);
  assert.match(html, /id="casino-title">nanaBet<\/h2>/);
  assert.match(html, /class="casino-chip-mark"/);
  assert.match(html, /id="casino-result-flash"/);
  assert.equal((html.match(/data-prize-id=/g) ?? []).length, 5);
  assert.equal((html.match(/class="release-entry"/g) ?? []).length, 21);
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
  ];
  for (const mediaPath of mediaPaths) {
    const bytes = await readFile(resolve(projectRoot, mediaPath));
    assert.ok(bytes.byteLength > 1024, mediaPath + " is unexpectedly small");
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

test("all seven reel faces stop exactly on the selected symbol", async () => {
  // Cover every current and target face while preserving backward rotation.
  const casinoModule = await import(
    pathToFileURL(resolve(projectRoot, "casino-3d.mjs")).href
  );
  const symbolCount = 7;
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

test("one random roll selects the three exact outcome bands", async () => {
  // Assert inclusive lower bounds and exclusive upper bounds.
  const harness = await loadHarness();
  const scenarios = [
    [0, "refund"],
    [0.499999, "refund"],
    [0.5, "prize"],
    [0.624999, "prize"],
    [0.625, "loss"],
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

test("chip debit and exclusive payouts produce the intended net balance", async () => {
  // A refund nets zero while both a prize and a loss net minus one.
  const scenarios = [
    { roll: [0.2], expectedBalance: 10, expectedType: "refund" },
    { roll: [0.55, 0], expectedBalance: 9, expectedType: "prize" },
    { roll: [0.9, 0, 0.25, 0.5, 0], expectedBalance: 9, expectedType: "loss" },
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
      scenario.expectedBalance,
    );
    assert.equal(
      harness.storage.get("niasguts-casino-fichas-v1"),
      String(scenario.expectedBalance),
    );
  }
});

test("fallback reels draw one local chip and clear it on the next loss", async () => {
  // Exercise the font-independent chip path through complete fallback spins.
  const harness = await loadHarness({ savedTokens: 5 });
  harness.setRandomValues([0.2]);
  await vm.runInContext("startCasinoSpin()", harness.context);

  for (const reel of harness.fallbackReels) {
    assert.equal(reel.classList.contains("is-chip"), true);
    assert.equal(reel.dataset.chipCount, "1");
    assert.equal(reel.textContent, "");
  }

  harness.setRandomValues([0.9, 0, 0.25, 0.5, 0]);
  await vm.runInContext("startCasinoSpin()", harness.context);

  for (const reel of harness.fallbackReels) {
    assert.equal(reel.classList.contains("is-chip"), false);
    assert.equal("chipCount" in reel.dataset, false);
    assert.notEqual(reel.textContent, "");
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
    harness.setRandomValues([0.55, 0]);
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

  harness.setRandomValues([0.55, 0]);
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
  // Ready, spinning, refund, and loss feedback share one non-jackpot surface.
  const harness = await loadHarness();
  vm.runInContext("casinoIsOpen = true", harness.context);
  const messages = [
    ["pronta para tentar?", "default"],
    ["os rolos estão girando...", "spinning"],
    ["a ficha voltou. patrimônio líquido: igual.", "token"],
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

test("zero chips disable the lever and expose the future minigame notice", async () => {
  // Show the final loss first, then reveal the no-chip state without a reset path.
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
  assert.equal(
    harness.elements.get("#spin-casino").getAttribute("aria-label"),
    "Sem fichas; minigame em breve",
  );
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
    [false, false, false, ...Array(18).fill(true)],
  );
  assert.equal(harness.elements.get("#release-page-status").textContent, "1/7");
  vm.runInContext("changeReleasePage(1)", harness.context);
  assert.deepEqual(
    harness.releaseEntries.map((entry) => entry.hidden),
    [true, true, true, false, false, false, ...Array(15).fill(true)],
  );

  const shortcut = {
    key: "P",
    target: new FakeElement("main"),
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    preventDefault() {},
  };
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
  assert.match(css, /\.fallback-reel\.is-chip::before[\s\S]*?repeating-conic-gradient/);
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
  assert.match(source, /character === "FICHA"/);
  assert.match(source, /context\.arc\(/);
  assert.match(source, /leverHitMeshes = \[model\.leverArm, model\.leverKnob\]/);
  assert.match(source, /intersectObjects\(leverHitMeshes, false\)/);
  assert.doesNotMatch(source, /leverPivot.*leverHitMeshes/);
  assert.doesNotMatch(source, /function createChibiPrize\(/);
});

test("casino source has one font-independent chip and no double payout", async () => {
  // Guard the simplified seven-face economy and its procedural marker.
  const applicationSource = await readFile(resolve(projectRoot, "app.js"), "utf8");
  assert.match(applicationSource, /character: "FICHA", label: "ficha"/);
  assert.match(applicationSource, /name: "pé da prima do vaper", modelId: "foot"/);
  assert.match(applicationSource, /niasguts-casino-bait-v1/);
  assert.doesNotMatch(applicationSource, /🪙/u);
  assert.doesNotMatch(applicationSource, /CASINO_DOUBLE_SYMBOL/);
  assert.doesNotMatch(applicationSource, /pendingCasinoOutcomeType === "double"/);
});
