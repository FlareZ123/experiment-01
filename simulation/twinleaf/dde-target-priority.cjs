'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { preparedRegidrago } = require('./apex-attack-action.cjs');
const { withDoubleDragonRecovery } = require('./dde-attach-tactic.cjs');
const load = moduleName => require(path.resolve(
  __dirname, '../../vendor/twinleaf/ptcg-server/output', moduleName
));

/** @returns {object} */
function checkAttachmentPriority() {
  const f = preparedRegidrago();
  f.attachFire();
  const cards = initializeCards();
  const { PokemonCardList } = load('game/store/state/pokemon-card-list');
  const { SlotType } = load('game/store/actions/play-card-action');
  const { AttackAction } = load('game/store/actions/game-actions');
  const { Simulator } = load('game/bots/simulator');
  const { CardType } = load('game/store/card/card-types');
  const { CheckProvidedEnergyEffect } = load('game/store/effects/check-effects');
  const bench = new PokemonCardList();
  bench.cards.push(cards.getCardByName('Regidrago VSTAR SIT'));
  f.attacking.bench.push(bench);
  const energy = cards.getCardByName('Double Dragon Energy ROS');
  f.attacking.hand.cards.push(energy);

  // Active already pays GGF for Apex Dragon without this hand Energy.
  const probe = new Simulator(f.state);
  assert.doesNotThrow(() => probe.dispatch(new AttackAction(101, 'Apex Dragon')));

  const defs = load('simple-bot/simple-bot-definitions');
  const options = withDoubleDragonRecovery({
    tactics: defs.allSimpleTactics, promptResolvers: defs.allPromptResolvers,
    scores: defs.defaultStateScores, arbiter: defs.defaultArbiterOptions
  });
  const { SimpleTacticsAi } = load('simple-bot/simple-tactics-ai');
  const tracked = [f.attacking.active.getPokemonCard(), bench.getPokemonCard(), energy];
  const before = tracked.map(card => JSON.stringify(card));
  const action = new SimpleTacticsAi({id:101}, options, null).decodeNextAction(f.state);
  const after = tracked.map(card => JSON.stringify(card));
  const speculativeCardMutations = tracked
    .filter((_,i) => before[i] !== after[i]).map(card => card.fullName);
  assert.equal(action?.constructor.name, 'PlayCardAction');
  assert.equal(action.handIndex, f.attacking.hand.cards.indexOf(energy));
  assert.equal(action.target.slot, SlotType.BENCH);
  assert.equal(action.target.index, 0);
  f.store.dispatch(action);
  assert.ok(f.attacking.bench[0].cards.includes(energy),
    'The pinned Store must attach Double Dragon to the benched Regidrago');

  const locked = preparedRegidrago();
  const firstDde = cards.getCardByName('Double Dragon Energy ROS');
  locked.attacking.active.cards.push(firstDde);
  locked.attacking.active.energies.cards.push(firstDde);
  locked.defending.stadium.cards.push(cards.getCardByName('Temple of Sinnoh ASR'));
  const secondBench = new PokemonCardList();
  secondBench.cards.push(cards.getCardByName('Regidrago VSTAR SIT'));
  locked.attacking.bench.push(secondBench);
  const anotherDde = cards.getCardByName('Double Dragon Energy ROS');
  locked.attacking.hand.cards.push(anotherDde);
  const check = new CheckProvidedEnergyEffect(locked.attacking, locked.attacking.active);
  locked.store.reduceEffect(locked.state,check);
  assert.deepEqual(check.energyMap.filter(row => row.card === firstDde)
    .flatMap(row => row.provides),[CardType.COLORLESS],
    'Temple should convert the attached DDE to one Colorless unit');
  const lockedChoice=new SimpleTacticsAi({id:101}, options, null)
    .decodeNextAction(locked.state);
  assert.equal(lockedChoice?.constructor.name,'PlayCardAction');
  assert.equal(lockedChoice.handIndex,locked.attacking.hand.cards.indexOf(anotherDde));
  assert.equal(lockedChoice.target.slot,SlotType.ACTIVE,
    'Two Grass and Temple-suppressed DDE do not pay printed GGF');
  return {
    activeAlreadyCanPayApex:true,
    eligibleUnpoweredBenchedRegidrago:true,
    optInTacticSelected:'Double Dragon Energy',
    chosenSlot:'BENCH',
    underTempleMissingFireChosenSlot:'ACTIVE',
    speculativeCardMutations,
    limitation:'Narrow Apex-cost priority only; no lookahead or match value certification'
  };
}
if(require.main===module)console.log(JSON.stringify(checkAttachmentPriority(),null,2));
module.exports={checkAttachmentPriority};
