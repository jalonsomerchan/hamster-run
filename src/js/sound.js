const SOUND_KEY = 'hamster-run-sound-enabled';
const Context = window.AudioContext || window.webkitAudioContext;

let ctx = null;
let gain = null;
let unlocked = false;
let enabled = localStorage.getItem(SOUND_KEY) !== 'false';
let button = null;

function context() {
  if (!Context) return null;
  if (!ctx) {
    ctx = new Context();
    gain = ctx.createGain();
    gain.gain.value = 0.18;
    gain.connect(ctx.destination);
  }
  return ctx;
}

async function unlock() {
  const audio = context();
  if (!audio) return false;
  try {
    if (audio.state === 'suspended') await audio.resume();
    unlocked = true;
    refreshButton();
    return true;
  } catch {
    return false;
  }
}

function setEnabled(value) {
  enabled = Boolean(value);
  localStorage.setItem(SOUND_KEY, String(enabled));
  refreshButton();
  if (enabled) unlock();
}

function toggle() {
  setEnabled(!enabled);
  if (enabled) play('toggle');
}

function beep(freq, duration, type = 'sine', volume = 0.4, to = null, delay = 0) {
  const audio = context();
  if (!audio || !gain || !enabled || !unlocked) return;

  const start = audio.currentTime + delay;
  const end = start + duration;
  const osc = audio.createOscillator();
  const amp = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), end);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, end);
  osc.connect(amp);
  amp.connect(gain);
  osc.start(start);
  osc.stop(end + 0.02);
}

function play(name) {
  if (!enabled || !unlocked) return;

  if (name === 'jump') beep(360, 0.08, 'triangle', 0.5, 620);
  if (name === 'doubleJump') {
    beep(520, 0.075, 'triangle', 0.45, 860);
    beep(740, 0.055, 'sine', 0.25, 980, 0.035);
  }
  if (name === 'peanut') {
    beep(760, 0.055, 'sine', 0.34);
    beep(1140, 0.055, 'sine', 0.22, null, 0.045);
  }
  if (name === 'damage') beep(190, 0.18, 'sawtooth', 0.48, 92);
  if (name === 'stomp') {
    beep(260, 0.09, 'square', 0.34, 520);
    beep(880, 0.055, 'triangle', 0.2, null, 0.04);
  }
  if (name === 'pause') beep(320, 0.11, 'sine', 0.26, 240);
  if (name === 'gameOver') {
    beep(330, 0.18, 'triangle', 0.32, 220);
    beep(220, 0.24, 'triangle', 0.28, 130, 0.14);
  }
  if (name === 'toggle') beep(640, 0.06, 'sine', 0.24);
}

function refreshButton() {
  if (!button) return;
  button.textContent = enabled ? 'Sonido: sí' : 'Sonido: no';
  button.setAttribute('aria-label', enabled ? 'Silenciar sonido' : 'Activar sonido');
  button.setAttribute('aria-pressed', String(enabled));
}

function createButton() {
  const controls = document.querySelector('.game-controls');
  if (!controls || button) return;

  button = document.createElement('button');
  button.id = 'soundToggleButton';
  button.type = 'button';
  button.addEventListener('pointerdown', (event) => event.stopPropagation());
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggle();
  });
  controls.prepend(button);
  refreshButton();
}

function installUnlock() {
  const handler = () => {
    if (enabled) unlock();
  };
  window.addEventListener('pointerdown', handler, { passive: true });
  window.addEventListener('keydown', handler, { passive: true });
}

createButton();
installUnlock();

window.HamsterRunAudio = {
  play,
  unlock,
  toggle,
  setEnabled,
  isEnabled: () => enabled,
  isUnlocked: () => unlocked,
};
