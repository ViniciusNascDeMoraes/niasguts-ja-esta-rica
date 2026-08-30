"use strict";

const BIRTH_YEAR = 2000;
const BIRTH_MONTH = 10;
const BIRTH_DAY = 4;
const BIRTH_HOUR = 12;
const BIRTH_MINUTE = 16;
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MILLISECONDS_PER_DAY =
  MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;
const NAME_VARIATIONS = [
  "amanda",
  "nana",
  "niasguts",
  "nia",
  "vito corleone de saia",
  "diabo loiro",
  "demonio de porto alegre",
  "barista de porto alegre",
];
const CASINO_NORMAL_SYMBOLS = [
  { character: "☕", label: "café" },
  { character: "🐯", label: "tigre" },
  { character: "💎", label: "diamante" },
  { character: "🍒", label: "cerejas" },
  { character: "7", label: "sete" },
];
const CASINO_PRIZE_SYMBOL = { character: "🎁", label: "presente" };
const SLOT_SYMBOLS = [...CASINO_NORMAL_SYMBOLS, CASINO_PRIZE_SYMBOL];
const CASINO_PRIZES = [
  { id: "esposa-nenepira", name: "esposa do nenepira", icon: "💍" },
  { id: "prima-vaper", name: "prima do vaper", icon: "👩" },
  { id: "bolos", name: "bólos", icon: "🎂" },
];
const CASINO_PRIZE_CHANCE = 0.12;
const ACHIEVEMENTS_STORAGE_KEY = "niasguts-achievements-v1";
const INITIAL_REEL_SYMBOL_INDICES = [0, 1, 4];
const CASINO_REEL_FULL_TURNS = [5, 6, 7];
const CASINO_REEL_DURATIONS_MS = [1400, 1750, 2100];
const CASINO_SETTLE_DELAY_MS = 180;
const NEW_PRIZE_ANIMATION_MS = 1100;
const REPEATED_PRIZE_ANIMATION_MS = 450;
const CASINO_FAILURE_MESSAGES = [
  "quase! mas o tigrinho ficou com tudo.",
  "a banca venceu. continua não rica.",
  "deu green... para a casa.",
  "o prêmio foi um café imaginário.",
  "resultado oficial: zero reais e muita experiência.",
];
const MARIN_GIFS = [
  {
    src: "assets/gifs/marin-chibi.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/my-dress-up-darling-my-dress-up-darling-season-2-marin-kitagawa-my-dress-up-darling-chibi-marin-chibi-gif-15174917057877362565",
    description: "Marin Kitagawa chibi",
    width: 487,
    height: 498,
  },
  {
    src: "assets/gifs/marin-cry.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/marin-cry-marin-sad-marin-kitagawa-marin-kitagawa-gif-24940756",
    description: "Marin Kitagawa chorando",
    width: 640,
    height: 576,
  },
  {
    src: "assets/gifs/marin-love.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/my-dress-up-darling-sono-bisque-doll-wa-koi-wo-suru-sono-bisque-doll-marin-kitagawa-love-gif-5644360806955828657",
    description: "Marin Kitagawa apaixonada",
    width: 426,
    height: 320,
  },
  {
    src: "assets/gifs/marin-bisque.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/marin-marin-kitagawa-kitagawa-bisque-bisque-doll-gif-14798750337503680499",
    description: "Marin Kitagawa em My Dress-Up Darling",
    width: 498,
    height: 281,
  },
  {
    src: "assets/gifs/marin-peak.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/marin-kitagawa-marin-peak-my-dress-up-darling-its-peak-gif-18353529066937443852",
    description: "Marin Kitagawa dizendo que chegou ao auge",
    width: 422,
    height: 498,
  },
  {
    src: "assets/gifs/marin-square.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/marin-kitagawa-gif-2131086954871040042",
    description: "Marin Kitagawa",
    width: 498,
    height: 498,
  },
  {
    src: "assets/gifs/marin-bisque-doll.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/marin-kitagawa-marin-kitagawa-kitagawa-marin-bisque-doll-gif-24693857",
    description: "Marin Kitagawa em Bisque Doll",
    width: 636,
    height: 640,
  },
  {
    src: "assets/gifs/marin-sono-bisque.gif",
    sourceUrl: "https://tenor.com/pt-BR/view/marin-kitagawa-marin-kitagawa-kitagawa-marin-sono-bisque-gif-24864114",
    description: "Marin Kitagawa em Sono Bisque Doll",
    width: 401,
    height: 498,
  },
];
const MOBILE_GIF_MAX_WIDTH_REM = 34;
const mobileGifMediaQuery = window.matchMedia(
  `(max-width: ${MOBILE_GIF_MAX_WIDTH_REM}rem)`,
);
const reducedMotionMediaQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);
const selectedMarinGifs = [];
const unlockedAchievementIds = new Set();
let pendingCasinoOutcome = [];
let pendingCasinoPrize = null;
let pendingAchievementAnimation = null;
let casinoMusicWanted = true;
let casinoIsOpen = false;
let casinoMusicCommandId = 0;
let casino3D = null;
let casino3DLoadPromise = null;
let casino3DFailed = false;
let casinoPrizeAnimationTimer = 0;
let achievementsArePersistent = true;

