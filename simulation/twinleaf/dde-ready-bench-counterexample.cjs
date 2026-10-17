'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {preparedRegidrago} = require('./apex-attack-action.cjs');
const {coversPrintedApexCost,withDoubleDragonRecovery,DDE_POLICY_VERSION} =
  require('./dde-attach-tactic.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output, name));

/**
 * Stage a legal Energy-allocation choice on an established midgame board:
 * Active Regidrago VSTAR has zero Energy, while a Benched Regidrago VSTAR
 * has Grass+Fire and will cover GGF on one Double Dragon attachment.
 * This is a counterexample to first-legal-Active targeting; no opponent
 * strategy, switch availability or eventual Prize gain is inferred.
 * @returns {object}
 */
function readyBenchOpportunity() {
  const f = preparedRegidrago();
  const cards = initializeCards();
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {CardType} = engine('game/store/card/card-types');
  const {CheckProvidedEnergyEffect} = engine('game/store/effects/check-effects');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const defs = engine('simple-bot/simple-bot-definitions');
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');

  for (const card of f.attacking.active.energies.cards.slice()) {
    f.attacking.active.cards.splice(f.attacking.active.cards.indexOf(card), 1);
  }
  f.attacking.active.energies.cards.length = 0;

  const bench = new PokemonCardList();
  bench.cards.push(cards.getCardByName('Regidrago VSTAR SIT'));
  for (const name of ['Grass Energy MEE','Fire Energy MEE']) {
    const energy = cards.getCardByName(name);
    bench.cards.push(energy);
    bench.energies.cards.push(energy);
  }
  f.attacking.bench.push(bench);
  const doubleDragon = cards.getCardByName('Double Dragon Energy ROS');
  f.attacking.hand.cards.push(doubleDragon);
  const handIndex = f.attacking.hand.cards.indexOf(doubleDragon);
  const opts = withDoubleDragonRecovery({
    tactics: defs.allSimpleTactics, promptResolvers: defs.allPromptResolvers,
    scores: defs.defaultStateScores, arbiter: defs.defaultArbiterOptions
  });
  const proposed = new SimpleTacticsAi({id:f.attacking.id},opts,null)
    .decodeNextAction(f.state);
  assert.equal(proposed?.constructor.name,'PlayCardAction');
  assert.equal(proposed.handIndex,handIndex);

  const hypothetical = new PlayCardAction(f.attacking.id,handIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
  });
  f.store.dispatch(hypothetical);
  assert.ok(bench.energies.cards.includes(doubleDragon));
  const before = new CheckProvidedEnergyEffect(f.attacking,bench);
  f.store.reduceEffect(f.state,before);
  const provided = before.energyMap.flatMap(row=>row.provides);
  assert.equal(coversPrintedApexCost(provided,CardType),true,
    'One DDE on the prepared Bench yields GGF whereas Active zero-Energy cannot');

  return {
    policy: DDE_POLICY_VERSION,
    proposedTarget: proposed.target.slot===SlotType.ACTIVE ? 'ACTIVE' : 'BENCH',
    alternateBenchAttachmentStoreAccepted:true,
    benchApexPrintedCostAfterAlternate:true,
    activeEnergyCardsBefore:0,
    benchedBasicEnergyBefore:['Grass Energy','Fire Energy'],
    scope:'Injected midgame single attachment; printed Energy payment only, not demonstrated attack or game result'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(readyBenchOpportunity(),null,2)+'\n');
module.exports={readyBenchOpportunity};
