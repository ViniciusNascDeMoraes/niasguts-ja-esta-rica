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
  "don corleone de saia",
  "pobre lazarenta",
];
const CASINO_NORMAL_SYMBOLS = [
  { character: "☕", label: "café" },
  { character: "🐯", label: "tigre" },
  { character: "💎", label: "diamante" },
  { character: "🍒", label: "cerejas" },
  { character: "7", label: "sete" },
];
const CASINO_PRIZE_SYMBOL = { character: "🎁", label: "presente" };
const CASINO_REFUND_SYMBOL = { character: "FICHA", label: "ficha" };
const SLOT_SYMBOLS = [
  ...CASINO_NORMAL_SYMBOLS,
  CASINO_PRIZE_SYMBOL,
  CASINO_REFUND_SYMBOL,
];
const CASINO_PRIZES = [
  { id: "esposa-nenepira", name: "esposa do nenepira", modelId: "ring" },
  { id: "prima-vaper", name: "pé da prima do vaper", modelId: "foot" },
  { id: "bolos", name: "bólos", modelId: "cake" },
  { id: "350-reais", name: "350 reais", modelId: "cash-case" },
  { id: "lanche-subway", name: "lanche do subway", modelId: "sandwich" },
];
const ACHIEVEMENTS_STORAGE_KEY = "niasguts-achievements-v1";
const CASINO_TOKENS_STORAGE_KEY = "niasguts-casino-fichas-v1";
const CASINO_BAIT_STORAGE_KEY = "niasguts-casino-bait-v1";
const INITIAL_CASINO_TOKENS = 5;
const INITIAL_REEL_SYMBOL_INDICES = [0, 1, 4];
const CASINO_REEL_FULL_TURNS = [5, 6, 7];
const CASINO_REEL_DURATIONS_MS = [1400, 1750, 2100];
const CASINO_SETTLE_DELAY_MS = 180;
const CASINO_RESULT_FLASH_DURATION_MS = 2000;
const CASINO_REFUND_CHANCE = 0.5;
const CASINO_PRIZE_CHANCE = 0.125;
const RELEASES_PER_PAGE = 3;
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
  "(max-width: " + MOBILE_GIF_MAX_WIDTH_REM + "rem)",
);
const reducedMotionMediaQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

const selectedMarinGifs = [];
const unlockedAchievementIds = new Set();
let pendingCasinoOutcome = [];
let pendingCasinoPrize = null;
let pendingCasinoOutcomeType = "loss";
let pendingAchievementAnimation = null;
let casinoTokenBalance = INITIAL_CASINO_TOKENS;
let casinoTokensArePersistent = true;
let casinoBaitConsumed = false;
let casinoBaitIsPersistent = true;
let achievementsArePersistent = true;
let casinoSpinInProgress = false;
let casinoJackpotOpen = false;
let casinoMusicWanted = true;
let casinoIsOpen = false;
let casinoMusicCommandId = 0;
let casino3D = null;
let achievements3D = null;
let shared3DModulePromise = null;
let casino3DLoadPromise = null;
let achievements3DLoadPromise = null;
let casino3DFailed = false;
let achievements3DFailed = false;
let releasePage = 0;
let casinoResultFlashTimerId = null;

