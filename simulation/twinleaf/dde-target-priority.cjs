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
  const action = new SimpleTacticsAi({id:101}, options, null).decodeNextAction(f.state);
  assert.equal(action?.constructor.name, 'PlayCardAction');
  assert.equal(action.handIndex, f.attacking.hand.cards.indexOf(energy));
  assert.equal(action.target.slot, SlotType.ACTIVE);
  return {
    activeAlreadyCanPayApex:true,
    eligibleUnpoweredBenchedRegidrago:true,
    optInTacticSelected:'Double Dragon Energy',
    chosenSlot:'ACTIVE',
    limitation:'First-legal-Dragon priority, not a relative strategic value comparison'
  };
}
if(require.main===module)console.log(JSON.stringify(checkAttachmentPriority(),null,2));
module.exports={checkAttachmentPriority};
