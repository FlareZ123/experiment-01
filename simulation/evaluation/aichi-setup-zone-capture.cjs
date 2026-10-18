'use strict';

const {openingSetupZones} = require('../twinleaf/opening-setup-zones.cjs');

/**
 * Attach researcher-only post-setup telemetry to one synchronous match.
 * The first root Store transition into turn 1 is captured before any bot
 * policy receives its ordinary turn decision. Patching is always restored.
 * No card in the capture is supplied to a bot.
 *
 * @param {object} storeClass Pinned Store constructor with dispatch method.
 * @param {() => object} play A single synchronous runMatch invocation.
 * @returns {{game:object,setupZones:object|null}}
 */
function captureSourceSetup(storeClass,play) {
  if (typeof storeClass?.prototype?.dispatch !== 'function' ||
      typeof play !== 'function') {
    throw new TypeError('Store dispatch and synchronous match callback required');
  }
  const original = storeClass.prototype.dispatch;
  let setupZones = null;
  storeClass.prototype.dispatch = function observeSetup(action) {
    const result = original.call(this,action);
    const state = this.state;
    if (setupZones === null && state?.turn === 1 &&
        Array.isArray(state.players) && state.players.length === 2) {
      setupZones = openingSetupZones(state);
    }
    return result;
  };
  try {
    return {game:play(),setupZones};
  } finally {
    storeClass.prototype.dispatch = original;
  }
}

module.exports={captureSourceSetup};
