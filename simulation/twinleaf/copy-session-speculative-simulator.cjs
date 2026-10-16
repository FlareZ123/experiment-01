'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {preparedRegidrago} = require('./apex-attack-action.cjs');
const {installPrototypeSafeSimulatorHook} =
  require('./prototype-safe-simulator-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const load = name => require(path.join(output, name));

/**
 * Probe module-global copied attack sessions across a speculative Simulator
 * action in the same process. The Store and effect are real; the source
 * Pokemon reducer is instrumented to record when session delegation occurs.
 *
 * @param {'control'|'pinned'|'prototype-safe'} mode
 * @returns {{mode:string,events:string[],before:number,after:number,simulatorError:string|null}}
 */
function runSimulatorSessionProbe(mode) {
  const {EndTurnEffect} = load('game/store/effects/game-phase-effects');
  const {PassTurnAction} = load('game/store/actions/game-actions');
  const {cloneAttacks,openCopyAttackSession,clearCopyAttackSessionsForTests} =
    load('game/store/prefabs/copy-attack-delegation');
  const simulatorModule = load('game/bots/simulator');

  clearCopyAttackSessionsForTests();
  const a = preparedRegidrago();
  const originalCopycat = a.attacking.active.getPokemonCard();
  const source = initializeCards().getCardByName('Hisuian Goodra VSTAR LOR');
  assert.ok(originalCopycat && source);
  a.attacking.discard.cards.push(source);
  const clonedAttacks = cloneAttacks(source.attacks);
  const events = [];
  const saved = source.reduceEffect;
  source.reduceEffect = function(store,state,effect) {
    if (effect instanceof EndTurnEffect) {
      events.push(store === a.store ? 'real' : 'speculative');
    }
    return state;
  };

  let restoreSimulator = () => {};
  try {
    openCopyAttackSession(a.state, a.attacking, originalCopycat,
      source, clonedAttacks, clonedAttacks[0]);

    a.store.reduceEffect(a.state,new EndTurnEffect(a.attacking));
    const before = events.length;
    assert.equal(before,1);

    let simulatorError = null;
    if (mode !== 'control') {
      if (mode === 'prototype-safe') {
        restoreSimulator = installPrototypeSafeSimulatorHook();
      }
      try {
        const Simulator = simulatorModule.Simulator;
        const simulator = new Simulator(a.state);
        simulator.dispatch(new PassTurnAction(a.attacking.id));
      } catch (error) {
        simulatorError = error?.message ?? String(error);
      }
    }

    a.store.reduceEffect(a.state,new EndTurnEffect(a.attacking));
    return {mode,events,before,after:events.length,simulatorError};
  } finally {
    restoreSimulator();
    source.reduceEffect = saved;
    clearCopyAttackSessionsForTests();
  }
}

function characterizeSpeculativeSessionInteraction() {
  const control = runSimulatorSessionProbe('control');
  const pinned = runSimulatorSessionProbe('pinned');
  const prototypeSafe = runSimulatorSessionProbe('prototype-safe');
  assert.deepEqual(control.events,['real','real']);
  return {
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    control,pinned,prototypeSafe,
    scope: 'Injected copy session and instrumented Goodra source reducer; exploratory actual Simulator dispatch and real Store effects, not match strength'
  };
}

if (require.main === module) {
  console.log('SPECULATIVE_COPY_SESSION',
    JSON.stringify(characterizeSpeculativeSessionInteraction(),null,2));
}
module.exports = {characterizeSpeculativeSessionInteraction};
