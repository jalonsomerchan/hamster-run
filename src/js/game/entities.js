import {
  LANDING_ZONE,
  START_SAFE_PLATFORMS,
  POWER_UP_TYPES,
  backgroundThemes,
} from '../config/gameConfig.js';
import { sprites } from '../config/assets.js';
import { random, clamp } from '../utils/math.js';
import {
  state,
  platforms,
  peanuts,
  hearts,
  enemies,
  decor,
  bursts,
  powerUps,
  backgroundProps,
} from './state.js';
import { currentDifficulty } from './difficulty.js';

export function spawnEnemy(platform, enemyX, difficulty) {
  const canFly =
    platform.index > START_SAFE_PLATFORMS + 2 && Math.random() < 0.28 + difficulty * 0.28;
  if (canFly) {
    const kind = Math.random() < 0.42 ? 'acornBat' : 'flying';
    const baseY = platform.y - random(112, 154);
    enemies.push({
      kind,
      x: platform.x + platform.width + random(18, 60),
      y: baseY,
      baseY,
      width: kind === 'acornBat' ? 70 : 68,
      height: kind === 'acornBat' ? 56 : 58,
      vx: random(28, 48) + difficulty * (kind === 'acornBat' ? 20 : 18),
      phase: random(0, Math.PI * 2),
    });
    return;
  }

  const roll = Math.random();
  if (roll < 0.45) {
    enemies.push({
      kind: 'ground',
      x: enemyX,
      y: platform.y - 40,
      width: 48,
      height: 37,
      platformLeft: platform.x + LANDING_ZONE,
      platformRight: platform.x + platform.width - LANDING_ZONE - 48,
      platformId: platform.id,
      yOffset: 40,
      patrolSpeed: random(18, 32) + difficulty * 16,
      direction: Math.random() < 0.5 ? -1 : 1,
      phase: random(0, Math.PI * 2),
    });
  } else if (roll < 0.58) {
    enemies.push({
      kind: 'mushroomHopper',
      x: enemyX,
      y: platform.y - 44,
      width: 54,
      height: 40,
      platformLeft: platform.x + LANDING_ZONE,
      platformRight: platform.x + platform.width - LANDING_ZONE - 54,
      platformId: platform.id,
      yOffset: 44,
      patrolSpeed: random(16, 28) + difficulty * 14,
      direction: Math.random() < 0.5 ? -1 : 1,
      phase: random(0, Math.PI * 2),
    });
  } else if (roll < 0.72) {
    enemies.push({
      kind: 'enemy',
      x: enemyX,
      y: platform.y - 42,
      width: 48,
      height: 39,
      platformLeft: platform.x + LANDING_ZONE,
      platformRight: platform.x + platform.width - LANDING_ZONE - 48,
      platformId: platform.id,
      yOffset: 42,
      patrolSpeed: random(14, 26) + difficulty * 12,
      direction: Math.random() < 0.5 ? -1 : 1,
    });
  } else if (roll < 0.88) {
    enemies.push({
      kind: 'chestnut',
      x: enemyX,
      y: platform.y - 42,
      width: 50,
      height: 39,
      platformLeft: platform.x + LANDING_ZONE,
      platformRight: platform.x + platform.width - LANDING_ZONE - 50,
      platformId: platform.id,
      yOffset: 42,
      patrolSpeed: random(22, 36) + difficulty * 18,
      direction: Math.random() < 0.5 ? -1 : 1,
      phase: random(0, Math.PI * 2),
    });
  } else {
    enemies.push({
      kind: 'thistle',
      x: enemyX,
      y: platform.y - 48,
      width: 44,
      height: 44,
      platformId: platform.id,
      yOffset: 48,
    });
  }
}

export function addTutorialEnemy(platform, kind) {
  const width = kind === 'chestnut' ? 50 : 48;
  const height = kind === 'chestnut' ? 39 : 37;
  const yOffset = kind === 'chestnut' ? 42 : 40;

  enemies.push({
    kind,
    x: platform.x + platform.width * 0.56,
    y: platform.y - yOffset,
    width,
    height,
    platformLeft: platform.x + LANDING_ZONE,
    platformRight: platform.x + platform.width - LANDING_ZONE - width,
    platformId: platform.id,
    yOffset,
    patrolSpeed: 12,
    direction: -1,
    phase: random(0, Math.PI * 2),
  });
}

export function spawnTutorialItems(platform, spec) {
  for (let index = 0; index < (spec.peanuts || 0); index += 1) {
    const yOffset = 78;
    peanuts.push({
      x: platform.x + 72 + index * 44,
      y: platform.y - yOffset,
      size: 28,
      taken: false,
      bob: random(0, Math.PI * 2),
      platformId: platform.id,
      yOffset,
    });
  }

  if (spec.heart) {
    const yOffset = 112;
    hearts.push({
      x: platform.x + platform.width * 0.55,
      y: platform.y - yOffset,
      size: 32,
      taken: false,
      bob: random(0, Math.PI * 2),
      platformId: platform.id,
      yOffset,
    });
  }

  if (spec.enemy) {
    addTutorialEnemy(platform, spec.enemy);
  }
}

