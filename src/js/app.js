import '../css/main.css';
import '../css/arcade-ui.css';
import './accessibility.js';
import './sound.js';
import './game-modes.js';

import { levels } from './config/gameConfig.js';
import { random } from './utils/math.js';
import { makeSeededRandom, setSeededRandom, withModeRandom } from './utils/seed.js';
import {
  state,
  player,
  platforms,
  peanuts,
  hearts,
  enemies,
  decor,
  backgroundProps,
  bursts,
  powerUps,
  powerUpEffects,
  feedbacks,
  clearPowerUpEffects,
  perfProbe,
} from './game/state.js';
import { timeDifficultyRamp, selectedModeSpeedBoost, selectedMode } from './game/difficulty.js';
import {
  makePlatform,
  lastPlatformEnd,
  spawnPlatform,
  improveStarterPlatforms,
  updateMovingPlatforms,
} from './game/platforms.js';
import { createBackgroundProps, updateEntities, pruneEntities } from './game/entities.js';
import { checkCollisions } from './game/collisions.js';
import {
  jump,
  loseLife,
  applyCharacter,
  getLifeRespawnDelay,
  setLifeRespawnDelay,
  respawnPlayerAfterLifeLoss,
} from './game/player.js';
import { draw, initRenderer } from './game/Renderer.js';
import {
  initUI,
  setModeTimeLeftRef,
  buildCharacterMenu,
  buildLevelMenu,
  showHome,
  showLevelSelect,
  setActiveOverlay,
  syncGameChrome,
  updateHud,
  endGame,
  shareGame,
  showPauseMenu,
  installConsolidatedPolish,
} from './game/ui.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const heroPreview = document.querySelector('#heroPreview');
const heroCtx = heroPreview.getContext('2d');
const home = document.querySelector('#home');

initRenderer(ctx, heroPreview, heroCtx, home);

initUI({
  scoreEl: document.querySelector('#score'),
  peanutsEl: document.querySelector('#peanuts'),
  timeEl: document.querySelector('#time'),
  livesEl: document.querySelector('#lives'),
  hud: document.querySelector('.hud'),
  gameControls: document.querySelector('.game-controls'),
  home,
  menu: document.querySelector('#menu'),
  gameOver: document.querySelector('#gameOver'),
  heroPreview,
  heroCtx,
  levelGrid: document.querySelector('#levelGrid'),
  characterGrid: document.querySelector('#characterGrid'),
  finalScore: document.querySelector('#finalScore'),
  finalPeanuts: document.querySelector('#finalPeanuts'),
  finalTime: document.querySelector('#finalTime'),
  finalRecord: document.querySelector('#finalRecord'),
});

let currentGameMode = null;
let modeTimeLeft = null;

setModeTimeLeftRef(() => modeTimeLeft);

function resetGame() {
  currentGameMode = window.HamsterRunModes?.getSelectedMode?.() || selectedMode();
  state._currentGameMode = currentGameMode;
  modeTimeLeft = currentGameMode.timeLimit ?? null;
  setSeededRandom(
    currentGameMode.seed
      ? makeSeededRandom(String(currentGameMode.seed) + ':' + state.selectedLevel)
      : null,
  );
  powerUps.length = 0;
  clearPowerUpEffects();

  const floor = state.height * 0.7;
  applyCharacter();
  state.level = levels[state.selectedLevel];
  state.mode = 'running';
  state.time = 0;
  state.score = 0;
  state.distance = 0;
  state.peanuts = 0;
  state.lives = 3;
  state.invincible = 1.2;
  state.speedBoost = 0;
  state.shake = 0;
  state.platformCount = 0;

  player.x = Math.max(58, state.width * 0.18);
  player.y = floor - player.height;
  player.vy = 0;
  player.jumps = 0;
  player.grounded = false;

  withModeRandom(() => {
    platforms.length = 0;
    platforms.push(
      makePlatform(-45, floor, Math.max(390, state.width * 0.96), state.level.platformVariant),
      {
        ...makePlatform(
          Math.max(260, state.width * 0.72),
          floor - 8,
          Math.max(260, state.width * 0.62),
          state.level.platformVariant,
        ),
        starter: true,
      },
    );
    state.platformCount = platforms.length;
    peanuts.length = 0;
    hearts.length = 0;
    enemies.length = 0;
    decor.length = 0;
    bursts.length = 0;
    backgroundProps.length = 0;
    const bgProps = state.level.backgroundSet !== 'none' ? createBackgroundProps() : [];
    backgroundProps.push(...bgProps);
    while (lastPlatformEnd() < state.width * 1.8) {
      spawnPlatform(platforms[platforms.length - 1]);
    }
  });

  improveStarterPlatforms();
  setActiveOverlay(null);
  syncGameChrome();
  updateHud();
}