// Load only known achievement IDs from this browser's saved progress.
try {
  const savedAchievementJson = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);

  if (savedAchievementJson !== null) {
    let savedAchievementIds = [];

    try {
      const parsedAchievementIds = JSON.parse(savedAchievementJson);

      if (Array.isArray(parsedAchievementIds)) {
        savedAchievementIds = parsedAchievementIds;
      } else {
        localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
    }

    for (const savedAchievementId of savedAchievementIds) {
      for (const prize of CASINO_PRIZES) {
        if (savedAchievementId === prize.id) {
          unlockedAchievementIds.add(prize.id);
          break;
        }
      }
    }
  }
} catch {
  achievementsArePersistent = false;
}
// IANA groups Rio Grande do Sul under the America/Sao_Paulo ruleset.
const PORTO_ALEGRE_TIME_ZONE = "America/Sao_Paulo";
const portoAlegreFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: PORTO_ALEGRE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
const counter = document.querySelector("#age-counter");
const counterValues = {
  years: document.querySelector("#years"),
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
};
const casinoDialog = document.querySelector("#casino-dialog");
const casinoOpenButton = document.querySelector("#open-casino");
const casinoLever = document.querySelector("#spin-casino");
const casinoLeverLabel = document.querySelector("#lever-label");
const slotMachine = document.querySelector("#slot-machine");
const casinoCanvas = document.querySelector("#casino-canvas");
const casinoLoading = document.querySelector("#casino-loading");
const casinoReelFallback = document.querySelector("#casino-reel-fallback");
const fallbackReels = document.querySelectorAll(".fallback-reel");
const casinoPrizePop = document.querySelector("#casino-prize-pop");
const casinoResult = document.querySelector("#casino-result");
const casinoMusic = document.querySelector("#casino-music");
const casinoMusicToggle = document.querySelector("#toggle-casino-music");
const casinoVolume = document.querySelector("#casino-volume");
const achievementsDialog = document.querySelector("#achievements-dialog");
const achievementsOpenButton = document.querySelector("#open-achievements");
const achievementsCount = document.querySelector("#achievements-count");
const achievementsProgress = document.querySelector("#achievements-progress");
const achievementSlots = document.querySelectorAll(".achievement-slot");
const achievementsPanel = document.querySelector("#achievements-panel");
const achievementCompletePlaque = document.querySelector(
  "#achievement-complete-plaque",
);
const achievementStorageNote = document.querySelector(
  "#achievement-storage-note",
);
const patchNotesDialog = document.querySelector("#patch-notes-dialog");
const marinGifFrames = document.querySelectorAll(".marin-gif-frame");

