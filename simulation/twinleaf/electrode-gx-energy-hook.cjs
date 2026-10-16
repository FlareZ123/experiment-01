'use strict';

const path = require('node:path');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(root, name));
let restoreActive = null;

/** Correct a pinned Extra Energy Bomb action without modifying vendor code. */
function installElectrodeGXEnergyHook() {
  if (restoreActive) return restoreActive;
  const {ElectrodeGX} = load('sets/08-sun-and-moon/set-celestial-storm/electrode-gx');
  const {PowerEffect} = load('game/store/effects/game-effects');
  const {AttachEnergyPrompt} = load('game/store/prompts/attach-energy-prompt');