function resize() {
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.floor(state.width * state.dpr);
  canvas.height = Math.floor(state.height * state.dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
}

function updatePowerUpEffects(dt) {
  powerUpEffects.jumps = Math.max(0, powerUpEffects.jumps - dt);
  powerUpEffects.speed = Math.max(0, powerUpEffects.speed - dt);
  powerUpEffects.invincible = Math.max(0, powerUpEffects.invincible - dt);
  if (powerUpEffects.invincible > 0) state.invincible = Math.max(state.invincible, 0.5);
}

function doLoseLife() {
  loseLife(endGame, updateHud);
}

function update(dt) {
  if (state.mode !== 'running' && state.mode !== 'paused') return;

  if (state.mode === 'paused') {
    state.last = performance.now();
    return;
  }

  const lifeDelay = getLifeRespawnDelay();
  if (lifeDelay > 0) {
    setLifeRespawnDelay(lifeDelay - dt);
    if (lifeDelay - dt <= 0) respawnPlayerAfterLifeLoss(endGame);
  }

  state.time += dt;
  if (modeTimeLeft !== null) {
    modeTimeLeft = Math.max(0, modeTimeLeft - dt);
    if (modeTimeLeft <= 0) endGame();
  }

  updatePowerUpEffects(dt);
  state.invincible = Math.max(0, state.invincible - dt);
  state.speedBoost += dt * 2.6;
  const ramp = timeDifficultyRamp();
  const speed =
    (state.level.speed + ramp.speed + selectedModeSpeedBoost() + Math.min(82, state.speedBoost)) *
    (powerUpEffects.speed > 0 ? 1.45 : 1);
  const move = speed * dt;
  state.distance += move;
  state.shake = Math.max(0, state.shake - dt * 18);

  if (getLifeRespawnDelay() <= 0) {
    player.vy += state.level.gravity * dt;
    const previousBottom = player.y + player.height;
    player.y += player.vy * dt;
    player.grounded = false;

    for (const platform of platforms) {
      const landed =
        player.vy >= 0 &&
        previousBottom <= platform.y + 12 &&
        player.y + player.height >= platform.y &&
        player.x + player.width * 0.78 > platform.x &&
        player.x + player.width * 0.22 < platform.x + platform.width;
      if (landed) {
        player.y = platform.y - player.height;
        player.vy = 0;
        player.grounded = true;
        player.jumps = 0;
      }
    }
  }

  for (const group of [platforms, peanuts, hearts, enemies, decor, bursts, powerUps]) {
    group.forEach((item) => {
      item.x -= move;
      if (item.platformLeft !== undefined) {
        item.platformLeft -= move;
        item.platformRight -= move;
      }
    });
  }

  updateMovingPlatforms(dt, player.grounded);
  updateEntities(dt);

  backgroundProps.forEach((item) => {
    item.x -= move * item.speed;
    if (item.x < -item.size - 40) item.x = state.width + random(60, 220);
  });

  checkCollisions(doLoseLife);

  if (player.y > state.height + 90) doLoseLife();

  feedbacks.forEach((f, i) => {
    f.age += dt;
    f.y -= 42 * dt;
    if (f.age > f.ttl) feedbacks.splice(i, 1);
  });

  pruneEntities();

  while (lastPlatformEnd() < state.width * 1.85) {
    withModeRandom(() => spawnPlatform(platforms[platforms.length - 1]));
  }

  state.score = Math.max(
    state.score,
    Math.floor(state.distance * 0.18 + state.time * 12 + state.peanuts * 75),
  );
  updateHud();
}

function loop(now) {
  const dt = Math.min(0.033, (now - state.last) / 1000 || 0);
  state.last = now;
  update(dt);
  draw();
  if (perfProbe.enabled) {
    perfProbe.frames += 1;
    perfProbe.acc += dt;
    if (perfProbe.acc >= 1) {
      console.log(`FPS: ${Math.round(perfProbe.frames / perfProbe.acc)}`);
      perfProbe.frames = 0;
      perfProbe.acc = 0;
    }
  }
  requestAnimationFrame(loop);
}

window.HamsterRunPauseControls = {
  getMode: () => state.mode,
  pause() {
    if (state.mode !== 'running') return false;
    state.mode = 'paused';
    syncGameChrome();
    return true;
  },
  resume() {
    if (state.mode !== 'paused') return false;
    state.mode = 'running';
    state.last = performance.now();
    setActiveOverlay(null);
    syncGameChrome();
    return true;
  },
  restartLevel() {
    resetGame();
    return true;
  },
  goHome() {
    state.mode = 'menu';
    setActiveOverlay(home);
    syncGameChrome();
    return true;
  },
};

function hasActiveOverlay() {
  return Boolean(document.querySelector('.overlay.is-visible:not([hidden])'));
}

function isScrollableMenuTarget(target) {
  return Boolean(
    target.closest(
      '.panel, .menu-scroll-area, .mode-grid, .difficulty-grid, .character-grid, .level-grid',
    ),
  );
}

window.addEventListener('resize', resize);
window.addEventListener('pointerdown', (event) => {
  if (state.mode !== 'running' || hasActiveOverlay()) return;
  if (!(event.target instanceof Element)) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  if (!event.target.closest('#game')) return;

  event.preventDefault();
  jump();
});
window.addEventListener(
  'touchmove',
  (event) => {
    if (state.mode !== 'running' || hasActiveOverlay()) return;
    if (!(event.target instanceof Element)) return;
    if (isScrollableMenuTarget(event.target)) return;
    if (!event.target.closest('#game')) return;

    event.preventDefault();
  },
  { passive: false },
);
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    event.preventDefault();
    jump();
  }
});

