'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {preparedToolAttack} =
  require('./tm-attack-policy-characterization.cjs');
const {installPrototypeSafeSimulatorHook} =
  require('./prototype-safe-simulator-hook.cjs');
const {installDetachedSimulatorHook} =
  require('./detached-simulator-hook.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runMatch} = require('./headless.cjs');
const {selectTrajectory} = require('./detached-simulator-game-contrast.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output, name));

/**
 * Show the difference between source-inheriting clones and prototype-safe
 * clones for the same real attack, with a temporary field that is added to
 * the live Card only *after* simulator construction.
 *
 * @returns {object}
 */
function testPrototypeSafeRealAttack() {
  const f = preparedToolAttack();
  const live = f.defender.active.getPokemonCard();
  assert.ok(live);
  const before = live.damageTakenLastTurn;
  const restore = installPrototypeSafeSimulatorHook();
  const property = '__agent49AfterCloneProbe';
  let result;
  try {
    const {Simulator} = engine('game/bots/simulator');
    const {AttackAction} = engine('game/store/actions/game-actions');
    const {ResolvePromptAction} =
      engine('game/store/actions/resolve-prompt-action');
    const sim = new Simulator(f.state);
    const cloned = sim.store.state.players[1].active.getPokemonCard();
    assert.ok(cloned);
    assert.notStrictEqual(cloned, live);
    assert.strictEqual(Object.getPrototypeOf(cloned), Object.getPrototypeOf(live),
      'Card must inherit its class prototype, not the live Card instance');
    live[property] = 111;
    assert.equal(cloned[property], undefined,
      'A new live field may not be inherited by the simulated Card');
    sim.dispatch(new AttackAction(f.attacker.id, 'Crisis Punch'));
    let prompts = 0;
    while (sim.store.state.prompts.some(p => p.result === undefined)) {
      const prompt = sim.store.state.prompts.find(p => p.result === undefined);
      assert.equal(prompt.constructor.name, 'WaitPrompt');
      sim.dispatch(new ResolvePromptAction(prompt.id, null));
      prompts++;
      assert.ok(prompts < 12);
    }
    assert.equal(sim.store.state.players[1].active.damage, 280);
    assert.equal(live.damageTakenLastTurn, before);
    assert.equal(f.defender.active.damage, 0);
    result = {
      sourcePrototypeAliased: Object.getPrototypeOf(cloned) === live,
      simulatedDamage: sim.store.state.players[1].active.damage,
      liveDamageHistoryAfter: live.damageTakenLastTurn,
      liveBoardDamageAfter: f.defender.active.damage,
      newLiveFieldInherited: Object.prototype.hasOwnProperty.call(cloned,property) ||
        cloned[property] !== undefined,
      resolvedWaitPrompts: prompts
    };
  } finally {
    delete live[property];
    restore();
  }
  return result;
}

/**
 * Characterize whether prototype severing changes a source-ranked game beyond
 * the existing detached Card clone. Both profiles are experimental.
 *
 * @returns {object}
 */
function comparePrototypeSafeGame() {
  const resolved = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const ranks = new Map(resolved.decks.map(d => [d.rank,d]));
  const champion = ranks.get(1), drago = ranks.get(10);
  assert.ok(champion?.playableUnderEngine && drago?.playableUnderEngine);
  const request = {
    deckA: champion.cardIds, deckB: drago.cardIds,
    seed: 20261049, maxActions: 350,
    label: 'source-ranked prototype safe versus weak-detached diagnostic',
    strictPromptValidation: true,
    forestSealSearchCorrection: true,
    supporterDecisionCorrection: true,
    doubleDragonRecovery: true,
    isolatePolicyRandomness: true
  };

  const restoreWeak = installDetachedSimulatorHook();
  let weak;
  try {
    weak = selectTrajectory(runMatch(request));
  } finally {
    restoreWeak();
  }
  const restoreSafe = installPrototypeSafeSimulatorHook();
  let safe;
  try {
    safe = selectTrajectory(runMatch(request));
  } finally {
    restoreSafe();
  }
  assert.deepEqual(weak.deckHashes, safe.deckHashes);
  assert.equal(weak.actualFirstTurn, safe.actualFirstTurn);
  return {
    seed: request.seed, deckHashes: weak.deckHashes,
    weakDetached: {
      winner: weak.winner, actions: weak.actions, turns: weak.turns,
      fingerprint: weak.recordFingerprint
    },
    prototypeSafe: {
      winner: safe.winner, actions: safe.actions, turns: safe.turns,
      fingerprint: safe.recordFingerprint
    },
    identicalGameTrajectories: weak.recordFingerprint === safe.recordFingerprint
  };
}

/** @returns {object} */
function characterizePrototypeSafeDetachment() {
  return {
    experiment: 'prototype-safe-simulator-compatibility-v1',
    engineRevision: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    realAttack: testPrototypeSafeRealAttack(),
    sourceGame: comparePrototypeSafeGame(),
    caveat: 'Prototype-safe behavior is experimental, with one conditioned attack and one seed. Even source-prototype detachment may interact with class metadata or special runtime objects in untested effects.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(characterizePrototypeSafeDetachment(), null, 2) + '\n');
}
module.exports = {
  testPrototypeSafeRealAttack,
  comparePrototypeSafeGame,
  characterizePrototypeSafeDetachment
};
