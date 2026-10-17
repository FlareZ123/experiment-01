'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {assertValidPromptAction} = require('../simulation/twinleaf/prompt-integrity.cjs');
const out = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const {State} = require(path.join(out, 'game/store/state/state'));
const {Player} = require(path.join(out, 'game/store/state/player'));
const {EnergyCard} = require(path.join(out, 'game/store/card/energy-card'));
const {CardType} = require(path.join(out, 'game/store/card/card-types'));
const {ChooseEnergyPrompt} = require(path.join(out, 'game/store/prompts/choose-energy-prompt'));
const {ResolvePromptAction} = require(path.join(out, 'game/store/actions/resolve-prompt-action'));
const {GameMessage} = require(path.join(out, 'game/game-message'));

function scene() {
  const state = new State();
  const player = new Player();
  player.id = 101;
  state.players.push(player);
  const catalog = [
    {card: new EnergyCard(), provides: [CardType.COLORLESS]},
    {card: new EnergyCard(), provides: [CardType.COLORLESS]}
  ];
  const prompt = new ChooseEnergyPrompt(101,
    GameMessage.CHOOSE_ENERGIES_TO_DISCARD, catalog,
    [CardType.COLORLESS, CardType.COLORLESS], {allowCancel: true});
  prompt.id = 7;
  state.prompts.push(prompt);
  const check = result => assertValidPromptAction(state,
    new ResolvePromptAction(7, result));
  return {prompt, catalog, check, state};
}

test('choosing each catalog Energy once is valid', () => {
  const {catalog, check} = scene();
  assert.doesNotThrow(() => check(catalog));
});

test('cannot reuse the same catalog Energy object', () => {
  const {prompt, catalog, check, state} = scene();
  const duplicate = [catalog[0], catalog[0]];
  assert.equal(prompt.validate(duplicate, state), true);
  assert.throws(() => check(duplicate), /invalid result/);
});
