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

const nativeBlob = window.Blob;
const nativeFunction = window.Function;
const nativeEval = window.eval;
const nativeStringReplace = String.prototype.replace;
let restored = false;

function patchGameSource(source) {
  if (typeof source !== 'string' || !source.includes('Hamster Run')) return source;

  return STARTER_PLATFORM_SOURCE_PATCHES.reduce(
    (nextSource, [from, to]) => nextSource.split(from).join(to),
    source,
  );
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

function installFunctionPatch() {
  window.Function = function PatchedFunction(...args) {
    const nextArgs = args.map(patchGameSource);
    return nativeFunction.apply(this, nextArgs);
  };
  window.Function.prototype = nativeFunction.prototype;
}

function installEvalPatch() {
  window.eval = function patchedEval(source) {
    return nativeEval.call(this, patchGameSource(source));
  };
}

function installReplacePatch() {
  String.prototype.replace = function patchedReplace(...args) {
    const replaced = nativeStringReplace.apply(this, args);
    return patchGameSource(replaced);
  };
}

function restoreSourcePatches() {
  if (restored) return;

  restored = true;
  window.Blob = nativeBlob;
  window.Function = nativeFunction;
  window.eval = nativeEval;
  String.prototype.replace = nativeStringReplace;
}

installBlobPatch();
installFunctionPatch();
installEvalPatch();
installReplacePatch();
window.setTimeout(restoreSourcePatches, 2500);