function showRandomMarinGifs() {
  // Keep two selected local Marin GIFs visible only outside mobile layouts.
  for (const gifFrame of marinGifFrames) {
    gifFrame.replaceChildren();
  }

  if (mobileGifMediaQuery.matches) {
    return;
  }

  if (selectedMarinGifs.length === 0) {
    const availableGifs = [...MARIN_GIFS];

    for (let index = 0; index < marinGifFrames.length; index += 1) {
      const randomIndex =
        index + Math.floor(Math.random() * (availableGifs.length - index));
      [availableGifs[index], availableGifs[randomIndex]] = [
        availableGifs[randomIndex],
        availableGifs[index],
      ];
    }

    selectedMarinGifs.push(...availableGifs.slice(0, marinGifFrames.length));
  }

  for (let index = 0; index < marinGifFrames.length; index += 1) {
    const gif = selectedMarinGifs[index];
    const gifFrame = marinGifFrames[index];
    const sourceLink = document.createElement("a");
    const gifImage = document.createElement("img");

    gifFrame.style.aspectRatio = `${gif.width} / ${gif.height}`;
    sourceLink.href = gif.sourceUrl;
    sourceLink.rel = "noopener noreferrer";
    sourceLink.target = "_blank";
    sourceLink.setAttribute("aria-label", `${gif.description} no Tenor`);
    gifImage.src = gif.src;
    gifImage.alt = gif.description;
    gifImage.width = gif.width;
    gifImage.height = gif.height;
    gifImage.decoding = "async";

    sourceLink.append(gifImage);
    gifFrame.append(sourceLink);
  }
}

function renderAchievements() {
  // Render locked placeholders or the prizes already earned in this browser.
  let unlockedCount = 0;

  for (let prizeIndex = 0; prizeIndex < CASINO_PRIZES.length; prizeIndex += 1) {
    const prize = CASINO_PRIZES[prizeIndex];
    const achievementSlot = achievementSlots[prizeIndex];
    const achievementIcon = achievementSlot.querySelector(".achievement-icon");
    const achievementName = achievementSlot.querySelector(".achievement-name");
    const isUnlocked = unlockedAchievementIds.has(prize.id);

    achievementSlot.classList.remove("is-new", "is-repeat");
    achievementSlot.classList.toggle("is-locked", !isUnlocked);
    achievementSlot.classList.toggle("is-unlocked", isUnlocked);

    if (isUnlocked) {
      unlockedCount += 1;
      achievementIcon.textContent = prize.icon;
      achievementName.textContent = prize.name;
      achievementSlot.setAttribute(
        "aria-label",
        `Conquista desbloqueada: ${prize.name}`,
      );
    } else {
      achievementIcon.textContent = "?";
      achievementName.textContent = "conquista oculta";
      achievementSlot.setAttribute("aria-label", "Conquista oculta");
    }
  }

  achievementsCount.textContent = `${unlockedCount}/${CASINO_PRIZES.length}`;
  achievementsProgress.textContent =
    `${unlockedCount} de ${CASINO_PRIZES.length} desbloqueadas`;
  const isComplete = unlockedCount === CASINO_PRIZES.length;
  achievementsPanel.classList.toggle("is-complete", isComplete);
  achievementCompletePlaque.hidden = !isComplete;
  achievementStorageNote.hidden = achievementsArePersistent;
}

function playPendingAchievementAnimation() {
  // Replay the latest earned trophy animation when the cabinet becomes visible.
  if (pendingAchievementAnimation === null) {
    return;
  }

  const prizeIndex = CASINO_PRIZES.findIndex(
    (prize) => prize.id === pendingAchievementAnimation.prizeId,
  );
  const animationClass = pendingAchievementAnimation.isNew ? "is-new" : "is-repeat";
  pendingAchievementAnimation = null;

  if (prizeIndex < 0 || reducedMotionMediaQuery.matches) {
    return;
  }

  const achievementSlot = achievementSlots[prizeIndex];
  achievementSlot.classList.remove("is-new", "is-repeat");
  void achievementSlot.offsetWidth;
  achievementSlot.classList.add(animationClass);
}

