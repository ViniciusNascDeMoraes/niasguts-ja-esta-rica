import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

class FakeClassList {
  // Store CSS classes for behavior tests without a browser DOM.
  constructor() {
    this.values = new Set();
  }

  add(...names) {
    // Add every requested class.
    for (const name of names) {
      this.values.add(name);
    }
  }

  remove(...names) {
    // Remove every requested class.
    for (const name of names) {
      this.values.delete(name);
    }
  }

  toggle(name, force) {
    // Toggle one class using normal DOM force semantics.
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
    // Report whether a class is currently stored.
    return this.values.has(name);
  }
}

class FakeElement {
  // Provide the small DOM surface used by the static page script.
  constructor(name = "element") {
    this.name = name;
    this.attributes = new Map();
    this.classList = new FakeClassList();
    this.listeners = new Map();
    this.style = {};
    this.childrenBySelector = new Map();
    this.textContent = "";
    this.hidden = false;
    this.open = false;
    this.disabled = false;
    this.isContentEditable = false;
    this.offsetWidth = 100;
  }

  addEventListener(type, listener) {
    // Record an event listener for later inspection or dispatch.
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(listener);
  }

  dispatch(type) {
    // Invoke every listener registered for one event type.
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ type, target: this });
    }
  }

  setAttribute(name, value) {
    // Store a string attribute value.
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    // Read a previously stored attribute value.
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    // Remove one stored attribute.
    this.attributes.delete(name);
  }

  querySelector(selector) {
    // Return a stable child element for an internal selector.
    if (!this.childrenBySelector.has(selector)) {
      this.childrenBySelector.set(selector, new FakeElement(selector));
    }
    return this.childrenBySelector.get(selector);
  }

  replaceChildren(...children) {
    // Preserve replacement children for compatibility with the page script.
    this.replacementChildren = children;
  }

  append(...children) {
    // Preserve appended children for compatibility with GIF rendering.
    this.appendedChildren = [...(this.appendedChildren ?? []), ...children];
  }

  matches() {
    // Treat test elements as non-editable unless explicitly configured.
    return false;
  }

  showModal() {
    // Open a fake modal dialog.
    this.open = true;
  }

  close() {
    // Close a fake modal dialog and notify listeners.
    this.open = false;
    this.dispatch("close");
  }
}

function createPageHarness(savedAchievements = []) {
  // Execute the real application script against a deterministic fake page.
  const elements = new Map();
  const achievementSlots = [
    new FakeElement("achievement-0"),
    new FakeElement("achievement-1"),
    new FakeElement("achievement-2"),
  ];
  const fallbackReels = [
    new FakeElement("fallback-0"),
    new FakeElement("fallback-1"),
    new FakeElement("fallback-2"),
  ];
  const audio = new FakeElement("casino-music");
  audio.paused = true;
  audio.ended = false;
  audio.volume = 0;
  audio.currentTime = 0;
  audio.play = async () => {
    // Simulate successful playback and its media event.
    audio.paused = false;
    audio.dispatch("play");
  };
  audio.pause = () => {
    // Simulate synchronous pause and its media event.
    audio.paused = true;
    audio.dispatch("pause");
  };

  function getElement(selector) {
    // Return stable fake elements for every document query.
    if (!elements.has(selector)) {
      elements.set(selector, new FakeElement(selector));
    }
    return elements.get(selector);
  }

  elements.set("#casino-music", audio);
  const storage = new Map();
  if (savedAchievements.length > 0) {
    storage.set("niasguts-achievements-v1", JSON.stringify(savedAchievements));
  }

  let randomValues = [];
  const fakeMath = Object.create(Math);
  fakeMath.random = () => randomValues.shift() ?? 0;
  const timers = new Map();
  let nextTimerId = 1;
  const windowObject = {
    devicePixelRatio: 1,
    matchMedia: () => ({ matches: true, addEventListener() {} }),
    setTimeout(callback, milliseconds) {
      // Store timers without recursively running the age-counter scheduler.
      const timerId = nextTimerId;
      nextTimerId += 1;
      timers.set(timerId, { callback, milliseconds });
      return timerId;
    },
    clearTimeout(timerId) {
      // Remove one queued fake timer.
      timers.delete(timerId);
    },
  };
  const documentObject = {
    hidden: false,
    title: "",
    documentElement: new FakeElement("documentElement"),
    querySelector: getElement,
    querySelectorAll(selector) {
      // Return the repeated elements used by the real application.
      if (selector === ".achievement-slot") {
        return achievementSlots;
      }
      if (selector === ".fallback-reel") {
        return fallbackReels;
      }
      if (selector === ".marin-gif-frame") {
        return [];
      }
      return [];
    },
    createElement: (name) => new FakeElement(name),
    addEventListener() {},
  };
  const context = vm.createContext({
    console,
    Date,
    Intl,
    Math: fakeMath,
    performance,
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key),
    },
    document: documentObject,
    getComputedStyle: () => ({ getPropertyValue: () => "#000000" }),
    window: windowObject,
  });
  windowObject.document = documentObject;

  return {
    achievementSlots,
    audio,
    context,
    elements,
    fallbackReels,
    setRandomValues(values) {
      // Replace the deterministic random sequence for the next scenario.
      randomValues = [...values];
    },
    storage,
  };
}

