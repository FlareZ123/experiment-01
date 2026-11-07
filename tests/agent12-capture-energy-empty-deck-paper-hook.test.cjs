'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {withPaperCaptureEnergyEmptyDeck} =
  require('../simulation/twinleaf/agent12-capture-energy-empty-deck-paper-hook.cjs');

class AttachEnergyEffect {
  constructor(player, energyCard) {
    this.player = player;
    this.energyCard = energyCard;
  }
}
class CaptureEnergy {
  constructor() { this.fullName = 'Capture Energy RCL'; }
  reduceEffect(store, state, effect) {
    state.calls++;
    if (effect.player.deck.cards.length === 0)
      throw new Error('native empty deck search');
    return state;
  }
}

function make(ownerCards, energyInHand = true) {
  const card = new CaptureEnergy();
  const owner = {
    hand: {cards: energyInHand ? [card] : []},
    deck: {cards: ownerCards.map((_, index) => ({index}))}
  };
  return {card, owner, state: {calls: 0},
    effect: new AttachEnergyEffect(owner, card)};
}

test('empty-deck printed search omitted for authentic own-hand attachment', () => {
  const original = CaptureEnergy.prototype.reduceEffect;
  const fixture = make([]);
  const observed = withPaperCaptureEnergyEmptyDeck(() =>
    fixture.card.reduceEffect(null, fixture.state, fixture.effect), {
    CaptureEnergy, AttachEnergyEffect
  });
  assert.strictEqual(observed.result, fixture.state);
  assert.equal(observed.result.calls, 0);
  assert.equal(observed.audit.skippedOnlyEmptySearch, 1);
  assert.strictEqual(CaptureEnergy.prototype.reduceEffect, original);
});

test('one available deck card executes original native implementation', () => {
  const original = CaptureEnergy.prototype.reduceEffect;
  const f = make([1]);
  const observed = withPaperCaptureEnergyEmptyDeck(() =>
    f.card.reduceEffect(null, f.state, f.effect), {
    CaptureEnergy, AttachEnergyEffect
  });
  assert.equal(observed.result.calls, 1);
  assert.equal(observed.audit.skippedOnlyEmptySearch, 0);
  assert.strictEqual(CaptureEnergy.prototype.reduceEffect, original);
});

test('non-hand source is outside the defined hand-attachment repair scope', () => {
  const f = make([], false);
  assert.throws(() => withPaperCaptureEnergyEmptyDeck(() =>
    f.card.reduceEffect(null, f.state, f.effect), {
    CaptureEnergy, AttachEnergyEffect
  }), /native empty deck search/);
  assert.equal(f.state.calls, 1);
});

test('foreign attachment remains unchanged and the original method restored', () => {
  const f = make([]);
  f.effect.energyCard = new CaptureEnergy();
  const original = CaptureEnergy.prototype.reduceEffect;
  assert.throws(() => withPaperCaptureEnergyEmptyDeck(() =>
    f.card.reduceEffect(null, f.state, f.effect), {
    CaptureEnergy, AttachEnergyEffect
  }), /native empty deck search/);
  assert.strictEqual(CaptureEnergy.prototype.reduceEffect, original);
});

test('other effect classes do not trigger a targeted correction', () => {
  const f = make([]);
  const previous = CaptureEnergy.prototype.reduceEffect;
  assert.throws(() => withPaperCaptureEnergyEmptyDeck(() =>
    f.card.reduceEffect(null, f.state, {...f.effect}), {
    CaptureEnergy, AttachEnergyEffect
  }), /native empty deck search/);
  assert.strictEqual(CaptureEnergy.prototype.reduceEffect, previous);
});

test('original prototype is restored even after caller exception', () => {
  const previous = CaptureEnergy.prototype.reduceEffect;
  assert.throws(() => withPaperCaptureEnergyEmptyDeck(() => {
    throw new Error('owner-policy-failed');
  }, {CaptureEnergy, AttachEnergyEffect}), /owner-policy-failed/);
  assert.strictEqual(CaptureEnergy.prototype.reduceEffect, previous);
});