function openAchievements() {
  // Open the three-slot achievement collection as a modal dialog.
  if (!achievementsDialog.open) {
    achievementsDialog.showModal();
  }

  playPendingAchievementAnimation();
}

function updateCasinoMusicControl() {
  // Reflect the current playback state in the music button.
  const isPlaying = !casinoMusic.paused && !casinoMusic.ended;
  casinoMusicToggle.textContent = isPlaying ? "⏸ MÚSICA" : "▶ MÚSICA";
  casinoMusicToggle.setAttribute("aria-pressed", String(isPlaying));
}

async function reconcileCasinoMusic() {
  // Apply the latest desired music state and ignore stale play promises.
  const commandId = casinoMusicCommandId + 1;
  casinoMusicCommandId = commandId;
  casinoMusic.volume = Number(casinoVolume.value) / 100;

  if (!casinoIsOpen || !casinoMusicWanted) {
    casinoMusic.pause();
    updateCasinoMusicControl();
    return;
  }

  try {
    await casinoMusic.play();

    if (
      commandId !== casinoMusicCommandId ||
      !casinoIsOpen ||
      !casinoMusicWanted
    ) {
      casinoMusic.pause();
    }
  } catch {
    if (commandId === casinoMusicCommandId) {
      casinoMusicWanted = false;
    }
  }

  updateCasinoMusicControl();
}

function toggleCasinoMusic() {
  // Toggle the visitor's music preference for the current page visit.
  casinoMusicWanted = !casinoMusicWanted;
  void reconcileCasinoMusic();
}

function updateCasinoMusicVolume() {
  // Apply the selected volume immediately to the casino music.
  casinoMusic.volume = Number(casinoVolume.value) / 100;
}

function readCasinoPalette() {
  // Read semantic CSS colors for matching Three.js materials.
  const rootStyles = getComputedStyle(document.documentElement);
  const readColor = (propertyName) => rootStyles.getPropertyValue(propertyName).trim();
  return {
    navyDeep: readColor("--navy-deep"),
    navy: readColor("--navy"),
    shirt: readColor("--shirt"),
    hairBlonde: readColor("--hair-blonde"),
    hairBlondeSoft: readColor("--hair-blonde-soft"),
    hairPink: readColor("--hair-pink"),
    hairPinkDark: readColor("--hair-pink-dark"),
    hairPinkSoft: readColor("--hair-pink-soft"),
    skirtBlueSoft: readColor("--skirt-blue-soft"),
    casinoGlass: readColor("--casino-glass"),
  };
}

function showCasinoFallback() {
  // Keep the casino playable when WebGL or its local module is unavailable.
  casino3DFailed = true;
  casino3D = null;
  slotMachine.classList.remove("is-loading", "is-ready");
  slotMachine.classList.add("is-fallback");
  casinoReelFallback.hidden = false;
  casinoLoading.textContent = "modo 3D indisponível; usando rolos simples.";
}

async function ensureCasino3D() {
  // Load and initialize the local Three.js scene at most once per page visit.
  if (casino3D !== null || casino3DFailed) {
    return casino3D;
  }

  if (casino3DLoadPromise === null) {
    casino3DLoadPromise = import("./casino-3d.mjs")
      .then(({ createCasino3D }) => {
        // Build the fixed-camera machine only after the module is available.
        casino3D = createCasino3D({
          canvas: casinoCanvas,
          palette: readCasinoPalette(),
          symbols: SLOT_SYMBOLS.map((symbol) => symbol.character),
          initialIndices: INITIAL_REEL_SYMBOL_INDICES,
          onContextFailure: showCasinoFallback,
        });
        slotMachine.classList.remove("is-loading", "is-fallback");
        slotMachine.classList.add("is-ready");
        casinoReelFallback.hidden = true;
        casino3D.setVisible(casinoDialog.open);
        return casino3D;
      })
      .catch((error) => {
        // Preserve the game and report the rendering failure for diagnostics.
        console.warn("Não foi possível iniciar o cassino 3D.", error);
        showCasinoFallback();
        return null;
      });
  }

  return casino3DLoadPromise;
}