export function spawnPowerUp(platform, type, ratio = 0.5) {
  const def = POWER_UP_TYPES[type];
  if (!platform || !def) return;
  const size = 34;
  const x = clamp(
    platform.x + platform.width * ratio,
    platform.x + 46,
    platform.x + platform.width - 46,
  );
  const yOffset = 92;
  powerUps.push({
    type,
    x,
    y: platform.y - yOffset,
    size,
    taken: false,
    bob: random(0, Math.PI * 2),
    platformId: platform.id,
    yOffset,
    pulse: 0,
  });
}

export function maybeSpawnPowerUp(platform) {
  if (
    !platform ||
    state.level?.tutorial ||
    platform.index <= START_SAFE_PLATFORMS + 1 ||
    platform.width < 210
  )
    return;
  const difficulty = currentDifficulty();
  const chance = 0.075 + difficulty * 0.055;
  if (Math.random() > chance) return;
  const types = ['jumps', 'speed', 'invincible'];
  spawnPowerUp(platform, types[Math.floor(random(0, types.length))], random(0.34, 0.72));
}

export function createBackgroundProps() {
  const props = [];
  const theme = backgroundThemes[state.level.backgroundSet] || backgroundThemes.meadow;
  const candidates = theme.props;
  for (let index = 0; index < 10; index += 1) {
    const sprite = candidates[index % candidates.length];
    const lane = sprites.background[sprite].lane;
    const spacing = lane === 'sky' ? random(230, 340) : random(360, 520);
    props.push({
      sprite,
      lane,
      x: index * spacing + random(20, 130),
      size: lane === 'sky' ? random(74, 120) : random(105, 155),
      speed: lane === 'sky' ? random(0.06, 0.12) : random(0.11, 0.17),
    });
  }
  return props;
}

export function spawnBackgroundProp(initial = false) {
  const theme = backgroundThemes[state.level.backgroundSet] || backgroundThemes.meadow;
  if (!theme.props.length) return;
  const sprite = theme.props[Math.floor(random(0, theme.props.length))];
  const lane = sprites.background[sprite].lane;
  const x = initial ? random(0, state.width) : state.width + random(50, 150);
  backgroundProps.push({
    sprite,
    lane,
    x,
    size: lane === 'sky' ? random(74, 120) : random(105, 155),
    speed: lane === 'sky' ? random(0.06, 0.12) : random(0.11, 0.17),
  });
}

export function updateEntities(dt) {
  enemies.forEach((enemy) => {
    if (
      enemy.kind === 'ground' ||
      enemy.kind === 'enemy' ||
      enemy.kind === 'chestnut' ||
      enemy.kind === 'mushroomHopper'
    )
      updatePatrolEnemy(enemy, dt);
    else if (enemy.kind === 'flying' || enemy.kind === 'acornBat') {
      enemy.x -= (enemy.vx || 65) * dt;
      enemy.y = enemy.baseY + Math.sin(state.time * 4.2 + enemy.phase) * 16;
    }
  });
  bursts.forEach((burst) => {
    burst.life -= dt;
    burst.y -= 42 * dt;
    if (burst.scale !== undefined) burst.scale += 1.8 * dt;
  });
  powerUps.forEach((p) => {
    p.pulse += dt * 6;
  });
}

function updatePatrolEnemy(enemy, dt) {
  if (
    enemy.platformLeft === undefined ||
    enemy.platformRight === undefined ||
    enemy.platformRight <= enemy.platformLeft
  ) {
    return;
  }
  enemy.x += enemy.direction * enemy.patrolSpeed * dt;
  if (enemy.x <= enemy.platformLeft) {
    enemy.x = enemy.platformLeft;
    enemy.direction = 1;
  } else if (enemy.x >= enemy.platformRight) {
    enemy.x = enemy.platformRight;
    enemy.direction = -1;
  }
}

export function pruneEntities() {
  const limit = -120;
  const p = platforms;
  p.splice(0, p.length, ...p.filter((item) => item.x + item.width > limit));
  peanuts.splice(0, peanuts.length, ...peanuts.filter((item) => item.x > limit && !item.taken));
  hearts.splice(0, hearts.length, ...hearts.filter((item) => item.x > limit && !item.taken));
  powerUps.splice(0, powerUps.length, ...powerUps.filter((item) => item.x > limit && !item.taken));
  enemies.splice(0, enemies.length, ...enemies.filter((e) => e.x > limit - 40 && !e.defeated));
  decor.splice(0, decor.length, ...decor.filter((d) => d.x > limit));
  bursts.splice(0, bursts.length, ...bursts.filter((b) => b.life > 0));
}
