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
      'Pinned engine rejected explicit Electro Rain selection at ' + prompt.constructor.name);
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
  const withoutTool = electroRainVsBenchedV(false);
  const withTool = electroRainVsBenchedV(true);
  assert.equal(withoutTool.activeTargetDamage, 0);
  assert.equal(withoutTool.benchedVTargetDamage, 30);
  assert.equal(withoutTool.discardedUnitEnergy, true);
  assert.equal(withTool.discardedUnitEnergy, true);
  assert.equal(withTool.benchedVTargetDamage, 30,
    'Pinned engine behavioral characterization changed: review the Telescopic Sight bug');
  return {
    scope: 'one attached source-legal Unit LPM, 30-damage Electro Rain onto Benched V',
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    expectedPaperDamageWithSight: 60,
    unpatchedEngineDamageWithSight: withTool.benchedVTargetDamage,
    withoutTool,
    withTool,
    note: 'Conditional engine action only, not evidence of matchup wins'
  };
}
if (require.main === module) console.log(JSON.stringify(verify(), null, 2));
module.exports = {electroRainVsBenchedV, verify};