function openCasino() {
  // Open the fictional casino, initialize WebGL, and reconcile its music.
  if (!casinoDialog.open) {
    casinoDialog.showModal();
  }

  casinoIsOpen = true;
  void reconcileCasinoMusic();
  void ensureCasino3D().then((casinoView) => {
    // Resume rendering only if the dialog is still visible after module loading.
    if (casinoView !== null) {
      casinoView.setVisible(casinoDialog.open);
    }
  });
}

function handleCasinoClose() {
  // Pause rendering and audio without changing the visitor's music preference.
  casinoIsOpen = false;
  casino3D?.setVisible(false);
  void reconcileCasinoMusic();
}

function handleCasinoVisibilityChange() {
  // Render the machine only while both its dialog and browser tab are visible.
  casino3D?.setVisible(casinoDialog.open && !document.hidden);
}

function handleCasinoMusicError() {
  // Recover from an unavailable audio resource with an accurate play button.
  casinoMusicWanted = false;
  updateCasinoMusicControl();
}

function handleCasinoLeverFocus() {
  // Mirror keyboard focus on the physical Three.js lever.
  casino3D?.setLeverFocus(true);
}

function handleCasinoLeverBlur() {
  // Remove the rendered focus highlight after the lever loses focus.
  casino3D?.setLeverFocus(false);
}

function handlePatchNotesShortcut(event) {
  // Toggle the secret patch notes with P while preserving browser modifiers.
  const eventTarget = event.target;
  const isEditableTarget =
    eventTarget !== null &&
    typeof eventTarget.matches === "function" &&
    (eventTarget.matches("input, textarea, select") ||
      eventTarget.isContentEditable);
  const isPatchNotesKey =
    typeof event.key === "string" && event.key.toLowerCase() === "p";

  if (
    event.defaultPrevented ||
    event.repeat ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    isEditableTarget ||
    !isPatchNotesKey
  ) {
    return;
  }

  if (patchNotesDialog.open) {
    event.preventDefault();
    patchNotesDialog.close();
    return;
  }

  if (casinoDialog.open || achievementsDialog.open) {
    return;
  }

  event.preventDefault();
  patchNotesDialog.showModal();
}

function showCasinoPrizeAnimation(prize, isNewPrize) {
  // Raise a new prize or bounce a repeated prize above the payout tray.
  window.clearTimeout(casinoPrizeAnimationTimer);
  casinoPrizePop.classList.remove("is-new", "is-repeat");
  casinoPrizePop.textContent = prize.icon;

  if (reducedMotionMediaQuery.matches) {
    casinoPrizePop.style.opacity = "1";
    casinoPrizeAnimationTimer = window.setTimeout(() => {
      // Hide the static reduced-motion reveal after it has been readable.
      casinoPrizePop.style.opacity = "0";
    }, REPEATED_PRIZE_ANIMATION_MS);
    return;
  }

  void casinoPrizePop.offsetWidth;
  casinoPrizePop.classList.add(isNewPrize ? "is-new" : "is-repeat");
  casinoPrizeAnimationTimer = window.setTimeout(
    () => {
      // Clear the completed class so the same prize can animate again.
      casinoPrizePop.classList.remove("is-new", "is-repeat");
    },
    isNewPrize ? NEW_PRIZE_ANIMATION_MS : REPEATED_PRIZE_ANIMATION_MS,
  );
}