const startButton = document.querySelector('#startButton');
const newGameButton = document.querySelector('#newGameButton');
const backHomeButton = document.querySelector('#backHomeButton');
const aboutButton = document.querySelector('#aboutButton');
const shareButton = document.querySelector('#shareButton');
const gameMenuButton = document.querySelector('#gameMenuButton');
const retryButton = document.querySelector('#retryButton');
const levelsButton = document.querySelector('#levelsButton');

startButton.addEventListener('click', resetGame);
newGameButton.addEventListener('click', showLevelSelect);
backHomeButton.addEventListener('click', showHome);
aboutButton.addEventListener('click', () => {
  window.alert(
    'Toca para saltar. Segundo toque: doble salto. Recoge nueces y corazones, evita enemigos.',
  );
});
shareButton.addEventListener('click', () => {
  shareGame(shareButton).catch(() => {
    shareButton.textContent = 'No se pudo compartir';
    window.setTimeout(() => {
      shareButton.textContent = 'Compartir juego';
    }, 1400);
  });
});
gameMenuButton.addEventListener('click', showLevelSelect);
retryButton.addEventListener('click', resetGame);
levelsButton.addEventListener('click', showLevelSelect);

installConsolidatedPolish();

resize();
applyCharacter();
buildCharacterMenu();
buildLevelMenu();
showHome();
syncGameChrome();
requestAnimationFrame(loop);