function loadSavedProgress() {
  // Restore known prizes, a valid chip balance, and the one-time bait state.
  try {
    const savedAchievementJson = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);

    if (savedAchievementJson !== null) {
      let parsedAchievementIds = [];
      try {
        const parsedValue = JSON.parse(savedAchievementJson);
        if (Array.isArray(parsedValue)) {
          parsedAchievementIds = parsedValue;
        }
      } catch {
        // Invalid local data is reset without treating storage as unavailable.
      }

      const knownAchievementIds = [];
      for (const prize of CASINO_PRIZES) {
        if (parsedAchievementIds.includes(prize.id)) {
          unlockedAchievementIds.add(prize.id);
          knownAchievementIds.push(prize.id);
        }
      }
      const sanitizedAchievementJson = JSON.stringify(knownAchievementIds);
      if (sanitizedAchievementJson !== savedAchievementJson) {
        localStorage.setItem(
          ACHIEVEMENTS_STORAGE_KEY,
          sanitizedAchievementJson,
        );
      }
    }
  } catch {
    achievementsArePersistent = false;
  }

  try {
    const savedTokenValue = localStorage.getItem(CASINO_TOKENS_STORAGE_KEY);

    if (savedTokenValue === null) {
      localStorage.setItem(
        CASINO_TOKENS_STORAGE_KEY,
        String(INITIAL_CASINO_TOKENS),
      );
    } else if (/^\d+$/.test(savedTokenValue)) {
      const parsedTokenBalance = Number(savedTokenValue);

      if (Number.isSafeInteger(parsedTokenBalance)) {
        casinoTokenBalance = parsedTokenBalance;
      } else {
        localStorage.setItem(
          CASINO_TOKENS_STORAGE_KEY,
          String(INITIAL_CASINO_TOKENS),
        );
      }
    } else {
      localStorage.setItem(
        CASINO_TOKENS_STORAGE_KEY,
        String(INITIAL_CASINO_TOKENS),
      );
    }
  } catch {
    casinoTokensArePersistent = false;
    casinoTokenBalance = INITIAL_CASINO_TOKENS;
  }

  try {
    casinoBaitConsumed =
      localStorage.getItem(CASINO_BAIT_STORAGE_KEY) === "true";
  } catch {
    casinoBaitIsPersistent = false;
  }
}

loadSavedProgress();

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
const slotMachine = document.querySelector("#slot-machine");
const casinoCanvas = document.querySelector("#casino-canvas");
const casinoLoading = document.querySelector("#casino-loading");
const casinoReelFallback = document.querySelector("#casino-reel-fallback");
const fallbackReels = document.querySelectorAll(".fallback-reel");
const casinoResult = document.querySelector("#casino-result");
const casinoResultFlash = document.querySelector("#casino-result-flash");
const casinoTokenBalanceElement = document.querySelector(
  "#casino-token-balance",
);
const casinoTokenStorageNote = document.querySelector(
  "#casino-token-storage-note",
);
const casinoEmpty = document.querySelector("#casino-empty");
const casinoJackpot = document.querySelector("#casino-jackpot");
const casinoJackpotBadge = document.querySelector("#casino-jackpot-badge");
const casinoJackpotPrize = document.querySelector("#casino-jackpot-prize");
const casinoJackpotContinue = document.querySelector(
  "#casino-jackpot-continue",
);
const casinoMusic = document.querySelector("#casino-music");
const casinoMusicToggle = document.querySelector("#toggle-casino-music");
const casinoVolume = document.querySelector("#casino-volume");
const achievementsDialog = document.querySelector("#achievements-dialog");
const achievementsOpenButton = document.querySelector("#open-achievements");
const achievementsCount = document.querySelector("#achievements-count");
const achievementsProgress = document.querySelector("#achievements-progress");
const achievementSlots = document.querySelectorAll(".achievement-slot");
const achievementsScreen = document.querySelector("#achievements-screen");
const achievementsCanvas = document.querySelector("#achievements-canvas");
const achievementsLoading = document.querySelector("#achievements-loading");
const achievementCompletePlaque = document.querySelector(
  "#achievement-complete-plaque",
);
const achievementStorageNote = document.querySelector(
  "#achievement-storage-note",
);
const patchNotesDialog = document.querySelector("#patch-notes-dialog");
const releaseEntries = document.querySelectorAll(".release-entry");
const releasePrevious = document.querySelector("#release-previous");
const releaseNext = document.querySelector("#release-next");
const releasePageStatus = document.querySelector("#release-page-status");
const marinGifFrames = document.querySelectorAll(".marin-gif-frame");

function showRandomMarinGifs() {
  // Do not create or request GIF images on small viewports.
  for (const frame of marinGifFrames) {
    frame.replaceChildren();
  }

  if (mobileGifMediaQuery.matches) {
    return;
  }

  if (selectedMarinGifs.length === 0) {
    const firstIndex = Math.floor(Math.random() * MARIN_GIFS.length);
    let secondIndex = Math.floor(Math.random() * (MARIN_GIFS.length - 1));

    if (secondIndex >= firstIndex) {
      secondIndex += 1;
    }

    selectedMarinGifs.push(MARIN_GIFS[firstIndex], MARIN_GIFS[secondIndex]);
  }

  for (let frameIndex = 0; frameIndex < marinGifFrames.length; frameIndex += 1) {
    const gif = selectedMarinGifs[frameIndex];

    if (gif === undefined) {
      continue;
    }

    const link = document.createElement("a");
    link.href = gif.sourceUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", gif.description + " no Tenor");

    const image = document.createElement("img");
    image.src = gif.src;
    image.alt = gif.description;
    image.width = gif.width;
    image.height = gif.height;
    image.decoding = "async";
    link.append(image);
    marinGifFrames[frameIndex].append(link);
  }
}