function finishCasinoSpin() {
  // Reveal the prepared loss or unlock the prepared mystery prize.
  const outcomeLabels = [];

  for (
    let reelIndex = 0;
    reelIndex < pendingCasinoOutcome.length;
    reelIndex += 1
  ) {
    outcomeLabels.push(pendingCasinoOutcome[reelIndex].label);
  }

  slotMachine.classList.remove("is-spinning");
  slotMachine.removeAttribute("aria-busy");
  for (let reelIndex = 0; reelIndex < fallbackReels.length; reelIndex += 1) {
    fallbackReels[reelIndex].textContent = pendingCasinoOutcome[reelIndex].character;
  }

  if (pendingCasinoPrize !== null) {
    const isNewPrize = !unlockedAchievementIds.has(pendingCasinoPrize.id);

    slotMachine.classList.add("is-winning");
    casinoResult.classList.add("is-prize");
    casino3D?.celebrate(true, reducedMotionMediaQuery.matches);
    slotMachine.setAttribute(
      "aria-label",
      `Resultado: ${outcomeLabels.join(", ")}. Prêmio: ${pendingCasinoPrize.name}`,
    );

    if (isNewPrize) {
      unlockedAchievementIds.add(pendingCasinoPrize.id);

      try {
        const savedAchievementIds = [];

        for (const prize of CASINO_PRIZES) {
          if (unlockedAchievementIds.has(prize.id)) {
            savedAchievementIds.push(prize.id);
          }
        }

        localStorage.setItem(
          ACHIEVEMENTS_STORAGE_KEY,
          JSON.stringify(savedAchievementIds),
        );
      } catch {
        achievementsArePersistent = false;
      }

      casinoResult.textContent = `VOCÊ GANHOU: ${pendingCasinoPrize.name}!`;
      renderAchievements();
    } else {
      casinoResult.textContent =
        `PRÊMIO REPETIDO: ${pendingCasinoPrize.name}.`;
    }

    pendingAchievementAnimation = {
      prizeId: pendingCasinoPrize.id,
      isNew: isNewPrize,
    };
    showCasinoPrizeAnimation(pendingCasinoPrize, isNewPrize);
  } else {
    slotMachine.classList.add("is-denied");
    casinoResult.classList.remove("is-prize");
    casino3D?.celebrate(false, reducedMotionMediaQuery.matches);
    slotMachine.setAttribute(
      "aria-label",
      `Resultado: ${outcomeLabels.join(", ")}`,
    );
    casinoResult.textContent =
      CASINO_FAILURE_MESSAGES[
        Math.floor(Math.random() * CASINO_FAILURE_MESSAGES.length)
      ];
  }

  casinoLever.disabled = false;
  casinoLeverLabel.textContent = "DE NOVO";
  casinoLever.setAttribute("aria-label", "Puxar alavanca do cassino novamente");
}

async function waitForCasinoAnimation(milliseconds) {
  // Wait for a fallback animation or short result-settle interval.
  if (milliseconds <= 0) {
    return;
  }

  await new Promise((resolve) => {
    // Resolve after the requested visual delay without blocking the page.
    window.setTimeout(resolve, milliseconds);
  });
}

