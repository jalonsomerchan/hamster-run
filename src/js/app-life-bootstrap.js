import appSource from './app.js?raw';
import '../css/main.css';

import hamsterSheet from '../assets/sprites/hamster/sheet-transparent.png';
import blueHamsterSheet from '../assets/sprites/characters/blue-hamster/sheet-transparent.png';
import tasmanianSheet from '../assets/sprites/characters/tasmanian/sheet-transparent.png';
import peanutSheet from '../assets/sprites/peanut/sheet-transparent.png';
import heartSheet from '../assets/sprites/heart/sheet-transparent.png';
import enemySheet from '../assets/sprites/enemy/sheet-transparent.png';
import groundEnemySheet from '../assets/sprites/enemies/ground/sheet-transparent.png';
import flyingEnemySheet from '../assets/sprites/enemies/flying/sheet-transparent.png';
import chestnutEnemySheet from '../assets/sprites/enemies/chestnut/sheet-transparent.png';
import platformWoodLong from '../assets/sprites/platforms/platform-1.png';
import platformWoodMedium from '../assets/sprites/platforms/platform-2.png';
import platformWoodShort from '../assets/sprites/platforms/platform-3.png';
import platformDirt from '../assets/sprites/platforms/platform-4.png';
import platformStraw from '../assets/sprites/platforms/platform-5.png';
import platformMushroom from '../assets/sprites/platforms/platform-6.png';
import cloudSprite from '../assets/sprites/background/background-1.png';
import treeSprite from '../assets/sprites/background/background-2.png';
import hillSprite from '../assets/sprites/background/background-3.png';
import barnSprite from '../assets/sprites/background/background-4.png';
import moonSprite from '../assets/sprites/background/background-5.png';
import haySprite from '../assets/sprites/background/background-6.png';
import thistleSprite from '../assets/sprites/environment/environment-3.png';
import grassSprite from '../assets/sprites/environment/environment-4.png';

const assetUrls = {
  '../assets/sprites/hamster/sheet-transparent.png': hamsterSheet,
  '../assets/sprites/characters/blue-hamster/sheet-transparent.png': blueHamsterSheet,
  '../assets/sprites/characters/tasmanian/sheet-transparent.png': tasmanianSheet,
  '../assets/sprites/peanut/sheet-transparent.png': peanutSheet,
  '../assets/sprites/heart/sheet-transparent.png': heartSheet,
  '../assets/sprites/enemy/sheet-transparent.png': enemySheet,
  '../assets/sprites/enemies/ground/sheet-transparent.png': groundEnemySheet,
  '../assets/sprites/enemies/flying/sheet-transparent.png': flyingEnemySheet,
  '../assets/sprites/enemies/chestnut/sheet-transparent.png': chestnutEnemySheet,
  '../assets/sprites/platforms/platform-1.png': platformWoodLong,
  '../assets/sprites/platforms/platform-2.png': platformWoodMedium,
  '../assets/sprites/platforms/platform-3.png': platformWoodShort,
  '../assets/sprites/platforms/platform-4.png': platformDirt,
  '../assets/sprites/platforms/platform-5.png': platformStraw,
  '../assets/sprites/platforms/platform-6.png': platformMushroom,
  '../assets/sprites/background/background-1.png': cloudSprite,
  '../assets/sprites/background/background-2.png': treeSprite,
  '../assets/sprites/background/background-3.png': hillSprite,
  '../assets/sprites/background/background-4.png': barnSprite,
  '../assets/sprites/background/background-5.png': moonSprite,
  '../assets/sprites/background/background-6.png': haySprite,
  '../assets/sprites/environment/environment-3.png': thistleSprite,
  '../assets/sprites/environment/environment-4.png': grassSprite,
};

function inlineImports(source) {
  return source
    .replace(/^import '\.\.\/css\/main\.css';\s*$/m, '')
    .replace(/^import\s+(\w+)\s+from\s+'([^']+)';\s*$/gm, (match, name, specifier) => {
      if (!Object.prototype.hasOwnProperty.call(assetUrls, specifier)) {
        return match;
      }

      return `const ${name} = ${JSON.stringify(assetUrls[specifier])};`;
    });
}

