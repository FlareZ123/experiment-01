'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { assertValidPromptAction } =
  require('../simulation/twinleaf/prompt-integrity.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const { Player } = require(path.join(output, 'game/store/state/player'));
const { State } = require(path.join(output, 'game/store/state/state'));
const { ChooseCardsPrompt } = require(path.join(output, 'game/store/prompts/choose-cards-prompt'));
const { ResolvePromptAction } = require(path.join(output, 'game/store/actions/resolve-prompt-action'));
const { GameMessage } = require(path.join(output, 'game/game-message'));

test('pinned ChooseCardsPrompt accepts same physical card twice; strict gate rejects', () => {
  const manager = initializeCards();
  const first = manager.getCardByName('Psychic Energy SVE');
  const second = manager.getCardByName('Psychic Energy SVE');
  assert.ok(first && second);
  assert.notEqual(first, second);
  const player = new Player();
  player.id = 101;
  player.deck.cards.push(first, second);
  const state = new State();
  state.players.push(player);
  const prompt = new ChooseCardsPrompt(
    player, GameMessage.CHOOSE_CARD_TO_HAND, player.deck, {},
    {min: 2, max: 2, allowCancel: false}
  );
  prompt.id = 7;
  state.prompts.push(prompt);
  assert.equal(prompt.validate([first, first]), true);
  assert.throws(() => assertValidPromptAction(
    state, new ResolvePromptAction(7, [first, first])), /invalid result/);
  assert.doesNotThrow(() => assertValidPromptAction(
    state, new ResolvePromptAction(7, [first, second])));
});
