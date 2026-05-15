import { levels } from '../config/gameConfig.js';

export const state = {
  mode: 'menu',
  level: levels[0],
  width: 390,
  height: 844,
  dpr: 1,
  time: 0,
  score: 0,
  distance: 0,
  peanuts: 0,
  lives: 3,
  invincible: 0,
  selectedLevel: 0,
  selectedCharacter: 0,
  last: performance.now(),
  speedBoost: 0,
  shake: 0,
  platformCount: 0,
};

export const player = {
  x: 74,
  y: 0,
  width: 62,
  height: 54,
  vy: 0,
  jumps: 0,
  grounded: false,
};

export const powerUpEffects = { jumps: 0, speed: 0, invincible: 0 };
export const feedbacks = [];

export let platforms = [];
export let peanuts = [];
export let hearts = [];
export let enemies = [];
export let decor = [];
export let backgroundProps = [];
export let bursts = [];
export let powerUps = [];

export function setPlatforms(value) { platforms = value; }
export function setPeanuts(value) { peanuts = value; }
export function setHearts(value) { hearts = value; }
export function setEnemies(value) { enemies = value; }
export function setDecor(value) { decor = value; }
export function setBackgroundProps(value) { backgroundProps = value; }
export function setBursts(value) { bursts = value; }
export function setPowerUps(value) { powerUps = value; }

export function clearPowerUpEffects() {
  powerUpEffects.jumps = 0;
  powerUpEffects.speed = 0;
  powerUpEffects.invincible = 0;
}

export let currentGameMode = null;
export let modeTimeLeft = null;

export function setCurrentGameMode(value) { currentGameMode = value; }
export function setModeTimeLeft(value) { modeTimeLeft = value; }

export const perfProbe = { enabled: new URLSearchParams(window.location.search).has('debugFps'), frames: 0, acc: 0 };
