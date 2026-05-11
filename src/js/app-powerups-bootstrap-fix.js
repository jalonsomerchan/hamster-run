import powerUpsBootstrapSource from './app-powerups-bootstrap.js?raw';
import appSource from './app.js?raw';
import '../css/main.css';
import './accessibility.js';
import './sound.js';
import './game-modes.js';

import hamsterSheet from '../assets/sprites/hamster/sheet-transparent.png';
import blueHamsterSheet from '../assets/sprites/characters/blue-hamster/sheet-transparent.png';
import tasmanianSheet from '../assets/sprites/characters/tasmanian/sheet-transparent.png';
import hamsterAngelSheet from '../assets/sprites/death/hamster-angel/sheet-transparent.png';
import blueHamsterAngelSheet from '../assets/sprites/death/blue-hamster-angel/sheet-transparent.png';
import tasmanianAngelSheet from '../assets/sprites/death/tasmanian-angel/sheet-transparent.png';
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

const patchedAppSource = tuneBaseGameSource(appSource);

const importedValues = {
  appSource: patchedAppSource,
  hamsterSheet,
  blueHamsterSheet,
  tasmanianSheet,
  hamsterAngelSheet,
  blueHamsterAngelSheet,
  tasmanianAngelSheet,
  peanutSheet,
  heartSheet,
  enemySheet,
  groundEnemySheet,
  flyingEnemySheet,
  chestnutEnemySheet,
  platformWoodLong,
  platformWoodMedium,
  platformWoodShort,
  platformDirt,
  platformStraw,
  platformMushroom,
  cloudSprite,
  treeSprite,
  hillSprite,
  barnSprite,
  moonSprite,
  haySprite,
  thistleSprite,
  grassSprite,
};

function tuneBaseGameSource(source) {
  return source
    .replace(
      `platforms = [
    makePlatform(-35, floor, Math.max(340, state.width * 0.82), state.level.platformVariant),
    {
      ...makePlatform(
        Math.max(260, state.width * 0.72),
        floor - 8,
        Math.max(260, state.width * 0.62),
        state.level.platformVariant,
      ),
      starter: true,
    },
  ];`,
      `platforms = [
    {
      ...makePlatform(-35, floor, Math.max(360, state.width * 0.92), state.level.platformVariant),
      starter: true,
      tutorialPrompt: state.level.tutorial ? 'Toca para saltar' : undefined,
    },
  ];`,
    )
    .replace(
      `const scripted = {
    2: { gap: 64, width: 330, lane: 2, prompt: 'Toca para saltar', peanuts: 2 },
    3: { gap: 132, width: 300, lane: 2, prompt: 'Salta huecos', peanuts: 2 },
    4: { gap: 154, width: 260, lane: 1, prompt: 'Doble salto', heart: true },
    5: { gap: 100, width: 330, lane: 2, prompt: 'Evita enemigos', enemy: 'ground' },
    6: { gap: 116, width: 330, lane: 2, prompt: 'Písalo desde arriba', enemy: 'chestnut', peanuts: 1 },
    7: { gap: 92, width: 340, lane: 1, prompt: 'Sigue corriendo', heart: true, peanuts: 2 },
  };`,
      `const scripted = {
    2: { gap: 86, width: 340, lane: 2, prompt: 'Salta el hueco', peanuts: 2 },
    3: { gap: 148, width: 310, lane: 1, prompt: 'Doble salto', heart: true },
    4: { gap: 112, width: 360, lane: 2, powerUpPrompt: 'Azul: más saltos', powerUp: 'jumps' },
    5: { gap: 160, width: 330, lane: 1, prompt: 'Usa los saltos extra', peanuts: 2 },
    6: { gap: 118, width: 360, lane: 2, powerUpPrompt: 'Rojo: corres más', powerUp: 'speed' },
    7: { gap: 154, width: 340, lane: 2, prompt: 'Controla el turbo', peanuts: 2 },
    8: { gap: 118, width: 360, lane: 1, powerUpPrompt: 'Amarillo: invencible', powerUp: 'invincible' },
    9: { gap: 124, width: 350, lane: 2, prompt: 'Evita enemigos', enemy: 'ground' },
    10: { gap: 126, width: 340, lane: 2, prompt: 'Písalo desde arriba', enemy: 'chestnut', peanuts: 1 },
    11: { gap: 104, width: 350, lane: 1, prompt: 'Mira el contador arriba', heart: true, peanuts: 2 },
  };`,
    );
}