function saveAchievements() {
  // Persist the known prize IDs while retaining in-memory progress on failure.
  if (!achievementsArePersistent) {
    return;
  }

  try {
    const orderedIds = CASINO_PRIZES
      .filter((prize) => unlockedAchievementIds.has(prize.id))
      .map((prize) => prize.id);
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(orderedIds));
  } catch {
    achievementsArePersistent = false;
  }
}

function saveCasinoTokens() {
  // Persist the virtual chip balance while retaining it for the current visit.
  if (!casinoTokensArePersistent) {
    return;
  }

  try {
    localStorage.setItem(
      CASINO_TOKENS_STORAGE_KEY,
      String(casinoTokenBalance),
    );
  } catch {
    casinoTokensArePersistent = false;
  }
}

function consumeCasinoBait() {
  // Guarantee the special first result only once per browser when possible.
  casinoBaitConsumed = true;

  if (!casinoBaitIsPersistent) {
    return;
  }

  try {
    localStorage.setItem(CASINO_BAIT_STORAGE_KEY, "true");
  } catch {
    casinoBaitIsPersistent = false;
  }
}

function renderAchievements() {
  // Keep the HTML labels and the WebGL gallery synchronized.
  for (const slot of achievementSlots) {
    const prize = CASINO_PRIZES.find(
      (candidate) => candidate.id === slot.dataset.prizeId,
    );
    const isUnlocked =
      prize !== undefined && unlockedAchievementIds.has(prize.id);
    const name = slot.querySelector(".achievement-name");
    const fallbackMark = slot.querySelector(".achievement-fallback-mark");

    slot.classList.toggle("is-locked", !isUnlocked);
    slot.classList.toggle("is-unlocked", isUnlocked);
    slot.setAttribute(
      "aria-label",
      isUnlocked ? "Conquista desbloqueada: " + prize.name : "Conquista oculta",
    );
    name.textContent = isUnlocked ? prize.name : "conquista oculta";
    fallbackMark.textContent = isUnlocked ? "3D" : "?";
  }

  const unlockedCount = unlockedAchievementIds.size;
  const totalCount = CASINO_PRIZES.length;
  const isComplete = unlockedCount === totalCount;
  achievementsCount.textContent = unlockedCount + "/" + totalCount;
  achievementsProgress.textContent =
    unlockedCount + " de " + totalCount + " desbloqueadas";
  achievementCompletePlaque.hidden = !isComplete;
  achievementStorageNote.hidden = achievementsArePersistent;
  achievementsScreen.classList.toggle("is-complete", isComplete);
  achievements3D?.setUnlocked([...unlockedAchievementIds]);
  casino3D?.setCollectionComplete(isComplete);
}

function renderCasinoTokens() {
  // Show the current balance and prevent play when no chip remains.
  casinoTokenBalanceElement.textContent = String(casinoTokenBalance);
  casinoTokenStorageNote.hidden =
    casinoTokensArePersistent && casinoBaitIsPersistent;
  const canSpin =
    casinoTokenBalance > 0 &&
    !casinoSpinInProgress &&
    !casinoJackpotOpen;
  casinoLever.disabled = !canSpin;
  casino3D?.setLeverInteractive(canSpin);

  if (casinoSpinInProgress) {
    casinoLever.setAttribute("aria-label", "Alavanca acionada; rolos girando");
  } else if (casinoTokenBalance === 0) {
    casinoLever.setAttribute("aria-label", "Sem fichas; minigame em breve");
  } else {
    casinoLever.setAttribute(
      "aria-label",
      "Puxar alavanca tridimensional do cassino",
    );
  }

  casinoEmpty.hidden =
    casinoTokenBalance !== 0 ||
    casinoSpinInProgress ||
    casinoJackpotOpen ||
    !casinoResultFlash.hidden;
}