async function loadHarness(savedAchievements = []) {
  // Load and run the production script in one isolated test context.
  const harness = createPageHarness(savedAchievements);
  const applicationSource = await readFile(resolve(projectRoot, "app.js"), "utf8");
  vm.runInContext(applicationSource, harness.context, { filename: "app.js" });
  vm.runInContext("casino3DFailed = true", harness.context);
  return harness;
}

test("static page references split assets and version 1.7", async () => {
  // Verify the deployment entry point and required accessible controls.
  const html = await readFile(resolve(projectRoot, "index.html"), "utf8");
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /src="app\.js" defer/);
  assert.match(html, /id="casino-canvas"/);
  assert.match(html, /id="toggle-casino-music"/);
  assert.match(html, /id="achievement-complete-plaque"/);
  assert.match(html, /versão 1\.7/);
  assert.doesNotMatch(html, /<style>/);
  assert.doesNotMatch(html, /<script>\s*["']use strict/);
});

test("vendored Three.js module and MIT notice have pinned contents", async () => {
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
  const moduleHash = createHash("sha256").update(moduleBytes).digest("hex");
  const coreHash = createHash("sha256").update(coreBytes).digest("hex");
  assert.equal(
    moduleHash,
    "86bcee248b64f44bcfc23c331ae74619061957d59cab040171dcb6fb5900beb6",
  );
  assert.equal(
    coreHash,
    "05b2609338c76cd65daf74f3ac515bc9a5045e1b3b33edc07d8c9bd55250fa90",
  );
  assert.match(license, /Copyright © 2010-2026 three\.js authors/);
  assert.match(license, /The MIT License/);

  const casinoModule = await import(
    pathToFileURL(resolve(projectRoot, "casino-3d.mjs")).href
  );
  assert.equal(typeof casinoModule.createCasino3D, "function");
});

test("physical reels stop with the selected symbol facing forward", async () => {
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
      const normalizedRotation = ((targetRotation % fullTurn) + fullTurn) % fullTurn;
      const expectedRotation = targetIndex * symbolAngle;
      assert.ok(Math.abs(normalizedRotation - expectedRotation) < 1e-9);
      assert.ok(targetRotation <= currentRotation - 5 * fullTurn);
    }
  }
});

test("every ordinary symbol combination remains a loss", async () => {
  // Run all 125 ordinary reel combinations through the complete spin scenario.
  const harness = await loadHarness();

  for (let first = 0; first < 5; first += 1) {
    for (let second = 0; second < 5; second += 1) {
      for (let third = 0; third < 5; third += 1) {
        harness.setRandomValues([
          0.12,
          (first + 0.01) / 5,
          (second + 0.01) / 5,
          (third + 0.01) / 5,
          0,
          0,
        ]);
        await vm.runInContext("startCasinoSpin()", harness.context);
        const labels = vm.runInContext(
          "pendingCasinoOutcome.map((symbol) => symbol.label)",
          harness.context,
        );
        assert.equal(new Set(labels).size > 1, true);
        assert.equal(vm.runInContext("pendingCasinoPrize", harness.context), null);
      }
    }
  }
});