function inlineBootstrapImports(source) {
  return source
    .replace(/^import appSource from '\.\/app\.js\?raw';\s*$/m, `const appSource = ${JSON.stringify(importedValues.appSource)};`)
    .replace(/^import '\.\.\/css\/main\.css';\s*$/m, '')
    .replace(/^import '\.\/accessibility\.js';\s*$/m, '')
    .replace(/^import '\.\/sound\.js';\s*$/m, '')
    .replace(/^import '\.\/game-modes\.js';\s*$/m, '')
    .replace(/^import\s+(\w+)\s+from\s+'[^']+';\s*$/gm, (match, name) => Object.hasOwn(importedValues, name) ? `const ${name} = ${JSON.stringify(importedValues[name])};` : match);
}

function fixGeneratedPowerUpsSource(source) {
  return source
    .replace(/const START_SAFE_PLATFORMS = 7;/g, 'const START_SAFE_PLATFORMS = 4;')
    .replace(
      `const TUTORIAL_POWER_UPS = {
  8: { gap: 94, width: 340, lane: 2, prompt: 'Azul: más saltos', powerUp: 'jumps' },
  9: { gap: 108, width: 340, lane: 1, prompt: 'Rojo: corres más', powerUp: 'speed', peanuts: 1 },
  10: { gap: 112, width: 340, lane: 2, prompt: 'Amarillo: invencible', powerUp: 'invincible', enemy: 'ground' },
  11: { gap: 102, width: 340, lane: 1, prompt: 'Mira el contador arriba', peanuts: 2 },
};`,
      `const TUTORIAL_POWER_UPS = {};`,
    )
    .replace(/spawnPowerUp\(platform, spec\.powerUp, 0\.56\);/g, 'spawnPowerUp(platform, spec.powerUp, 0.5, spec.powerUpPrompt);')
    .replace(/spawnPowerUp\(platform, spec\.powerUp, 0\.36\);/g, 'spawnPowerUp(platform, spec.powerUp, 0.5, spec.powerUpPrompt);')
    .replace(/spawnPowerUp\(platform, spec\.powerUp, 0\.18\);/g, 'spawnPowerUp(platform, spec.powerUp, 0.5, spec.powerUpPrompt);')
    .replace(/function spawnPowerUp\(platform, type, ratio = 0\.5\) \{/g, 'function spawnPowerUp(platform, type, ratio = 0.5, tutorialPrompt = null) {')
    .replace(/const yOffset = 92;/g, `const yOffset = state.level?.tutorial ? 86 : 92;`)
    .replace(/powerUps\.push\(\{ type, x, y: platform\.y - yOffset, size, taken: false, bob: random\(0, Math\.PI \* 2\), platformId: platform\.id, yOffset, pulse: 0 \}\);/g, `powerUps.push({ type, x, y: platform.y - yOffset, size, taken: false, bob: random(0, Math.PI * 2), platformId: platform.id, yOffset, pulse: 0, tutorialPrompt });`)
    .replace(/function drawPowerUp\(powerUp\) \{/g, `function drawPowerUpPrompt(powerUp, cx, cy) {
  if (!powerUp.tutorialPrompt) return;
  ctx.save();
  ctx.font = '800 15px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const text = powerUp.tutorialPrompt;
  const width = Math.min(240, ctx.measureText(text).width + 28);
  const labelY = cy - 36;
  ctx.fillStyle = 'rgba(20, 24, 36, 0.78)';
  powerUpRoundRect(ctx, cx - width / 2, labelY - 17, width, 34, 17);
  ctx.fill();
  ctx.strokeStyle = POWER_UP_TYPES[powerUp.type].color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.fillText(text, cx, labelY);
  ctx.restore();
}

function drawPowerUp(powerUp) {`)
    .replace(/ctx\.restore\(\);\n\}/g, 'ctx.restore();\n  drawPowerUpPrompt(powerUp, cx, cy);\n}', 1)
    .replace(/roundRect\(ctx,/g, 'powerUpRoundRect(ctx,')
    .replace(/function roundRect\(targetCtx,/g, 'function powerUpRoundRect(targetCtx,');
}

const executableSource = fixGeneratedPowerUpsSource(inlineBootstrapImports(powerUpsBootstrapSource));
const moduleUrl = URL.createObjectURL(new Blob([executableSource], { type: 'text/javascript' }));

import(moduleUrl)
  .catch((error) => console.error('No se pudo cargar Hamster Run', error))
  .finally(() => URL.revokeObjectURL(moduleUrl));