function clearCasinoResultFlash() {
  // Cancel stale cards so a newer message always owns the two-second window.
  if (casinoResultFlashTimerId !== null) {
    window.clearTimeout(casinoResultFlashTimerId);
    casinoResultFlashTimerId = null;
  }

  casinoResultFlash.hidden = true;
  casinoResultFlash.classList.remove("is-token", "is-spinning", "is-loss");
}

function showCasinoMessage(message, tone = "default", emphasize = true) {
  // Keep one accessible result below while briefly enlarging ordinary feedback.
  casinoResult.textContent = message;
  casinoResult.classList.toggle("is-prize", tone === "prize");
  casinoResult.classList.toggle("is-token", tone === "token");
  clearCasinoResultFlash();

  if (!emphasize || !casinoIsOpen || casinoJackpotOpen) {
    return;
  }

  casinoResultFlash.textContent = message;
  casinoResultFlash.classList.toggle("is-token", tone === "token");
  casinoResultFlash.classList.toggle("is-spinning", tone === "spinning");
  casinoResultFlash.classList.toggle("is-loss", tone === "loss");
  casinoResultFlash.hidden = false;
  casinoResultFlashTimerId = window.setTimeout(() => {
    casinoResultFlashTimerId = null;
    casinoResultFlash.hidden = true;
    casinoResultFlash.classList.remove("is-token", "is-spinning", "is-loss");
    renderCasinoTokens();
  }, CASINO_RESULT_FLASH_DURATION_MS);
}

function playPendingAchievementAnimation() {
  // Animate the prize most recently awarded when its gallery is visible.
  if (pendingAchievementAnimation === null || achievements3D === null) {
    return;
  }

  achievements3D.highlightPrize(
    pendingAchievementAnimation.id,
    pendingAchievementAnimation.isNew,
    reducedMotionMediaQuery.matches,
  );
  pendingAchievementAnimation = null;
}

function readCasinoPalette() {
  // Read semantic CSS colors for matching Three.js materials.
  const rootStyles = getComputedStyle(document.documentElement);
  const readColor = (propertyName) =>
    rootStyles.getPropertyValue(propertyName).trim();
  return {
    navyDeep: readColor("--navy-deep"),
    navy: readColor("--navy"),
    shirt: readColor("--shirt"),
    white: readColor("--white"),
    hairBlonde: readColor("--hair-blonde"),
    hairBlondeSoft: readColor("--hair-blonde-soft"),
    hairPink: readColor("--hair-pink"),
    hairPinkDark: readColor("--hair-pink-dark"),
    hairPinkSoft: readColor("--hair-pink-soft"),
    tieRed: readColor("--tie-red"),
    skirtBlue: readColor("--skirt-blue"),
    skirtBlueSoft: readColor("--skirt-blue-soft"),
  };
}

function load3DModule() {
  // Share the one pinned local Three.js presentation module between both views.
  if (shared3DModulePromise === null) {
    shared3DModulePromise = import("./casino-3d.mjs");
  }

  return shared3DModulePromise;
}

function showCasinoFallback() {
  // Keep every rule playable when WebGL is unavailable.
  casino3DFailed = true;
  casino3D?.dispose();
  casino3D = null;
  slotMachine.classList.remove("is-loading", "is-ready");
  slotMachine.classList.add("is-fallback");
  casinoReelFallback.hidden = false;
  casinoLoading.textContent = "modo 3D indisponível; usando rolos simples.";
  renderCasinoTokens();
}

function showAchievementsFallback() {
  // Preserve readable progress if the 3D trophy gallery cannot start.
  achievements3DFailed = true;
  achievements3D?.dispose();
  achievements3D = null;
  achievementsScreen.classList.remove("is-3d-loading", "is-3d-ready");
  achievementsScreen.classList.add("is-3d-fallback");
  achievementsLoading.textContent = "vitrine 3D indisponível.";
}

function syncCasino3DVisibility(view = casino3D) {
  // Match the existing casino renderer to the dialog and browser visibility.
  view?.setVisible(casinoIsOpen && casinoDialog.open && !document.hidden);
}