async function startCasinoSpin() {
  // Prepare a controlled mystery-prize trinca or an ordinary losing outcome.
  if (casinoLever.disabled) {
    return;
  }

  pendingCasinoOutcome = [];
  pendingCasinoPrize = null;

  if (Math.random() < CASINO_PRIZE_CHANCE) {
    const availablePrizes = [];

    for (const prize of CASINO_PRIZES) {
      if (!unlockedAchievementIds.has(prize.id)) {
        availablePrizes.push(prize);
      }
    }

    if (availablePrizes.length === 0) {
      availablePrizes.push(...CASINO_PRIZES);
    }

    pendingCasinoPrize =
      availablePrizes[Math.floor(Math.random() * availablePrizes.length)];

    for (
      let reelIndex = 0;
      reelIndex < INITIAL_REEL_SYMBOL_INDICES.length;
      reelIndex += 1
    ) {
      pendingCasinoOutcome.push(CASINO_PRIZE_SYMBOL);
    }
  } else {
    for (
      let reelIndex = 0;
      reelIndex < INITIAL_REEL_SYMBOL_INDICES.length;
      reelIndex += 1
    ) {
      pendingCasinoOutcome.push(
        CASINO_NORMAL_SYMBOLS[
          Math.floor(Math.random() * CASINO_NORMAL_SYMBOLS.length)
        ],
      );
    }

    const allSymbolsMatch =
      pendingCasinoOutcome[0] === pendingCasinoOutcome[1] &&
      pendingCasinoOutcome[1] === pendingCasinoOutcome[2];

    if (allSymbolsMatch) {
      const matchingIndex = CASINO_NORMAL_SYMBOLS.indexOf(
        pendingCasinoOutcome[0],
      );
      let replacementIndex = Math.floor(
        Math.random() * (CASINO_NORMAL_SYMBOLS.length - 1),
      );

      if (replacementIndex >= matchingIndex) {
        replacementIndex += 1;
      }

      pendingCasinoOutcome[pendingCasinoOutcome.length - 1] =
        CASINO_NORMAL_SYMBOLS[replacementIndex];
    }
  }

  casinoLever.disabled = true;
  casinoLeverLabel.textContent = "GIRANDO";
  casinoLever.setAttribute("aria-label", "Alavanca acionada; rolos girando");
  casinoResult.textContent = "os rolos estão girando...";
  casinoResult.classList.remove("is-prize");
  slotMachine.classList.remove("is-denied", "is-winning");
  slotMachine.classList.add("is-spinning");
  slotMachine.setAttribute("aria-busy", "true");

  const targetIndices = pendingCasinoOutcome.map((symbol) =>
    SLOT_SYMBOLS.indexOf(symbol),
  );
  const reducedMotion = reducedMotionMediaQuery.matches;
  const casinoView = await ensureCasino3D();

  if (casinoView !== null) {
    try {
      await casinoView.spinTo(targetIndices, {
        durations: CASINO_REEL_DURATIONS_MS,
        fullTurns: CASINO_REEL_FULL_TURNS,
        reducedMotion,
      });
    } catch (error) {
      console.warn("A animação 3D do cassino falhou.", error);
      showCasinoFallback();
      await waitForCasinoAnimation(
        reducedMotion
          ? 0
          : CASINO_REEL_DURATIONS_MS[CASINO_REEL_DURATIONS_MS.length - 1],
      );
    }
  } else {
    await waitForCasinoAnimation(
      reducedMotion
        ? 0
        : CASINO_REEL_DURATIONS_MS[CASINO_REEL_DURATIONS_MS.length - 1],
    );
  }

  await waitForCasinoAnimation(reducedMotion ? 0 : CASINO_SETTLE_DELAY_MS);
  finishCasinoSpin();
}

function getPortoAlegreParts(date) {
  // Read an instant as calendar fields in Porto Alegre.
  const fields = {};

  for (const part of portoAlegreFormatter.formatToParts(date)) {
    if (part.type !== "literal") {
      fields[part.type] = Number(part.value);
    }
  }

  return fields;
}

function getPortoAlegreBirthday(year) {
  // Convert the birthday time in Porto Alegre into an exact instant.
  const targetAsUtc = Date.UTC(
    year,
    BIRTH_MONTH - 1,
    BIRTH_DAY,
    BIRTH_HOUR,
    BIRTH_MINUTE,
  );
  let instant = targetAsUtc;
  const offsetCorrectionPasses = 3;

  for (let pass = 0; pass < offsetCorrectionPasses; pass += 1) {
    const fields = getPortoAlegreParts(new Date(instant));
    const displayedAsUtc = Date.UTC(
      fields.year,
      fields.month - 1,
      fields.day,
      fields.hour,
      fields.minute,
      fields.second,
    );
    instant -= displayedAsUtc - targetAsUtc;
  }

  return new Date(instant);
}

