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

function patchLifeSystem(source) {
  let patched = source;

  if (!/function\s+loseLife\s*\(/.test(patched)) {
    patched += `

function loseLife() {
  if (state.mode !== 'running' || state.invincible > 0) {
    return;
  }

  state.lives = Math.max(0, state.lives - 1);
  state.invincible = 1.6;
  state.shake = Math.max(state.shake, 1.4);
  updateHud();

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

  player.x = clamp(player.x, safePlatform.x + 24, safePlatform.x + safePlatform.width - player.width - 24);
  player.y = safePlatform.y - player.height - 4;
  player.vy = 0;
  player.jumps = 0;
  player.grounded = true;

  const dangerPadding = 110;
  enemies = enemies.filter((enemy) => {
    const enemyCenter = enemy.x + enemy.width / 2;
    return enemyCenter < player.x - dangerPadding || enemyCenter > player.x + player.width + dangerPadding;
  });

  bursts.push({
    x: player.x + player.width / 2,
    y: player.y + player.height / 2,
    ttl: 0.45,
    life: 0.45,
    radius: 16,
    color: 'rgba(255, 91, 91, 0.5)',
  });
}
`;
  }

  patched += `

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

await import(patchedModuleUrl);
URL.revokeObjectURL(patchedModuleUrl);