async function ensureCasino3D() {
  // Initialize the casino scene only on its first opening.
  if (casino3D !== null || casino3DFailed) {
    return casino3D;
  }

  if (casino3DLoadPromise === null) {
    casino3DLoadPromise = load3DModule()
      .then(({ createCasino3D }) => {
        casino3D = createCasino3D({
          canvas: casinoCanvas,
          palette: readCasinoPalette(),
          symbols: SLOT_SYMBOLS.map((symbol) => symbol.character),
          prizes: CASINO_PRIZES,
          initialIndices: INITIAL_REEL_SYMBOL_INDICES,
          reducedMotion: reducedMotionMediaQuery.matches,
          onLeverActivate: startCasinoSpin,
          onContextFailure: showCasinoFallback,
        });
        slotMachine.classList.remove("is-loading", "is-fallback");
        slotMachine.classList.add("is-ready");
        casinoReelFallback.hidden = true;
        syncCasino3DVisibility(casino3D);
        casino3D.setLeverFocus(document.activeElement === casinoLever);
        casino3D.setCollectionComplete(
          unlockedAchievementIds.size === CASINO_PRIZES.length,
        );
        renderCasinoTokens();
        return casino3D;
      })
      .catch((error) => {
        console.warn("Não foi possível iniciar o cassino 3D.", error);
        showCasinoFallback();
        return null;
      });
  }

  return casino3DLoadPromise;
}

async function ensureAchievements3D() {
  // Initialize the shared-canvas trophy gallery only on first opening.
  if (achievements3D !== null || achievements3DFailed) {
    return achievements3D;
  }

  if (achievements3DLoadPromise === null) {
    achievementsScreen.classList.add("is-3d-loading");
    achievements3DLoadPromise = load3DModule()
      .then(({ createAchievements3D }) => {
        achievements3D = createAchievements3D({
          canvas: achievementsCanvas,
          palette: readCasinoPalette(),
          prizes: CASINO_PRIZES,
          slots: [...achievementSlots],
          unlockedIds: [...unlockedAchievementIds],
          reducedMotion: reducedMotionMediaQuery.matches,
          onContextFailure: showAchievementsFallback,
        });
        achievementsScreen.classList.remove(
          "is-3d-loading",
          "is-3d-fallback",
        );
        achievementsScreen.classList.add("is-3d-ready");
        achievementsLoading.hidden = true;
        achievements3D.setVisible(achievementsDialog.open && !document.hidden);
        playPendingAchievementAnimation();
        return achievements3D;
      })
      .catch((error) => {
        console.warn("Não foi possível iniciar a vitrine 3D.", error);
        showAchievementsFallback();
        return null;
      });
  }

  return achievements3DLoadPromise;
}

function updateCasinoMusicControl() {
  // Reflect actual media playback, never merely the requested state.
  const isActuallyPlaying = !casinoMusic.paused && !casinoMusic.ended;
  casinoMusicToggle.setAttribute(
    "aria-pressed",
    isActuallyPlaying ? "true" : "false",
  );
  casinoMusicToggle.textContent = isActuallyPlaying
    ? "⏸ PAUSAR"
    : "▶ MÚSICA";
}

async function reconcileCasinoMusic() {
  // Make only the newest play/pause request authoritative.
  const commandId = ++casinoMusicCommandId;
  const shouldPlay =
    casinoIsOpen && casinoMusicWanted && !document.hidden;

  if (shouldPlay) {
    try {
      await casinoMusic.play();
    } catch {
      if (commandId === casinoMusicCommandId) {
        casinoMusicWanted = false;
      }
    }
  }

  if (!casinoIsOpen || !casinoMusicWanted || document.hidden) {
    casinoMusic.pause();

    if (!casinoIsOpen) {
      casinoMusic.currentTime = 0;
    }
  }

  updateCasinoMusicControl();
}

function toggleCasinoMusic() {
  // Preserve the visitor's desired state across close and reopen.
  casinoMusicWanted = !casinoMusicWanted;
  void reconcileCasinoMusic();
}

function updateCasinoMusicVolume() {
  // Apply the selected casino-only volume immediately.
  casinoMusic.volume = Number(casinoVolume.value) / 100;
}

function handleCasinoMusicError() {
  // Expose a truthful retry button after a media error.
  casinoMusicWanted = false;
  casinoMusicCommandId += 1;
  updateCasinoMusicControl();
}

function handleCasinoVisibilityChange() {
  // Pause hidden work and resume only when the visitor still wants music.
  syncCasino3DVisibility();
  achievements3D?.setVisible(achievementsDialog.open && !document.hidden);
  void reconcileCasinoMusic();
}

function handleCasinoLeverFocus() {
  // Put focus feedback on the rendered lever, not on a rectangular button.
  casino3D?.setLeverFocus(true);
}

