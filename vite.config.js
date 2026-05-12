import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const APP_PATH_SUFFIX = '/src/js/app.js';

function replaceFunction(source, functionName, replacement) {
  const marker = `function ${functionName}(`;
  const start = source.indexOf(marker);

  if (start === -1) {
    throw new Error(`No se encontró ${functionName} en src/js/app.js`);
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

function restoreEnemyStompPlugin() {
  return {
    name: 'restore-enemy-stomp',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith(APP_PATH_SUFFIX)) {
        return null;
      }

      let patched = replaceFunction(
        code,
        'canStomp',
        `function canStomp(enemy, previousBottom) {
  if (!enemy || enemy.kind === 'thistle' || enemy.defeated) {
    return false;
  }

  const box = enemyBox(enemy);
  const playerHitbox = playerBox(8);
  const playerBottom = player.y + player.height;
  const horizontalOverlap = Math.min(playerHitbox.x + playerHitbox.width, box.x + box.width) - Math.max(playerHitbox.x, box.x);
  const minRequiredOverlap = Math.min(playerHitbox.width, box.width) * 0.18;
  const wasAboveEnemy = previousBottom <= box.y + Math.max(18, box.height * 0.48);
  const stillInTopZone = playerBottom <= box.y + box.height * 0.78;
  const fallingOrAlmostFalling = player.vy >= -120;

  return horizontalOverlap >= minRequiredOverlap && wasAboveEnemy && stillInTopZone && fallingOrAlmostFalling;
}`,
      );

      patched = replaceFunction(
        patched,
        'stompEnemy',
        `function stompEnemy(enemy) {
  if (!enemy || enemy.defeated) {
    return;
  }

  enemy.defeated = true;
  enemy.defeatTime = 0.28;
  state.score += enemy.kind === 'flying' ? 180 : 140;
  player.vy = -state.level.jump * 0.46;
  player.jumps = 1;
  player.grounded = false;

  bursts.push({
    x: enemy.x + enemy.width / 2,
    y: enemy.y + enemy.height / 2,
    ttl: 0.34,
    life: 0.34,
    radius: Math.max(enemy.width, enemy.height) * 0.55,
    color: 'rgba(255, 232, 120, 0.65)',
  });

  playSound('peanut');
  updateHud();
}`,
      );

      return {
        code: patched,
        map: null,
      };
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [restoreEnemyStompPlugin(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
