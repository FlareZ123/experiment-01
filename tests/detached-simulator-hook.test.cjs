'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {makeDetachedSimulatorClass} =
  require('../simulation/twinleaf/detached-simulator-hook.cjs');

class FakeSimulator {
  /** @param {object} state @param {object} options */
  constructor(state, options) {
    this.store = {state};
    this.options = options;
  }
  /** @param {number} amount */
  mutateCard(amount) {
    this.store.state.card.damage += amount;
  }
}

/** Minimal alias-preserving stand-in for a full object-graph clone. */
function cloneFixture(state) {
  const card = {...state.card};
  return {card, aliases: [card, card]};
}

test('detached wrapper preserves internal aliases and isolates live card field', () => {
  const card = {damage: 0};
  const source = {card, aliases: [card, card]};
  const Wrapped = makeDetachedSimulatorClass(FakeSimulator, cloneFixture);
  const options = {flipMode: 'heads'};
  const probe = new Wrapped(source, options);
  assert.notStrictEqual(probe.store.state.card, card);
  assert.strictEqual(probe.store.state.aliases[0], probe.store.state.card);
  assert.strictEqual(probe.store.state.aliases[1], probe.store.state.card);
  assert.strictEqual(probe.options, options);
  probe.mutateCard(280);
  assert.equal(probe.store.state.card.damage, 280);
  assert.equal(source.card.damage, 0);
});

test('new wrapper class is distinct and preserves original constructor', () => {
  const Wrapped = makeDetachedSimulatorClass(FakeSimulator, cloneFixture);
  assert.notStrictEqual(Wrapped, FakeSimulator);
  const original = new FakeSimulator({card: {damage: 0}}, {id: 'original'});
  assert.equal(original.options.id, 'original');
  assert.ok(new Wrapped({card: {damage: 0}}, {}).constructor === Wrapped);
});
