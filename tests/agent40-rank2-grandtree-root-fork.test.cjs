'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  SEED, SOURCE_SEAT, PRIZE_ROOT_ORDINAL, ORIGINAL_ROOT_SHA256,
  selectLiveDeckEvolution
} = require('../simulation/twinleaf/agent40-rank2-grandtree-root-fork.cjs');

class ChooseCardsPrompt {
  constructor(player, cards) {
    this.playerId = player.id;
    this.cards = player.deck;
    this.cards.cards = cards;
    this.id = 21;
  }
  validate(cards) {
    return cards.length === 1 && this.cards.cards.includes(cards[0]);
  }
}
class ResolvePromptAction {
  constructor(promptId, selection) {
    this.promptId = promptId;
    this.selection = selection;
  }
}

test('source fork pins an existing authentic original-deal decision', () => {
  assert.equal(SEED, 20261024);
  assert.equal(SOURCE_SEAT, 1);
  assert.equal(PRIZE_ROOT_ORDINAL, 47);
  assert.match(ORIGINAL_ROOT_SHA256, /^[a-f0-9]{64}$/);
});

test('live owner-deck Stadium prompt may select actual Herdier', () => {
  const herdier = {fullName: 'Herdier SUM'};
  const player = {id: 202, deck: {cards: []}};
  const prompt = new ChooseCardsPrompt(player, [herdier]);
  const action = selectLiveDeckEvolution({}, player, prompt,
    'Herdier SUM', ResolvePromptAction);
  assert.equal(action.promptId, 21);
  assert.deepEqual(action.selection, [herdier]);
});

test('live owner-deck Stadium prompt may select actual Stoutland', () => {
  const stoutland = {fullName: 'Stoutland BCR'};
  const player = {id: 202, deck: {cards: []}};
  const prompt = new ChooseCardsPrompt(player, [stoutland]);
  const action = selectLiveDeckEvolution({}, player, prompt,
    'Stoutland BCR', ResolvePromptAction);
  assert.deepEqual(action.selection, [stoutland]);
});

test('no hidden deck peeking before own live search prompt', () => {
  const player = {id: 202, deck: {cards: [{fullName: 'Herdier SUM'}]}};
  const fakePrompt = {playerId: 202, cards: player.deck};
  assert.equal(selectLiveDeckEvolution({}, player, fakePrompt,
    'Herdier SUM', ResolvePromptAction), null);
  const opponent = {id: 101, deck: {cards: [{fullName: 'Herdier SUM'}]}};
  const wrongOwnerPrompt = new ChooseCardsPrompt(opponent,
    opponent.deck.cards);
  assert.equal(selectLiveDeckEvolution({}, player, wrongOwnerPrompt,
    'Herdier SUM', ResolvePromptAction), null);
  assert.equal(selectLiveDeckEvolution({}, player, undefined,
    'Herdier SUM', ResolvePromptAction), null);
});