function handleCasinoLeverBlur() {
  // Remove the rendered keyboard focus glow.
  casino3D?.setLeverFocus(false);
}

function openCasino() {
  // Open the full-screen casino and lazily start its presentation.
  if (!casinoDialog.open) {
    casinoDialog.showModal();
  }

  casinoIsOpen = true;
  renderCasinoTokens();

  if (
    (casinoTokenBalance > 0 || casinoSpinInProgress) &&
    !casinoJackpotOpen &&
    !casinoResult.classList.contains("is-prize")
  ) {
    showCasinoMessage(
      casinoResult.textContent,
      casinoSpinInProgress
        ? "spinning"
        : casinoResult.classList.contains("is-token")
          ? "token"
          : "default",
    );
  } else {
    clearCasinoResultFlash();
  }

  syncCasino3DVisibility();
  void ensureCasino3D();
  void reconcileCasinoMusic();

  if (casinoTokenBalance > 0) {
    casinoLever.focus();
  } else {
    casinoEmpty.focus();
  }
}

function closeCasinoJackpot() {
  // Keep a win on screen until the visitor explicitly acknowledges it.
  if (!casinoJackpotOpen) {
    return;
  }

  casinoJackpotOpen = false;
  casinoJackpot.hidden = true;
  slotMachine.classList.remove("is-jackpot");
  casino3D?.hidePrize();
  renderCasinoTokens();

  if (casinoTokenBalance > 0) {
    casinoLever.focus();
  } else {
    casinoEmpty.focus();
  }
}

function handleCasinoClose() {
  // Stop casino-only activity without overwriting the desired music state.
  clearCasinoResultFlash();

  if (casinoJackpotOpen) {
    closeCasinoJackpot();
  }

  casinoIsOpen = false;
  syncCasino3DVisibility();
  void reconcileCasinoMusic();
}

function handleCasinoCancel(event) {
  // Escape acknowledges a jackpot before it can close the surrounding dialog.
  if (casinoJackpotOpen) {
    event.preventDefault();
    closeCasinoJackpot();
  }
}

function handleCasinoKeydown(event) {
  // Keep keyboard focus inside the blocking jackpot acknowledgement.
  if (casinoJackpotOpen && event.key === "Tab") {
    event.preventDefault();
    casinoJackpotContinue.focus();
  }
}

function openAchievements() {
  // Open the full-screen gallery and position its single WebGL canvas.
  renderAchievements();

  if (!achievementsDialog.open) {
    achievementsDialog.showModal();
  }

  void ensureAchievements3D().then(() => {
    achievements3D?.setVisible(!document.hidden);
    achievements3D?.resize();
    playPendingAchievementAnimation();
  });
}

function handleAchievementsClose() {
  // Stop its low-rate animation while the gallery is hidden.
  achievements3D?.setVisible(false);
}

function renderReleasePage() {
  // Show three releases at a time, newest page first.
  const pageCount = Math.ceil(releaseEntries.length / RELEASES_PER_PAGE);
  releasePage = Math.max(0, Math.min(releasePage, pageCount - 1));
  const firstVisibleIndex = releasePage * RELEASES_PER_PAGE;
  const lastVisibleIndex = firstVisibleIndex + RELEASES_PER_PAGE;

  for (let index = 0; index < releaseEntries.length; index += 1) {
    releaseEntries[index].hidden =
      index < firstVisibleIndex || index >= lastVisibleIndex;
  }

  releasePrevious.disabled = releasePage === 0;
  releaseNext.disabled = releasePage === pageCount - 1;
  releasePageStatus.textContent = releasePage + 1 + "/" + pageCount;
}

function changeReleasePage(direction) {
  // Advance by one bounded release page.
  releasePage += direction;
  renderReleasePage();
}

