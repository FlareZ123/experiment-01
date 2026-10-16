'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {captureChooseCardsReferences, restoreChooseCardsReferences} =
  require('../simulation/twinleaf/choose-cards-reference.cjs');

class ChooseCardsPrompt {
  constructor(cards, message = 'Select Pokémon') {
    this.cards = {cards};
    this.message = message;
  }
}
class ResolvePromptAction {
  constructor(result) { this.result = result; }
}
const card = name => ({fullName:name});

test('same-print separate card objects retain their distinct source indices', () => {
  const first = card('Fezandipiti ex SFA');
  const second = card('Fezandipiti ex SFA');
  const prompt = new ChooseCardsPrompt([first, second, card('Shadow Rider V CRE')]);
  const encoded = captureChooseCardsReferences(prompt, new ResolvePromptAction([second]));
  assert.deepEqual(encoded.selection, [
    {mode:'card-reference', index:1, fullName:'Fezandipiti ex SFA'}
  ]);
  const clone = new ChooseCardsPrompt([card('Fezandipiti ex SFA'),
    card('Fezandipiti ex SFA'), card('Shadow Rider V CRE')]);
  const restored = restoreChooseCardsReferences(clone, encoded);
  assert.equal(restored[0], clone.cards.cards[1]);
  assert.notEqual(restored[0], clone.cards.cards[0]);
});

test('numeric prompt selection retains original numeric representation', () => {
  const prompt = new ChooseCardsPrompt([card('Alpha'), card('Beta')]);
  const encoded = captureChooseCardsReferences(prompt, new ResolvePromptAction([1, 0]));
  assert.deepEqual(restoreChooseCardsReferences(prompt, encoded), [1, 0]);
});

test('null and empty prompt results stay distinct', () => {
  const prompt = new ChooseCardsPrompt([card('Alpha')]);
  const nullEncoded = captureChooseCardsReferences(prompt, new ResolvePromptAction(null));
  assert.equal(restoreChooseCardsReferences(prompt, nullEncoded), null);
  const emptyEncoded = captureChooseCardsReferences(prompt, new ResolvePromptAction([]));
  assert.deepEqual(restoreChooseCardsReferences(prompt, emptyEncoded), []);
});

test('changed prompt source, card, or message blocks restoration', () => {
  const prompt = new ChooseCardsPrompt([card('Alpha'), card('Beta')]);
  const encoded = captureChooseCardsReferences(prompt, new ResolvePromptAction([prompt.cards.cards[1]]));
  assert.throws(() => restoreChooseCardsReferences(
    new ChooseCardsPrompt([card('Alpha')]), encoded), /differs/);
  assert.throws(() => restoreChooseCardsReferences(
    new ChooseCardsPrompt([card('Alpha'), card('Gamma')]), encoded), /differs/);
  assert.throws(() => restoreChooseCardsReferences(
    new ChooseCardsPrompt([card('Alpha'), card('Beta')], 'Another prompt'), encoded), /differs/);
});

test('nonmember objects and out-of-range indices fail during capture', () => {
  const prompt = new ChooseCardsPrompt([card('Alpha'), card('Beta')]);
  assert.throws(() => captureChooseCardsReferences(prompt,
    new ResolvePromptAction([card('Beta')])), /not a member/);
  assert.throws(() => captureChooseCardsReferences(prompt,
    new ResolvePromptAction([2])), /not a member/);
  assert.throws(() => captureChooseCardsReferences(prompt,
    new ResolvePromptAction([-1])), /not a member/);
});
