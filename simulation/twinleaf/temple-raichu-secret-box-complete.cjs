'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {preparedStadiumResponse, providedEnergy} = (() => {
  const policy = require('./temple-raichu-policy-characterization.cjs');
  return {
    preparedStadiumResponse: policy.preparedStadiumResponse,
    providedEnergy: require('./temple-raichu-board.cjs').providedEnergy
  };
})();

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Source-representable conditional line: expired Battle VIP Pass x3 becomes
 * the discard payment for Secret Box, which finds PokéStop to replace Temple.
 * This is a staged board test with explicit validated prompt selections.
 */
function testSecretBoxStadiumLine() {
  const f = preparedStadiumResponse('secret-box-three-expired-vip');
  const {CardType} = load('game/store/card/card-types');
  const {PlayCardAction, PlayerType, SlotType} =
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {StateUtils} = load('game/store/state-utils');

  assert.deepEqual(providedEnergy(f).map(row => row.provides), [[CardType.COLORLESS]]);
  assert.equal(StateUtils.getStadiumCard(f.state)?.fullName, 'Temple of Sinnoh ASR');
  const box = f.a.hand.cards.findIndex(card => card.fullName === 'Secret Box TWM');
  assert.ok(box >= 0);
  f.store.dispatch(new PlayCardAction(f.a.id, box, {
    player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
  }));
  const steps = [];
  for (let n = 0; n < 8; n += 1) {
    const p = f.state.prompts.find(prompt => prompt.result === undefined);
    if (!p) break;
    const type = p.constructor.name;
    let selection;
    if (type === 'ChooseCardsPrompt' && p.options.min === 3) {
      selection = p.cards.cards.filter(card => card.fullName === 'Battle VIP Pass FST');
      assert.equal(selection.length, 3, 'Discard exactly three expired VIP Pass');
      steps.push('discard-expired-vip-three');
    } else if (type === 'ChooseCardsPrompt') {
      selection = p.cards.cards.filter(card => card.fullName === 'PokéStop PGO');
      assert.equal(selection.length, 1, 'PokéStop must remain in deck search zone');
      steps.push('choose-pokestop');
    } else if (type === 'ShowCardsPrompt') {
      selection = true;
      steps.push('reveal-search');
    } else if (type === 'ShuffleDeckPrompt') {
      selection = f.a.deck.cards.map((card, index) => index);
      steps.push('shuffle-deck-valid-permutation');
    } else {
      throw new Error('Unexpected prompt while resolving Secret Box: ' + type);
    }
    if (typeof p.validate === 'function') {
      assert.equal(p.validate(selection, f.state), true,
        'Response must pass normal prompt validation for ' + type);
    }
    f.store.dispatch(new ResolvePromptAction(p.id, selection));
  }
  assert.deepEqual(steps, [
    'discard-expired-vip-three', 'choose-pokestop',
    'reveal-search', 'shuffle-deck-valid-permutation'
  ]);
  assert.ok(!f.state.prompts.some(prompt => prompt.result === undefined),
    'Secret Box search must resolve fully');
  assert.equal(f.a.discard.cards.filter(card => card.fullName ===
    'Battle VIP Pass FST').length, 3);
  assert.ok(f.a.hand.cards.some(card => card.fullName === 'PokéStop PGO'));

  const pokeStopIndex = f.a.hand.cards.findIndex(card => card.fullName === 'PokéStop PGO');
  f.store.dispatch(new PlayCardAction(f.a.id, pokeStopIndex, {
    player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
  }));
  assert.equal(StateUtils.getStadiumCard(f.state)?.fullName, 'PokéStop PGO');
  assert.ok(providedEnergy(f)[0].provides.includes(CardType.LIGHTNING));

  f.store.dispatch(new AttackAction(f.a.id, 'Electro Rain'));
  const attackPrompt = f.state.prompts.find(prompt => prompt.result === undefined);
  assert.ok(attackPrompt, 'Paid Electro Rain proceeds to its discard selection prompt');

  return {
    sourceRank: 17,
    paidItem: 'Secret Box TWM',
    discarded: '3 Battle VIP Pass FST (expired at turn 4)',
    fetched: 'PokéStop PGO',
    prompts: steps,
    outgoingStadium: 'Temple of Sinnoh ASR',
    activeStadium: StateUtils.getStadiumCard(f.state)?.fullName,
    restoredEnergy: providedEnergy(f)[0].provides,
    attack: 'Electro Rain',
    attackPrompt: attackPrompt.constructor.name,
    limitation: 'Hand, Stage 1 attacker, Energy and board injected; no deck-draw likelihood or win outcome'
  };
}

if (require.main === module) {
  console.log(JSON.stringify(testSecretBoxStadiumLine(), null, 2));
}
module.exports = {testSecretBoxStadiumLine};
