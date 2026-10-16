'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu} = require('./temple-raichu-board.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Exact one-Unit-Energy, one target choice Electro Rain board.
 * Telescopic Sight should increase damage to a Benched Pokémon V by 30.
 * This is conditional attack-effect fidelity, not a real-game win claim.
 * @param {boolean} toolAttached
 * @returns {object}
 */
function electroRainVsBenchedV(toolAttached) {
  const f = stagedRaichu(['Unit Energy LPM UPR'], null);
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {PlayerType, SlotType} = load('game/store/actions/play-card-action');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');

  const target = new PokemonCardList();
  target.cards.push(f.card('Shadow Rider Calyrex V CRE'));
  f.b.bench.push(target);
  if (toolAttached) f.a.active.tools.push(f.card('Telescopic Sight VIV'));
  for (const player of [f.a, f.b]) {
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(f.card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }

  // The pinned prompt recomputes blocked indices by Card.id. Synthetic fixture
  // cards must have distinct IDs just as cards do in a real 60-card game.
  f.a.active.getPokemonCard().id = 1001;
  f.attached.forEach((energy, index) => { energy.id = 1002 + index; });
  const events = [];
  f.store.dispatch(new AttackAction(101, 'Electro Rain'));
  for (let i = 0; i < 15; i++) {
    const prompt = f.state.prompts.find(p => p.result === undefined);
    if (!prompt) break;
    let selection;
    if (prompt.constructor.name === 'ChooseCardsPrompt') {
      selection = [...f.attached];
      events.push({prompt: 'ChooseCardsPrompt', chosen: selection.map(c => c.fullName)});
    } else if (prompt.constructor.name === 'PutDamagePrompt') {
      assert.equal(prompt.damage, 30);
      selection = [{target: {player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index: 0}, damage: 30}];
      events.push({prompt: 'PutDamagePrompt', selections: selection});
    } else if (prompt.constructor.name === 'WaitPrompt') {
      selection = null;
      events.push({prompt: 'WaitPrompt'});
    } else {
      throw new Error('Unexpected Electro Rain prompt: ' + prompt.constructor.name);
    }
    assert.ok(prompt.validate(selection, f.state),
      'Pinned engine rejected Electro Rain selection: ' + JSON.stringify({type: prompt.constructor.name, options: prompt.options, blocked: prompt.options?.blocked, available: prompt.cards?.cards?.map(c => ({name: c.fullName, id: c.id})), selection: selection?.map?.(c => ({name: c.fullName, id: c.id}))}));
    f.store.dispatch(new ResolvePromptAction(prompt.id, selection));
  }
  assert.ok(!f.state.prompts.some(p => p.result === undefined),
    'Electro Rain should finish all attack-choice prompts');
  return {
    toolAttached,
    activeTargetDamage: f.b.active.damage,
    benchedVTargetDamage: target.damage,
    discardedUnitEnergy: f.a.discard.cards.some(c => c.fullName === 'Unit Energy LPM UPR'),
    events
  };
}

function verify() {
  const {withElectroRainDamageHook} = require('./electro-rain-damage-hook.cjs');
  const {Store} = load('game/store/store');
  const originalReducer = Store.prototype.reduceEffect;
  const withoutTool = electroRainVsBenchedV(false);
  const withTool = electroRainVsBenchedV(true);
  const correctedWithTool = withElectroRainDamageHook(() => electroRainVsBenchedV(true));
  const correctedWithoutTool = withElectroRainDamageHook(() => electroRainVsBenchedV(false));
  assert.equal(Store.prototype.reduceEffect, originalReducer,
    'Experimental research hook must restore the vendor reducer exactly');
  assert.equal(withoutTool.activeTargetDamage, 0);
  assert.equal(withoutTool.benchedVTargetDamage, 30);
  assert.equal(withoutTool.discardedUnitEnergy, true);
  assert.equal(withTool.discardedUnitEnergy, true);
  assert.equal(withTool.benchedVTargetDamage, 30,
    'Pinned engine behavioral characterization changed: review the Telescopic Sight bug');
  assert.equal(correctedWithTool.benchedVTargetDamage, 60,
    'Scoped research hook must restore the printed Telescopic Sight bonus');
  assert.equal(correctedWithoutTool.benchedVTargetDamage, 30,
    'Scoped research hook must preserve Electro Rain base damage without a Tool');
  assert.equal(electroRainVsBenchedV(true).benchedVTargetDamage, 30,
    'Research hook restoration must recover original pinned behavior');
  return {
    scope: 'one attached source-legal Unit LPM, 30-damage Electro Rain onto Benched V',
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    expectedPaperDamageWithSight: 60,
    unpatchedEngineDamageWithSight: withTool.benchedVTargetDamage,
    withoutTool,
    withTool,
    correctedWithTool,
    correctedWithoutTool,
    note: 'Conditional engine action only, not evidence of matchup wins'
  };
}
if (require.main === module) console.log(JSON.stringify(verify(), null, 2));
module.exports = {electroRainVsBenchedV, verify};