test("the 12 percent boundary awards locked prizes before repeats", async () => {
  // Unlock all three prizes in order and only then permit a repeated reward.
  const harness = await loadHarness();

  for (let prizeIndex = 0; prizeIndex < 3; prizeIndex += 1) {
    harness.setRandomValues([0.119999, 0]);
    await vm.runInContext("startCasinoSpin()", harness.context);
    assert.equal(
      vm.runInContext("unlockedAchievementIds.size", harness.context),
      prizeIndex + 1,
    );
  }

  harness.setRandomValues([0.119999, 0]);
  await vm.runInContext("startCasinoSpin()", harness.context);
  assert.equal(vm.runInContext("unlockedAchievementIds.size", harness.context), 3);
  assert.equal(
    harness.elements.get("#casino-result").textContent,
    "PRÊMIO REPETIDO: esposa do nenepira.",
  );
  assert.equal(
    harness.storage.get("niasguts-achievements-v1"),
    JSON.stringify(["esposa-nenepira", "prima-vaper", "bolos"]),
  );
});

test("manual pause wins over an unresolved play request", async () => {
  // Reproduce the former race and assert that stale playback cannot resume.
  const harness = await loadHarness();
  let resolvePlay;
  harness.audio.play = () => {
    // Leave playback pending until the scenario explicitly resolves it.
    harness.audio.paused = false;
    return new Promise((resolvePlayPromise) => {
      resolvePlay = resolvePlayPromise;
    });
  };
  harness.audio.pause = () => {
    // Record the synchronous pause used by the current command.
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

test("manual pause persists across close and reopen during one visit", async () => {
  // Verify the full dialog lifecycle without resetting playback position.
  const harness = await loadHarness();
  vm.runInContext("openCasino()", harness.context);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(harness.audio.paused, false);

  vm.runInContext("toggleCasinoMusic()", harness.context);
  await Promise.resolve();
  assert.equal(harness.audio.paused, true);
  assert.equal(vm.runInContext("casinoMusicWanted", harness.context), false);

  harness.elements.get("#casino-dialog").close();
  vm.runInContext("openCasino()", harness.context);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(harness.audio.paused, true);
  assert.equal(harness.audio.currentTime, 0);
});

test("rejected playback leaves a truthful retry control", async () => {
  // Handle browser autoplay rejection without a stale pressed state.
  const harness = await loadHarness();
  harness.audio.play = async () => {
    // Reproduce a browser policy rejection.
    throw new Error("Autoplay blocked");
  };

  await vm.runInContext(
    "casinoIsOpen = true; casinoMusicWanted = true; reconcileCasinoMusic()",
    harness.context,
  );

  assert.equal(harness.audio.paused, true);
  assert.equal(vm.runInContext("casinoMusicWanted", harness.context), false);
  assert.equal(
    harness.elements.get("#toggle-casino-music").getAttribute("aria-pressed"),
    "false",
  );
  assert.equal(
    harness.elements.get("#toggle-casino-music").textContent,
    "▶ MÚSICA",
  );
});

test("restored complete progress turns the trophy cabinet gold", async () => {
  // Restore all known prizes and expose the permanent completion plaque.
  const harness = await loadHarness([
    "esposa-nenepira",
    "prima-vaper",
    "bolos",
    "unknown-prize",
  ]);

  assert.equal(
    harness.elements.get("#achievements-panel").classList.contains("is-complete"),
    true,
  );
  assert.equal(
    harness.elements.get("#achievement-complete-plaque").hidden,
    false,
  );
  assert.equal(vm.runInContext("unlockedAchievementIds.size", harness.context), 3);
});
