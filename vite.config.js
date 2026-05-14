import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const POWERUPS_BOOTSTRAP_SUFFIX = '/src/js/app-powerups-bootstrap.js';

function replaceFunction(source, functionName, replacement) {
  const marker = `function ${functionName}(`;
  const start = source.indexOf(marker);

  if (start === -1) {
    throw new Error(`No se encontró ${functionName} en app-powerups-bootstrap.js`);
  }

  const bodyStart = source.indexOf('{', start);
  if (bodyStart === -1) {
    throw new Error(`No se pudo localizar el cuerpo de ${functionName}`);
  }

  let depth = 0;
  let inString = null;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (inLineComment) {
      if (char === '\n') inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === '/' && next === '/') {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (char === '/' && next === '*') {
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = char;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return `${source.slice(0, start)}${replacement}${source.slice(index + 1)}`;
      }
    }
  }

  throw new Error(`No se pudo cerrar el cuerpo de ${functionName}`);
}

function patchLifeLimits(code) {
  const difficultyPatch =
    ".replace(/return clamp\\(\\(state\\.distance - 650\\) \\/ 5200, 0, 1\\);/g, 'return clamp((state.distance - 450) / 3400, 0, 1);');";
  const livesPatch =
    ".replace(/return clamp\\(\\(state\\.distance - 650\\) \\/ 5200, 0, 1\\);/g, 'return clamp((state.distance - 450) / 3400, 0, 1);')\n" +
    "    .replace(/state\\.lives = 3;/g, 'state.lives = Math.min(3, maxLivesForCurrentLevel());')\n" +
    "    .replace(/state\\.lives \\+= 1;/g, 'state.lives = Math.min(maxLivesForCurrentLevel(), state.lives + 1);')\n" +
    "    .replace(/state\\.lives = state\\.lives \\+ 1;/g, 'state.lives = Math.min(maxLivesForCurrentLevel(), state.lives + 1);')\n" +
    "    .replace(/state\\.lives = Math\\.min\\(6, state\\.lives \\+ 1\\);/g, 'state.lives = Math.min(maxLivesForCurrentLevel(), state.lives + 1);')\n" +
    "    .replace(/state\\.lives < 5/g, 'state.lives < maxLivesForCurrentLevel()');";

  let patched = code.replace(difficultyPatch, livesPatch);

  patched = replaceFunction(
    patched,
    'selectedMode',
    `function selectedMode() {
  return currentGameMode || window.HamsterRunModes?.getSelectedMode?.() || { id: 'endless', name: 'Endless', timeLimit: null, seed: null };
}

function maxLivesForCurrentLevel() {
  const configuredMax = Number(state.level?.maxLives ?? state.level?.max_lives ?? state.maxLives ?? 5);
  if (!Number.isFinite(configuredMax) || configuredMax < 1) return 5;
  return Math.floor(configuredMax);
}`,
  );

  patched = replaceFunction(
    patched,
    'resetGame',
    `function resetGame() {
  currentGameMode = window.HamsterRunModes?.getSelectedMode?.() || selectedMode();
  modeTimeLeft = currentGameMode.timeLimit ?? null;
  seededRandom = currentGameMode.seed ? makeSeededRandom(String(currentGameMode.seed) + ':' + state.selectedLevel) : null;
  powerUps.length = 0;
  clearPowerUpEffects();

  withModeRandom(() => originalResetGame());
  state.lives = Math.min(state.lives, maxLivesForCurrentLevel());
  improveStarterPlatforms();
  updateModeHud();
}`,
  );

  patched = patched.replace(
    'withModeRandom(() => originalUpdate(dt));\n  updateModeTimer(dt);',
    'withModeRandom(() => originalUpdate(dt));\n  state.lives = Math.min(state.lives, maxLivesForCurrentLevel());\n  updateModeTimer(dt);',
  );

  patched = patched.replace(
    'const visibleLives = Math.max(0, Math.floor(state.lives));',
    'const visibleLives = Math.max(0, Math.min(maxLivesForCurrentLevel(), Math.floor(state.lives)));',
  );

  return patched;
}

function patchSafeRespawn(code) {
  return replaceFunction(
    code,
    'findSafeRespawnPoint',
    `function findSafeRespawnPoint() {
  const screenSafe = respawnScreenSafeBounds();
  const targetX = clamp(player.x, screenSafe.left, screenSafe.right);
  const candidates = platforms
    .map((platform) => {
      const landingLeft = platform.x + 30;
      const landingRight = platform.x + platform.width - player.width - 30;
      const left = Math.max(landingLeft, screenSafe.left);
      const right = Math.min(landingRight, screenSafe.right);

      if (left > right) return null;

      const x = clamp(targetX, left, right);
      return {
        platform,
        x,
        score: Math.abs(x - targetX) + Math.abs(platform.y - player.y) * 0.02,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score);

  const chosen = candidates[0] || fallbackRespawnPoint(screenSafe);
  if (!chosen) return null;

  return {
    x: chosen.x,
    y: chosen.platform.y - player.height - 18,
  };
}

function respawnScreenSafeBounds() {
  const left = clamp(state.width * 0.16, 54, 94);
  const right = clamp(state.width * 0.46, left + player.width + 42, state.width - player.width - 68);
  return { left, right };
}

function fallbackRespawnPoint(screenSafe) {
  const platform =
    platforms.find((item) => item.x < screenSafe.right && item.x + item.width > screenSafe.left) ||
    platforms.find((item) => item.x + item.width > screenSafe.left) ||
    platforms[0];

  if (!platform) return null;

  const landingLeft = platform.x + 30;
  const landingRight = platform.x + platform.width - player.width - 30;
  if (landingLeft > landingRight) return null;

  return {
    platform,
    x: clamp(clamp(player.x, screenSafe.left, screenSafe.right), landingLeft, landingRight),
  };
}`,
  );
}

function hamsterRuntimePatchPlugin() {
  return {
    name: 'hamster-runtime-patches',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith(POWERUPS_BOOTSTRAP_SUFFIX)) {
        return null;
      }

      return {
        code: patchSafeRespawn(patchLifeLimits(code)),
        map: null,
      };
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [hamsterRuntimePatchPlugin(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