function handlePatchNotesShortcut(event) {
  // Keep the release history secret behind an unmodified P key.
  const target = event.target;
  const isEditing =
    target?.isContentEditable ||
    target?.matches?.("input, textarea, select");

  if (
    event.key.toLowerCase() === "p" &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    !isEditing &&
    !casinoDialog.open &&
    !achievementsDialog.open
  ) {
    event.preventDefault();
    releasePage = 0;
    renderReleasePage();

    if (patchNotesDialog.open) {
      patchNotesDialog.close();
    } else {
      patchNotesDialog.showModal();
    }
    return;
  }

  if (!patchNotesDialog.open) {
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    changeReleasePage(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    changeReleasePage(1);
  }
}

function waitForCasinoAnimation(milliseconds) {
  // Avoid timers entirely when reduced motion requests an immediate result.
  if (milliseconds <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function createOrdinaryLosingOutcome() {
  // Choose three ordinary symbols and repair any accidental matching triple.
  const outcome = Array.from({ length: 3 }, () => {
    const symbolIndex = Math.floor(Math.random() * CASINO_NORMAL_SYMBOLS.length);
    return CASINO_NORMAL_SYMBOLS[symbolIndex];
  });

  if (outcome.every((symbol) => symbol === outcome[0])) {
    const currentIndex = CASINO_NORMAL_SYMBOLS.indexOf(outcome[2]);
    outcome[2] =
      CASINO_NORMAL_SYMBOLS[
        (currentIndex + 1) % CASINO_NORMAL_SYMBOLS.length
      ];
  }

  return outcome;
}

function chooseCasinoOutcome() {
  // Resolve the three exclusive outcomes from one uniformly random roll.
  pendingCasinoPrize = null;

  if (!casinoBaitConsumed) {
    consumeCasinoBait();
    pendingCasinoOutcomeType = "prize";
    pendingCasinoOutcome = Array(3).fill(CASINO_PRIZE_SYMBOL);
    pendingCasinoPrize = CASINO_PRIZES.find(
      (prize) => prize.id === "prima-vaper",
    );
    return;
  }

  const outcomeRoll = Math.random();

  if (outcomeRoll < CASINO_REFUND_CHANCE) {
    pendingCasinoOutcomeType = "refund";
    pendingCasinoOutcome = Array(3).fill(CASINO_REFUND_SYMBOL);
    return;
  }

  if (outcomeRoll < CASINO_REFUND_CHANCE + CASINO_PRIZE_CHANCE) {
    pendingCasinoOutcomeType = "prize";
    pendingCasinoOutcome = Array(3).fill(CASINO_PRIZE_SYMBOL);
    const lockedPrizes = CASINO_PRIZES.filter(
      (prize) => !unlockedAchievementIds.has(prize.id),
    );
    const prizePool = lockedPrizes.length > 0 ? lockedPrizes : CASINO_PRIZES;
    pendingCasinoPrize =
      prizePool[Math.floor(Math.random() * prizePool.length)];
    return;
  }

  pendingCasinoOutcomeType = "loss";
  pendingCasinoOutcome = createOrdinaryLosingOutcome();
}

function showCasinoJackpot(prize, isNewPrize) {
  // Block the machine behind a persistent, emphatic prize presentation.
  clearCasinoResultFlash();
  casinoJackpotOpen = true;
  slotMachine.classList.add("is-jackpot");
  casinoJackpotBadge.textContent = isNewPrize
    ? "NOVA CONQUISTA"
    : "VOCÊ GANHOU DE NOVO";
  casinoJackpotPrize.textContent = prize.name;
  casinoJackpot.hidden = false;
  casino3D?.showPrize(
    prize.modelId,
    !isNewPrize,
    reducedMotionMediaQuery.matches,
  );
  renderCasinoTokens();
  casinoJackpotContinue.focus();
}

function finishCasinoSpin() {
  // Apply the authoritative payout only after every reel has stopped.
  casinoSpinInProgress = false;
  slotMachine.classList.remove("is-spinning");
  slotMachine.setAttribute("aria-busy", "false");
  casinoResult.classList.remove("is-prize", "is-token");

  if (pendingCasinoOutcomeType === "refund") {
    casinoTokenBalance += 1;
    saveCasinoTokens();
    showCasinoMessage(
      "a ficha voltou. patrimônio líquido: igual.",
      "token",
    );
    casino3D?.celebrate("token", reducedMotionMediaQuery.matches);
    renderCasinoTokens();
    return;
  }

  if (pendingCasinoOutcomeType === "prize" && pendingCasinoPrize !== null) {
    const isNewPrize = !unlockedAchievementIds.has(pendingCasinoPrize.id);

    if (isNewPrize) {
      unlockedAchievementIds.add(pendingCasinoPrize.id);
      saveAchievements();
    }

    renderAchievements();
    pendingAchievementAnimation = {
      id: pendingCasinoPrize.id,
      isNew: isNewPrize,
    };
    showCasinoMessage(
      isNewPrize
        ? "NOVA CONQUISTA: " + pendingCasinoPrize.name + ". Continua não rica."
        : "PRÊMIO REPETIDO: " + pendingCasinoPrize.name + ".",
      "prize",
      false,
    );
    casino3D?.celebrate("prize", reducedMotionMediaQuery.matches);
    showCasinoJackpot(pendingCasinoPrize, isNewPrize);
    return;
  }

  const failureMessage =
    CASINO_FAILURE_MESSAGES[
      Math.floor(Math.random() * CASINO_FAILURE_MESSAGES.length)
    ];
  showCasinoMessage(failureMessage, "loss");
  casino3D?.celebrate("loss", reducedMotionMediaQuery.matches);
  renderCasinoTokens();
}

async function startCasinoSpin() {
  // Debit one chip, animate one authoritative outcome, then settle its payout.
  if (
    casinoSpinInProgress ||
    casinoJackpotOpen ||
    casinoTokenBalance <= 0
  ) {
    renderCasinoTokens();
    return;
  }

  casinoSpinInProgress = true;
  casinoTokenBalance -= 1;
  saveCasinoTokens();
  chooseCasinoOutcome();
  renderCasinoTokens();
  showCasinoMessage("os rolos estão girando...", "spinning");
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
        reducedMotion ? 0 : Math.max(...CASINO_REEL_DURATIONS_MS),
      );
    }
  } else {
    // Render the local chip without relying on a system emoji font.
    for (let reelIndex = 0; reelIndex < fallbackReels.length; reelIndex += 1) {
      const reel = fallbackReels[reelIndex];
      const symbol = pendingCasinoOutcome[reelIndex];
      const isChip = symbol === CASINO_REFUND_SYMBOL;
      reel.classList.toggle("is-chip", isChip);
      reel.textContent = isChip ? "" : symbol.character;

      if (isChip) {
        reel.dataset.chipCount = "1";
      } else {
        delete reel.dataset.chipCount;
      }
    }
    await waitForCasinoAnimation(
      reducedMotion ? 0 : Math.max(...CASINO_REEL_DURATIONS_MS),
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
  // Show completed years and elapsed time since the latest birthday.
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
    (remainingMilliseconds %
      (MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE)) /
      MILLISECONDS_PER_SECOND,
  );

  counterValues.years.textContent = String(years).padStart(2, "0");
  counterValues.days.textContent = String(days).padStart(3, "0");
  counterValues.hours.textContent = String(hours).padStart(2, "0");
  counterValues.minutes.textContent = String(minutes).padStart(2, "0");
  counterValues.seconds.textContent = String(seconds).padStart(2, "0");
  counter.setAttribute(
    "aria-label",
    years + " anos, " + days + " dias, " + hours + " horas, " +
      minutes + " minutos, " + seconds + " segundos",
  );
}

function scheduleNextUpdate() {
  // Refresh now and align the next update with the next real clock second.
  updateCounter();
  const delay =
    MILLISECONDS_PER_SECOND - (Date.now() % MILLISECONDS_PER_SECOND);
  window.setTimeout(scheduleNextUpdate, delay);
}

updateCasinoMusicVolume();
updateCasinoMusicControl();
renderAchievements();
renderCasinoTokens();
renderReleasePage();
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
casinoDialog.addEventListener("cancel", handleCasinoCancel);
casinoDialog.addEventListener("keydown", handleCasinoKeydown);
casinoJackpotContinue.addEventListener("click", closeCasinoJackpot);
achievementsDialog.addEventListener("close", handleAchievementsClose);
releasePrevious.addEventListener("click", () => changeReleasePage(-1));
releaseNext.addEventListener("click", () => changeReleasePage(1));
document.addEventListener("keydown", handlePatchNotesShortcut);
document.addEventListener("visibilitychange", handleCasinoVisibilityChange);
mobileGifMediaQuery.addEventListener("change", showRandomMarinGifs);

// Pick one displayed identity for this page visit.
const selectedName =
  NAME_VARIATIONS[Math.floor(Math.random() * NAME_VARIATIONS.length)];
const questionText = selectedName + " já está rica?";
document.querySelector("#question").textContent = questionText;
document.title = questionText;

showRandomMarinGifs();
scheduleNextUpdate();