function avoidFunctionNameCollisions(source) {
  return source
    .replace(/function\s+canStomp\s*\(/g, 'function originalCanStomp(')
    .replace(/function\s+stompEnemy\s*\(/g, 'function originalStompEnemy(')
    .replace(/function\s+loseLife\s*\(/g, 'function originalLoseLife(')
    .replace(/function\s+respawnPlayerAfterLifeLoss\s*\(/g, 'function originalRespawnPlayerAfterLifeLoss(');
}

function injectDrawFeedback(source) {
  return source.replace(
    /(function\s+drawPlayer\s*\([^)]*\)\s*{)/,
    `$1\n  if (state.invincible > 0 && Math.floor(state.invincible * 12) % 2 === 0) {\n    ctx.save();\n    ctx.globalAlpha = 0.38;\n  }\n`,
  ).replace(
    /(function\s+drawPlayer\s*\([^)]*\)\s*{[\s\S]*?\n})/,
    (match) => {
      if (match.includes('__lifeFeedbackDrawRestore')) {
        return match;
      }

      return match.replace(/\n}$/, `\n  if (state.invincible > 0 && Math.floor(state.invincible * 12) % 2 === 0) {\n    ctx.restore();\n  }\n  // __lifeFeedbackDrawRestore\n}`);
    },
  );
}

function patchLifeSystem(source) {
  let patched = injectDrawFeedback(avoidFunctionNameCollisions(source));

  if (!/function\s+itemBox\s*\(/.test(patched)) {
    patched += `

function itemBox(item) {
  const size = item.size || Math.max(item.width || 0, item.height || 0) || 28;
  return {
    x: item.x,
    y: item.y,
    width: item.width || size,
    height: item.height || size,
  };
}
`;
  }

  patched += `

function canStomp(enemy, previousBottom) {
  if (!enemy || enemy.kind === 'thistle') {
    return false;
  }

  const box = enemyBox(enemy);
  const playerCenterX = player.x + player.width / 2;
  const enemyLeft = box.x + 4;
  const enemyRight = box.x + box.width - 4;
  const isOverEnemy = playerCenterX >= enemyLeft && playerCenterX <= enemyRight;
  const wasAboveEnemy = previousBottom <= box.y + Math.min(24, box.height * 0.55);
  const isFallingOrLanding = player.vy >= -80 || previousBottom <= box.y + 10;

  return isOverEnemy && wasAboveEnemy && isFallingOrLanding;
}

function stompEnemy(enemy) {
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
}

function loseLife() {
  if (state.mode !== 'running' || state.invincible > 0) {
    return;
  }

  state.lives = Math.max(0, state.lives - 1);
  state.invincible = 2.45;
  state.shake = Math.max(state.shake, 2.2);
  updateHud();

  bursts.push({
    x: player.x + player.width / 2,
    y: player.y + player.height / 2,
    ttl: 0.72,
    life: 0.72,
    radius: 28,
    color: 'rgba(255, 65, 85, 0.74)',
  });

  if (state.lives <= 0) {
    endGame();
    return;
  }

  respawnPlayerAfterLifeLoss();
}

function respawnPlayerAfterLifeLoss() {
  const safePlatform =
    platforms.find((platform) => platform.x <= player.x && platform.x + platform.width >= player.x + player.width) ||
    platforms.find((platform) => platform.x + platform.width > player.x + player.width) ||
    platforms[0];

  if (!safePlatform) {
    endGame();
    return;
  }

  player.x = clamp(player.x, safePlatform.x + 30, safePlatform.x + safePlatform.width - player.width - 30);
  player.y = safePlatform.y - player.height - 18;
  player.vy = 0;
  player.jumps = 0;
  player.grounded = true;

  const dangerPadding = 155;
  enemies = enemies.filter((enemy) => {
    const enemyCenter = enemy.x + enemy.width / 2;
    return enemyCenter < player.x - dangerPadding || enemyCenter > player.x + player.width + dangerPadding;
  });

  bursts.push({
    x: player.x + player.width / 2,
    y: player.y + player.height / 2,
    ttl: 0.95,
    life: 0.95,
    radius: 18,
    color: 'rgba(255, 91, 91, 0.54)',
  });
}

const __hamsterRunOriginalUpdateHud = updateHud;
updateHud = function updateHudWithHeartIcons() {
  __hamsterRunOriginalUpdateHud();
  renderLifeHearts();
};

function renderLifeHearts() {
  if (!livesEl) {
    return;
  }

  const visibleLives = Math.max(0, Math.floor(state.lives));
  livesEl.textContent = '♥'.repeat(visibleLives);
  livesEl.style.backgroundImage = 'none';
  livesEl.style.width = 'auto';
  livesEl.setAttribute('aria-label', visibleLives === 1 ? '1 vida' : visibleLives + ' vidas');
}

updateHud();
`;

  return patched;
}

const patchedSource = patchLifeSystem(inlineImports(appSource));
const patchedModuleUrl = URL.createObjectURL(new Blob([patchedSource], { type: 'text/javascript' }));

import(patchedModuleUrl)
  .catch((error) => {
    console.error('No se pudo cargar Hamster Run', error);
  })
  .finally(() => {
    URL.revokeObjectURL(patchedModuleUrl);
  });
