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
  const {PlayerType} = load('game/store/actions/play-card-action');
  const {SuperType,CardTag} = load('game/store/card/card-types');
  const {GameError} = load('game/game-error');
  const {GameMessage} = load('game/game-message');
  const original = ElectrodeGX.prototype.reduceEffect;
  /** @param {any} store @param {any} state @param {any} effect */
  function corrected(store,state,effect) {
    if (!(effect instanceof PowerEffect) || effect.power !== this.powers[0]) {
      return original.call(this,store,state,effect);
    }
    const player = effect.player;
    const recipients = [];