const birthInstant = getPortoAlegreBirthday(BIRTH_YEAR);

function updateCounter() {
  // Show the completed years and elapsed time since the latest birthday.
  const now = new Date();

  if (now < birthInstant) {
    for (const value of Object.values(counterValues)) {
      value.textContent = "0";
    }

    counter.setAttribute("aria-label", "A data atual é anterior ao nascimento");
    return;
  }

  let latestBirthdayYear = getPortoAlegreParts(now).year;
  let latestBirthday = getPortoAlegreBirthday(latestBirthdayYear);

  if (now < latestBirthday) {
    latestBirthdayYear -= 1;
    latestBirthday = getPortoAlegreBirthday(latestBirthdayYear);
  }

  let remainingMilliseconds = now - latestBirthday;
  const years = latestBirthdayYear - BIRTH_YEAR;
  const days = Math.floor(remainingMilliseconds / MILLISECONDS_PER_DAY);
  remainingMilliseconds %= MILLISECONDS_PER_DAY;

  const hours = Math.floor(
    remainingMilliseconds /
      (MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR),
  );
  remainingMilliseconds %=
    MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR;

  const minutes = Math.floor(
    remainingMilliseconds / (MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE),
  );
  const seconds = Math.floor(
    (remainingMilliseconds % (MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE)) /
      MILLISECONDS_PER_SECOND,
  );

  counterValues.years.textContent = String(years).padStart(2, "0");
  counterValues.days.textContent = String(days).padStart(3, "0");
  counterValues.hours.textContent = String(hours).padStart(2, "0");
  counterValues.minutes.textContent = String(minutes).padStart(2, "0");
  counterValues.seconds.textContent = String(seconds).padStart(2, "0");
  counter.setAttribute(
    "aria-label",
    `${years} anos, ${days} dias, ${hours} horas, ${minutes} minutos, ` +
      `${seconds} segundos`,
  );
}

function scheduleNextUpdate() {
  // Refresh now and align the next update with the next real clock second.
  updateCounter();
  const delay = MILLISECONDS_PER_SECOND - (Date.now() % MILLISECONDS_PER_SECOND);
  window.setTimeout(scheduleNextUpdate, delay);
}

updateCasinoMusicVolume();
updateCasinoMusicControl();
renderAchievements();
casinoOpenButton.addEventListener("click", openCasino);
achievementsOpenButton.addEventListener("click", openAchievements);
casinoLever.addEventListener("click", startCasinoSpin);
casinoLever.addEventListener("focus", handleCasinoLeverFocus);
casinoLever.addEventListener("blur", handleCasinoLeverBlur);
casinoMusicToggle.addEventListener("click", toggleCasinoMusic);
casinoVolume.addEventListener("input", updateCasinoMusicVolume);
casinoMusic.addEventListener("play", updateCasinoMusicControl);
casinoMusic.addEventListener("pause", updateCasinoMusicControl);
casinoMusic.addEventListener("ended", updateCasinoMusicControl);
casinoMusic.addEventListener("error", handleCasinoMusicError);
casinoDialog.addEventListener("close", handleCasinoClose);
document.addEventListener("keydown", handlePatchNotesShortcut);
document.addEventListener("visibilitychange", handleCasinoVisibilityChange);
mobileGifMediaQuery.addEventListener("change", showRandomMarinGifs);

// Pick one displayed name for this page visit.
const selectedName =
  NAME_VARIATIONS[Math.floor(Math.random() * NAME_VARIATIONS.length)];
const questionText = `${selectedName} já está rica?`;
document.querySelector("#question").textContent = questionText;
document.title = questionText;

showRandomMarinGifs();
scheduleNextUpdate();
