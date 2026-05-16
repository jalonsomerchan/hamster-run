import { POWER_UP_TYPES } from '../config/gameConfig.js';

import {
  state,
  player,
  peanuts,
  hearts,
  enemies,
  powerUps,
  powerUpEffects,
  feedbacks,
  bursts,
} from './state.js';
import { playSound } from './player.js';

export function playerBox(padding = 0) {
  return {
    x: player.x + padding,
    y: player.y + padding,
    width: player.width - padding * 2,
    height: player.height - padding * 2,
  };
}

export function enemyBox(enemy) {
  if (enemy.kind === 'flying' || enemy.kind === 'acornBat') {
    return {
      x: enemy.x + 10,
      y: enemy.y + 10,
      width: enemy.width - 20,
      height: enemy.height - 18,
    };
  }
  return {
    x: enemy.x + 5,
    y: enemy.y + 5,
    width: enemy.width - 10,
    height: enemy.height - 9,
  };
}

export function itemBox(item) {
  const size = item.size || Math.max(item.width || 0, item.height || 0) || 28;
  return {
    x: item.x,
    y: item.y,
    width: item.width || size,
    height: item.height || size,
  };
}

export function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function addFeedback(text, x, y, color) {
  feedbacks.push({ text, x, y, age: 0, ttl: 1.2, color });
}

export function canStomp(enemy, previousBottom) {
  if (!enemy || enemy.kind === 'thistle') return false;
  const box = enemyBox(enemy);
  const pBox = playerBox(8);
  const playerBottom = player.y + player.height;
  const horizontalOverlap =
    Math.min(pBox.x + pBox.width, box.x + box.width) - Math.max(pBox.x, box.x);
  const minRequiredOverlap = Math.min(pBox.width, box.width) * 0.18;
  return (
    horizontalOverlap >= minRequiredOverlap &&
    previousBottom <= box.y + Math.max(18, box.height * 0.48) &&
    playerBottom <= box.y + box.height * 0.78 &&
    player.vy >= -120
  );
}

export function stompEnemy(enemy) {
  if (!enemy || enemy.defeated) return;
  playSound('stomp');
  enemy.defeated = true;
  enemy.defeatTime = 0.28;
  state.score += enemy.kind === 'flying' || enemy.kind === 'acornBat' ? 180 : 140;
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

export function checkCollisions(loseLife) {
  const previousBottom = player.y + player.height - player.vy * (1 / 60);

  for (const peanut of peanuts) {
    const dx = player.x + player.width / 2 - (peanut.x + peanut.size / 2);
    const dy = player.y + player.height / 2 - (peanut.y + peanut.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (!peanut.taken && distance < (player.width + peanut.size) * 0.42) {
      peanut.taken = true;
      state.peanuts += 1;
      state.score += 75;
      addFeedback('+75', peanut.x + peanut.size / 2, peanut.y - 12, '#f5cb6b');
      playSound('peanut');
      bursts.push({
        x: peanut.x + peanut.size / 2,
        y: peanut.y + peanut.size / 2,
        ttl: 0.32,
        life: 0.32,
        radius: 24,
        color: '#f5cb6b',
      });
    }
  }

  for (const heart of hearts) {
    if (!heart.taken && intersects(playerBox(7), itemBox(heart))) {
      heart.taken = true;
      state.lives = Math.min(6, state.lives + 1);
      state.score += 110;
      addFeedback('VIDA!', heart.x + heart.size / 2, heart.y - 12, '#ff3f66');
      playSound('heart');
      bursts.push({
        x: heart.x + heart.size / 2,
        y: heart.y + heart.size / 2,
        ttl: 0.38,
        life: 0.38,
        scale: 0.58,
        color: '#ff3f66',
      });
    }
  }

  for (const p of powerUps) {
    const dx = player.x + player.width / 2 - (p.x + p.size / 2);
    const dy = player.y + player.height / 2 - (p.y + p.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (!p.taken && distance < (player.width + p.size) * 0.42) {
      p.taken = true;
      const def = POWER_UP_TYPES[p.type];
      powerUpEffects[p.type] = def.duration;
      state.score += def.score;
      addFeedback(def.label, player.x + player.width / 2, player.y - 12, def.color);
      playSound('powerup');
      bursts.push({
        x: p.x + p.size / 2,
        y: p.y + p.size / 2,
        ttl: 0.46,
        life: 0.46,
        radius: 28,
        color: def.color,
      });
    }
  }

  for (const enemy of enemies) {
    if (!enemy.defeated && intersects(playerBox(9), enemyBox(enemy))) {
      if (canStomp(enemy, previousBottom)) stompEnemy(enemy);
      else if (powerUpEffects.invincible <= 0) loseLife();
    }
  }
}
