'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { preparedRegidrago } = require('./apex-attack-action.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const load = moduleName => require(path.join(output, moduleName));

/**
 * Reproduce the generic bot's immediate tactical preference when one legal
 * Marshadow Ability action is the only way to pay the next Apex Dragon.
 * This probes one prepared state, not the generic bot across all games.
 * @returns {object}
 */
function marshadowResponsePolicyProbe() {
  const f = preparedRegidrago();
  const manager = initializeCards();
  const get = name => {
    const card = manager.getCardByName(name);
    assert.ok(card, 'Missing pinned printing ' + name);
    return card;
  };
  const { PokemonCardList } = load('game/store/state/pokemon-card-list');
  const { UseAbilityAction, AttackAction } = load('game/store/actions/game-actions');
  const { PlayerType, SlotType } = load('game/store/actions/play-card-action');
  const { ResolvePromptAction } = load('game/store/actions/resolve-prompt-action');
  const { CheckProvidedEnergyEffect } = load('game/store/effects/check-effects');
  const { UseAbilityTactic } = load('simple-bot/simple-tactics/use-ability-tactic');
  const { StateScore } = load('simple-bot/state-score/state-score');
  const defaults = load('simple-bot/simple-bot-definitions');

  const marshadow = get('Marshadow UNB');
  const temple = get('Temple of Sinnoh ASR');
  const wob = get('Wobbuffet PHF');
  const dde = [get('Double Dragon Energy ROS'), get('Double Dragon Energy ROS')];
  f.attacking.active.cards = f.attacking.active.cards.filter(card => card.name !== 'Grass Energy');
  f.attacking.active.energies.cards.length = 0;
  for (const e of dde) {
    f.attacking.active.cards.push(e);
    f.attacking.active.energies.cards.push(e);
  }
  f.defending.active.cards.length = 0;
  f.defending.active.cards.push(wob);
  f.defending.stadium.cards.push(temple);
  const bench = new PokemonCardList();
  bench.cards.push(marshadow);
  f.attacking.bench.push(bench);
  const options = {
    tactics: defaults.allSimpleTactics,
    scores: defaults.defaultStateScores,
    promptResolvers: defaults.allPromptResolvers,
    arbiter: defaults.defaultArbiterOptions
  };
  const supplied = () => {
    const effect = new CheckProvidedEnergyEffect(f.attacking);
    f.store.reduceEffect(f.state, effect);
    return effect.energyMap.flatMap(e => e.provides);
  };
  const score = new StateScore(options);
  const beforeScore = score.getScore(f.state, f.attacking.id);
  const defaultChoice = new UseAbilityTactic(options).useTactic(f.state, f.attacking);
  assert.deepEqual(supplied(), [9,9]);
  assert.throws(() => f.store.dispatch(new AttackAction(f.attacking.id, 'Apex Dragon')),
    'Temple should block the paid Dragon attack before removal');
  const response = new UseAbilityAction(f.attacking.id, 'Resetting Hole', {
    player: PlayerType.BOTTOM_PLAYER,
    slot: SlotType.BENCH,
    index: 0
  });
  f.store.dispatch(response);
  const afterScore = score.getScore(f.state, f.attacking.id);
  assert.ok(f.defending.discard.cards.includes(temple));
  assert.ok(f.attacking.discard.cards.includes(marshadow));
  assert.deepEqual(supplied(), [0,0,0,0]);
  f.store.dispatch(new AttackAction(f.attacking.id,'Apex Dragon'));
  const prompt = f.state.prompts.find(p => p.result === undefined &&
    p.constructor.name === 'ChooseAttackPrompt');
  assert.ok(prompt, 'Apex Dragon becomes legally payable after Resetting Hole');
  f.store.dispatch(new ResolvePromptAction(prompt.id, f.dratini.attacks[0]));
  assert.equal(f.defending.active.damage,20);
  const responseWasChosen = defaultChoice?.constructor?.name === 'UseAbilityAction' &&
    defaultChoice.name === 'Resetting Hole';
  return {
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    defaultUseAbilityTactic:defaultChoice?.constructor?.name||null,
    defaultPower:defaultChoice?.name||null,
    responseWasChosen,
    beforeScore,afterScore,
    actualAction:'UseAbilityAction Resetting Hole',
    templeDiscarded:true,marshadowDiscarded:true,
    paidApexDragonCopiedDamage:f.defending.active.damage,
    scope:'one synthetic ready board and isolated ability tactic; no complete game or policy win rate'
  };
}

if (require.main === module) {
  console.log(JSON.stringify(marshadowResponsePolicyProbe(),null,2));
}
module.exports = { marshadowResponsePolicyProbe };
