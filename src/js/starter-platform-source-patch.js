const STARTER_PLATFORM_SOURCE_PATCHES = [
  [
    "makePlatform(-35, floor, Math.max(340, state.width * 0.82), state.level.platformVariant),",
    "makePlatform(-45, floor, Math.max(390, state.width * 0.96), state.level.platformVariant),",
  ],
  [
    'if (state.level?.tutorial || platforms.length < 2) return;',
    'if (platforms.length < 2) return;',
  ],
  [
    'first.x = -34;',
    'first.x = -45;',
  ],
  [
    'first.width = clamp(state.width * 0.74, 292, 348);',
    'first.width = clamp(state.width * 0.86, 330, 420);',
  ],
];

const PAUSE_CONTROLS_SOURCE = `
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
`;

const nativeBlob = window.Blob;
let restored = false;

function patchGameSource(source) {
  if (typeof source !== 'string' || !source.includes('Hamster Run')) return source;

  const patchedSource = STARTER_PLATFORM_SOURCE_PATCHES.reduce(
    (nextSource, [from, to]) => nextSource.split(from).join(to),
    source,
  );

  if (
    patchedSource.includes('window.HamsterRunPauseControls') ||
    !patchedSource.includes('function syncGameChrome') ||
    !patchedSource.includes('function resetGame')
  ) {
    return patchedSource;
  }

  return `${patchedSource}\n${PAUSE_CONTROLS_SOURCE}`;
}

function shouldPatchBlob(parts) {
  return parts?.some?.((part) => typeof part === 'string' && part.includes('function improveStarterPlatforms'));
}

function installBlobPatch() {
  if (typeof nativeBlob !== 'function') return;

  window.Blob = function PatchedBlob(parts = [], options) {
    const nextParts = shouldPatchBlob(parts) ? parts.map(patchGameSource) : parts;
    return new nativeBlob(nextParts, options);
  };
  window.Blob.prototype = nativeBlob.prototype;
}

function restoreSourcePatches() {
  if (restored) return;

  restored = true;
  window.Blob = nativeBlob;
}

installBlobPatch();
window.setTimeout(restoreSourcePatches, 1200);
