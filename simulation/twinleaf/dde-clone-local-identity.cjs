'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {preparedRegidrago} = require('./apex-attack-action.cjs');
const {withDoubleDragonRecovery} = require('./dde-attach-tactic.cjs');
const {installPrototypeSafeSimulatorHook} =
  require('./prototype-safe-simulator-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output, name));

/**
 * Test that a DDE attached in a simulated action is matched by the identity
 * of the simulated hand card, even when the clone detaches source Card objects.
 *
 * @param {'pinned'|'prototype-safe'} profile
 * @returns {object}
 */
function checkOneProfile(profile) {
  const cards = initializeCards();
  const f = preparedRegidrago();
  f.attachFire();
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {SlotType} = engine('game/store/actions/play-card-action');
  const bench = new PokemonCardList();
  bench.cards.push(cards.getCardByName('Regidrago VSTAR SIT'));
  f.attacking.bench.push(bench);
  const energy = cards.getCardByName('Double Dragon Energy ROS');
  f.attacking.hand.cards.push(energy);
  const sourceIndex = f.attacking.hand.cards.indexOf(energy);

  const restore = profile === 'prototype-safe' ?
    installPrototypeSafeSimulatorHook() : () => {};
  try {
    const {Simulator} = engine('game/bots/simulator');
    const simulated = new Simulator(f.state);
    const clonePlayer = simulated.store.state.players.find(p => p.id === f.attacking.id);
    const clonedEnergy = clonePlayer.hand.cards[sourceIndex];
    assert.ok(clonedEnergy);
    assert.equal(clonedEnergy.fullName, energy.fullName);
    if (profile === 'prototype-safe') {
      assert.notStrictEqual(clonedEnergy, energy,
        'Safe simulator must detach source Card identity');
    }

    const defs = engine('simple-bot/simple-bot-definitions');
    const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
    const options = withDoubleDragonRecovery({
      tactics: defs.allSimpleTactics,
      promptResolvers: defs.allPromptResolvers,
      scores: defs.defaultStateScores,
      arbiter: defs.defaultArbiterOptions
    });
    const action = new SimpleTacticsAi({id: f.attacking.id}, options, null)
      .decodeNextAction(f.state);
    assert.equal(action?.constructor.name, 'PlayCardAction');
    assert.equal(action.handIndex, sourceIndex);
    assert.equal(action.target.slot, SlotType.BENCH);
    assert.equal(action.target.index, 0);

    // Use the authoritative Store to check the effect and exact selected Card.
    f.store.dispatch(action);
    assert.ok(f.attacking.bench[0].cards.includes(energy));
    assert.equal(f.attacking.bench[0].energies.cards.includes(energy), true);
    return {
      profile,
      sourceCardDetached: clonedEnergy !== energy,
      selectedBenchRegidrago: true,
      authoritativeStoreAttachment: true
    };
  } finally {
    restore();
  }
}

/** @returns {object} */
function testCloneLocalEnergyMatching() {
  return {
    test: 'DDE policy clone-local Card identity across Simulator profiles',
    enginePin: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases: [checkOneProfile('pinned'), checkOneProfile('prototype-safe')],
    scope: 'Two constructed states, policy choice and actual Store attachment only'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(testCloneLocalEnergyMatching(), null, 2) + '\n');
}

module.exports = {checkOneProfile, testCloneLocalEnergyMatching};
