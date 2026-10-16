'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {severClonePrototypeAliases} =
  require('../simulation/twinleaf/prototype-safe-simulator-hook.cjs');

/** @param {any} source @param {Map<object,object>} [seen] */
function reproducePinnedCloneSemantics(source, seen = new Map()) {
  if (source === null || typeof source !== 'object') return source;
  if (seen.has(source)) return seen.get(source);
  if (Array.isArray(source)) {
    const clone = [];
    seen.set(source, clone);
    for (const value of source) clone.push(reproducePinnedCloneSemantics(value, seen));
    return clone;
  }
  const clone = Object.create(source);
  seen.set(source, clone);
  for (const key of Object.keys(source)) {
    clone[key] = reproducePinnedCloneSemantics(source[key], seen);
  }
  return clone;
}

class SampleCard {
  constructor() {
    this.damageTakenLastTurn = 0;
  }
  /** @returns {number} */
  attack() {
    return 20 + this.damageTakenLastTurn;
  }
}

test('reparented Card retains class behavior but does not inherit source changes', () => {
  const card = new SampleCard();
  const source = {active: {cards: [card]}, aliases: [card]};
  const clone = reproducePinnedCloneSemantics(source);
  assert.strictEqual(Object.getPrototypeOf(clone.active.cards[0]), card);
  const severed = severClonePrototypeAliases(source, clone);
  assert.ok(severed >= 3);
  const clonedCard = clone.active.cards[0];
  assert.notStrictEqual(clonedCard, card);
  assert.strictEqual(Object.getPrototypeOf(clonedCard), SampleCard.prototype);
  assert.strictEqual(clone.aliases[0], clonedCard);
  assert.ok(clonedCard instanceof SampleCard);
  assert.equal(clonedCard.attack(), 20);
  card.damageTakenLastTurn = 50;
  card.fieldAddedAfterSimulation = 'live';
  assert.equal(clonedCard.damageTakenLastTurn, 0);
  assert.equal(clonedCard.fieldAddedAfterSimulation, undefined);
  assert.equal(clonedCard.attack(), 20);
});

test('prototype severing preserves cycles and source null prototypes', () => {
  const root = Object.create(null);
  root.amount = 4;
  root.self = root;
  const clone = reproducePinnedCloneSemantics(root);
  assert.strictEqual(Object.getPrototypeOf(clone), root);
  const changes = severClonePrototypeAliases(root, clone);
  assert.equal(changes, 1);
  assert.equal(Object.getPrototypeOf(clone), null);
  assert.strictEqual(clone.self, clone);
  root.newField = 2;
  assert.equal(clone.newField, undefined);
});

test('reparenting is idempotent for fully visited clone pairs', () => {
  const src = {objects: [{x: 1}]};
  const clone = reproducePinnedCloneSemantics(src);
  const first = severClonePrototypeAliases(src, clone);
  const second = severClonePrototypeAliases(src, clone);
  assert.ok(first > 0);
  assert.equal(second, 0);
});
